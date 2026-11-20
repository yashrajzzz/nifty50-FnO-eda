"""Tests for NIFTY 50 Options endpoints."""

from fastapi.testclient import TestClient


def test_options_summary(client: TestClient) -> None:
    response = client.get("/api/v1/options/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["total_ce_records"] > 1_000_000
    assert data["total_pe_records"] > 1_000_000
    assert data["unique_trading_dates"] > 1400
    assert data["total_ce_contracts"] > 0
    assert data["total_pe_contracts"] > 0
    assert data["avg_pcr_oi"] > 0.5


def test_options_comparison(client: TestClient) -> None:
    response = client.get("/api/v1/options/comparison?limit=30")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert len(data["series"]) == 30
    first = data["series"][0]
    assert first["ce_contracts"] > 0
    assert first["pe_contracts"] > 0
    assert first["total_contracts"] == first["ce_contracts"] + first["pe_contracts"]
    assert first["pcr_oi"] is not None


def test_options_volume(client: TestClient) -> None:
    response = client.get("/api/v1/options/volume?limit=20")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]["series"]) == 20
    assert payload["data"]["series"][0]["total_contracts"] > 0


def test_options_premium_turnover(client: TestClient) -> None:
    response = client.get("/api/v1/options/premium-turnover?limit=20")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]["series"]) == 20


def test_options_strike_analysis(client: TestClient) -> None:
    response = client.get("/api/v1/options/strike-analysis?top_n=25")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["total_strikes"] == 25
    assert len(data["strikes"]) == 25
    # Verify sorted by strike price
    strikes = [s["strike_price"] for s in data["strikes"]]
    assert strikes == sorted(strikes)


def test_options_expiry_analysis(client: TestClient) -> None:
    response = client.get("/api/v1/options/expiry-analysis")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["total_expiries"] > 50
    assert len(data["expiries"]) == data["total_expiries"]
    first = data["expiries"][0]
    assert first["total_contracts"] > 0
    assert first["unique_strikes"] > 0
