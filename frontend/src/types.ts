export type DetectionClass =
  | 'submarine_pipeline'
  | 'shipwreck'
  | 'ghost_net'
  | 'mine_cylinder';

export type SeverityLevel =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type EcosystemRiskLevel =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'MONITOR';

export interface DetectionLocation {
  latitude: number;
  longitude: number;
  depth_m: number | null;
}

export interface BoundingDimensions {
  length_m: number | null;
  width_m: number | null;
}

export interface DetectionItem {
  id: string;
  detection_id?: string;

  class_name: DetectionClass | string;

  label?: string;

  // Backend sends percentage, e.g. 81.5
  confidence: number;

  // Optional raw confidence for compatibility
  conf?: number;

  severity: SeverityLevel | string;

  location?: DetectionLocation;

  lat: number;
  lon: number;

  depth_m: number | null;

  bounding_dimensions?: BoundingDimensions;

  dimensions_m: string | null;

  acoustic_shadow_length_m?: number | null;

  shadow_verified: boolean;

  bbox: [number, number, number, number];

  color_rgb?: [number, number, number];

  description: string;

  fairway_proximity_m?: number | null;

  tile_source?: string | null;

  timestamp?: string;

  navigation_risk?: SeverityLevel | string | null;

  ecosystem_risk?: EcosystemRiskLevel | string | null;

  potential_impact?: string | null;

  clearance_priority?: string | null;

  nearest_ecosystem?: string | null;
}

export interface SurveyMetadata {
  survey_date: string;
  vessel: string;
  sonar_model: string;

  total_area_sqm: number;

  region?: string;
  sea_basin?: string;
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
  } | null;
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

  category:
    | 'Mangroves'
    | 'Coral Reefs'
    | 'Seagrass'
    | 'Estuaries'
    | 'Mudflats'
    | 'Coastal Wetlands'
    | 'Open Ocean'
    | 'Deep Ocean';

  region: string;

  sea_basin: string;

  center: [number, number];

  area_km2: number;

  health_index: number;

  key_species: string;

  primary_threat: string;

  hazard_proximity_count: number;
}