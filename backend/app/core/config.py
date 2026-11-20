"""Centralized application settings via Pydantic Settings."""

from pathlib import Path
from typing import Any, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment and defaults."""

    # Project metadata
    PROJECT_NAME: str = "NIFTY 50 Futures and Options Analytics API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = (
        "Backend API for NIFTY 50 Derivatives Exploratory Data Analysis "
        "and Machine Learning Market Direction Classification."
    )
    API_V1_STR: str = "/api/v1"

    # Runtime environment
    ENV: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS configuration for Next.js frontend
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        raise ValueError("Invalid format for BACKEND_CORS_ORIGINS")

    # Project filesystem paths
    @property
    def PROJECT_ROOT(self) -> Path:
        """Absolute path to repository root directory."""
        # backend/app/core/config.py -> parents[3] is project root
        return Path(__file__).resolve().parents[3]

    @property
    def DATA_DIR(self) -> Path:
        return self.PROJECT_ROOT / "data"

    @property
    def RAW_DATA_DIR(self) -> Path:
        return self.DATA_DIR / "raw"

    @property
    def PROCESSED_DATA_DIR(self) -> Path:
        return self.DATA_DIR / "processed"

    @property
    def DATA_ML_DIR(self) -> Path:
        return self.DATA_DIR / "ml"

    @property
    def MODELS_DIR(self) -> Path:
        return self.PROJECT_ROOT / "models"

    @property
    def SAVED_MODELS_DIR(self) -> Path:
        return self.MODELS_DIR / "saved_models"

    @property
    def EVALUATION_DIR(self) -> Path:
        return self.MODELS_DIR / "evaluation" / "notebook_06"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
