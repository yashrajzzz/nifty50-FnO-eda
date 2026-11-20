import type { ApiResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
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

export const api = {
  overview: () => request<import("./types").OverviewSummary>("/overview"),
  datasets: () => request<import("./types").DatasetsOverviewResponse>("/overview/datasets"),
  futuresSummary: () => request<import("./types").FuturesSummary>("/futures/summary"),
  optionsSummary: () => request<import("./types").OptionsSummary>("/options/summary"),
  comparison: () => request<import("./types").ComparativeAnalyticsResponse>("/analytics/comparison"),
};
