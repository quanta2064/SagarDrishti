"""
AquaScan / SonarSight - Confidence Calibration & Hazard Severity Scoring
Implements post-hoc temperature scaling to align raw detector logits to true probabilities
and computes tactical maritime severity levels (CRITICAL, HIGH, MEDIUM, LOW).
"""

import math
from typing import Dict, Any

# Optimal temperature parameter tuned for sonar YOLOv8 models
DEFAULT_TEMPERATURE = 1.35

def calibrate_confidence(raw_conf: float, temperature: float = DEFAULT_TEMPERATURE) -> float:
    """
    Applies temperature scaling to raw sigmoid confidence scores:
    p_calibrated = 1 / (1 + exp(- logit / T))
    """
    if raw_conf <= 0.01:
        return 0.01
    if raw_conf >= 0.99:
        return 0.99
        
    logit = math.log(raw_conf / (1.0 - raw_conf))
    scaled_logit = logit / temperature
    calibrated = 1.0 / (1.0 + math.exp(-scaled_logit))
    return round(float(calibrated), 4)

def score_severity(
    class_name: str,
    confidence: float,
    length_m: float,
    width_m: float,
    fairway_proximity_m: float = 12.0
) -> str:
    """
    Calculates severity level based on maritime navigational impact:
    - CRITICAL: Large hull obstruction (shipwreck) or massive debris within primary fairway (< 25m)
    - HIGH: Ruptured pipeline / cylinder or entangled fishing nets with high confidence
    - MEDIUM: Moderate debris / nets in secondary waters
    - LOW: Small miscellaneous anomalies or deep seafloor contacts
    """
    area = length_m * width_m
    norm_class = class_name.lower().replace(" ", "_").replace("/", "_")

    if "shipwreck" in norm_class:
        if fairway_proximity_m < 50.0 or area > 60.0:
            return "CRITICAL"
        return "HIGH"

    if "pipe" in norm_class or "cylinder" in norm_class:
        if fairway_proximity_m < 30.0 or length_m > 12.0:
            return "HIGH" if confidence > 0.70 else "MEDIUM"
        return "MEDIUM"

    if "net" in norm_class or "debris" in norm_class:
        if area > 40.0:
            return "HIGH"
        return "MEDIUM"

    # Miscellaneous anomalies
    if area > 50.0 and fairway_proximity_m < 25.0:
        return "HIGH"
    elif area > 20.0:
        return "MEDIUM"
    else:
        return "LOW"
