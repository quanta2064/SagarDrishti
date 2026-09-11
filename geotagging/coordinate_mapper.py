"""
AquaScan / SonarSight - Geotagging & Coordinate Mapping Engine
Converts pixel-space bounding coordinates from the sonar waterfall display
into real-world across-track and along-track distances, then projects to WGS84 (lat/lon).
"""

import math
from typing import Tuple, Dict, Any

# Approximate conversion: 1 deg latitude ~= 111,320 meters
METERS_PER_DEG_LAT = 111320.0

def project_pixel_to_wgs84(
    pixel_x: float,
    pixel_y: float,
    image_width: int,
    image_height: int,
    center_lat: float,
    center_lon: float,
    slant_range_m: float = 75.0,
    heading_deg: float = 0.0
) -> Tuple[float, float, float]:
    """
    Transforms pixel coordinates into:
    1. Across-track distance in meters from towfish track line (center)
    2. Along-track distance in meters along survey trajectory
    3. WGS84 Latitude and Longitude
    """
    # Across-track calculation: horizontal axis represents port (-) to starboard (+)
    center_col = image_width / 2.0
    across_track_m = ((pixel_x - center_col) / center_col) * slant_range_m

    # Along-track calculation: vertical axis represents survey progression (pings)
    # Assumes survey track length of ~200 meters per frame
    track_length_m = 220.0
    along_track_m = ((pixel_y - (image_height / 2.0)) / float(image_height)) * track_length_m

    # Rotate by survey heading
    heading_rad = math.radians(heading_deg)
    dx_m = across_track_m * math.cos(heading_rad) - along_track_m * math.sin(heading_rad)
    dy_m = across_track_m * math.sin(heading_rad) + along_track_m * math.cos(heading_rad)

    # Convert delta meters to delta degrees WGS84
    d_lat = dy_m / METERS_PER_DEG_LAT
    meters_per_deg_lon = METERS_PER_DEG_LAT * math.cos(math.radians(center_lat))
    d_lon = dx_m / max(1.0, meters_per_deg_lon)

    out_lat = round(center_lat + d_lat, 6)
    out_lon = round(center_lon + d_lon, 6)
    estimated_depth_m = round(14.0 + (abs(across_track_m) * 0.08), 1)

    return out_lat, out_lon, estimated_depth_m
