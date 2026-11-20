"""Tests for NIFTY 50 Futures endpoints."""

from fastapi.testclient import TestClient


def test_futures_summary(client: TestClient) -> None:
    response = client.get("/api/v1/futures/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["total_records"] > 4000
    assert data["unique_trading_dates"] > 1400
    assert data["total_contracts_traded"] > 0
    assert data["total_turnover_lakhs"] > 0
    assert data["avg_daily_contracts"] > 0
    assert data["max_open_interest"] > 0


def test_futures_prices_pagination_and_filter(client: TestClient) -> None:
    response = client.get("/api/v1/futures/prices?limit=50&offset=0")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["returned_records"] == 50
    assert data["total_records"] > 1400

    first = data["prices"][0]
    assert "date" in first
    assert "close" in first

    # Date filter test
    r_filtered = client.get("/api/v1/futures/prices?start_date=2024-01-01&end_date=2024-03-31")
    assert r_filtered.status_code == 200
    filtered_data = r_filtered.json()["data"]
    for p in filtered_data["prices"]:
        assert "2024-01-01" <= p["date"] <= "2024-03-31"


def test_futures_prices_invalid_date_range(client: TestClient) -> None:
    response = client.get("/api/v1/futures/prices?start_date=2025-01-01&end_date=2024-01-01")
    assert response.status_code == 400
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "INVALID_DATE_RANGE"


def test_futures_volume_series(client: TestClient) -> None:
    response = client.get("/api/v1/futures/volume?limit=100")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]["series"]) == 100
    assert payload["data"]["series"][0]["contracts"] > 0


def test_futures_turnover_series(client: TestClient) -> None:
    response = client.get("/api/v1/futures/turnover?limit=100")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]["series"]) == 100
    assert payload["data"]["series"][0]["turnover_lakhs"] > 0


def test_futures_open_interest_series(client: TestClient) -> None:
    response = client.get("/api/v1/futures/open-interest?limit=100")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]["series"]) == 100
    assert payload["data"]["series"][0]["open_interest"] > 0
