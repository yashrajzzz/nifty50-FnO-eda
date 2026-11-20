"""Tests for overview and dataset inventory endpoints."""

from fastapi.testclient import TestClient


def test_overview_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/overview")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["study_period"]["start_date"] == "2021-01-01"
    assert data["study_period"]["end_date"] == "2026-09-25"
    assert data["total_raw_records"] > 2_000_000

    instruments = data["instruments"]
    assert len(instruments) == 3
    inst_names = [i["instrument"] for i in instruments]
    assert "NIFTY Index Futures" in inst_names
    assert "NIFTY Call Options (CE)" in inst_names
    assert "NIFTY Put Options (PE)" in inst_names

    ml = data["ml_dataset"]
    assert ml["total_observations"] == 775
    assert ml["feature_count"] == 43
    assert ml["train_rows"] == 541
    assert ml["validation_rows"] == 115
    assert ml["test_rows"] == 117

    assert data["data_limitation"]["is_official_cash_spot"] is False
    assert "proxy" in data["data_limitation"]["limitation_text"].lower()


def test_datasets_overview_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/overview/datasets")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["total_datasets"] >= 5
    keys = [d["dataset_key"] for d in data["datasets"]]
    assert "futures" in keys
    assert "call_options" in keys
    assert "put_options" in keys
    assert "ml_full" in keys
    assert "target_audit" in keys

    futures_ds = next(d for d in data["datasets"] if d["dataset_key"] == "futures")
    assert futures_ds["total_records"] > 4000
    assert futures_ds["total_columns"] >= 14
    assert len(futures_ds["columns"]) == futures_ds["total_columns"]
