SagarDrishti

AI-powered underwater side-scan sonar debris detection and hazard mapping project.

Current status: Coder 3's backend/application work and an incomplete React frontend are currently in the repository.  

Team Work Allocation

Coder 1 — Acoustic Preprocessing & Tiling Engineer

Main responsibility: Build the sonar-image preprocessing and tiling pipeline.

Responsibilities

Remove acoustic speckle noise without blurring hard edges or shadows using Discrete Wavelet Transform (pywt).

Implement Contrast Limited Adaptive Histogram Equalization (CLAHE) tailored for sonar dynamic ranges.

Slice large sonar swaths into overlapping 640×640 patches and re-stitch bounding boxes after detection.

Hourly schedule

Hours 0–8: Set up the virtual environment, install opencv-python, PyWavelets, and numpy, and build baseline CLAHE.

Hours 8–20: Implement 2D Wavelet soft-threshold despeckling with pywt.wavedec2.

Hours 20–34: Build a sliding-window tiler with 20% overlap and non-maximum-suppression stitching.

Hours 34–44: Package the preprocessing/tiling functionality into a clean pipeline callable by the application.

Hours 44–48: Buffer, optimization, and edge-case testing, including grayscale vs. 3-channel input.

Expected modules

pipeline/
├── preprocessor.py
└── tiler.py

Required functions/classes from the task specification

pipeline/preprocessor.py

despeckle_sonar(image, wavelet='db4', level=2, threshold_scale=1.5)
enhance_contrast(image, clip_limit=2.5, tile_grid_size=(8,8))
process_sonar_pipeline(input_path_or_bytes)

The pipeline should support grayscale and 3-channel images and return both the raw normalized image and the fully preprocessed image for comparison.

pipeline/tiler.py

SonarTiler
├── slice_into_tiles(image, tile_size=640, overlap=0.2)
└── stitch_detections(detections_per_tile, iou_threshold=0.45)

The tiler should preserve tile IDs and offsets and convert tile-space bounding boxes back into original-image coordinates before suppressing duplicate detections across overlapping tile boundaries.

Coder 2 — AI Detection & Synthetic Data Engineer

Main responsibility: Build the AI detection layer and a procedural synthetic sonar-data fallback.

Responsibilities

Fine-tune or wrap Ultralytics YOLOv8 for four target classes:

Shipwreck

Pipe/Cylinder

Ghost Net

Hazard Anomaly

Implement synthetic_generator.py to generate realistic acoustic seafloor images so the team is not blocked when public datasets are unavailable.

Add shadow-consistency logic: a real 3D object on the seafloor should cast an acoustic shadow on the side opposite the sonar ping.

Hourly schedule

Hours 0–8: Install ultralytics, obtain YOLOv8n weights, and set up label/configuration files.

Hours 8–20: Build a procedural synthetic sonar generator that creates approximately 100 sample images with annotations.

Hours 20–34: Package the inference engine in model.py with bounding-box and confidence outputs plus shadow verification.

Hours 34–44: Connect model output to the visualizer and geotagging components.

Hours 44–48: Export to ONNX using the Ultralytics export workflow for the edge benchmark.

Expected modules

detection/
├── synthetic_generator.py
└── model.py

Synthetic generator requirements

detection/synthetic_generator.py should:

Generate realistic sonar/seafloor textures using:

grayscale background

low-frequency terrain/intensity variation

Rayleigh-distributed speckle noise

Procedurally place targets from the four classes.

Render a corresponding acoustic shadow for high-backscatter targets.

Produce YOLO-format annotation text files:

class_id center_x center_y width height

Suggested class mapping from the task specification:

0 = Shipwreck
1 = Pipe_Cylinder
2 = Ghost_Net
3 = Hazard_Anomaly

Detection engine requirements

detection/model.py should provide a SonarDetector class with functionality equivalent to:

__init__(self, model_path='yolov8n.pt')
predict(self, tile_image, conf_threshold=0.35)
validate_shadow_geometry(self, image, bbox)

Detection results should include:

class_name
class_id
confidence
bbox = [x1, y1, x2, y2]
has_valid_shadow

The shadow validation heuristic should examine the image immediately beyond the detected object and flag detections without an expected low-intensity acoustic-shadow region as possible false positives.

How Coder 1 and Coder 2 Should Work in Git

Do not work directly on main.

After cloning the repository:

