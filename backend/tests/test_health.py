"""Tests for health, root, and documentation endpoints."""

from fastapi.testclient import TestClient
from backend.app.core.config import settings


def test_root_endpoint(client: TestClient) -> None:
    """Root endpoint should return 200 with service metadata."""
    response = client.get("/")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["name"] == settings.PROJECT_NAME
    assert payload["data"]["docs_url"] == "/docs"
    assert payload["data"]["health_url"] == "/health"


def test_health_endpoint(client: TestClient) -> None:
    """Direct /health endpoint should return status 'ok' and artifact flags."""
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["status"] == "ok"
    assert data["environment"] == settings.ENV
    assert data["artifacts_ready"] is True
    assert data["artifacts"]["model_pipeline"] is True
    assert data["artifacts"]["feature_schema"] is True
    assert data["artifacts"]["ml_dataset"] is True


def test_versioned_health_endpoint(client: TestClient) -> None:
    """Versioned /api/v1/health should respond identically."""
    response = client.get(f"{settings.API_V1_STR}/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["status"] == "ok"


def test_docs_endpoints(client: TestClient) -> None:
    """OpenAPI and Swagger UI docs endpoints should respond successfully."""
    response = client.get("/docs")
    assert response.status_code == 200

    response_openapi = client.get("/openapi.json")
    assert response_openapi.status_code == 200
    openapi_json = response_openapi.json()
    assert openapi_json["info"]["title"] == settings.PROJECT_NAME


def test_configuration_loading() -> None:
    """Settings should correctly resolve paths and defaults."""
    assert settings.PROJECT_NAME != ""
    assert settings.PROJECT_ROOT.is_dir()
    assert (settings.PROJECT_ROOT / "data").is_dir()
    assert (settings.PROJECT_ROOT / "models").is_dir()
    assert isinstance(settings.BACKEND_CORS_ORIGINS, list)
    assert len(settings.BACKEND_CORS_ORIGINS) >= 1
