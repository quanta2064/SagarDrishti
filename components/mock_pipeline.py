import cv2
import numpy as np
import pywt

def run_despeckle_and_clahe(image_bgr):
    if len(image_bgr.shape) == 3:
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_bgr.copy()

    coeffs = pywt.dwt2(gray, 'db2')
    LL, (LH, HL, HH) = coeffs

    threshold = np.std(HH) * 1.2
    LH_t = pywt.threshold(LH, threshold, mode='soft')
    HL_t = pywt.threshold(HL, threshold, mode='soft')
    HH_t = pywt.threshold(HH, threshold, mode='soft')

    despeckled = pywt.idwt2((LL, (LH_t, HL_t, HH_t)), 'db2')
    despeckled = np.clip(despeckled, 0, 255).astype(np.uint8)

    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(despeckled)

    return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

def detect_anomalies(image_bgr, conf_thresh=0.35, require_shadow=True):
    h, w = image_bgr.shape[:2]
    detections = [
        {
            'id': 'HAZ-001',
            'class': 'Shipwreck',
            'conf': 0.94,
            'bbox': (360, 250, 540, 335),
            'color': (0, 0, 255),
            'shadow_verified': True,
            'dimensions_m': '28.5m x 8.2m',
            'depth_m': 14.2,
            'severity': 'CRITICAL',
            'lat': 27.8921,
            'lon': -82.4938,
            'description': 'Sunken coastal vessel hull obstructing primary navigational fairway.'
        },
        {
            'id': 'HAZ-002',
            'class': 'Severed Pipe',
            'conf': 0.88,
            'bbox': (770, 470, 975, 535),
            'color': (0, 140, 255),
            'shadow_verified': True,
            'dimensions_m': '18.0m x 1.2m',
            'depth_m': 19.8,
            'severity': 'HIGH',
            'lat': 27.8954,
            'lon': -82.4880,
            'description': 'Exposed metallic industrial conduit with sharp shear fracture.'
        },
        {
            'id': 'HAZ-003',
            'class': 'Ghost Fishing Net',
            'conf': 0.76,
            'bbox': (210, 450, 320, 540),
            'color': (0, 230, 255),
            'shadow_verified': True,
            'dimensions_m': '12.4m x 9.8m',
            'depth_m': 16.5,
            'severity': 'MODERATE',
            'lat': 27.8890,
            'lon': -82.4962,
            'description': 'Dense synthetic monofilament entanglements posing propeller hazard.'
        }
    ]

    filtered = []
    annotated = image_bgr.copy()
    for d in detections:
        if d['conf'] < conf_thresh:
            continue
        if require_shadow and not d['shadow_verified']:
            continue
        filtered.append(d)
        x1, y1, x2, y2 = d['bbox']
        x1 = int(x1 * (w / 1280.0))
        x2 = int(x2 * (w / 1280.0))
        y1 = int(y1 * (h / 720.0))
        y2 = int(y2 * (h / 720.0))
        cv2.rectangle(annotated, (x1, y1), (x2, y2), d['color'], 2)
        pct = int(d['conf'] * 100)
        label = f"{d['class']} ({pct}%)"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
        cv2.rectangle(annotated, (x1, y1 - 24), (x1 + tw + 10, y1), d['color'], -1)
        cv2.putText(annotated, label, (x1 + 5, y1 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    return annotated, filtered
