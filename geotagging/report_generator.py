"""
AquaScan - Structured Report Generator

Generates:
    - JSON detection reports
    - CSV detection reports
    - PDF detection reports

The reports contain only information actually available from
the current AquaScan MVP pipeline.

Detection model:
    SonarSight YOLOv8n

Supported classes:
    - submarine_pipeline
    - shipwreck
    - ghost_net
    - mine_cylinder

Important:
    Model confidence is used for the alert level.
    It does not represent physical hazard severity.

    Depth, physical dimensions, acoustic shadow measurements,
    navigation risk, ecosystem risk, and fairway clearance are
    reported as unavailable unless supplied by another pipeline
    component.
"""

import io
import csv

from datetime import datetime, timezone
from typing import Dict, Any, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)


# ============================================================
# CONSTANTS
# ============================================================

CLASS_NAMES = [
    "submarine_pipeline",
    "shipwreck",
    "ghost_net",
    "mine_cylinder",
]

SEVERITY_LEVELS = [
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "LOW",
]


# ============================================================
# HELPERS
# ============================================================

def _utc_date() -> str:
    """Return the current UTC date as YYYY-MM-DD."""

    return datetime.now(
        timezone.utc
    ).strftime("%Y-%m-%d")


def _utc_timestamp() -> str:
    """Return the current UTC timestamp in ISO format."""

    return (
        datetime.now(timezone.utc)
        .isoformat()
        .replace("+00:00", "Z")
    )


def _format_confidence(value: Any) -> float:
    """
    Convert model confidence into a percentage.

    The detector normally supplies confidence as 0.0-1.0.
    This helper also accepts an already-converted percentage.
    """

    try:
        confidence = float(value)
    except (TypeError, ValueError):
        return 0.0

    if 0.0 <= confidence <= 1.0:
        confidence *= 100.0

    return round(
        max(0.0, min(100.0, confidence)),
        1,
    )


def _parse_dimensions(
    dimensions: Any,
    length_value: Any,
    width_value: Any,
):
    """
    Parse dimensions only when they are actually supplied.

    Examples accepted:
        "15x4.5m"
        "15 x 4.5 m"

    Returns:
        (length_m, width_m)
    """

    length_m = length_value
    width_m = width_value

    if (
        isinstance(dimensions, str)
        and "x" in dimensions.lower()
    ):

        try:

            cleaned = (
                dimensions
                .lower()
                .replace("m", "")
                .strip()
            )

            parts = cleaned.split("x")

            if len(parts) >= 2:

                parsed_length = float(
                    parts[0].strip()
                )

                parsed_width = float(
                    parts[1].strip()
                )

                length_m = parsed_length
                width_m = parsed_width

        except (
            ValueError,
            TypeError,
        ):
            pass

    return length_m, width_m


def _safe_value(
    value: Any,
    default: Any = None,
):
    """
    Return default only when value is missing.

    Unlike the old implementation, this does not inject
    fabricated physical measurements.
    """

    if value is None:
        return default

    return value


# ============================================================
# JSON REPORT
# ============================================================

