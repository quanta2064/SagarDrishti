"""
AquaScan - SonarSight YOLOv8n Object Detection

Runs inference using the trained SonarSight YOLOv8n model
for four underwater side-scan sonar target classes:

0: submarine_pipeline
1: shipwreck
2: ghost_net
3: mine_cylinder

Confidence-based alert level:
    >= 0.70 -> High
    >= 0.40 -> Medium
    <  0.40 -> Low

Note:
    Severity represents model-confidence alert level.
    It does NOT represent physical hazard severity.
"""

import os
from typing import List, Dict, Any, Tuple

import cv2
import numpy as np


# ============================================================
# MODEL CLASSES
# ============================================================

CLASS_NAMES = [
    "submarine_pipeline",
    "shipwreck",
    "ghost_net",
    "mine_cylinder",
]


# Human-readable English labels
CLASS_LABELS = {
    "submarine_pipeline": "Submarine Pipeline",
    "shipwreck": "Shipwreck",
    "ghost_net": "Ghost Net",
    "mine_cylinder": "Mine Cylinder",
}


# Hindi labels for multilingual UI/report support
CLASS_LABELS_HINDI = {
    "submarine_pipeline": "सबमरीन पाइपलाइन",
    "shipwreck": "डूबा हुआ जहाज (जलपोत मलबा)",
    "ghost_net": "घोस्ट नेट / लावारिस जाल",
    "mine_cylinder": "माइन सिलिंडर",
}


# ============================================================
# CLASS COLORS
# ============================================================

# RGB colors for frontend/UI
CLASS_COLORS_RGB = {
    "submarine_pipeline": (37, 99, 235),
    "shipwreck": (220, 38, 38),
    "ghost_net": (234, 179, 8),
    "mine_cylinder": (245, 158, 11),
}


# BGR colors for OpenCV
CLASS_COLORS_BGR = {
    "submarine_pipeline": (235, 99, 37),
    "shipwreck": (38, 38, 220),
    "ghost_net": (8, 179, 234),
    "mine_cylinder": (11, 158, 245),
}


# ============================================================
# SONAR DETECTOR
# ============================================================

