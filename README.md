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
