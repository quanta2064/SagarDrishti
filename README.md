# AquaScan

## AI-Powered Underwater Marine Debris & Anomaly Detection

AquaScan is an AI-powered side-scan sonar analysis platform designed to assist in detecting potential underwater marine debris and anomalies from sonar imagery.

The system uses a custom-trained **SonarSight YOLOv8n** object detection model to identify four underwater target classes:

- Submarine Pipeline
- Shipwreck
- Ghost Net
- Mine Cylinder

AquaScan provides an interactive dashboard where users can upload sonar imagery, run AI detection, visualize detected targets, view their geographic locations, and export detection reports.

---

## Key Features

- AI-based detection of underwater sonar targets
- Custom-trained SonarSight YOLOv8n model
- Four target classes: Pipeline, Shipwreck, Ghost Net, Mine Cylinder
- Confidence-based alert levels
- Sonar image visualization with detection bounding boxes
- Geographic detection mapping
- CSV export
- GeoJSON export
- PDF detection reports
- FastAPI backend
- Streamlit frontend

### Confidence-Based Alert Levels

| Model Confidence | Alert Level |
|---:|---|
| ≥ 70% | High |
| 40–69% | Medium |
| < 40% | Low |

Alert levels represent **model confidence only** and do not independently represent physical hazard severity.

---

## Technology Stack

### Machine Learning

- YOLOv8n
- Ultralytics
- PyTorch
- OpenCV
- Side-Scan Sonar Imagery

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

### Frontend

- Streamlit
- Pandas
- Folium
- Streamlit-Folium

### Reporting

- CSV
- GeoJSON
- ReportLab

---

## SonarSight YOLOv8n

SonarSight is the custom-trained YOLOv8n model used by AquaScan.

The model detects four underwater sonar target classes:

```text
0 → submarine_pipeline
1 → shipwreck
2 → ghost_net
3 → mine_cylinder
Training Configuration
Parameter	Value
Model	YOLOv8n
Maximum Epochs	100
Best Epoch	79
Batch Size	16
Image Size	640 × 640
Patience	15
Pretrained	Yes

The trained model is stored at:

models/sonarsight_yolov8n_best.pt
Dataset

The model was trained using the DRISHTI-SSS side-scan sonar dataset.

Dataset Distribution
Split	Images
Training	4,297
Validation	904
Test	901
Training Annotation Distribution
Class	Objects
Submarine Pipeline	1,000
Shipwreck	1,554
Ghost Net	900
Mine Cylinder	843
Model Performance
Validation Results
Metric	Result
Precision	79.4%
Recall	76.7%
mAP@0.5	76.3%
mAP@0.5:0.95	58.4%
Test Results
Metric	Result
Precision	78.26%
Recall	69.78%
mAP@0.5	71.59%
mAP@0.5:0.95	55.38%

Performance varies between target classes, with submarine pipeline and ghost-net examples showing stronger results than shipwreck and mine-cylinder detection.

How It Works
Sonar Image
     ↓
FastAPI Backend
     ↓
SonarSight YOLOv8n
     ↓
Object Detection
     ↓
Confidence / Alert Level
     ↓
Geotagging
     ↓
JSON / CSV / GeoJSON / PDF
     ↓
Streamlit Dashboard
Installation

Clone the repository:

git clone https://github.com/quanta2064/SagarDrishti.git

Enter the project directory:

cd SagarDrishti

Create a virtual environment:

python -m venv .venv

Activate it:

.venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt
Running AquaScan
1. Start the Backend

From the project root:

uvicorn server:app --reload

Backend:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs
2. Start the Frontend

Open another terminal with the virtual environment activated:

streamlit run app.py

Dashboard:

http://localhost:8501
Using AquaScan
Upload a supported side-scan sonar image.
Adjust the detection confidence threshold.
Run the AI detection pipeline.
Review the raw and annotated sonar imagery.
Inspect detected targets and confidence levels.
View detection locations on the interactive map.
Export the results as CSV, GeoJSON, or PDF.

Supported image formats:

PNG
JPG
JPEG
TIF
TIFF
Current MVP Limitations

The current AquaScan MVP focuses on AI-based target detection from uploaded side-scan sonar imagery.

The current detector does not automatically calculate:

Physical object dimensions
Water depth
Calibrated acoustic-shadow measurements
Actual fairway clearance
Navigation risk
Ecosystem risk
Survey coverage area

When this information is unavailable, AquaScan reports it as unavailable rather than generating fabricated values.

The current MVP also uses supplied scan coordinates for geotagging rather than deriving precise object coordinates from a complete sonar navigation track.

Future Scope

Future development can extend AquaScan with:

Native XTF / JSF / S7K sonar ingestion
Calibrated sonar geometry
Accurate depth estimation
Acoustic-shadow analysis
Object size estimation
Large-area multi-tile sonar processing
GPS / AUV navigation-track integration
Advanced false-positive filtering
Temporal change detection
Additional marine debris classes
Edge deployment on AUV hardware
Mission-level GIS analysis
Operational Note

AquaScan is an AI-assisted detection system.

A model detection indicates that the sonar image contains visual characteristics associated with one of the trained classes. It does not independently establish the identity, physical dimensions, depth, or operational significance of an object.

Detection results should be reviewed by an appropriate operator before being used for operational decisions.

Project Information

Project: AquaScan

Model: SonarSight YOLOv8n

Application: AI-powered underwater marine debris and anomaly detection using side-scan sonar imagery.

Repository: SagarDrishti
