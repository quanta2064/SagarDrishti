"""
AquaScan - FastAPI Backend

AI-powered underwater marine debris and anomaly detection
using side-scan sonar imagery.

Detection model:
    SonarSight YOLOv8n

Supported classes:
    0: submarine_pipeline
    1: shipwreck
    2: ghost_net
    3: mine_cylinder

The backend provides:
    - Sonar image upload
    - Optional sonar preprocessing
    - YOLOv8n inference
    - Confidence-based alert levels
    - Basic scan geotagging
    - JSON/CSV/PDF report generation
    - Detection filtering
    - Annotated image retrieval
    - Demo/sample mission presets
"""

import os
import cv2
import numpy as np
import time
import uuid
import base64
import asyncio

from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    Query,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from pipeline.preprocessor import preprocess_sonar_frame
from pipeline.sonar_parser import decode_uploaded_bytes
from pipeline.tiler import generate_tiles

from detection.model import (
    SonarDetector,
    CLASS_LABELS,
    CLASS_COLORS_RGB,
)

from detection.export import (
    get_edge_hardware_benchmarks,
    get_model_specifications,
)

from geotagging.report_generator import (
    generate_json_report,
    generate_csv_report,
    generate_pdf_report,
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AquaScan Marine Detection API",
    description=(
        "AI-powered underwater marine debris and anomaly "
        "detection using side-scan sonar imagery."
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GLOBALS
# ============================================================

SAMPLE_DIR = os.path.join(
    os.path.dirname(__file__),
    "data",
    "sample_missions",
)

JOBS_STORE: Dict[str, Dict[str, Any]] = {}

detector = SonarDetector()


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class DetectionLocation(BaseModel):
    latitude: float
    longitude: float
    depth_m: Optional[float] = None


class BoundingDimensions(BaseModel):
    length_m: Optional[float] = None
    width_m: Optional[float] = None


class DetectionItem(BaseModel):
    detection_id: str
    id: str

    class_name: str
    label: str

    # React frontend expects percentage: 0-100
    confidence: float

    # React frontend uses uppercase levels
    severity: str

    location: DetectionLocation

    lat: float
    lon: float

    depth_m: Optional[float] = None

    bounding_dimensions: BoundingDimensions

    dimensions_m: Optional[str] = None

    acoustic_shadow_length_m: Optional[float] = None
    shadow_verified: bool

    bbox: List[int]
    color_rgb: List[int]

    description: str

    fairway_proximity_m: Optional[float] = None
    tile_source: Optional[str] = None

    timestamp: str

    navigation_risk: Optional[str] = None
    ecosystem_risk: Optional[str] = None
    potential_impact: Optional[str] = None
    clearance_priority: Optional[str] = None


class SurveyMetadata(BaseModel):
    survey_date: str
    vessel: str
    sonar_model: str

    total_area_sqm: int

    region: str = "Unknown"
    sea_basin: str = "Unknown"


class ReportSummary(BaseModel):
    total_detections: int

    by_class: Dict[str, int]
    by_severity: Dict[str, int]

    false_positive_filtered: int

    fairway_clearance_status: str
    recommended_action: str


class DisasterReadiness(BaseModel):
    coverage_pct: float
    fairway_cleared: bool
    readiness_index: int
    disaster_event: str


class AnalysisResponse(BaseModel):
    job_id: str

    mission_name: str

    center_coords: List[float]

    scanned_area_km2: float

    pipeline_latency_ms: int

    raw_image_base64: str
    annotated_image_base64: str

    survey_metadata: SurveyMetadata

    detections: List[DetectionItem]

    summary: ReportSummary

    stages: Dict[str, int]

    disaster_readiness: Optional[DisasterReadiness] = None


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def img_to_base64(img_bgr: np.ndarray) -> str:
    """
    Convert an OpenCV BGR image to a base64 PNG data URL.
    """

    if img_bgr is None or img_bgr.size == 0:
        return ""

    success, encoded = cv2.imencode(
        ".png",
        img_bgr,
    )

    if not success:
        return ""

    encoded_bytes = base64.b64encode(
        encoded
    ).decode("utf-8")

    return f"data:image/png;base64,{encoded_bytes}"


def normalize_severity(severity: str) -> str:
    """
    Normalize SonarSight severity values to the
    uppercase format expected by the React frontend.
    """

    normalized = str(severity).strip().upper()

    mapping = {
        "HIGH": "HIGH",
        "MEDIUM": "MEDIUM",
        "LOW": "LOW",
        "CRITICAL": "CRITICAL",
    }

    return mapping.get(normalized, normalized)


# ============================================================
# MAIN ANALYSIS PIPELINE
# ============================================================

def run_full_pipeline(
    raw_bgr: np.ndarray,
    mission_title: str,
    center_lat: float,
    center_lon: float,
    vessel_name: str = "Unknown Vessel",
    sonar_model: str = "Unknown Sonar",
    region_name: str = "Unknown",
    basin_name: str = "Unknown",
    conf_threshold: float = 0.25,
    enable_despeckle: bool = False,
    enforce_shadow: bool = False,
    job_id: Optional[str] = None,
) -> AnalysisResponse:

    t_start = time.time()

    stages: Dict[str, int] = {}

    if job_id is None:
        job_id = f"job-{uuid.uuid4().hex[:10]}"

    # --------------------------------------------------------
    # VALIDATE INPUT
    # --------------------------------------------------------

    if raw_bgr is None or raw_bgr.size == 0:
        raise ValueError("Invalid or empty sonar image.")

    # --------------------------------------------------------
    # STAGE 1: IMAGE / TILE PREPARATION
    # --------------------------------------------------------

    t0 = time.time()

    h, w = raw_bgr.shape[:2]

    # Retained for pipeline compatibility.
    # Current SonarSight inference runs on the supplied image.
    generate_tiles(
        (h, w),
        tile_size=640,
        overlap_ratio=0.20,
    )

    stages["parsing_ms"] = int(
        (time.time() - t0) * 1000
    )

    # --------------------------------------------------------
    # STAGE 2: PREPROCESSING
    # --------------------------------------------------------

    t1 = time.time()

    if enable_despeckle:
        processed_bgr = preprocess_sonar_frame(
            raw_bgr,
            enable_wavelet=True,
            enable_clahe=True,
        )
    else:
        processed_bgr = raw_bgr.copy()

    stages["preprocessing_ms"] = int(
        (time.time() - t1) * 1000
    )

    # --------------------------------------------------------
    # STAGE 3: YOLO DETECTION
    # --------------------------------------------------------

    t2 = time.time()

    (
        annotated_bgr,
        detections_raw,
        false_positives_count,
    ) = detector.detect(
        processed_bgr,
        conf_threshold=conf_threshold,
        enforce_shadow=enforce_shadow,
        center_lat=center_lat,
        center_lon=center_lon,
    )

    stages["detection_ms"] = int(
        (time.time() - t2) * 1000
    )

    # Current MVP geotags detections to supplied scan coordinates.
    stages["geotagging_ms"] = 0

    # --------------------------------------------------------
    # STAGE 4: REPORT GENERATION
    # --------------------------------------------------------

    t3 = time.time()

    survey_meta_dict = {
        "job_id": job_id,
        "survey_date": datetime.utcnow().strftime(
            "%Y-%m-%d"
        ),
        "vessel": vessel_name,
        "sonar_model": sonar_model,
        "region": region_name,
        "sea_basin": basin_name,

        # A single uploaded image does not provide
        # calibrated surveyed area.
        "total_area_sqm": 0,
    }

    json_report = generate_json_report(
        survey_meta_dict,
        detections_raw,
        false_positive_count=false_positives_count,
    )

    csv_text = generate_csv_report(
        json_report
    )

    pdf_bytes = generate_pdf_report(
        json_report
    )

    stages["report_ms"] = int(
        (time.time() - t3) * 1000
    )

    # --------------------------------------------------------
    # TOTAL PIPELINE LATENCY
    # --------------------------------------------------------

    total_latency_ms = int(
        (time.time() - t_start) * 1000
    )

    # --------------------------------------------------------
    # FORMAT DETECTIONS FOR REACT FRONTEND
    # --------------------------------------------------------

    formatted_detections: List[DetectionItem] = []

    for d in detections_raw:

        class_name = d["class"]

        label = d.get(
            "label",
            CLASS_LABELS.get(
                class_name,
                class_name.replace("_", " ").title(),
            ),
        )

        severity = normalize_severity(
            d.get("severity", "LOW")
        )

        confidence = round(
            float(d.get("confidence", 0.0)) * 100.0,
            1,
        )

        formatted_detections.append(
            DetectionItem(
                detection_id=d["id"],
                id=d["id"],

                class_name=class_name,
                label=label,

                confidence=confidence,
                severity=severity,

                location=DetectionLocation(
                    latitude=d["lat"],
                    longitude=d["lon"],
                    depth_m=d.get("depth_m"),
                ),

                lat=d["lat"],
                lon=d["lon"],

                depth_m=d.get("depth_m"),

                bounding_dimensions=BoundingDimensions(
                    length_m=d.get("length_m"),
                    width_m=d.get("width_m"),
                ),

                dimensions_m=d.get(
                    "dimensions_m"
                ),

                acoustic_shadow_length_m=d.get(
                    "shadow_length_m"
                ),

                shadow_verified=d.get(
                    "shadow_verified",
                    False,
                ),

                bbox=d["bbox"],

                color_rgb=d.get(
                    "color_rgb",
                    list(
                        CLASS_COLORS_RGB.get(
                            class_name,
                            (0, 168, 204),
                        )
                    ),
                ),

                description=d.get(
                    "description",
                    "",
                ),

                fairway_proximity_m=d.get(
                    "fairway_proximity_m"
                ),

                tile_source=d.get(
                    "tile_source"
                ),

                timestamp=(
                    datetime.utcnow()
                    .isoformat()
                    + "Z"
                ),

                # These remain None because the current
                # MVP does not calculate them.
                navigation_risk=None,
                ecosystem_risk=None,
                potential_impact=None,
                clearance_priority=None,
            )
        )

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    if formatted_detections:
        recommended_action = (
            "Review detected targets"
        )
    else:
        recommended_action = (
            "No targets detected"
        )

    summary_obj = ReportSummary(
        total_detections=len(
            formatted_detections
        ),

        by_class=json_report[
            "summary"
        ]["by_class"],

        by_severity={
            normalize_severity(k): v
            for k, v in json_report[
                "summary"
            ]["by_severity"].items()
        },

        false_positive_filtered=(
            false_positives_count
        ),

        fairway_clearance_status=(
            "NOT ASSESSED"
        ),

        recommended_action=(
            recommended_action
        ),
    )

    # --------------------------------------------------------
    # DISASTER READINESS
    # --------------------------------------------------------

    # Not calculated by the current MVP.
    disaster_readiness = None

    # --------------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------------

    response = AnalysisResponse(
        job_id=job_id,

        mission_name=mission_title,

        center_coords=[
            center_lat,
            center_lon,
        ],

        # No calibrated sonar coverage calculation.
        scanned_area_km2=0.0,

        pipeline_latency_ms=total_latency_ms,

        raw_image_base64=img_to_base64(
            raw_bgr
        ),

        annotated_image_base64=img_to_base64(
            annotated_bgr
        ),

        survey_metadata=SurveyMetadata(
            **survey_meta_dict
        ),

        detections=formatted_detections,

        summary=summary_obj,

        stages=stages,

        disaster_readiness=(
            disaster_readiness
        ),
    )

    # --------------------------------------------------------
    # STORE JOB
    # --------------------------------------------------------

    JOBS_STORE[job_id] = {
        "status": "complete",
        "progress": 100,

        "response": response,

        "json_report": json_report,
        "csv_text": csv_text,
        "pdf_bytes": pdf_bytes,

        "raw_img": raw_bgr,
        "annotated_img": annotated_bgr,

        "created_at": time.time(),
    }

    return response


# ============================================================
# REST ENDPOINTS
# ============================================================

@app.get("/api/health")
def health():

    return {
        "status": "ONLINE",
        "system": "AquaScan Marine Detection Platform",
        "version": "1.0.0",
        "pipeline": (
            "SonarSight YOLOv8n Detection"
        ),
        "model_loaded": (
            detector.model_loaded
        ),
        "demo_mode": False,
        "edge_ready": True,
    }


# ============================================================
# EDGE / MODEL INFORMATION
# ============================================================

@app.get("/api/edge/benchmarks")
def edge_benchmarks():

    return {
        "benchmarks": (
            get_edge_hardware_benchmarks()
        ),
        "model_specifications": (
            get_model_specifications()
        ),
    }


# ============================================================
# DEMO / SAMPLE MISSION PRESETS
# ============================================================

@app.get(
    "/api/mission/preset",
    response_model=AnalysisResponse,
)
def get_mission_preset(
    preset_id: str = Query("chennai"),
    conf_threshold: float = 0.35,
    enable_despeckle: bool = True,
    enforce_shadow: bool = False,
):

    pid = preset_id.lower()

    # These are intentionally retained as DEMO/SAMPLE
    # mission presets for the existing dashboard.
    if pid in [
        "mumbai",
        "tokyo_bay",
    ]:

        img_path = os.path.join(
            SAMPLE_DIR,
            "mission_2_tokyo_bay.png",
        )

        title = (
            "DEMO — Mumbai Harbour Sonar Survey"
        )

        center = [
            18.9438,
            72.8617,
        ]

        vessel = (
            "DEMO — RV Samudra Ratnakar"
        )

        sensor = (
            "DEMO — Klein 3000 SSS"
        )

        region = (
            "Maharashtra"
        )

        basin = "Arabian Sea"

    elif pid in [
        "odisha",
        "thunder_bay",
    ]:

        img_path = os.path.join(
            SAMPLE_DIR,
            "mission_3_thunder_bay.png",
        )

        title = (
            "DEMO — Odisha Coastal Sonar Survey"
        )

        center = [
            20.2961,
            86.6710,
        ]

        vessel = (
            "DEMO — AUV Sagar-Kanya"
        )

        sensor = (
            "DEMO — EdgeTech 4125 Dual-Freq"
        )

        region = "Odisha"

        basin = "Bay of Bengal"

    elif pid == "andaman":

        img_path = os.path.join(
            SAMPLE_DIR,
            "mission_1_tampa_bay.png",
        )

        title = (
            "DEMO — Andaman Marine Sonar Survey"
        )

        center = [
            11.6234,
            92.7265,
        ]

        vessel = (
            "DEMO — AUV Matsya-III"
        )

        sensor = (
            "DEMO — Reson SeaBat S7K"
        )

        region = (
            "Andaman & Nicobar Islands"
        )

        basin = "Andaman Sea"

    elif pid == "lakshadweep":

        img_path = os.path.join(
            SAMPLE_DIR,
            "mission_2_tokyo_bay.png",
        )

        title = (
            "DEMO — Lakshadweep Marine Sonar Survey"
        )

        center = [
            10.8500,
            72.1900,
        ]

        vessel = (
            "DEMO — AUV Sagar-Nidhi"
        )

        sensor = (
            "DEMO — EdgeTech 4125"
        )

        region = "Lakshadweep"

        basin = "Laccadive Sea"

    elif pid == "kerala":

        img_path = os.path.join(
            SAMPLE_DIR,
            "mission_3_thunder_bay.png",
        )

        title = (
            "DEMO — Kerala Coastal Sonar Survey"
        )

        center = [
            9.9312,
            76.2673,
        ]

        vessel = (
            "DEMO — RV Sagar Sampada"
        )

        sensor = (
            "DEMO — EdgeTech 4125"
        )

        region = "Kerala"

        basin = "Arabian Sea"

    else:

        img_path = os.path.join(
            SAMPLE_DIR,
            "mission_1_tampa_bay.png",
        )

        title = (
            "DEMO — Chennai Coastal Sonar Survey"
        )

        center = [
            13.0827,
            80.2707,
        ]

        vessel = (
            "DEMO — INS Makar"
        )

        sensor = (
            "DEMO — EdgeTech 4125"
        )

        region = (
            "Tamil Nadu"
        )

        basin = "Bay of Bengal"

    # --------------------------------------------------------
    # LOAD DEMO IMAGE
    # --------------------------------------------------------

    raw_bgr = cv2.imread(
        img_path
    )

    if raw_bgr is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Demo preset image not found: "
                f"{img_path}"
            ),
        )

    job_id = f"preset-{pid}"

    return run_full_pipeline(
        raw_bgr,

        title,

        center[0],
        center[1],

        vessel_name=vessel,

        sonar_model=sensor,

        region_name=region,

        basin_name=basin,

        conf_threshold=conf_threshold,

        enable_despeckle=(
            enable_despeckle
        ),

        enforce_shadow=(
            enforce_shadow
        ),

        job_id=job_id,
    )


