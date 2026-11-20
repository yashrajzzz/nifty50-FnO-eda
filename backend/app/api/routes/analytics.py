"""API endpoints for comparative and statistical analytics across instruments."""

from fastapi import APIRouter
from backend.app.schemas.analytics import (
    ComparativeAnalyticsResponse,
    CorrelationMatrixResponse,
    DescriptiveAnalyticsResponse,
)
from backend.app.schemas.base import ApiResponse
from backend.app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Comparative Statistical Analytics"])


@router.get(
    "/descriptive",
    response_model=ApiResponse[DescriptiveAnalyticsResponse],
    summary="Descriptive Statistical Analysis",
    description="Mean, standard deviation, quartiles, skewness, and kurtosis for returns, volumes, and Open Interest.",
)
async def get_descriptive_analytics() -> ApiResponse[DescriptiveAnalyticsResponse]:
    stats = analytics_service.get_descriptive_analytics()
    return ApiResponse(data=stats, message="Descriptive analytics retrieved successfully")


@router.get(
    "/correlation",
    response_model=ApiResponse[CorrelationMatrixResponse],
    summary="Correlation Matrix (Pearson & Spearman)",
    description="Computes full Pearson and Spearman correlation matrices across daily market variables.",
)
async def get_correlation_analytics() -> ApiResponse[CorrelationMatrixResponse]:
    matrix = analytics_service.get_correlation_matrix()
    return ApiResponse(data=matrix, message="Correlation matrices retrieved successfully")


@router.get(
    "/comparison",
    response_model=ApiResponse[ComparativeAnalyticsResponse],
    summary="Comparative Market Dynamics",
    description="Key comparative findings: market shares, return volatilities, and CE vs PE volume/OI relationships.",
)
async def get_comparative_analytics() -> ApiResponse[ComparativeAnalyticsResponse]:
    comparison = analytics_service.get_comparative_analytics()
    return ApiResponse(data=comparison, message="Comparative analytics retrieved successfully")