def generate_json_report(
    survey_meta: Dict[str, Any],
    detections: List[Dict[str, Any]],
    false_positive_count: int = 0,
) -> Dict[str, Any]:
    """
    Generate the structured AquaScan JSON report.
    """

    now_str = _utc_date()

    job_id = str(
        survey_meta.get(
            "job_id",
            "001",
        )
    )

    report_id = (
        f"AS-{now_str}-"
        f"{job_id[-4:].upper()}"
    )

    # --------------------------------------------------------
    # CLASS COUNTS
    # --------------------------------------------------------

    by_class = {
        class_name: 0
        for class_name in CLASS_NAMES
    }

    # --------------------------------------------------------
    # SEVERITY COUNTS
    # --------------------------------------------------------

    by_severity = {
        severity: 0
        for severity in SEVERITY_LEVELS
    }

    # --------------------------------------------------------
    # FORMAT DETECTIONS
    # --------------------------------------------------------

    formatted_dets = []

    for idx, detection in enumerate(
        detections
    ):

        det_id = detection.get(
            "id",
            f"DET-{idx + 1:04d}",
        )

        class_name = detection.get(
            "class",
            "unknown",
        )

        if class_name not in by_class:
            by_class[class_name] = 0

        by_class[class_name] += 1

        severity = str(
            detection.get(
                "severity",
                "Low",
            )
        ).upper()

        if severity not in by_severity:
            by_severity[severity] = 0

        by_severity[severity] += 1

        # ----------------------------------------------------
        # CONFIDENCE
        # ----------------------------------------------------

        confidence = _format_confidence(
            detection.get(
                "confidence",
                detection.get(
                    "conf",
                    0.0,
                ),
            )
        )

        # ----------------------------------------------------
        # DIMENSIONS
        # ----------------------------------------------------

        length_m, width_m = (
            _parse_dimensions(
                detection.get(
                    "dimensions_m"
                ),
                detection.get(
                    "length_m"
                ),
                detection.get(
                    "width_m"
                ),
            )
        )

        # ----------------------------------------------------
        # LOCATION
        # ----------------------------------------------------

        latitude = detection.get(
            "lat"
        )

        longitude = detection.get(
            "lon"
        )

        depth_m = detection.get(
            "depth_m"
        )

        # ----------------------------------------------------
        # OPTIONAL ANALYSIS
        # ----------------------------------------------------

        navigation_risk = detection.get(
            "navigation_risk"
        )

        ecosystem_risk = detection.get(
            "ecosystem_risk"
        )

        potential_impact = detection.get(
            "potential_impact"
        )

        clearance_priority = detection.get(
            "clearance_priority"
        )

        shadow_length = detection.get(
            "shadow_length_m"
        )

        tile_source = detection.get(
            "tile_source"
        )

        timestamp = detection.get(
            "timestamp",
            _utc_timestamp(),
        )

        # ----------------------------------------------------
        # DESCRIPTION
        # ----------------------------------------------------

        description = detection.get(
            "description"
        )

        if not description:

            description = (
                f"Potential {class_name.replace('_', ' ')} "
                f"detected by SonarSight YOLOv8n "
                f"with {confidence:.1f}% confidence."
            )

        # ----------------------------------------------------
        # APPEND DETECTION
        # ----------------------------------------------------

        formatted_dets.append(
            {
                "detection_id": det_id,

                "class": class_name,

                "confidence": confidence,

                "severity": severity,

                "navigation_risk": (
                    navigation_risk
                ),

                "ecosystem_risk": (
                    ecosystem_risk
                ),

                "potential_impact": (
                    potential_impact
                ),

                "clearance_priority": (
                    clearance_priority
                ),

                "description": description,

                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "depth_m": depth_m,
                },

                "bounding_dimensions": {
                    "length_m": length_m,
                    "width_m": width_m,
                },

                "dimensions_m": detection.get(
                    "dimensions_m"
                ),

                "acoustic_shadow_length_m": (
                    shadow_length
                ),

                "shadow_verified": detection.get(
                    "shadow_verified",
                    False,
                ),

                "bbox": detection.get(
                    "bbox",
                    [],
                ),

                "color_rgb": detection.get(
                    "color_rgb"
                ),

                "tile_source": tile_source,

                "timestamp": timestamp,
            }
        )

    # ========================================================
    # REPORT
    # ========================================================

    return {
        "report_id": report_id,

        "platform": (
            "AquaScan - AI-Powered "
            "Underwater Marine Detection"
        ),

        "model": (
            "SonarSight YOLOv8n"
        ),

        "survey_metadata": {
            "survey_date": survey_meta.get(
                "survey_date",
                now_str,
            ),

            "vessel": survey_meta.get(
                "vessel",
                "Unknown Vessel",
            ),

            "sonar_model": survey_meta.get(
                "sonar_model",
                "Unknown Sonar",
            ),

            "region": survey_meta.get(
                "region",
                "Unknown",
            ),

            "sea_basin": survey_meta.get(
                "sea_basin",
                "Unknown",
            ),

            "total_area_sqm": survey_meta.get(
                "total_area_sqm"
            ),
        },

        "detections": formatted_dets,

        "summary": {
            "total_detections": len(
                formatted_dets
            ),

            "by_class": by_class,

            "by_severity": by_severity,

            "false_positive_filtered": (
                false_positive_count
            ),

            "fairway_clearance_status": (
                "NOT ASSESSED"
            ),

            "recommended_action": (
                "Review detected targets"
                if formatted_dets
                else "No targets detected"
            ),
        },
    }


