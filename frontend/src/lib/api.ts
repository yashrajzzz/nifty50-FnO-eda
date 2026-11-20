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

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api/v1";

const DEFAULT_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 15000;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
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

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(id);
    return res;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new ApiError(408, `Backend request timed out after ${timeoutMs / 1000} seconds.`);
    }
    // Network / connection refused error
    throw new ApiError(
      0,
      `Unable to connect to FastAPI backend at ${BASE_URL}. Verify backend server is running on port 8000.`
    );
  }
}

async function get<T>(path: string, params?: Record<string, string | number | undefined | null>): Promise<T> {
  const url = `${BASE_URL}${path}${buildQuery(params)}`;
  const res = await fetchWithTimeout(url);

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.message || errJson.detail || errorMsg;
    } catch {
      const text = await res.text().catch(() => "");
      if (text) errorMsg = text;
    }
    throw new ApiError(res.status, errorMsg);
  }

  const json: ApiResponse<T> = await res.json();
  if (!json.success || json.data == null) {
    throw new ApiError(500, json.message || "Invalid or empty response from backend");
  }
  return json.data;
}

async function post<T, B>(path: string, body: B): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.message || errJson.detail || errorMsg;
    } catch {
      const text = await res.text().catch(() => "");
      if (text) errorMsg = text;
    }
    throw new ApiError(res.status, errorMsg);
  }

  const json: ApiResponse<T> = await res.json();
  if (!json.success || json.data == null) {
    throw new ApiError(500, json.message || "Inference response payload was empty");
  }
  return json.data;
}

export const api = {
  // System Health
  health: () => get<{ status: string; version: string; artifacts_ready: boolean }>("/health"),

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
  mlSampleFeatures: (split?: string) => get<SampleFeaturesResponse>("/ml/sample", { split }),
  mlPredict: (data: PredictRequest) => post<PredictResponse, PredictRequest>("/ml/predict", data),
};
