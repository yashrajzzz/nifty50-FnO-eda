"""Base response envelopes and health schemas."""

from datetime import datetime, timezone
from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ErrorDetail(BaseModel):
    """Structured error payload."""

    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error explanation")
    details: Optional[Any] = Field(None, description="Optional extra error context")


class ApiResponse(BaseModel, Generic[DataT]):
    """Standard generic API response wrapper."""

    success: bool = Field(True, description="Indicates if the request succeeded")
    data: Optional[DataT] = Field(None, description="Response payload")
    message: Optional[str] = Field(None, description="Optional operational message")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of response",
    )


class ArtifactStatus(BaseModel):
    """Readiness status of repository datasets and model artifacts."""

    model_pipeline: bool = Field(..., description="Trained Extra Trees joblib pipeline present")
    feature_schema: bool = Field(..., description="Ordered 43-features JSON schema present")
    ml_metadata: bool = Field(..., description="ML split and target metadata JSON present")
    ml_dataset: bool = Field(..., description="Full ML parquet dataset present")
    evaluation_artifacts: bool = Field(..., description="Evaluation metrics and model card present")


class HealthResponse(BaseModel):
    """Health status and environment metadata."""

    status: str = Field("ok", description="Overall system health status")
    environment: str = Field(..., description="Application environment (e.g., development, production)")
    version: str = Field(..., description="Application semantic version")
    artifacts_ready: bool = Field(..., description="Whether required ML artifacts are available")
    artifacts: ArtifactStatus = Field(..., description="Granular artifact availability flags")


class RootResponse(BaseModel):
    """Welcome information for API root endpoint."""

    name: str = Field(..., description="Application name")
    version: str = Field(..., description="Application version")
    docs_url: str = Field(..., description="Interactive OpenAPI documentation URL")
    health_url: str = Field(..., description="Health check endpoint URL")
