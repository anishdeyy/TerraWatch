export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';
export type SubscriptionTier = 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type ProjectType =
  | 'REFORESTATION'
  | 'AGROFORESTRY'
  | 'BIODIVERSITY'
  | 'CARBON'
  | 'CONSERVATION'
  | 'RESTORATION';

export type ProjectStatus = 'ACTIVE' | 'MONITORING' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: number;
  name: string;
  description?: string;
  project_type: ProjectType;
  status: ProjectStatus;
  owner_id?: number;
  total_area_hectares: number;
  site_count: number;
  created_at?: string;
  updated_at?: string;
}

export type SiteStatus = 'ACTIVE' | 'MONITORING' | 'AT_RISK' | 'ARCHIVED';

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Site {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  project_name?: string;
  status: SiteStatus;
  region?: string;
  ecological_type?: string;
  data_source?: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  geometry: GeoJSONPolygon;
  ndvi?: number;
  carbon_stock?: number;
  biodiversity_score?: number;
  water_stress?: number;
  soil_organic_carbon?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: number;
  properties: {
    id: number;
    site_id?: number;
    name: string;
    project_id: number;
    project_name?: string;
    status: SiteStatus;
    region?: string;
    ecological_type?: string;
    data_source?: string;
    area_hectares: number;
    latitude: number;
    longitude: number;
    ndvi?: number;
    carbon_stock?: number;
    biodiversity_score?: number;
    water_stress?: number;
    soil_organic_carbon?: number;
  };
  geometry: GeoJSONPolygon;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface EnvironmentalMetric {
  id: number;
  site_id: number;
  recorded_at: string;
  soil_organic_carbon?: number;
  soil_ph?: number;
  soil_moisture?: number;
  temperature?: number;
  rainfall?: number;
  ndvi?: number;
  biodiversity_score?: number;
  species_richness?: number;
  carbon_stock?: number;
  carbon_sequestration?: number;
  deforestation_risk?: number;
  water_stress?: number;
}

export interface MetricTrendPoint {
  date: string;
  carbon_stock?: number;
  carbon_sequestration?: number;
  biodiversity_score?: number;
  ndvi?: number;
  rainfall?: number;
  temperature?: number;
  soil_organic_carbon?: number;
  soil_ph?: number;
  soil_moisture?: number;
  water_stress?: number;
}

export interface MetricTrends {
  site_id: number;
  site_name: string;
  trends: MetricTrendPoint[];
}

export interface HealthScoreBreakdown {
  overall_score: number;
  label: string;
  breakdown: {
    biodiversity: number;
    vegetation: number;
    carbon: number;
    soil: number;
    water: number;
  };
  weights: Record<string, number>;
}

export interface AlertItem {
  id: string;
  site_id: number;
  site_name: string;
  project_id: number;
  project_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metric: string;
  current_value: number;
  previous_value: number;
  change_pct: number;
  timestamp: string;
  recommended_action: string;
}

export interface SiteAnalytics {
  site_id: number;
  site_name: string;
  project_id: number;
  project_name: string;
  area_hectares: number;
  status: SiteStatus;
  latest_metrics: Partial<EnvironmentalMetric>;
  health_score: HealthScoreBreakdown;
  alerts: AlertItem[];
}

export interface ProjectAnalytics {
  project_id: number;
  project_name: string;
  project_type: ProjectType;
  total_area_hectares: number;
  site_count: number;
  average_health_score: number;
  total_carbon_stock: number;
  average_biodiversity: number;
  average_ndvi: number;
  active_alerts_count: number;
  sites_summary: Array<{
    site_id: number;
    site_name: string;
    status: SiteStatus;
    area_hectares: number;
    health_score: number;
    ndvi?: number;
    carbon_stock?: number;
    water_stress?: number;
    alerts_count: number;
  }>;
}

export interface AISiteSummary {
  site_id: number;
  site_name: string;
  summary: string;
  key_findings: string[];
  risk_factors: string[];
  recommended_actions: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  confidence: string;
  limitations: string[];
}

export interface RecommendationItem {
  recommendation: string;
  why_it_may_help: string;
  affected_metrics: string[];
  expected_direction_of_change: string;
  time_horizon: 'Short Term' | 'Medium Term' | 'Long Term';
  confidence: string;
  data_limitations: string;
}

export interface RecommendationResponse {
  site_id: number;
  site_name: string;
  analysis: string;
  recommendations: RecommendationItem[];
}

export interface AnomalyExplanationResponse {
  site_id: number;
  site_name: string;
  metric: string;
  anomaly_detected: string;
  hypotheses: string[];
  possible_contributing_factors: string[];
  confidence_level: string;
  recommended_ground_investigation: string[];
}

export interface ProjectSummaryResponse {
  project_id: number;
  project_name: string;
  executive_summary: string;
  project_status: string;
  key_environmental_trends: string[];
  highest_risk_sites: string[];
  positive_trends: string[];
  priority_recommendations: string[];
  data_gaps: string[];
  next_monitoring_actions: string[];
}

export interface AskAIResponse {
  question: string;
  answer: string;
  referenced_sites: string[];
  key_metrics_considered: string[];
  confidence: string;
  grounding_notes: string;
}

export interface ReportItem {
  id: number;
  title: string;
  report_type: string;
  project_id?: number;
  site_id?: number;
  status: string;
  content: any;
  created_at?: string;
}

export interface PackageItem {
  id: string;
  name: string;
  price_inr: number;
  price_paise: number;
  popular?: boolean;
  features: string[];
  limits: {
    max_projects: number;
    max_sites: number;
    ai_insights: boolean;
    pdf_reports: boolean;
  };
}

export interface OrderItem {
  id: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: string;
  status: string;
  package_type: string;
  created_at?: string;
}

export interface DataSource {
  id: string;
  name: string;
  provider: string;
  source_type: string;
  url?: string;
  dataset_identifier?: string;
  description?: string;
  license?: string;
  version?: string;
  spatial_resolution?: string;
  temporal_resolution?: string;
  retrieval_method?: string;
  active: boolean;
  record_count: number;
  last_updated?: string;
}

export interface IngestionRun {
  id: number;
  source_id: string;
  source_name?: string;
  started_at: string;
  completed_at?: string;
  status: string;
  rows_processed: number;
  rows_inserted: number;
  rows_updated: number;
  rows_rejected: number;
  warnings: string[];
  errors: string[];
}

export interface DataQualitySummary {
  total_observations: number;
  complete_records: number;
  missing_values: number;
  spatially_matched: number;
  regional_references: number;
  synthetic_records: number;
  active_sources: number;
  latest_ingestion_time?: string;
}

export interface SiteDrawPreview {
  area_hectares: number;
  latitude: number;
  longitude: number;
  suggested_ecological_type: string;
  overlapping_sites: Array<{
    site_id: number;
    site_name: string;
    project_name?: string;
    status: string;
    overlap_area_hectares: number;
  }>;
  nearby_sites: Array<{
    site_id: number;
    site_name: string;
    project_name?: string;
    distance_km: number;
    area_hectares: number;
    status: string;
    ecological_type: string;
  }>;
  regional_soil_preview?: {
    suggested_ecological_type: string;
    calibrated_soc_range_pct: [number, number];
    typical_soil_ph: [number, number];
  };
  climate_preview?: {
    provider?: string;
    status?: string;
    total_rainfall_mm?: number;
    average_temperature_c?: number;
  };
}

export interface SiteProvenanceItem {
  metric: string;
  value?: number;
  unit?: string;
  source_type: string;  // OBSERVED, REFERENCE, SYNTHETIC
  source_name: string;
  source_url?: string;
  spatial_level: string; // SITE_OBSERVATION, SITE_OVERLAP, NEAREST_REFERENCE, STATE, REGIONAL_REFERENCE, COUNTRY, REFERENCE_RANGE
  temporal_resolution?: string;
  confidence: string; // HIGH, MEDIUM, LOW
  observed_at?: string;
  metadata?: any;
}

