/* TypeScript interfaces matching backend Pydantic schemas */

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  timestamp: string;
}

/* ==================== OVERVIEW ==================== */

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

/* ==================== FUTURES ==================== */

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

export interface FuturesPricePoint {
  date: string;
  expiry?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  settle_price?: number;
  underlying_value?: number;
}

export interface FuturesPricesResponse {
  total_records: number;
  returned_records: number;
  prices: FuturesPricePoint[];
}

export interface FuturesVolumePoint {
  date: string;
  contracts: number;
  turnover_lakhs: number;
  volume_change_pct?: number;
}

export interface FuturesVolumeResponse {
  total_records: number;
  series: FuturesVolumePoint[];
}

export interface FuturesTurnoverPoint {
  date: string;
  turnover_lakhs: number;
  turnover_change_pct?: number;
}

export interface FuturesTurnoverResponse {
  total_records: number;
  series: FuturesTurnoverPoint[];
}

export interface FuturesOIPoint {
  date: string;
  open_interest: number;
  change_in_oi?: number;
  oi_change_pct?: number;
}

export interface FuturesOIResponse {
  total_records: number;
  series: FuturesOIPoint[];
}

/* ==================== OPTIONS ==================== */

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

export interface DailyOptionsComparisonPoint {
  date: string;
  ce_contracts: number;
  pe_contracts: number;
  total_contracts: number;
  ce_oi: number;
  pe_oi: number;
  total_oi: number;
  pcr_oi?: number;
  pcr_volume?: number;
  ce_turnover_lakhs: number;
  pe_turnover_lakhs: number;
  ce_premium_turnover_lakhs?: number;
  pe_premium_turnover_lakhs?: number;
}

export interface OptionsComparisonResponse {
  total_records: number;
  series: DailyOptionsComparisonPoint[];
}

export interface OptionsVolumePoint {
  date: string;
  ce_contracts: number;
  pe_contracts: number;
  total_contracts: number;
  ce_pe_volume_ratio?: number;
}

export interface OptionsVolumeResponse {
  total_records: number;
  series: OptionsVolumePoint[];
}

export interface OptionsPremiumTurnoverPoint {
  date: string;
  ce_premium_turnover_lakhs?: number;
  pe_premium_turnover_lakhs?: number;
  total_premium_turnover_lakhs?: number;
}

export interface OptionsPremiumTurnoverResponse {
  total_records: number;
  series: OptionsPremiumTurnoverPoint[];
}

export interface StrikeAnalysisPoint {
  strike_price: number;
  ce_open_interest: number;
  pe_open_interest: number;
  ce_contracts: number;
  pe_contracts: number;
  pcr_oi?: number;
}

export interface StrikeAnalysisResponse {
  total_strikes: number;
  snapshot_date?: string;
  strikes: StrikeAnalysisPoint[];
}

export interface ExpiryAnalysisPoint {
  expiry: string;
  total_contracts: number;
  total_open_interest: number;
  ce_contracts: number;
  pe_contracts: number;
  unique_strikes: number;
}

export interface ExpiryAnalysisResponse {
  total_expiries: number;
  expiries: ExpiryAnalysisPoint[];
}

/* ==================== ANALYTICS ==================== */

export interface DescriptiveStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  p25: number;
  median: number;
  p75: number;
  max: number;
  skewness?: number;
  kurtosis?: number;
}

export interface DescriptiveAnalyticsResponse {
  futures_returns: DescriptiveStats;
  pcr_oi: DescriptiveStats;
  futures_contracts: DescriptiveStats;
  ce_contracts: DescriptiveStats;
  pe_contracts: DescriptiveStats;
  futures_oi: DescriptiveStats;
  ce_oi: DescriptiveStats;
  pe_oi: DescriptiveStats;
}

export interface CorrelationMatrixResponse {
  features: string[];
  pearson: number[][];
  spearman: number[][];
}

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

/* ==================== MACHINE LEARNING ==================== */

export interface ModelParamSummary {
  n_estimators: number;
  max_depth?: number;
  min_samples_split: number;
  min_samples_leaf: number;
  max_features: string;
  class_weight: string;
  random_state: number;
}

export interface ModelInfoResponse {
  project: string;
  selected_model: string;
  selected_model_type: string;
  pipeline_steps: string[];
  hyperparameters: ModelParamSummary;
  feature_count: number;
  feature_columns: string[];
  raw_class_mapping: Record<string, string>;
  model_class_mapping: Record<string, string>;
  dataset_splits: Record<string, number>;
  date_ranges: Record<string, Record<string, string>>;
  cross_validation: string;
  target_provenance: string;
  target_limitation: string;
  not_a_trading_recommendation: boolean;
}

export interface ValidationModelScore {
  model: string;
  accuracy: number;
  balanced_accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  log_loss: number;
}

export interface CVSummaryItem {
  model: string;
  best_cv_macro_f1: number;
  cv_std: number;
  mean_train_macro_f1: number;
  best_params: string;
}

export interface PurgedCVFoldItem {
  fold: number;
  train_rows: number;
  validation_rows: number;
  train_end: string;
  validation_start: string;
  max_train_target_date: string;
  purged_rows: number;
}

export interface ModelMetricsResponse {
  final_test_metrics: Record<string, number>;
  validation_comparison: ValidationModelScore[];
  training_cv_summary: CVSummaryItem[];
  purged_cv_folds: PurgedCVFoldItem[];
}

export interface NativeImportanceItem {
  feature: string;
  importance: number;
}

export interface PermutationImportanceItem {
  feature: string;
  importance_mean: number;
  importance_std: number;
}

export interface FeatureImportanceResponse {
  total_features: number;
  native_importance: NativeImportanceItem[];
  permutation_importance: PermutationImportanceItem[];
}

export interface HistoricalPredictionItem {
  date: string;
  target_date: string;
  actual_direction: number;
  predicted_direction: number;
  actual_label: string;
  predicted_label: string;
  correct: boolean;
  probability_down: number;
  probability_sideways: number;
  probability_up: number;
}

export interface ConfusionMatrixRow {
  actual_label: string;
  down: number;
  sideways: number;
  up: number;
  total: number;
}

export interface HistoricalPredictionsResponse {
  total_records: number;
  returned_records: number;
  recorded_accuracy: number;
  recorded_macro_f1: number;
  confusion_matrix: ConfusionMatrixRow[];
  predictions: HistoricalPredictionItem[];
}

export interface PredictRequest {
  features: Record<string, number>;
}

export interface DirectionProbabilities {
  down: number;
  sideways: number;
  up: number;
}

export interface PredictResponse {
  predicted_direction: number;
  predicted_label: string;
  confidence: number;
  probabilities: DirectionProbabilities;
  model_name: string;
  pipeline_steps: string[];
  is_historical: boolean;
  disclaimer: string;
  target_limitation: string;
}

export interface SampleFeaturesResponse {
  date: string;
  target_date: string;
  actual_direction: number;
  actual_label: string;
  split: string;
  features: Record<string, number>;
}