# ============================================================
# CSV REPORT
# ============================================================

def generate_csv_report(
    json_report: Dict[str, Any]
) -> str:
    """
    Generate a CSV report suitable for
    spreadsheet/GIS processing.
    """

    output = io.StringIO()

    writer = csv.writer(
        output
    )

    writer.writerow(
        [
            "detection_id",
            "class",
            "confidence_pct",
            "severity",
            "latitude",
            "longitude",
            "depth_m",
            "length_m",
            "width_m",
            "acoustic_shadow_length_m",
            "shadow_verified",
            "navigation_risk",
            "ecosystem_risk",
            "potential_impact",
            "clearance_priority",
            "tile_source",
            "timestamp",
        ]
    )

    for detection in json_report.get(
        "detections",
        [],
    ):

        location = detection.get(
            "location",
            {},
        )

        dimensions = detection.get(
            "bounding_dimensions",
            {},
        )

        writer.writerow(
            [
                detection.get(
                    "detection_id"
                ),

                detection.get(
                    "class"
                ),

                detection.get(
                    "confidence"
                ),

                detection.get(
                    "severity"
                ),

                location.get(
                    "latitude"
                ),

                location.get(
                    "longitude"
                ),

                location.get(
                    "depth_m"
                ),

                dimensions.get(
                    "length_m"
                ),

                dimensions.get(
                    "width_m"
                ),

                detection.get(
                    "acoustic_shadow_length_m"
                ),

                detection.get(
                    "shadow_verified",
                    False,
                ),

                detection.get(
                    "navigation_risk"
                ),

                detection.get(
                    "ecosystem_risk"
                ),

                detection.get(
                    "potential_impact"
                ),

                detection.get(
                    "clearance_priority"
                ),

                detection.get(
                    "tile_source"
                ),

                detection.get(
                    "timestamp"
                ),
            ]
        )

    return output.getvalue()


# ============================================================
# PDF REPORT
# ============================================================

