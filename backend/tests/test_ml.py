"""Tests for Machine Learning model inspection, evaluation, and inference endpoints."""

from fastapi.testclient import TestClient


def test_model_info_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/ml/model-info")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["selected_model"] == "Extra Trees"
    assert data["feature_count"] == 43
    assert len(data["feature_columns"]) == 43
    assert data["feature_columns"][0] == "NIFTY_Return"
    assert data["feature_columns"][-1] == "CE_PE_Volume_Ratio"

    hyperparams = data["hyperparameters"]
    assert hyperparams["n_estimators"] == 120
    assert hyperparams["max_depth"] == 10
    assert hyperparams["class_weight"] == "balanced_subsample"

    assert data["dataset_splits"]["training"] == 541
    assert data["dataset_splits"]["validation"] == 115
    assert data["dataset_splits"]["testing"] == 117
    assert data["not_a_trading_recommendation"] is True


def test_model_metrics_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/ml/metrics")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    test_metrics = data["final_test_metrics"]
    assert test_metrics["Accuracy"] == 0.3846
    assert test_metrics["Macro_F1"] == 0.3224
    assert test_metrics["Balanced_Accuracy"] == 0.3227

    val_comparison = data["validation_comparison"]
    assert len(val_comparison) == 7
    # Top model by validation Macro F1 is Extra Trees
    assert val_comparison[0]["model"] == "Extra Trees"
    assert val_comparison[0]["macro_f1"] == 0.3704

    cv_folds = data["purged_cv_folds"]
    assert len(cv_folds) == 3


def test_feature_importance_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/ml/feature-importance")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["total_features"] == 43

    native = data["native_importance"]
    assert len(native) == 43
    # Top native feature in notebook 06 was Futures_Relative_OI_20D
    assert native[0]["feature"] == "Futures_Relative_OI_20D"
    assert native[0]["importance"] > 0

    perm = data["permutation_importance"]
    assert len(perm) == 43
    assert perm[0]["feature"] == "Futures_High_Volume"


def test_historical_predictions_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/ml/historical-predictions")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["total_records"] == 117
    assert data["recorded_accuracy"] == 0.3846
    assert data["recorded_macro_f1"] == 0.3224

    cm = data["confusion_matrix"]
    assert len(cm) == 3
    # Down row
    assert cm[0]["actual_label"] == "Down (-1)"
    assert cm[0]["down"] == 27
    assert cm[0]["sideways"] == 7
    assert cm[0]["up"] == 23
    assert cm[0]["total"] == 57

    # Sideways row
    assert cm[1]["actual_label"] == "Sideways (0)"
    assert cm[1]["total"] == 13

    # Up row
    assert cm[2]["actual_label"] == "Up (1)"
    assert cm[2]["total"] == 47

    # Test date filtering
    r_filtered = client.get("/api/v1/ml/historical-predictions?start_date=2026-05-01&end_date=2026-05-31")
    assert r_filtered.status_code == 200
    f_data = r_filtered.json()["data"]
    for item in f_data["predictions"]:
        assert "2026-05-01" <= item["date"] <= "2026-05-31"


def test_sample_features_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/ml/sample?split=test&index=0")
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["split"] == "test"
    assert data["actual_direction"] in [-1, 0, 1]
    assert len(data["features"]) == 43


def test_predict_endpoint_success(client: TestClient) -> None:
    # 1. Fetch valid sample features
    sample_resp = client.get("/api/v1/ml/sample?split=test&index=0")
    assert sample_resp.status_code == 200
    features = sample_resp.json()["data"]["features"]

    # 2. Post to predict
    response = client.post("/api/v1/ml/predict", json={"features": features})
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True

    data = payload["data"]
    assert data["predicted_direction"] in [-1, 0, 1]
    assert data["predicted_label"] in ["Down", "Sideways", "Up"]
    assert 0.0 <= data["confidence"] <= 1.0

    probas = data["probabilities"]
    total_prob = probas["down"] + probas["sideways"] + probas["up"]
    assert abs(total_prob - 1.0) < 1e-4

    assert data["model_name"] == "Extra Trees"
    assert data["is_historical"] is False
    assert "Experimental" in data["disclaimer"]
    assert "proxy" in data["target_limitation"].lower()


def test_predict_endpoint_missing_features(client: TestClient) -> None:
    # Incomplete features dictionary
    response = client.post("/api/v1/ml/predict", json={"features": {"NIFTY_Return": 0.5}})
    assert response.status_code == 422
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "MISSING_FEATURES"


def test_predict_endpoint_invalid_values(client: TestClient) -> None:
    # Fetch valid features then corrupt one
    sample_resp = client.get("/api/v1/ml/sample?split=test&index=0")
    features = sample_resp.json()["data"]["features"]
    features["NIFTY_Return"] = "not-a-number"

    response = client.post("/api/v1/ml/predict", json={"features": features})
    assert response.status_code == 422
