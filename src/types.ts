export type HeatRiskLevel = "Low" | "Moderate" | "High" | "Extreme";

export interface LocationMeta {
  id: string;
  name: string;
  country: string;
}

export interface CurrentConditions {
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  historicalAverage: number;
  updatedMinutesAgo: number;
}

export interface HourlyPoint {
  hour: number;
  time: string; // "14:00"
  temperature: number;
}

export type ForecastIcon = "sun" | "partly" | "cloud" | "rain" | "storm" | "haze";

export interface ForecastDay {
  day: string;
  max: number;
  min: number;
  condition: string;
  icon: ForecastIcon;
}

/** Raw, location-scoped dataset returned by the (mock) temperature service. */
export interface RawSnapshot {
  location: LocationMeta;
  current: CurrentConditions;
  currentSeries: HourlyPoint[];
  historicalSeries: HourlyPoint[];
  forecast: ForecastDay[];
}

export interface HeatRiskFactor {
  label: string;
  level: "Low" | "Moderate" | "High";
}

export interface HeatRiskResult {
  score: number;
  level: HeatRiskLevel;
  factors: HeatRiskFactor[];
}

export type SignalKind = "info" | "warning" | "danger" | "positive";

export interface DetectedSignal {
  label: string;
  kind: SignalKind;
}

export interface AIAnalysisResult {
  summary: string;
  signals: DetectedSignal[];
  confidence: number;
}

export interface AnomalyResult {
  detected: boolean;
  hour: number;
  time: string;
  deviation: number;
  severity: "Moderate" | "High";
  explanation: string;
}

export type RecommendationIcon = "water" | "clock" | "shield" | "sun" | "home" | "umbrella";

export interface Recommendation {
  id: string;
  title: string;
  body: string;
  priority: "high" | "medium" | "low";
  icon: RecommendationIcon;
}

export interface EnvironmentalInsights {
  key: string;
  trend: string;
  risk: string;
  forecast: string;
}

export interface ComparisonRow {
  id: string;
  name: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  level: HeatRiskLevel;
}

export interface DerivedData {
  heatRisk: HeatRiskResult;
  anomaly: AnomalyResult;
  analysis: AIAnalysisResult;
  recommendations: Recommendation[];
  insights: EnvironmentalInsights;
  comparison: ComparisonRow[];
  hottest: string;
}
