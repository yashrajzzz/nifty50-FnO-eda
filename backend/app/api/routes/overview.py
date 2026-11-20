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
    counts = data_service.get_record_counts()

    fut_count = counts["futures"]
    calls_count = counts["calls"]
    puts_count = counts["puts"]
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
    import pyarrow.parquet as pq

    fut_path = data_service.processed_dir / "futures_clean.parquet"
    calls_path = data_service.processed_dir / "calls_clean.parquet"
    puts_path = data_service.processed_dir / "puts_clean.parquet"
    ml_full_path = data_service.ml_dir / "full_ml_dataset.parquet"
    target_audit_path = data_service.ml_dir / "target_audit.parquet"

    def inspect_parquet_schema(path) -> tuple[int, int, list[DatasetColumnInfo]]:
        if not path.is_file():
            return 0, 0, []
        pf = pq.ParquetFile(path)
        num_rows = pf.metadata.num_rows
        schema = pf.schema_arrow
        infos = []
        for i in range(len(schema)):
            field = schema.field(i)
            null_count = sum(
                pf.metadata.row_group(rg).column(i).statistics.null_count or 0
                for rg in range(pf.metadata.num_row_groups)
                if pf.metadata.row_group(rg).column(i).statistics
            )
            non_null = num_rows - null_count
            missing_pct = round((null_count / num_rows) * 100, 2) if num_rows else 0.0
            infos.append(
                DatasetColumnInfo(
                    name=field.name,
                    data_type=str(field.type),
                    non_null_count=non_null,
                    missing_percentage=missing_pct,
                )
            )
        return num_rows, len(schema), infos

    fut_rows, fut_cols_count, fut_cols = inspect_parquet_schema(fut_path)
    calls_rows, calls_cols_count, calls_cols = inspect_parquet_schema(calls_path)
    puts_rows, puts_cols_count, puts_cols = inspect_parquet_schema(puts_path)
    ml_rows, ml_cols_count, ml_cols = inspect_parquet_schema(ml_full_path)
    audit_rows, audit_cols_count, audit_cols = inspect_parquet_schema(target_audit_path)

    datasets = [
        DatasetDetail(
            dataset_key="futures",
            name="NIFTY Index Futures (Clean)",
            file_type="parquet",
            total_records=fut_rows,
            total_columns=fut_cols_count,
            date_coverage_start="2021-01-01",
            date_coverage_end="2026-09-25",
            unique_dates_count=1421,
            file_size_bytes=os.path.getsize(fut_path) if fut_path.is_file() else 0,
            columns=fut_cols,
        ),
        DatasetDetail(
            dataset_key="call_options",
            name="NIFTY Call Options (CE)",
            file_type="parquet",
            total_records=calls_rows,
            total_columns=calls_cols_count,
            date_coverage_start="2021-01-01",
            date_coverage_end="2026-09-25",
            unique_dates_count=1421,
            file_size_bytes=os.path.getsize(calls_path) if calls_path.is_file() else 0,
            columns=calls_cols,
        ),
        DatasetDetail(
            dataset_key="put_options",
            name="NIFTY Put Options (PE)",
            file_type="parquet",
            total_records=puts_rows,
            total_columns=puts_cols_count,
            date_coverage_start="2021-01-01",
            date_coverage_end="2026-09-25",
            unique_dates_count=1421,
            file_size_bytes=os.path.getsize(puts_path) if puts_path.is_file() else 0,
            columns=puts_cols,
        ),
        DatasetDetail(
            dataset_key="ml_full",
            name="Full Engineered ML Dataset",
            file_type="parquet",
            total_records=ml_rows,
            total_columns=ml_cols_count,
            date_coverage_start="2021-01-01",
            date_coverage_end="2026-09-25",
            unique_dates_count=775,
            file_size_bytes=os.path.getsize(ml_full_path) if ml_full_path.is_file() else 0,
            columns=ml_cols,
        ),
        DatasetDetail(
            dataset_key="target_audit",
            name="Daily Target Construction Audit",
            file_type="parquet",
            total_records=audit_rows,
            total_columns=audit_cols_count,
            date_coverage_start="2021-01-01",
            date_coverage_end="2026-09-25",
            unique_dates_count=1421,
            file_size_bytes=os.path.getsize(target_audit_path) if target_audit_path.is_file() else 0,
            columns=audit_cols,
        ),
    ]

    return ApiResponse(
        data=DatasetsOverviewResponse(total_datasets=len(datasets), datasets=datasets),
        message="Dataset inventory retrieved successfully",
    )
