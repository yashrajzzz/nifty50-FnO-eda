import type {
  ApiResponse,
  OverviewSummary,
  DatasetsOverviewResponse,
  FuturesSummary,
  FuturesPricesResponse,
  FuturesVolumeResponse,
  FuturesTurnoverResponse,
  FuturesOIResponse,
  OptionsSummary,
  OptionsComparisonResponse,
  OptionsVolumeResponse,
  OptionsPremiumTurnoverResponse,
  StrikeAnalysisResponse,
  ExpiryAnalysisResponse,
  DescriptiveAnalyticsResponse,
  CorrelationMatrixResponse,
  ComparativeAnalyticsResponse,
  ModelInfoResponse,
  ModelMetricsResponse,
  FeatureImportanceResponse,
  HistoricalPredictionsResponse,
  SampleFeaturesResponse,
  PredictRequest,
  PredictResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function buildQuery(params?: Record<string, string | number | undefined | null>): string {
  if (!params) return "";
  const query = Object.entries(params)
    .filter(([_, v]) => v != null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return query ? `?${query}` : "";
}

async function get<T>(path: string, params?: Record<string, string | number | undefined | null>): Promise<T> {
  const url = `${BASE_URL}${path}${buildQuery(params)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || `HTTP ${res.status}`);
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.success || json.data == null) {
    throw new ApiError(500, json.message || "Empty response");
  }
  return json.data;
}

async function post<T, B>(path: string, body: B): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new ApiError(res.status, errorBody || `HTTP ${res.status}`);
  }
  const json: ApiResponse<T> = await res.json();
  if (!json.success || json.data == null) {
    throw new ApiError(500, json.message || "Empty response");
  }
  return json.data;
}

export const api = {
  // Overview
  overview: () => get<OverviewSummary>("/overview"),
  datasets: () => get<DatasetsOverviewResponse>("/overview/datasets"),

  // Futures
  futuresSummary: () => get<FuturesSummary>("/futures/summary"),
  futuresPrices: (params?: { start_date?: string; end_date?: string; limit?: number; offset?: number }) =>
    get<FuturesPricesResponse>("/futures/prices", params),
  futuresVolume: (params?: { start_date?: string; end_date?: string }) =>
    get<FuturesVolumeResponse>("/futures/volume", params),
  futuresTurnover: (params?: { start_date?: string; end_date?: string }) =>
    get<FuturesTurnoverResponse>("/futures/turnover", params),
  futuresOI: (params?: { start_date?: string; end_date?: string }) =>
    get<FuturesOIResponse>("/futures/open-interest", params),

  // Options
  optionsSummary: () => get<OptionsSummary>("/options/summary"),
  optionsComparison: (params?: { start_date?: string; end_date?: string }) =>
    get<OptionsComparisonResponse>("/options/comparison", params),
  optionsVolume: (params?: { start_date?: string; end_date?: string }) =>
    get<OptionsVolumeResponse>("/options/volume", params),
  optionsPremiumTurnover: (params?: { start_date?: string; end_date?: string }) =>
    get<OptionsPremiumTurnoverResponse>("/options/premium-turnover", params),
  optionsStrikeAnalysis: (params?: { snapshot_date?: string; top_n?: number }) =>
    get<StrikeAnalysisResponse>("/options/strike-analysis", params),
  optionsExpiryAnalysis: (params?: { limit?: number }) =>
    get<ExpiryAnalysisResponse>("/options/expiry-analysis", params),

  // Comparative Analytics
  analyticsDescriptive: () => get<DescriptiveAnalyticsResponse>("/analytics/descriptive"),
  analyticsCorrelation: () => get<CorrelationMatrixResponse>("/analytics/correlation"),
  comparison: () => get<ComparativeAnalyticsResponse>("/analytics/comparison"),

  // Machine Learning
  mlModelInfo: () => get<ModelInfoResponse>("/ml/model-info"),
  mlMetrics: () => get<ModelMetricsResponse>("/ml/metrics"),
  mlFeatureImportance: () => get<FeatureImportanceResponse>("/ml/feature-importance"),
  mlHistoricalPredictions: (params?: { start_date?: string; end_date?: string; limit?: number }) =>
    get<HistoricalPredictionsResponse>("/ml/historical-predictions", params),
  mlSampleFeatures: (split?: string) => get<SampleFeaturesResponse>("/ml/sample-features", { split }),
  mlPredict: (data: PredictRequest) => post<PredictResponse, PredictRequest>("/ml/predict", data),
};