# ============================================================
# CUSTOM SONAR UPLOAD
# ============================================================

@app.post("/api/upload")
async def upload_sonar(
    file: UploadFile = File(...),

    conf_threshold: float = Query(
        0.25
    ),

    enable_despeckle: bool = Query(
        False
    ),

    enforce_shadow: bool = Query(
        False
    ),

    latitude: float = Query(
        13.0827
    ),

    longitude: float = Query(
        80.2707
    ),

    vessel: str = Query(
        "AUV Sagar-Kanya"
    ),
):

    contents = await file.read()

    try:

        decoded = decode_uploaded_bytes(
            contents,
            file.filename,
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid image format: {str(e)}"
            ),
        )

    job_id = (
        f"job-{uuid.uuid4().hex[:10]}"
    )

    title = (
        f"AquaScan // {file.filename}"
    )

    run_full_pipeline(
        decoded["image"],

        title,

        latitude,
        longitude,

        vessel_name=vessel,

        # The uploaded image does not carry
        # a verified sonar hardware identifier.
        sonar_model="Uploaded Sonar Image",

        conf_threshold=(
            conf_threshold
        ),

        enable_despeckle=(
            enable_despeckle
        ),

        enforce_shadow=(
            enforce_shadow
        ),

        job_id=job_id,
    )

    return {
        "job_id": job_id,

        "status": "complete",

        "message": (
            "Sonar image processed "
            "successfully by AquaScan."
        ),

        "file_name": file.filename,
    }


