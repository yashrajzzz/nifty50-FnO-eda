"""Tests for comparative and statistical analytics endpoints."""

from fastapi.testclient import TestClient


def test_descriptive_analytics(client: TestClient) -> None:
    response = client.get("/api/v1/analytics/descriptive")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["futures_returns"]["count"] > 1400
    assert data["futures_returns"]["std"] > 0
    assert data["pcr_oi"]["mean"] > 0.5
    assert data["ce_contracts"]["count"] > 1400
    assert data["pe_contracts"]["count"] > 1400


def test_correlation_matrix(client: TestClient) -> None:
    response = client.get("/api/v1/analytics/correlation")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    features = data["features"]
    assert len(features) >= 8

    pearson = data["pearson"]
    spearman = data["spearman"]

    assert len(pearson) == len(features)
    assert len(spearman) == len(features)

    # Diagonal elements of correlation matrices should be 1.0
    for i in range(len(features)):
        assert abs(pearson[i][i] - 1.0) < 1e-4
        assert abs(spearman[i][i] - 1.0) < 1e-4


def test_comparative_analytics(client: TestClient) -> None:
    response = client.get("/api/v1/analytics/comparison")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["common_trading_days"] == 1421
    assert data["average_pcr"] > 0
    assert data["median_pcr"] > 0
    assert -1.0 <= data["ce_pe_volume_correlation"] <= 1.0
    assert -1.0 <= data["ce_pe_oi_correlation"] <= 1.0

    vol_shares = data["volume_shares"]
    total_vol_pct = vol_shares["futures_pct"] + vol_shares["ce_pct"] + vol_shares["pe_pct"]
    assert abs(total_vol_pct - 100.0) < 0.2

    oi_shares = data["open_interest_shares"]
    total_oi_pct = oi_shares["futures_pct"] + oi_shares["ce_pct"] + oi_shares["pe_pct"]
    assert abs(total_oi_pct - 100.0) < 0.2
