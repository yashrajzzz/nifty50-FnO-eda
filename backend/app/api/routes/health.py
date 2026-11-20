"""Health check endpoints for application monitoring and artifact verification."""

from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.schemas.base import ApiResponse, ArtifactStatus, HealthResponse

router = APIRouter()


def check_artifact_readiness() -> tuple[bool, ArtifactStatus]:
    """Verify local availability of repository model artifacts and datasets."""
    status = ArtifactStatus(
        model_pipeline=(settings.SAVED_MODELS_DIR / "nifty50_direction_pipeline.joblib").is_file(),
        feature_schema=(settings.SAVED_MODELS_DIR / "nifty50_direction_features.json").is_file(),
        ml_metadata=(settings.DATA_ML_DIR / "ml_metadata.json").is_file(),
        ml_dataset=(settings.DATA_ML_DIR / "full_ml_dataset.parquet").is_file(),
        evaluation_artifacts=(settings.EVALUATION_DIR / "model_card.json").is_file(),
    )
    all_ready = all(
        [
            status.model_pipeline,
            status.feature_schema,
            status.ml_metadata,
            status.ml_dataset,
            status.evaluation_artifacts,
        ]
    )
    return all_ready, status


@router.get(
    "/health",
    response_model=ApiResponse[HealthResponse],
    summary="Application Health & Readiness",
    description="Returns current service status, environment details, and ML artifact readiness.",
)
async def get_health() -> ApiResponse[HealthResponse]:
    all_ready, status = check_artifact_readiness()
    return ApiResponse(
        data=HealthResponse(
            status="ok",
            environment=settings.ENV,
            version=settings.VERSION,
            artifacts_ready=all_ready,
            artifacts=status,
        ),
        message="Service is operational",
    )
