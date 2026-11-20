"""Machine Learning endpoints for model inspection, evaluation, and experimental direction inference."""

from datetime import date
from typing import Optional
from fastapi import APIRouter, Query
from backend.app.core.errors import AppException
from backend.app.schemas.base import ApiResponse
from backend.app.schemas.ml import (
    FeatureImportanceResponse,
    HistoricalPredictionsResponse,
    ModelInfoResponse,
    ModelMetricsResponse,
    PredictRequest,
    PredictResponse,
    SampleFeaturesResponse,
)
from backend.app.services.ml_service import ml_service

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


def validate_dates(start_date: Optional[date], end_date: Optional[date]) -> None:
    if start_date and end_date and start_date > end_date:
        raise AppException(
            message="start_date cannot be later than end_date",
            status_code=400,
            code="INVALID_DATE_RANGE",
            details={"start_date": str(start_date), "end_date": str(end_date)},
        )


@router.get(
    "/model-info",
    response_model=ApiResponse[ModelInfoResponse],
    summary="Model Architecture & Metadata",
    description="Returns trained Extra Trees model hyperparameters, pipeline steps, 43 feature names, and split dates.",
)
async def get_model_info() -> ApiResponse[ModelInfoResponse]:
    info = ml_service.get_model_info()
    return ApiResponse(data=info, message="Model specifications retrieved successfully")


@router.get(
    "/metrics",
    response_model=ApiResponse[ModelMetricsResponse],
    summary="Recorded Evaluation Metrics",
    description="Returns recorded untouched test set metrics, validation model ranking, and 3-fold purged CV summary.",
)
async def get_model_metrics() -> ApiResponse[ModelMetricsResponse]:
    metrics = ml_service.get_metrics()
    return ApiResponse(data=metrics, message="Model metrics retrieved successfully")


@router.get(
    "/feature-importance",
    response_model=ApiResponse[FeatureImportanceResponse],
    summary="Feature Importance (Native & Permutation)",
    description="Returns Gini impurity importance and validation permutation importance across all 43 features.",
)
async def get_feature_importance() -> ApiResponse[FeatureImportanceResponse]:
    importance = ml_service.get_feature_importance()
    return ApiResponse(data=importance, message="Feature importance retrieved successfully")


@router.get(
    "/historical-predictions",
    response_model=ApiResponse[HistoricalPredictionsResponse],
    summary="Test Set Historical Predictions",
    description="Returns historical predictions for all 117 test observations, confidence probabilities, and confusion matrix.",
)
async def get_historical_predictions(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(150, ge=1, le=500, description="Page size limit"),
    offset: int = Query(0, ge=0, description="Offset index"),
) -> ApiResponse[HistoricalPredictionsResponse]:
    validate_dates(start_date, end_date)
    preds = ml_service.get_historical_predictions(
        start_date=str(start_date) if start_date else None,
        end_date=str(end_date) if end_date else None,
        limit=limit,
        offset=offset,
    )
    return ApiResponse(data=preds, message="Historical predictions retrieved successfully")


@router.get(
    "/sample",
    response_model=ApiResponse[SampleFeaturesResponse],
    summary="Sample Feature Vector",
    description="Returns a real historical feature vector from test or validation partitions for quick live inference testing.",
)
async def get_sample_features(
    split: str = Query("test", description="Dataset split (test, validation, train)"),
    index: int = Query(0, ge=0, description="Row index within partition"),
) -> ApiResponse[SampleFeaturesResponse]:
    sample = ml_service.get_sample_features(split=split, index=index)
    return ApiResponse(data=sample, message="Sample feature vector retrieved successfully")


@router.post(
    "/predict",
    response_model=ApiResponse[PredictResponse],
    summary="Live Experimental Direction Prediction",
    description=(
        "Executes inference through the saved Extra Trees pipeline on 43 engineered features. "
        "Returns predicted market direction (-1: Down, 0: Sideways, 1: Up), label, and class probabilities."
    ),
)
async def predict(payload: PredictRequest) -> ApiResponse[PredictResponse]:
    result = ml_service.predict(payload.features)
    return ApiResponse(data=result, message="Experimental direction prediction generated successfully")
