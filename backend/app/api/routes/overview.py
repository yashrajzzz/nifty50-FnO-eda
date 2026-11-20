"""Overview and dataset inventory API endpoints."""

import os
from fastapi import APIRouter
from backend.app.schemas.base import ApiResponse
from backend.app.schemas.overview import (
    DataLimitationNotice,
    DatasetColumnInfo,
    DatasetDetail,
    DatasetsOverviewResponse,
    InstrumentRecordCount,
    MLDatasetOverview,
    OverviewSummary,
    StudyPeriodInfo,
)
from backend.app.services.data_service import data_service

router = APIRouter(prefix="/overview", tags=["Overview & Metadata"])


@router.get(
    "",
    response_model=ApiResponse[OverviewSummary],
    summary="Project & Market Overview",
    description="Returns high-level project summary, study period, scale, and data limitation disclosures.",
)
async def get_overview() -> ApiResponse[OverviewSummary]:
    ml_meta = data_service.get_ml_metadata()
    fut = data_service.get_futures_data()
    calls = data_service.get_calls_data(columns=["Date"])
    puts = data_service.get_puts_data(columns=["Date"])

    fut_count = len(fut)
    calls_count = len(calls)
    puts_count = len(puts)
    total_raw = fut_count + calls_count + puts_count

    summary = OverviewSummary(
        project_name="NIFTY 50 Futures and Options Exploratory Data Analysis & Machine Learning",
        study_period=StudyPeriodInfo(
            start_date="2021-01-01",
            end_date="2026-09-25",
            is_partial=True,
            note="September 2026 represents partial data rather than a complete calendar month.",
        ),
        total_raw_records=total_raw,
        instruments=[
            InstrumentRecordCount(
                instrument="NIFTY Index Futures",
                records=fut_count,
                percentage=round((fut_count / total_raw) * 100, 4),
            ),
            InstrumentRecordCount(
                instrument="NIFTY Call Options (CE)",
                records=calls_count,
                percentage=round((calls_count / total_raw) * 100, 2),
            ),
            InstrumentRecordCount(
                instrument="NIFTY Put Options (PE)",
                records=puts_count,
                percentage=round((puts_count / total_raw) * 100, 2),
            ),
        ],
        ml_dataset=MLDatasetOverview(
            total_observations=ml_meta.get("valid_target_observations", 775),
            feature_count=ml_meta.get("feature_count", 43),
            target_classes=ml_meta.get("target_mapping", {"-1": "Down", "0": "Sideways", "1": "Up"}),
            train_rows=541,
            validation_rows=115,
            test_rows=117,
            split_discrepancy_note=(
                "Partitions sum to 773 observations; 2 boundary observations (2025-10-15 and 2026-04-07) "
                "were purged between train/validation and validation/test to avoid lookahead contamination."
            ),
        ),
        data_limitation=DataLimitationNotice(
            field="Underlying Value",
            proxy_source=ml_meta.get(
                "underlying_source",
                "Daily median Underlying Value from supplied futures contracts, CE then PE fallback",
            ),
            coverage_percentage=ml_meta.get("underlying_proxy_coverage_percent", 68.26),
            is_official_cash_spot=False,
            limitation_text=ml_meta.get(
                "underlying_source_limitation",
                "Derivatives-implied proxy, not an independent official NIFTY 50 spot close series.",
            ),
        ),
    )
    return ApiResponse(data=summary, message="Overview retrieved successfully")


