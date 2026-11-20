"""Pydantic schemas for overview and dataset inventory endpoints."""

from datetime import date
from typing import Any, Optional
from pydantic import BaseModel, Field


class StudyPeriodInfo(BaseModel):
    """Study period coverage details."""

    start_date: str = Field(..., description="Start date of study (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date of study (YYYY-MM-DD)")
    is_partial: bool = Field(True, description="Indicates if the final period is partial")
    note: str = Field(..., description="Contextual note regarding date coverage")


class InstrumentRecordCount(BaseModel):
    """Record counts for individual market instruments."""

    instrument: str = Field(..., description="Name of instrument (Futures, Call Options, Put Options)")
    records: int = Field(..., description="Number of observed records")
    percentage: float = Field(..., description="Percentage of total market records")


class MLDatasetOverview(BaseModel):
    """Machine learning experimental dataset overview."""

    total_observations: int = Field(..., description="Total labelled daily observations")
    feature_count: int = Field(..., description="Number of engineered predictor features")
    target_classes: dict[str, str] = Field(..., description="Target direction label mapping")
    train_rows: int = Field(..., description="Training partition observation count")
    validation_rows: int = Field(..., description="Validation partition observation count")
    test_rows: int = Field(..., description="Test partition observation count")
    split_discrepancy_note: str = Field(..., description="Explanation of boundary purged observations")


class DataLimitationNotice(BaseModel):
    """Transparent notice regarding derivatives-implied proxy data."""

    field: str = Field("Underlying Value", description="Relevant dataset field")
    proxy_source: str = Field(..., description="Derivatives source used to construct proxy")
    coverage_percentage: float = Field(..., description="Coverage across trading dates without interpolation")
    is_official_cash_spot: bool = Field(False, description="Whether this represents official NSE spot close")
    limitation_text: str = Field(..., description="Full description of the proxy constraint")


class OverviewSummary(BaseModel):
    """Consolidated project overview response payload."""

    project_name: str = Field(..., description="Project title")
    study_period: StudyPeriodInfo = Field(..., description="Study period coverage details")
    total_raw_records: int = Field(..., description="Sum of raw records across all 3 instruments")
    instruments: list[InstrumentRecordCount] = Field(..., description="Instrument record counts")
    ml_dataset: MLDatasetOverview = Field(..., description="ML dataset snapshot")
    data_limitation: DataLimitationNotice = Field(..., description="Data constraint disclosures")


class DatasetColumnInfo(BaseModel):
    """Column schema details for dataset inventory."""

    name: str = Field(..., description="Column name")
    data_type: str = Field(..., description="Inferred or physical data type")
    non_null_count: int = Field(..., description="Count of non-null records")
    missing_percentage: float = Field(..., description="Percentage of missing values")


class DatasetDetail(BaseModel):
    """Granular statistics and schema for an individual dataset."""

    dataset_key: str = Field(..., description="Identifier key (futures, calls, puts, ml_full, etc.)")
    name: str = Field(..., description="Descriptive display name")
    file_type: str = Field(..., description="Storage format (parquet, zip, csv)")
    total_records: int = Field(..., description="Row count")
    total_columns: int = Field(..., description="Column count")
    date_coverage_start: Optional[str] = Field(None, description="Earliest trading date")
    date_coverage_end: Optional[str] = Field(None, description="Latest trading date")
    unique_dates_count: Optional[int] = Field(None, description="Count of unique trading dates")
    file_size_bytes: int = Field(..., description="File size on disk in bytes")
    columns: list[DatasetColumnInfo] = Field(..., description="Column schema breakdown")


class DatasetsOverviewResponse(BaseModel):
    """Inventory response covering all primary datasets."""

    total_datasets: int = Field(..., description="Number of tracked datasets")
    datasets: list[DatasetDetail] = Field(..., description="Dataset specifications")
