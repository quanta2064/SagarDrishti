"""
AquaScan / SonarSight - Tiling & Detection Stitching Engine
Slices high-resolution sonar waterfall imagery into 640x640 inference tiles
with 20% spatial overlap and merges cross-tile detections with Non-Maximum Suppression (NMS).
"""

import numpy as np
from typing import List, Tuple, Dict, Any

def generate_tiles(image_shape: Tuple[int, int], tile_size: int = 640, overlap_ratio: float = 0.2) -> List[Tuple[int, int, int, int]]:
    """
    Computes bounding coordinates (ymin, xmin, ymax, xmax) for sliding window tiles.
    """
    h, w = image_shape[:2]
    step = int(tile_size * (1.0 - overlap_ratio))
    
    y_starts = list(range(0, max(1, h - tile_size + 1), step))
    if len(y_starts) == 0 or y_starts[-1] + tile_size < h:
        y_starts.append(max(0, h - tile_size))
        
    x_starts = list(range(0, max(1, w - tile_size + 1), step))
    if len(x_starts) == 0 or x_starts[-1] + tile_size < w:
        x_starts.append(max(0, w - tile_size))
        
    tiles = []
    for y in sorted(list(set(y_starts))):
        for x in sorted(list(set(x_starts))):
            tiles.append((y, x, min(h, y + tile_size), min(w, x + tile_size)))
            
    return tiles

def compute_iou(boxA: List[float], boxB: List[float]) -> float:
    """Computes Intersection over Union between [x1, y1, x2, y2]."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxAArea = max(0, boxA[2] - boxA[0]) * max(0, boxA[3] - boxA[1])
    boxBArea = max(0, boxB[2] - boxB[0]) * max(0, boxB[3] - boxB[1])

    denom = float(boxAArea + boxBArea - interArea)
    return interArea / denom if denom > 0 else 0.0

def merge_detections_nms(detections: List[Dict[str, Any]], iou_threshold: float = 0.45) -> List[Dict[str, Any]]:
    """
    Merges duplicate detections across overlapping tiles using Non-Maximum Suppression (NMS).
    """
    if not detections:
        return []

    # Sort descending by confidence
    sorted_dets = sorted(detections, key=lambda x: x.get('confidence', x.get('conf', 0.0)), reverse=True)
    kept = []

    while sorted_dets:
        best = sorted_dets.pop(0)
        kept.append(best)
        sorted_dets = [
            d for d in sorted_dets
            if d.get('class') != best.get('class') or compute_iou(best['bbox'], d['bbox']) < iou_threshold
        ]

    return kept
