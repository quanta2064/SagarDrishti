"""
AquaScan / SonarSight - Sonar Ingestion & Preprocessing Pipeline
Implements 2D Discrete Wavelet Transform (DWT) despeckling + CLAHE contrast normalization.
Preserves acoustic shadow boundaries while filtering speckle noise and seafloor reverberation.
"""

import cv2
import numpy as np
import pywt
from typing import Tuple

def wavelet_despeckle(image_gray: np.ndarray, wavelet: str = 'db2', threshold_factor: float = 1.2) -> np.ndarray:
    """
    Applies 2D Discrete Wavelet Transform (DWT) soft thresholding to remove acoustic speckle noise
    while preserving sharp edge boundaries vital for acoustic shadow segmentation.
    """
    coeffs = pywt.dwt2(image_gray.astype(np.float32), wavelet)
    ll, (lh, hl, hh) = coeffs

    # Compute soft threshold based on high frequency subband standard deviation
    threshold = np.std(hh) * threshold_factor
    lh_thresh = pywt.threshold(lh, threshold, mode='soft')
    hl_thresh = pywt.threshold(hl, threshold, mode='soft')
    hh_thresh = pywt.threshold(hh, threshold, mode='soft')

    despeckled = pywt.idwt2((ll, (lh_thresh, hl_thresh, hh_thresh)), wavelet)
    # Ensure correct dimensions match input
    despeckled = despeckled[:image_gray.shape[0], :image_gray.shape[1]]
    return np.clip(despeckled, 0, 255).astype(np.uint8)

def apply_clahe(image_gray: np.ndarray, clip_limit: float = 2.5, grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
    """
    Contrast Limited Adaptive Histogram Equalization tuned for acoustic sonar dynamic range.
    Compensates for acoustic transmission loss across range swaths (near-nadir to far-range).
    """
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=grid_size)
    return clahe.apply(image_gray)

def preprocess_sonar_frame(
    image_bgr: np.ndarray,
    enable_wavelet: bool = True,
    enable_clahe: bool = True,
    clip_limit: float = 2.5
) -> np.ndarray:
    """
    Full preprocessing pipeline: BGR/Gray conversion -> DWT Despeckling -> CLAHE -> BGR output.
    """
    if image_bgr is None or image_bgr.size == 0:
        raise ValueError("Input image is empty or invalid.")

    if len(image_bgr.shape) == 3 and image_bgr.shape[2] == 3:
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    elif len(image_bgr.shape) == 3 and image_bgr.shape[2] == 4:
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGRA2GRAY)
    else:
        gray = image_bgr.copy()

    processed = gray
    if enable_wavelet:
        processed = wavelet_despeckle(processed)
    if enable_clahe:
        processed = apply_clahe(processed, clip_limit=clip_limit)

    return cv2.cvtColor(processed, cv2.COLOR_GRAY2BGR)