git clone https://github.com/quanta2064/SagarDrishti.git
cd SagarDrishti

Create a branch for your work.

Coder 1

git checkout main
git pull
git checkout -b coder1-preprocessing

Work mainly in:

pipeline/preprocessor.py
pipeline/tiler.py

Then:

git add pipeline/
git commit -m "Implement sonar preprocessing and tiling"
git push -u origin coder1-preprocessing

Open a Pull Request:

coder1-preprocessing -> main

Coder 2

git checkout main
git pull
git checkout -b coder2-detection

Work mainly in:

detection/synthetic_generator.py
detection/model.py

Then:

git add detection/
git commit -m "Implement detection engine and synthetic sonar generator"
git push -u origin coder2-detection

Open a Pull Request:

coder2-detection -> main

Important integration rule

Before modifying files, pull the latest main.

Avoid changing another coder's modules unless the change is necessary for integration. If a shared interface needs to change, communicate it before merging.

Current Frontend

The repository contains an incomplete React + TypeScript frontend under:

frontend/

The visible frontend source includes components such as:

frontend/src/components/
├── AnalyticsPanel.tsx
├── HazardMap.tsx
├── HazardTable.tsx
├── HeroBanner.tsx
├── ImpactCards.tsx
├── IncidentTable.tsx
├── KeyMetricsBar.tsx
├── MissionControlCard.tsx
├── ProcessingModal.tsx
├── ProcessingPipeline.tsx
├── ReportModal.tsx
├── SelectedDetection...
├── Sidebar.tsx
└── SonarViewer.tsx

The frontend also contains Vite/TypeScript configuration and a package.json.

Run the current frontend locally

You do not need the old Antigravity preview URL. The project can be started locally.

Open PowerShell in the project root and run:

cd frontend
npm install
npm run dev

Vite should print a local URL in the terminal, normally similar to:

Local: http://localhost:5173/

Open the URL that Vite actually prints.

If npm is not recognized

Coder 3 — React Command Center & Interactive Map Engineer

Main responsibility: Build and integrate the high-impact React + TypeScript command-center frontend for AquaScan. The frontend replaces the earlier Streamlit/streamlit-folium plan and should communicate with the existing application/backend rather than introducing a second Streamlit UI.

Responsibilities

Build an intuitive, high-impact maritime operations dashboard that looks like a professional naval/defense command screen.

Provide a side-by-side sonar comparison:

Raw Sonar: original acoustic imagery.

AI Enhanced: preprocessed/despeckled imagery with detection bounding boxes and confidence scores.

Use clear visual distinction for the four detection classes: Shipwreck, Pipe/Cylinder, Ghost Net, and Hazard Anomaly.

Provide an interactive geospatial hazard map using the project's React frontend/map implementation.

Plot detected hazards using their geotagged coordinates.

Use severity/color-coded markers.

Selecting a marker should expose useful detection information such as hazard type, confidence, location, clearance depth/status, and action required where available.

Implement command-center controls:

Demo/preset mission selector.

Confidence threshold control.

Preprocessing/despeckling toggle.

Acoustic-shadow validation toggle.

High-risk fairway buffer display/toggle.

Display top-level operational metrics such as:

Area Scanned (km²)

Hazards Identified

Critical Navigation Blockers

Pipeline Inference Latency (ms)

Integrate the frontend with the existing backend/application and the outputs produced by Coder 1, Coder 2, and Coder 4.

Keep the UI functional even when an upstream module is incomplete by using clearly separated mock/demo data or safe fallback states. Do not duplicate or permanently fork the preprocessing, detection, or geotagging logic inside the frontend.

Make the interface presentation-ready: responsive layout, loading/processing states, clear error states, consistent typography, and polished dashboard interactions.

Core dashboard structure

The command center should be organized around the existing React components and may evolve as integration progresses:

Mission / Scenario Controls
        ↓
Operational Metrics
        ↓
┌───────────────────────┬────────────────────────┐
│ Raw Sonar             │ AI Enhanced Sonar       │
│                       │ + Detection Overlays   │
└───────────────────────┴────────────────────────┘
        ↓
Interactive Hazard Map
        ↓
Incident / Clearance Audit + Report Actions

Expected frontend areas

Use the existing frontend/ application as the starting point. Relevant components currently include:

