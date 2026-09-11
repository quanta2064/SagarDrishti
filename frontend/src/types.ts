export type DetectionClass = 'shipwreck' | 'pipe_cylinder' | 'debris_net' | 'misc_anomaly';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EcosystemRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MONITOR';

export interface DetectionLocation {
  latitude: number;
  longitude: number;
  depth_m: number;
}

export interface BoundingDimensions {
  length_m: number;
  width_m: number;
}

export interface DetectionItem {
  id: string;
  detection_id?: string;
  class_name: DetectionClass | string;
  label?: string;
  confidence: number; // 0 - 100 percentage
  conf?: number;       // 0 - 1 float for compatibility
  severity: SeverityLevel;
  location?: DetectionLocation;
  lat: number;
  lon: number;
  depth_m: number;
  bounding_dimensions?: BoundingDimensions;
  dimensions_m: string;
  acoustic_shadow_length_m?: number;
  shadow_verified: boolean;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  color_rgb?: [number, number, number];
  description: string;
  fairway_proximity_m?: number;
  tile_source?: string;
  timestamp?: string;

  // SagarDrishti Risk Intelligence Extensions
  navigation_risk?: SeverityLevel;
  ecosystem_risk?: EcosystemRiskLevel;
  potential_impact?: string;
  clearance_priority?: string;
  nearest_ecosystem?: string;
}

export interface SurveyMetadata {
  survey_date: string;
  vessel: string;
  sonar_model: string;
  total_area_sqm: number;
  region?: string;
  sea_basin?: string; // 'Arabian Sea' | 'Bay of Bengal' | 'Indian Ocean' | 'Andaman Sea'
}

export interface ReportSummary {
  total_detections: number;
  by_class: Record<string, number>;
  by_severity: Record<string, number>;
  false_positive_filtered: number;
  fairway_clearance_status: string;
  recommended_action: string;
  ecosystem_risk_count?: {
    critical: number;
    high: number;
    moderate: number;
  };
}

export interface AnalysisResponse {
  job_id: string;
  mission_name: string;
  center_coords: [number, number];
  scanned_area_km2: number;
  pipeline_latency_ms: number;
  raw_image_base64: string;
  annotated_image_base64: string;
  survey_metadata?: SurveyMetadata;
  detections: DetectionItem[];
  summary: ReportSummary;
  stages?: Record<string, number>;
  disaster_readiness?: {
    coverage_pct: number;
    fairway_cleared: boolean;
    readiness_index: number;
    disaster_event: string;
  };
}

export interface EdgeBenchmark {
  platform: string;
  runtime: string;
  fps: number;
  latency_ms: number;
  power_w: number;
  memory_mb: number;
  use_case: string;
  status: string;
}

export interface ModelSpec {
  architecture: string;
  input_resolution: string;
  pytorch_checkpoint_mb: number;
  onnx_model_mb: number;
  tensorrt_fp16_mb: number;
  tensorrt_int8_mb: number;
  parameters: number;
  gflops: number;
  acoustic_shadow_gate: string;
}

export interface MarineEcosystemZone {
  id: string;
  name: string;
  hindi_name: string;
  category: 'Mangroves' | 'Coral Reefs' | 'Seagrass' | 'Estuaries' | 'Mudflats' | 'Coastal Wetlands' | 'Open Ocean' | 'Deep Ocean';
  region: string;
  sea_basin: string;
  center: [number, number];
  area_km2: number;
  health_index: number; // 0 - 100%
  key_species: string;
  primary_threat: string;
  hazard_proximity_count: number;
}
