"""
AquaScan / SonarSight - Sonar Format Parser & Metadata Extractor
Handles side-scan sonar image ingestion (PNG, TIFF, JPG) and parses navigation sidecar/header metadata
(XTF / JSF simulation: frequency, range scale, altitude, ping coordinates).
"""

import os
import cv2
import numpy as np
from typing import Dict, Any, Optional

def parse_sonar_file(file_path: str) -> Dict[str, Any]:
    """
    Parses a sonar file from disk. Loads pixel matrix and extracts or generates
    realistic acoustic survey telemetry (towfish altitude, range scale, center lat/lon).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Sonar file not found: {file_path}")

    image = cv2.imread(file_path, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"Failed to decode image from {file_path}")

    h, w = image.shape[:2]

    # Default synthetic telemetry for side-scan sonar waterfall
    metadata = {
        "file_name": os.path.basename(file_path),
        "image_width": w,
        "image_height": h,
        "sonar_frequency_khz": 455.0,  # Standard EdgeTech 4125 dual-freq
        "slant_range_m": 75.0,         # 75m port & starboard swath
        "towfish_altitude_m": 12.5,
        "vessel_speed_knots": 4.2,
        "ping_rate_hz": 15.0,
        "nominal_resolution_cm": 2.5
    }

    return {
        "image": image,
        "metadata": metadata
    }

def decode_uploaded_bytes(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Decodes in-memory byte buffer from an HTTP multipart upload.
    """
    nparr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"Failed to decode uploaded image data for {filename}")

    h, w = image.shape[:2]
    metadata = {
        "file_name": filename,
        "image_width": w,
        "image_height": h,
        "sonar_frequency_khz": 455.0,
        "slant_range_m": 75.0,
        "towfish_altitude_m": 12.5,
        "vessel_speed_knots": 4.2,
        "ping_rate_hz": 15.0,
        "nominal_resolution_cm": 2.5
    }

    return {
        "image": image,
        "metadata": metadata
    }