# ============================================================
# JOB ENDPOINTS
# ============================================================

@app.get(
    "/api/jobs/{job_id}/status"
)
def get_job_status(
    job_id: str,
):

    if job_id not in JOBS_STORE:

        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    job = JOBS_STORE[job_id]

    return {
        "job_id": job_id,

        "status": job["status"],

        "progress": job["progress"],

        "current_stage": (
            "REPORT_GENERATION"
        ),

        "detections_count": len(
            job["response"].detections
        ),

        "pipeline_latency_ms": (
            job["response"]
            .pipeline_latency_ms
        ),
    }


@app.get(
    "/api/jobs/{job_id}/results",
    response_model=AnalysisResponse,
)
def get_job_results(
    job_id: str,
):

    if job_id not in JOBS_STORE:

        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return JOBS_STORE[job_id][
        "response"
    ]


# ============================================================
# DETECTION FILTERING
# ============================================================

@app.get(
    "/api/jobs/{job_id}/detections"
)
def get_job_detections(
    job_id: str,

    class_name: Optional[str] = None,

    min_confidence: Optional[
        float
    ] = None,

    severity: Optional[str] = None,
):

    if job_id not in JOBS_STORE:

        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    detections = (
        JOBS_STORE[job_id][
            "response"
        ].detections
    )

    filtered = []

    normalized_requested_severity = (
        normalize_severity(severity)
        if severity
        else None
    )

    for detection in detections:

        if (
            class_name
            and detection.class_name
            != class_name
        ):
            continue

        if (
            min_confidence
            is not None
            and detection.confidence
            < min_confidence
        ):
            continue

        if (
            normalized_requested_severity
            and detection.severity
            != normalized_requested_severity
        ):
            continue

        filtered.append(
            detection
        )

    return {
        "job_id": job_id,

        "total_matching": len(
            filtered
        ),

        "detections": filtered,
    }