class SonarDetector:
    """
    AquaScan's YOLOv8n-based sonar detector.

    Uses the trained SonarSight YOLOv8n model for inference.
    """

    def __init__(
        self,
        model_path: str = "models/sonarsight_yolov8n_best.pt",
    ):
        self.model_path = model_path
        self.model = None
        self.model_loaded = False

        self._initialize_model()

    # --------------------------------------------------------
    # MODEL INITIALIZATION
    # --------------------------------------------------------

    def _initialize_model(self):
        """Load the trained SonarSight YOLOv8n model."""

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"SonarSight model not found: {self.model_path}"
            )

        try:
            from ultralytics import YOLO

            self.model = YOLO(self.model_path)
            self.model_loaded = True

            print(
                f"[AquaScan] SonarSight YOLOv8n loaded: "
                f"{self.model_path}"
            )

        except Exception as e:
            self.model_loaded = False
            self.model = None

            raise RuntimeError(
                f"Failed to load SonarSight YOLOv8n model: {e}"
            ) from e

    # --------------------------------------------------------
    # SEVERITY
    # --------------------------------------------------------

    @staticmethod
    def _get_severity(confidence: float) -> str:
        """
        Convert model confidence into an application-level
        alert level.

        This is confidence-based and is NOT physical hazard
        severity.
        """

        if confidence >= 0.70:
            return "High"

        if confidence >= 0.40:
            return "Medium"

        return "Low"

    # --------------------------------------------------------
    # MAIN DETECTION FUNCTION
    # --------------------------------------------------------

    def detect(
        self,
        image_bgr: np.ndarray,
        conf_threshold: float = 0.25,
        enforce_shadow: bool = True,
        center_lat: float = 13.0827,
        center_lon: float = 80.2707,
    ) -> Tuple[np.ndarray, List[Dict[str, Any]], int]:
        """
        Run YOLO inference on a sonar image.

        Parameters:
            image_bgr:
                Input sonar image in OpenCV BGR format.

            conf_threshold:
                Minimum YOLO confidence threshold.

            enforce_shadow:
                Retained for API compatibility.
                Shadow validation is not currently performed
                by the YOLO inference path.

            center_lat:
                Latitude supplied for the current scan.

            center_lon:
                Longitude supplied for the current scan.

        Returns:
            annotated_image:
                Image with YOLO detection overlays.

            detections:
                List of detected objects.

            false_positive_count:
                Number of false positives filtered.
                Currently zero because no separate
                post-detection filtering is applied.
        """

        if image_bgr is None or image_bgr.size == 0:
            raise ValueError("Invalid or empty sonar image.")

        if not self.model_loaded or self.model is None:
            raise RuntimeError(
                "SonarSight YOLOv8n model is not loaded."
            )

        return self._run_yolo_inference(
            image_bgr=image_bgr,
            conf_threshold=conf_threshold,
            center_lat=center_lat,
            center_lon=center_lon,
        )

    # --------------------------------------------------------
    # YOLO INFERENCE
    # --------------------------------------------------------

    def _run_yolo_inference(
        self,
        image_bgr: np.ndarray,
        conf_threshold: float,
        center_lat: float,
        center_lon: float,
    ) -> Tuple[np.ndarray, List[Dict[str, Any]], int]:
        """
        Run inference using the trained SonarSight YOLOv8n model.
        """

        results = self.model(
            image_bgr,
            conf=conf_threshold,
            imgsz=640,
            verbose=False,
        )

        result = results[0]

        # Generate annotated image using Ultralytics
        annotated = result.plot()

        detections: List[Dict[str, Any]] = []

        # No detections
        if result.boxes is None or len(result.boxes) == 0:
            return annotated, detections, 0

        # Process every detected bounding box
        for box in result.boxes:

            # --------------------------------------------
            # CLASS + CONFIDENCE
            # --------------------------------------------

            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            # --------------------------------------------
            # BOUNDING BOX
            # --------------------------------------------

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            bbox = [
                int(x1),
                int(y1),
                int(x2),
                int(y2),
            ]

            # --------------------------------------------
            # CLASS NAME
            # --------------------------------------------

            if 0 <= class_id < len(CLASS_NAMES):
                class_name = CLASS_NAMES[class_id]
            else:
                class_name = f"class_{class_id}"

            label = CLASS_LABELS.get(
                class_name,
                class_name.replace("_", " ").title(),
            )

            hindi_label = CLASS_LABELS_HINDI.get(
                class_name,
                label,
            )

            # --------------------------------------------
            # CONFIDENCE-BASED SEVERITY
            # --------------------------------------------

            severity = self._get_severity(confidence)

            # --------------------------------------------
            # COLORS
            # --------------------------------------------

            rgb_color = CLASS_COLORS_RGB.get(
                class_name,
                (0, 168, 204),
            )

            bgr_color = CLASS_COLORS_BGR.get(
                class_name,
                (204, 168, 0),
            )

            # --------------------------------------------
            # DETECTION OBJECT
            # --------------------------------------------

            detections.append(
                {
                    # Identification
                    "id": f"DET-{len(detections) + 1:04d}",

                    # Classification
                    "class": class_name,
                    "label": label,
                    "label_hindi": hindi_label,

                    # Model confidence
                    "confidence": confidence,

                    # Bounding box
                    "bbox": bbox,

                    # UI colors
                    "color_rgb": list(rgb_color),
                    "color_bgr": list(bgr_color),

                    # Acoustic shadow
                    # Not currently calculated by YOLO inference.
                    "shadow_verified": False,
                    "shadow_length_m": None,

                    # Physical measurements
                    # Require calibrated sonar geometry.
                    "dimensions_m": None,
                    "length_m": None,
                    "width_m": None,
                    "depth_m": None,

                    # Application-level confidence alert
                    "severity": severity,

                    # Current MVP geotag
                    # Uses the coordinates supplied with
                    # the uploaded scan.
                    "lat": center_lat,
                    "lon": center_lon,

                    # Human-readable description
                    "description": (
                        f"Detected {label} "
                        f"using SonarSight YOLOv8n."
                    ),

                    # Additional contextual information
                    # intentionally unavailable until backed
                    # by real sonar/navigation data.
                    "fairway_proximity_m": None,
                    "tile_source": None,
                    "navigation_risk": None,
                    "ecosystem_risk": None,
                    "potential_impact": None,
                    "clearance_priority": None,
                }
            )

        return annotated, detections, 0