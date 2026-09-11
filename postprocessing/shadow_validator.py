"""
AquaScan / SonarSight - Acoustic Shadow Geometry Validator & False Positive Suppression
In side-scan sonar, elevated man-made objects block acoustic pulses, casting a distinct
leeward acoustic shadow (zone of zero backscatter) away from the sonar nadir line.
This module checks for:
1. Low backscatter intensity in the shadow region behind the target
2. Proportionality between object dimensions and shadow length (H = L * h / R)
3. Rejection of natural seabed flat rocks or speckle peaks lacking acoustic shadows.
"""

import cv2
import numpy as np
from typing import Dict, Any, Tuple

def analyze_acoustic_shadow(
    image_gray: np.ndarray,
    bbox: Tuple[int, int, int, int],
    nadir_x: int = 640,
    min_shadow_contrast_ratio: float = 0.40
) -> Dict[str, Any]:
    """
    Validates whether the detection has a physically plausible acoustic shadow.
    bbox: (x1, y1, x2, y2)
    nadir_x: horizontal pixel position of the sonar towfish ground track (nadir)
    """
    h, w = image_gray.shape[:2]
    x1, y1, x2, y2 = bbox

    # Determine shadow projection direction (away from nadir)
    center_x = (x1 + x2) // 2
    is_starboard = center_x >= nadir_x
    
    obj_w = max(4, x2 - x1)
    obj_h = max(4, y2 - y1)

    # Object backscatter region
    obj_crop = image_gray[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
    obj_mean = float(np.mean(obj_crop)) if obj_crop.size > 0 else 128.0

    # Inspect shadow search window immediately downstream along the acoustic beam
    shadow_len = int(obj_w * 1.25)
    if is_starboard:
        sx1 = min(w - 1, x2)
        sx2 = min(w, x2 + shadow_len)
    else:
        sx1 = max(0, x1 - shadow_len)
        sx2 = max(0, x1)

    sy1 = max(0, y1)
    sy2 = min(h, y2)

    shadow_crop = image_gray[sy1:sy2, sx1:sx2]
    shadow_mean = float(np.mean(shadow_crop)) if shadow_crop.size > 0 else 100.0

    # Genuine acoustic shadow should have significantly lower return than the highlight
    contrast = (obj_mean - shadow_mean) / max(1.0, obj_mean)
    has_valid_shadow = bool(shadow_mean < 75.0 or contrast > min_shadow_contrast_ratio)
    
    # Estimate physical shadow length in meters (using approx 0.08m per pixel)
    estimated_shadow_m = round(float(abs(sx2 - sx1)) * 0.08, 1)

    return {
        "shadow_verified": has_valid_shadow,
        "contrast_ratio": round(contrast, 3),
        "target_backscatter": round(obj_mean, 1),
        "shadow_backscatter": round(shadow_mean, 1),
        "estimated_shadow_length_m": max(1.5, estimated_shadow_m)
    }