# ============================================================
# CSV REPORT
# ============================================================

@app.get(
    "/api/jobs/{job_id}/report/csv"
)
def get_job_report_csv(
    job_id: str,
):

    if job_id not in JOBS_STORE:

        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    csv_data = JOBS_STORE[job_id][
        "csv_text"
    ]

    return Response(
        content=csv_data,

        media_type="text/csv",

        headers={
            "Content-Disposition": (
                "attachment; "
                f"filename=aquascan_detections_"
                f"{job_id}.csv"
            )
        },
    )


# ============================================================
# PDF REPORT
# ============================================================

@app.get(
    "/api/jobs/{job_id}/report/pdf"
)
def get_job_report_pdf(
    job_id: str,
):

    if job_id not in JOBS_STORE:

        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    pdf_bytes = JOBS_STORE[job_id][
        "pdf_bytes"
    ]

    return Response(
        content=pdf_bytes,

        media_type="application/pdf",

        headers={
            "Content-Disposition": (
                "attachment; "
                f"filename=aquascan_detection_"
                f"report_{job_id}.pdf"
            )
        },
    )


# ============================================================
# TILE ENDPOINT
# ============================================================

@app.get(
    "/api/jobs/{job_id}/tiles/{tile_id}"
)
def get_job_tile(
    job_id: str,
    tile_id: str,
):

    if job_id not in JOBS_STORE:

        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    annotated = JOBS_STORE[
        job_id
    ]["annotated_img"]

    h, w = annotated.shape[:2]

    tile = annotated[
        0:min(640, h),
        0:min(640, w),
    ]

    success, encoded = cv2.imencode(
        ".png",
        tile,
    )

    if not success:

        raise HTTPException(
            status_code=500,
            detail="Failed to encode tile.",
        )

    return Response(
        content=encoded.tobytes(),
        media_type="image/png",
    )