frontend/src/components/
├── AnalyticsPanel.tsx
├── HazardMap.tsx
├── HazardTable.tsx
├── HeroBanner.tsx
├── ImpactCards.tsx
├── IncidentTable.tsx
├── KeyMetricsBar.tsx
├── MissionControlCard.tsx
├── ProcessingModal.tsx
├── ProcessingPipeline.tsx
├── ReportModal.tsx
├── SelectedDetection...
├── Sidebar.tsx
└── SonarViewer.tsx

Do not replace the frontend architecture with Streamlit. Extend/refactor the existing React components and coordinate with the backend contract when an API or data shape needs to change.

Hourly schedule

Hours 0–8: Audit the existing React/Vite application, establish the dashboard shell, navigation, layout, mission controls, and shared UI/data types.

Hours 8–20: Build/refine the dual-pane sonar viewer for raw vs. enhanced imagery and detection overlays.

Hours 20–34: Integrate the interactive hazard map and connect it to geotagged detection data.

Hours 34–44: Connect Coder 1, Coder 2, and Coder 4 outputs through the agreed application/backend interfaces. Add demo scenarios so judges can test the UI without manually preparing data.

Hours 44–48: UI polish, loading/error states, responsive checks, performance cleanup, and final demo rehearsal.

Important Coder 3 integration rules

The React frontend is the active UI host. Do not reintroduce the old Streamlit/streamlit-folium architecture.

Keep backend communication/API calls separate from presentation components where practical.

Do not hard-code production detection results into components; demo data should be isolated and replaceable.

If Coder 1, 2, or 4 changes an output schema, update the shared interface deliberately rather than silently transforming data in multiple places.

Before modifying shared frontend/backend integration files, pull the latest main and communicate interface changes to the affected coder.

Git workflow

git checkout main
git pull
git checkout -b coder3-react-command-center

Work mainly in:

frontend/

Then:

git add frontend/
git commit -m "Build React command center and hazard map"
git push -u origin coder3-react-command-center

Open a Pull Request:

coder3-react-command-center -> main

Coder 4 — Geotagging, Reporting & Edge Benchmarking Engineer

Main responsibility: Convert detections into geographic outputs, generate professional clearance/audit reports, and benchmark the AI inference pipeline for edge deployment.

Responsibilities

Convert image-pixel bounding boxes and ping/trajectory information into WGS84 GPS latitude/longitude coordinates.

Generate structured exports:

GeoJSON for GIS software such as QGIS/ArcGIS.

CSV for spreadsheet analysis.

PDF Clearance Report for operational/demo use.

Generate a professional PDF report containing:

Mission summary.

Mission metadata.

Detection table.

Hazard class.

Latitude/longitude.

Confidence.

Severity.

Appropriate clearance/status information.

Official project/report header and a clear status stamp such as RESTRICTED / NOT CLEARED.

Benchmark the AI model using ONNX Runtime and report:

Mean latency.

p95 latency.

FPS/throughput.

Peak RAM consumption.

Produce a clean benchmark comparison chart suitable for the pitch deck, comparing laptop CPU performance against the intended/simulated edge deployment target.

Expose download/export hooks so the Coder 3 React command center can trigger or retrieve the generated GeoJSON, CSV, and PDF outputs.

Expected modules

geotagging/
├── mapper.py
└── reporter.py

benchmark.py

Required geotagging interface

geotagging/mapper.py

pixel_to_gps(
    bbox_centroid_xy,
    survey_origin_latlon,
    ping_heading_deg,
    resolution_meters_per_pixel
) -> Tuple[float, float]

The function should calculate the geographic position of a detected object from the survey origin, sonar-image pixel position, heading, and across-track resolution.

Required reporting interfaces

geotagging/reporter.py

export_geojson(detections_list, output_path) -> str
export_csv(detections_list, output_path) -> str
generate_pdf_report(mission_summary, detections_list, output_path) -> str

The GeoJSON export should be a valid FeatureCollection with appropriate point/polygon geometry and detection metadata.

The CSV export should contain clean, analysis-friendly detection records.

The PDF should be a concise professional Maritime Port Clearance Hazard Audit rather than a raw debug dump.

Benchmark requirements

benchmark.py should:

Load the YOLOv8 model exported to ONNX, e.g. yolov8n.onnx.

Run approximately 100 inference iterations using onnxruntime.

Measure:

Mean latency.

p95 latency.

FPS/throughput.

Peak RAM consumption.