@router.get(
    "/datasets",
    response_model=ApiResponse[DatasetsOverviewResponse],
    summary="Dataset Inventory & Schemas",
    description="Returns detailed records, column definitions, null-counts, and file sizes across repository datasets.",
)
async def get_datasets_overview() -> ApiResponse[DatasetsOverviewResponse]:
    fut = data_service.get_futures_data()
    ml_full = data_service.get_ml_dataset("full")
    target_audit = data_service.get_ml_dataset("target_audit")

    def inspect_columns(df) -> list[DatasetColumnInfo]:
        infos = []
        for col in df.columns:
            non_null = int(df[col].count())
            total = len(df)
            missing_pct = round(((total - non_null) / total) * 100, 2) if total > 0 else 0.0
            infos.append(
                DatasetColumnInfo(
                    name=str(col),
                    data_type=str(df[col].dtype),
                    non_null_count=non_null,
                    missing_percentage=missing_pct,
                )
            )
        return infos

    fut_path = data_service.processed_dir / "futures_clean.parquet"
    calls_path = data_service.processed_dir / "calls_clean.parquet"
    puts_path = data_service.processed_dir / "puts_clean.parquet"
    ml_full_path = data_service.ml_dir / "full_ml_dataset.parquet"
    target_audit_path = data_service.ml_dir / "target_audit.parquet"

    calls = data_service.get_calls_data()
    puts = data_service.get_puts_data()

    datasets = [
        DatasetDetail(
            dataset_key="futures",
            name="NIFTY Index Futures (Clean)",
            file_type="parquet",
            total_records=len(fut),
            total_columns=len(fut.columns),
            date_coverage_start=str(fut["Date"].min().date()) if "Date" in fut.columns else None,
            date_coverage_end=str(fut["Date"].max().date()) if "Date" in fut.columns else None,
            unique_dates_count=int(fut["Date"].nunique()) if "Date" in fut.columns else None,
            file_size_bytes=os.path.getsize(fut_path) if fut_path.is_file() else 0,
            columns=inspect_columns(fut),
        ),
        DatasetDetail(
            dataset_key="call_options",
            name="NIFTY Call Options (CE)",
            file_type="parquet",
            total_records=len(calls),
            total_columns=len(calls.columns),
            date_coverage_start=str(calls["Date"].min().date()) if "Date" in calls.columns else None,
            date_coverage_end=str(calls["Date"].max().date()) if "Date" in calls.columns else None,
            unique_dates_count=int(calls["Date"].nunique()) if "Date" in calls.columns else None,
            file_size_bytes=os.path.getsize(calls_path) if calls_path.is_file() else 0,
            columns=inspect_columns(calls),
        ),
        DatasetDetail(
            dataset_key="put_options",
            name="NIFTY Put Options (PE)",
            file_type="parquet",
            total_records=len(puts),
            total_columns=len(puts.columns),
            date_coverage_start=str(puts["Date"].min().date()) if "Date" in puts.columns else None,
            date_coverage_end=str(puts["Date"].max().date()) if "Date" in puts.columns else None,
            unique_dates_count=int(puts["Date"].nunique()) if "Date" in puts.columns else None,
            file_size_bytes=os.path.getsize(puts_path) if puts_path.is_file() else 0,
            columns=inspect_columns(puts),
        ),
        DatasetDetail(
            dataset_key="ml_full",
            name="Full Engineered ML Dataset",
            file_type="parquet",
            total_records=len(ml_full),
            total_columns=len(ml_full.columns),
            date_coverage_start=str(ml_full["Date"].min().date()) if "Date" in ml_full.columns else None,
            date_coverage_end=str(ml_full["Date"].max().date()) if "Date" in ml_full.columns else None,
            unique_dates_count=int(ml_full["Date"].nunique()) if "Date" in ml_full.columns else None,
            file_size_bytes=os.path.getsize(ml_full_path) if ml_full_path.is_file() else 0,
            columns=inspect_columns(ml_full),
        ),
        DatasetDetail(
            dataset_key="target_audit",
            name="Daily Target Construction Audit",
            file_type="parquet",
            total_records=len(target_audit),
            total_columns=len(target_audit.columns),
            date_coverage_start=str(target_audit["Date"].min().date()) if "Date" in target_audit.columns else None,
            date_coverage_end=str(target_audit["Date"].max().date()) if "Date" in target_audit.columns else None,
            unique_dates_count=int(target_audit["Date"].nunique()) if "Date" in target_audit.columns else None,
            file_size_bytes=os.path.getsize(target_audit_path) if target_audit_path.is_file() else 0,
            columns=inspect_columns(target_audit),
        ),
    ]

    return ApiResponse(
        data=DatasetsOverviewResponse(total_datasets=len(datasets), datasets=datasets),
        message="Dataset inventory retrieved successfully",
    )