# ============================================================
# WEBSOCKET PIPELINE PROGRESS
# ============================================================

@app.websocket(
    "/ws/jobs/{job_id}"
)
async def websocket_job_progress(
    websocket: WebSocket,
    job_id: str,
):

    await websocket.accept()

    stages = [

        (
            "PARSING",
            15,
            "Preparing uploaded sonar image...",
        ),

        (
            "PREPROCESSING",
            35,
            "Applying optional sonar preprocessing...",
        ),

        (
            "DETECTION",
            65,
            "Running SonarSight YOLOv8n detection...",
        ),

        (
            "GEOTAGGING",
            85,
            "Applying supplied scan coordinates...",
        ),

        (
            "REPORT_GENERATION",
            100,
            "Generating AquaScan detection reports...",
        ),
    ]

    try:

        for stage, pct, message in stages:

            await websocket.send_json(
                {
                    "job_id": job_id,

                    "stage": stage,

                    "progress": pct,

                    "message": message,

                    "timestamp": (
                        datetime.utcnow()
                        .isoformat()
                        + "Z"
                    ),
                }
            )

            await asyncio.sleep(
                0.35
            )

        await websocket.send_json(
            {
                "job_id": job_id,

                "status": "complete",

                "progress": 100,

                "message": (
                    "AquaScan pipeline "
                    "completed successfully."
                ),
            }
        )

    except WebSocketDisconnect:

        pass


# ============================================================
# LOCAL DEVELOPMENT
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
    )