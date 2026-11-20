/* TypeScript interfaces matching backend Pydantic schemas */

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  timestamp: string;
}

/* Overview */

export interface StudyPeriodInfo {
  start_date: string;
  end_date: string;
  is_partial: boolean;
  note: string;
}

export interface InstrumentRecordCount {
  instrument: string;
  records: number;
  percentage: number;
}

export interface MLDatasetOverview {
  total_observations: number;
  feature_count: number;
  target_classes: Record<string, string>;
  train_rows: number;
  validation_rows: number;
  test_rows: number;
  split_discrepancy_note: string;
}

export interface DataLimitationNotice {
  field: string;
  proxy_source: string;
  coverage_percentage: number;
  is_official_cash_spot: boolean;
  limitation_text: string;
}

export interface OverviewSummary {
  project_name: string;
  study_period: StudyPeriodInfo;
  total_raw_records: number;
  instruments: InstrumentRecordCount[];
  ml_dataset: MLDatasetOverview;
  data_limitation: DataLimitationNotice;
}

export interface DatasetColumnInfo {
  name: string;
  data_type: string;
  non_null_count: number;
  missing_percentage: number;
}

export interface DatasetDetail {
  dataset_key: string;
  name: string;
  file_type: string;
  total_records: number;
  total_columns: number;
  date_coverage_start?: string;
  date_coverage_end?: string;
  unique_dates_count?: number;
  file_size_bytes: number;
  columns: DatasetColumnInfo[];
}

export interface DatasetsOverviewResponse {
  total_datasets: number;
  datasets: DatasetDetail[];
}

/* Futures */

export interface FuturesSummary {
  total_records: number;
  unique_trading_dates: number;
  date_range_start: string;
  date_range_end: string;
  total_contracts_traded: number;
  total_turnover_lakhs: number;
  avg_daily_contracts: number;
  avg_daily_turnover_lakhs: number;
  avg_open_interest: number;
  max_open_interest: number;
  latest_close?: number;
}

/* Options */

export interface OptionsSummary {
  total_ce_records: number;
  total_pe_records: number;
  unique_trading_dates: number;
  date_range_start: string;
  date_range_end: string;
  total_ce_contracts: number;
  total_pe_contracts: number;
  total_ce_turnover_lakhs: number;
  total_pe_turnover_lakhs: number;
  total_ce_premium_turnover_lakhs: number;
  total_pe_premium_turnover_lakhs: number;
  avg_pcr_oi: number;
  median_pcr_oi: number;
  avg_pcr_volume: number;
}

/* Analytics */

export interface InstrumentShare {
  futures_pct: number;
  ce_pct: number;
  pe_pct: number;
}

export interface ComparativeAnalyticsResponse {
  common_trading_days: number;
  average_pcr: number;
  median_pcr: number;
  pcr_std: number;
  ce_pe_volume_correlation: number;
  ce_pe_oi_correlation: number;
  futures_return_volatility_pct: number;
  volume_shares: InstrumentShare;
  open_interest_shares: InstrumentShare;
}