Save a clean comparison chart such as:

benchmark_edge_vs_cloud.png

The chart should compare laptop CPU performance with the simulated/intended edge deployment target described by the project.

Hourly schedule

Hours 0–8: Define shared data schemas for GeoJSON, CSV, JSON metadata, report fields, and benchmark outputs.

Hours 8–20: Implement geotagging/mapper.py for pixel-to-geographic projection.

Hours 20–34: Implement geotagging/reporter.py using fpdf2 or reportlab for the PDF clearance/audit report.

Hours 34–44: Implement benchmark.py, run the ONNX inference benchmark, calculate latency/throughput/memory metrics, and export the benchmark chart.

Hours 44–48: Integrate download/export hooks directly with the Coder 3 React command center and test generated files end-to-end.

Git workflow

git checkout main
git pull
git checkout -b coder4-geotagging-reporting

Work mainly in:

geotagging/mapper.py
geotagging/reporter.py
benchmark.py

Then:

git add geotagging/ benchmark.py
git commit -m "Implement geotagging reports and edge benchmarking"
git push -u origin coder4-geotagging-reporting

Open a Pull Request:

coder4-geotagging-reporting -> main

Important Coder 4 integration rules

Keep geographic conversion, report generation, and benchmarking out of React components.

The frontend should consume structured outputs rather than reimplementing coordinate conversion.

Keep report generation deterministic and testable from a standalone Python script/function.

Do not block the React UI if a PDF/report or benchmark artifact is unavailable; return a clear unavailable/error state.

Communicate changes to shared detection/output schemas before merging.

Current Frontend

The repository contains the active React + TypeScript frontend under. This is the current command-center UI and replaces the earlier Streamlit frontend plan:

frontend/

The visible frontend source includes components such as:

frontend/src/components/
├── AnalyticsPanel.tsx
├── HazardMap.tsx
├── HazardTable.tsx
├── HeroBanner.tsx
├── ImpactCards.tsx
├── IncidentTable.tsx
├── KeyMetricsBar.tsx
├── MissionControlCard.tsx
├── ProcessingModal.tsx
├── ProcessingPipeline.tsx
├── ReportModal.tsx
├── SelectedDetection...
├── Sidebar.tsx
└── SonarViewer.tsx

The frontend also contains Vite/TypeScript configuration and a package.json.

Run the current frontend locally

You do not need the old Antigravity preview URL. The project can be started locally.

Open PowerShell in the project root and run:

cd frontend
npm install
npm run dev

Vite should print a local URL in the terminal, normally similar to:

Local: http://localhost:5173/

Open the URL that Vite actually prints.

If npm is not recognized

Install Node.js (LTS), restart PowerShell, and check:

node --version
npm --version

Then:

cd frontend
npm install
npm run dev

Stop the frontend

Press:

Ctrl + C

in the terminal running Vite.

Current backend/application

The repository currently contains:

server.py
app.py

The React frontend is the active UI host. server.py/the existing application layer should provide the integration boundary used by the frontend and processing pipeline.

app.py is part of the existing application/prototype work. Do not delete or replace it without coordinating with the person responsible for application integration.

Backend/API run instructions may depend on the current implementation and should be verified against server.py before being added here. Do not invent or hard-code endpoint contracts without checking the current server implementation.

Project Structure

Current repository structure is approximately:

aquascan/
├── components/
├── data/
│   └── sample_missions/
├── detection/
├── frontend/
├── geotagging/
├── pipeline/
├── postprocessing/
├── tests/
├── app.py
├── benchmark.py
├── requirements.txt
├── server.py
└── .gitignore

Install Node.js (LTS), restart PowerShell, and check:

node --version
npm --version

Then:

cd frontend
npm install
npm run dev

Stop the frontend

Press:

Ctrl + C

in the terminal running Vite.

Current backend/application

The repository currently contains:

server.py
app.py

app.py is part of the existing application/prototype work. Do not delete or replace it without coordinating with the person responsible for the application integration.

Backend run instructions may depend on the current implementation and should be verified against server.py before being added here.

Project Structure

Current repository structure is approximately:

aquascan/
├── components/
├── data/
│   └── sample_missions/
├── detection/
├── frontend/
├── geotagging/
├── pipeline/
├── postprocessing/
├── tests/
├── app.py
├── requirements.txt
├── server.py
└── .gitignore
