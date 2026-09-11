"""
AquaScan / SonarSight - Realistic Side-Scan Sonar Survey Generator
Generates synthetic acoustic sonograms reproducing side-scan sonar physics:
- Rayleigh backscatter noise across seafloor sediment
- Slant range attenuation & sand ripple patterns
- Towfish nadir ground track (central dead zone / water column return)
- Man-made target acoustic highlights and leeward acoustic shadows for the 4 PRD classes:
  0: shipwreck
  1: pipe_cylinder
  2: debris_net
  3: misc_anomaly
"""

import os
import cv2
import numpy as np

def generate_mission_sonar(output_path: str, seed: int = 42, mission_type: str = "tampa"):
    np.random.seed(seed)
    width, height = 1280, 720
    
    # 1. Base acoustic seabed backscatter using Rayleigh distribution
    base = np.random.rayleigh(scale=38, size=(height, width)).astype(np.float32)
    base = cv2.GaussianBlur(base, (5, 5), 0)
    
    # 2. Add realistic sand ripples and seabed undulations
    x = np.linspace(0, 10 * np.pi, width)
    ripples = np.sin(x) * 14.0
    base += ripples

    # 3. Towfish Nadir line (acoustic dead zone directly under the vehicle)
    nadir_col = width // 2
    nadir_half_width = 24
    nadir_mask = np.ones((height, width), dtype=np.float32)
    for col in range(nadir_col - nadir_half_width, nadir_col + nadir_half_width):
        dist = abs(col - nadir_col) / float(nadir_half_width)
        nadir_mask[:, col] = 0.15 + 0.5 * dist
    base *= nadir_mask

    sonar_img = np.clip(base, 0, 255).astype(np.uint8)

    # 4. Inject synthetic targets with acoustic shadows based on mission
    if mission_type == "tampa":
        # Target 1: Shipwreck (High backscatter hull + leeward shadow)
        pts_hull = np.array([[360, 250], [530, 268], [520, 330], [350, 312]], np.int32)
        cv2.fillPoly(sonar_img, [pts_hull], 245)
        cv2.polylines(sonar_img, [pts_hull], True, 255, 2)
        # Shadow cast to port side (away from center nadir 640)
        pts_shadow = np.array([[360, 250], [200, 245], [190, 320], [350, 312]], np.int32)
        cv2.fillPoly(sonar_img, [pts_shadow], 10)

        # Target 2: Ruptured Pipeline / Cylinder
        cv2.line(sonar_img, (780, 470), (970, 530), color=250, thickness=9)
        # Shadow cast to starboard side (away from nadir)
        cv2.line(sonar_img, (810, 485), (1000, 545), color=12, thickness=14)

        # Target 3: Ghost Fishing Net (tangled cluster)
        for _ in range(16):
            cx, cy = np.random.randint(210, 310), np.random.randint(450, 535)
            cv2.circle(sonar_img, (cx, cy), np.random.randint(6, 20), 215, -1)
        cv2.ellipse(sonar_img, (175, 490), (45, 26), 10, 0, 360, 15, -1)

        # Target 4: Miscellaneous Concrete / Container Anomaly
        pts_box = np.array([[1000, 160], [1090, 160], [1090, 220], [1000, 220]], np.int32)
        cv2.fillPoly(sonar_img, [pts_box], 235)
        pts_box_shadow = np.array([[1090, 160], [1180, 160], [1180, 220], [1090, 220]], np.int32)
        cv2.fillPoly(sonar_img, [pts_box_shadow], 14)

    elif mission_type == "tokyo":
        # Tokyo Bay: Tsunami debris, industrial cylinders, tangled lines
        pts_hull = np.array([[370, 260], [530, 275], [515, 325], [360, 310]], np.int32)
        cv2.fillPoly(sonar_img, [pts_hull], 240)
        pts_shadow = np.array([[360, 260], [210, 255], [200, 325], [360, 310]], np.int32)
        cv2.fillPoly(sonar_img, [pts_shadow], 12)

        # Industrial pipelines
        cv2.line(sonar_img, (760, 460), (950, 520), color=248, thickness=8)
        cv2.line(sonar_img, (790, 475), (980, 535), color=14, thickness=13)

        # Tangled fishing lines
        for _ in range(12):
            cx, cy = np.random.randint(220, 300), np.random.randint(460, 520)
            cv2.circle(sonar_img, (cx, cy), np.random.randint(8, 18), 210, -1)
        cv2.ellipse(sonar_img, (180, 490), (40, 24), 0, 0, 360, 16, -1)

        # Submerged cargo container
        pts_cont = np.array([[990, 170], [1080, 170], [1080, 225], [990, 225]], np.int32)
        cv2.fillPoly(sonar_img, [pts_cont], 230)
        cv2.fillPoly(sonar_img, [np.array([[1080, 170], [1170, 170], [1170, 225], [1080, 225]], np.int32)], 15)

    else:
        # Thunder Bay Sanctuary: Historic wooden schooner wreck and boulder formations
        pts_schooner = np.array([[350, 240], [550, 265], [530, 340], [340, 315]], np.int32)
        cv2.fillPoly(sonar_img, [pts_schooner], 248)
        cv2.polylines(sonar_img, [pts_schooner], True, 255, 2)
        cv2.fillPoly(sonar_img, [np.array([[340, 240], [180, 235], [170, 335], [340, 315]], np.int32)], 8)

        # Boilers / cylindrical steam pipes
        cv2.line(sonar_img, (770, 480), (960, 530), color=245, thickness=10)
        cv2.line(sonar_img, (800, 495), (990, 545), color=12, thickness=14)

        # Old nets
        for _ in range(14):
            cx, cy = np.random.randint(230, 310), np.random.randint(450, 520)
            cv2.circle(sonar_img, (cx, cy), np.random.randint(6, 16), 205, -1)
        cv2.ellipse(sonar_img, (190, 485), (38, 22), 5, 0, 360, 18, -1)

        # Concrete anchor block
        cv2.rectangle(sonar_img, (1010, 170), (1080, 220), 230, -1)
        cv2.rectangle(sonar_img, (1080, 170), (1150, 220), 16, -1)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, sonar_img)
    print(f"Generated realistic sonar mission: {output_path}")

if __name__ == "__main__":
    sample_dir = os.path.join(os.path.dirname(__file__), "sample_missions")
    generate_mission_sonar(os.path.join(sample_dir, "mission_1_tampa_bay.png"), seed=42, mission_type="tampa")
    generate_mission_sonar(os.path.join(sample_dir, "mission_2_tokyo_bay.png"), seed=101, mission_type="tokyo")
    generate_mission_sonar(os.path.join(sample_dir, "mission_3_thunder_bay.png"), seed=202, mission_type="thunder")