def generate_pdf_report(
    json_report: Dict[str, Any]
) -> bytes:
    """
    Generate a concise AquaScan PDF detection report.
    """

    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,

        pagesize=letter,

        rightMargin=36,
        leftMargin=36,

        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # --------------------------------------------------------
    # STYLES
    # --------------------------------------------------------

    title_style = ParagraphStyle(
        "AquaScanTitle",

        parent=styles["Heading1"],

        fontName="Helvetica-Bold",

        fontSize=18,

        textColor=colors.HexColor(
            "#06283D"
        ),

        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "AquaScanSubtitle",

        parent=styles["Normal"],

        fontName="Helvetica",

        fontSize=10,

        textColor=colors.HexColor(
            "#0077B6"
        ),

        spaceAfter=12,
    )

    heading_style = ParagraphStyle(
        "AquaScanHeading",

        parent=styles["Heading2"],

        fontName="Helvetica-Bold",

        fontSize=11,

        textColor=colors.HexColor(
            "#06283D"
        ),

        spaceBefore=10,

        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "AquaScanBody",

        parent=styles["Normal"],

        fontName="Helvetica",

        fontSize=8.5,

        textColor=colors.HexColor(
            "#335368"
        ),

        leading=12,
    )

    footnote_style = ParagraphStyle(
        "AquaScanFootnote",

        parent=styles["Italic"],

        fontSize=7,

        textColor=colors.HexColor(
            "#648296"
        ),
    )

    # --------------------------------------------------------
    # DATA
    # --------------------------------------------------------

    meta = json_report.get(
        "survey_metadata",
        {},
    )

    summary = json_report.get(
        "summary",
        {},
    )

    detections = json_report.get(
        "detections",
        [],
    )

    # --------------------------------------------------------
    # DOCUMENT ELEMENTS
    # --------------------------------------------------------

    elements = []

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    elements.append(
        Paragraph(
            "AQUASCAN",
            title_style,
        )
    )

    elements.append(
        Paragraph(
            (
                "AI-Powered Underwater Marine "
                "Debris & Anomaly Detection Report "
                "| Report ID: "
                f"<b>{json_report.get('report_id', 'N/A')}</b>"
            ),
            subtitle_style,
        )
    )

    elements.append(
        Spacer(1, 6)
    )

    # --------------------------------------------------------
    # MODEL INFORMATION
    # --------------------------------------------------------

    elements.append(
        Paragraph(
            "Analysis Information",
            heading_style,
        )
    )

    model_name = json_report.get(
        "model",
        "SonarSight YOLOv8n",
    )

    analysis_data = [
        [
            "Detection Model:",
            str(model_name),
            "Total Targets:",
            str(
                summary.get(
                    "total_detections",
                    0,
                )
            ),
        ],

        [
            "Survey Date:",
            str(
                meta.get(
                    "survey_date",
                    "N/A",
                )
            ),

            "False Positives Filtered:",
            str(
                summary.get(
                    "false_positive_filtered",
                    0,
                )
            ),
        ],

        [
            "Vessel:",
            str(
                meta.get(
                    "vessel",
                    "N/A",
                )
            ),

            "Area:",
            (
                "N/A"
                if meta.get(
                    "total_area_sqm"
                ) in (None, 0)
                else f"{meta.get('total_area_sqm')} m²"
            ),
        ],

        [
            "Sonar:",
            str(
                meta.get(
                    "sonar_model",
                    "N/A",
                )
            ),

            "Region:",
            str(
                meta.get(
                    "region",
                    "N/A",
                )
            ),
        ],
    ]

    analysis_table = Table(
        analysis_data,

        colWidths=[
            105,
            160,
            125,
            140,
        ],
    )

    analysis_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    colors.HexColor(
                        "#EAF4F7"
                    ),
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, -1),
                    colors.HexColor(
                        "#06283D"
                    ),
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (-1, -1),
                    "Helvetica",
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    5,
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    5,
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor(
                        "#D4E7EF"
                    ),
                ),
            ]
        )
    )

    elements.append(
        analysis_table
    )

    elements.append(
        Spacer(1, 12)
    )

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    elements.append(
        Paragraph(
            "Detection Summary",
            heading_style,
        )
    )

    total_detections = summary.get(
        "total_detections",
        0,
    )

    by_severity = summary.get(
        "by_severity",
        {},
    )

    high_count = by_severity.get(
        "HIGH",
        0,
    )

    medium_count = by_severity.get(
        "MEDIUM",
        0,
    )

    low_count = by_severity.get(
        "LOW",
        0,
    )

    summary_text = (
        f"<b>{total_detections}</b> "
        "potential sonar targets were detected "
        "by SonarSight YOLOv8n. "
        f"<b>{high_count}</b> targets have High "
        "model-confidence, "
        f"<b>{medium_count}</b> have Medium "
        "model-confidence, and "
        f"<b>{low_count}</b> have Low "
        "model-confidence."
        "<br/><br/>"
        "<b>Important:</b> Confidence-based alert "
        "levels indicate model confidence only. "
        "They do not represent physical hazard "
        "severity or navigation clearance."
    )

    elements.append(
        Paragraph(
            summary_text,
            body_style,
        )
    )

    elements.append(
        Spacer(1, 12)
    )

    # --------------------------------------------------------
    # DETECTION TABLE
    # --------------------------------------------------------

    elements.append(
        Paragraph(
            "Detected Targets",
            heading_style,
        )
    )

    det_headers = [
        "ID",
        "Class",
        "Confidence",
        "Alert",
        "Latitude",
        "Longitude",
        "Depth",
        "Dimensions",
    ]

    det_rows = [
        det_headers
    ]

    for detection in detections:

        location = detection.get(
            "location",
            {},
        )

        dimensions = detection.get(
            "bounding_dimensions",
            {},
        )

        latitude = location.get(
            "latitude"
        )

        longitude = location.get(
            "longitude"
        )

        depth = location.get(
            "depth_m"
        )

        length_m = dimensions.get(
            "length_m"
        )

        width_m = dimensions.get(
            "width_m"
        )

        # ----------------------------------------------------
        # FORMAT LOCATION
        # ----------------------------------------------------

        if (
            latitude is not None
            and longitude is not None
        ):

            lat_lon = (
                f"{float(latitude):.4f}"
            )

            lon_text = (
                f"{float(longitude):.4f}"
            )

        else:

            lat_lon = "N/A"
            lon_text = "N/A"

        # ----------------------------------------------------
        # FORMAT DEPTH
        # ----------------------------------------------------

        depth_text = (
            f"{depth} m"
            if depth is not None
            else "N/A"
        )

        # ----------------------------------------------------
        # FORMAT DIMENSIONS
        # ----------------------------------------------------

        if (
            length_m is not None
            and width_m is not None
        ):

            dimensions_text = (
                f"{length_m} x "
                f"{width_m} m"
            )

        else:

            dimensions_text = "N/A"

        # ----------------------------------------------------
        # APPEND ROW
        # ----------------------------------------------------

        det_rows.append(
            [
                detection.get(
                    "detection_id",
                    "N/A",
                ),

                detection.get(
                    "class",
                    "Unknown",
                )
                .replace("_", " ")
                .title(),

                f"{detection.get('confidence', 0)}%",

                detection.get(
                    "severity",
                    "N/A",
                ),

                lat_lon,

                lon_text,

                depth_text,

                dimensions_text,
            ]
        )

    # --------------------------------------------------------
    # EMPTY RESULT
    # --------------------------------------------------------

    if not detections:

        det_rows.append(
            [
                "-",
                "No targets detected",
                "-",
                "-",
                "-",
                "-",
                "N/A",
                "N/A",
            ]
        )

    # --------------------------------------------------------
    # TABLE
    # --------------------------------------------------------

    detection_table = Table(
        det_rows,

        colWidths=[
            48,
            78,
            58,
            45,
            70,
            70,
            50,
            70,
        ],

        repeatRows=1,
    )

    detection_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor(
                        "#0077B6"
                    ),
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),

                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    7,
                ),

                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER",
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),

                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.white,
                        colors.HexColor(
                            "#F4FAFC"
                        ),
                    ],
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor(
                        "#D4E7EF"
                    ),
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    4,
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    4,
                ),
            ]
        )
    )

    elements.append(
        detection_table
    )

    elements.append(
        Spacer(1, 14)
    )

    # --------------------------------------------------------
    # DATA LIMITATIONS
    # --------------------------------------------------------

    elements.append(
        Paragraph(
            (
                "<b>Data availability:</b> "
                "Depth, physical dimensions, acoustic-shadow "
                "measurements, and fairway clearance are "
                "reported as N/A when calibrated sonar "
                "metadata or dedicated analysis is unavailable."
            ),
            body_style,
        )
    )

    elements.append(
        Spacer(1, 10)
    )

    # --------------------------------------------------------
    # FOOTNOTE
    # --------------------------------------------------------

    elements.append(
        Paragraph(
            (
                "<i>Generated by AquaScan using "
                "SonarSight YOLOv8n. "
                "Detection results should be reviewed "
                "by an appropriate operator before "
                "operational decisions are made.</i>"
            ),
            footnote_style,
        )
    )

    # --------------------------------------------------------
    # BUILD PDF
    # --------------------------------------------------------

    doc.build(
        elements
    )

    buffer.seek(0)

    return buffer.getvalue()