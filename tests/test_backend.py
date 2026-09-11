"""
Automated unit tests for AquaScan / SonarSight backend pipeline and API.
"""

import os
import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from pipeline.preprocessor import preprocess_sonar_frame, wavelet_despeckle, apply_clahe
from postprocessing.shadow_validator import analyze_acoustic_shadow
from postprocessing.confidence import calibrate_confidence, score_severity
from geotagging.coordinate_mapper import project_pixel_to_wgs84
from geotagging.report_generator import generate_json_report, generate_csv_report, generate_pdf_report
from server import app

client = TestClient(app)

def test_wavelet_despeckle_and_clahe():
    dummy = np.random.randint(0, 255, (256, 256), dtype=np.uint8)
    despeckled = wavelet_despeckle(dummy)
    assert despeckled.shape == (256, 256)
    assert despeckled.dtype == np.uint8

    enhanced = apply_clahe(despeckled)
    assert enhanced.shape == (256, 256)

    dummy_bgr = cv2.cvtColor(dummy, cv2.COLOR_GRAY2BGR)
    processed_bgr = preprocess_sonar_frame(dummy_bgr)
    assert processed_bgr.shape == (256, 256, 3)

def test_shadow_validator():
    # Construct an image with a bright highlight and dark shadow
    test_img = np.full((100, 200), 120, dtype=np.uint8)
    # Bright target
    test_img[30:70, 40:80] = 240
    # Leeward shadow (to the right, away from nadir)
    test_img[30:70, 80:130] = 15

    res = analyze_acoustic_shadow(test_img, (40, 30, 80, 70), nadir_x=20)
    assert res["shadow_verified"] is True
    assert res["contrast_ratio"] > 0.4
    assert res["estimated_shadow_length_m"] > 0

def test_confidence_calibration_and_severity():
    calib = calibrate_confidence(0.90)
    assert 0.0 < calib < 1.0

    sev_shipwreck = score_severity("shipwreck", 0.95, 25.0, 8.0, fairway_proximity_m=10.0)
    assert sev_shipwreck == "CRITICAL"

    sev_pipe = score_severity("pipe_cylinder", 0.85, 18.0, 1.2, fairway_proximity_m=15.0)
    assert sev_pipe in ["CRITICAL", "HIGH"]

def test_coordinate_geotagging():
    lat, lon, depth = project_pixel_to_wgs84(
        pixel_x=640, pixel_y=360, image_width=1280, image_height=720,
        center_lat=27.8921, center_lon=-82.4938
    )
    assert abs(lat - 27.8921) < 0.01
    assert abs(lon - (-82.4938)) < 0.01
    assert depth > 10.0

def test_report_generation():
    meta = {"job_id": "test-123", "survey_date": "2026-09-07", "vessel": "AUV-Poseidon", "sonar_model": "EdgeTech 4125", "total_area_sqm": 125000}
    detections = [{
        "id": "DET-001",
        "class": "shipwreck",
        "confidence": 0.94,
        "severity": "CRITICAL",
        "lat": 27.8921,
        "lon": -82.4938,
        "depth_m": 14.2,
        "length_m": 28.5,
        "width_m": 8.2,
        "shadow_length_m": 12.0
    }]
    json_rep = generate_json_report(meta, detections, false_positive_count=5)
    assert "report_id" in json_rep
    assert json_rep["summary"]["total_detections"] == 1
    assert json_rep["summary"]["by_class"]["shipwreck"] == 1
    assert json_rep["summary"]["by_severity"]["CRITICAL"] == 1

    csv_data = generate_csv_report(json_rep)
    assert "detection_id,class,confidence_pct" in csv_data
    assert "DET-001" in csv_data

    pdf_bytes = generate_pdf_report(json_rep)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ONLINE"
    assert "SagarDrishti" in data["system"]

def test_api_mission_preset():
    res = client.get("/api/mission/preset?preset_id=tampa_bay")
    assert res.status_code == 200
    data = res.json()
    assert "mission_name" in data
    assert len(data["detections"]) > 0
    assert "raw_image_base64" in data
    assert "annotated_image_base64" in data
    assert data["summary"]["total_detections"] > 0

def test_api_reports_download():
    # First ensure preset exists in cache
    client.get("/api/mission/preset?preset_id=tampa_bay")
    
    csv_res = client.get("/api/jobs/preset-tampa_bay/report/csv")
    assert csv_res.status_code == 200
    assert "detection_id" in csv_res.text

    pdf_res = client.get("/api/jobs/preset-tampa_bay/report/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.content.startswith(b"%PDF")

def test_api_edge_benchmarks():
    res = client.get("/api/edge/benchmarks")
    assert res.status_code == 200
    data = res.json()
    assert "benchmarks" in data
    assert len(data["benchmarks"]) >= 4

def test_api_upload_sonar():
    test_img = np.full((120, 200, 3), 100, dtype=np.uint8)
    cv2.rectangle(test_img, (50, 40), (90, 80), (240, 240, 240), -1)
    _, encoded = cv2.imencode(".png", test_img)
    file_bytes = encoded.tobytes()

    response = client.post(
        "/api/upload",
        files={"file": ("test_sonar.png", file_bytes, "image/png")},
        params={"conf_threshold": 0.35, "enable_despeckle": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    job_id = data["job_id"]

    status_res = client.get(f"/api/jobs/{job_id}/status")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "complete"

    results_res = client.get(f"/api/jobs/{job_id}/results")
    assert results_res.status_code == 200
    results_data = results_res.json()
    assert results_data["job_id"] == job_id
    assert "detections" in results_data
    assert "raw_image_base64" in results_data

