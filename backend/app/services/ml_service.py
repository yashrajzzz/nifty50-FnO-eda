"""Machine Learning model management, inference, and evaluation service."""

import json
from pathlib import Path
from typing import Any, Optional
import joblib
import numpy as np
import pandas as pd
from backend.app.core.config import settings
from backend.app.core.errors import AppException, ModelArtifactError, NotFoundError
from backend.app.schemas.ml import (
    CVSummaryItem,
    ConfusionMatrixRow,
    DirectionProbabilities,
    FeatureImportanceResponse,
    HistoricalPredictionItem,
    HistoricalPredictionsResponse,
    ModelInfoResponse,
    ModelMetricsResponse,
    ModelParamSummary,
    NativeImportanceItem,
    PermutationImportanceItem,
    PredictResponse,
    PurgedCVFoldItem,
    SampleFeaturesResponse,
    ValidationModelScore,
)


class MLService:
    """Manages Extra Trees pipeline artifact loading, evaluation tables, and inference."""

    # Model class mapping: internal pipeline encodes 0: Down (-1), 1: Sideways (0), 2: Up (1)
    MODEL_TO_DOMAIN_MAP = {
        0: (-1, "Down"),
        1: (0, "Sideways"),
        2: (1, "Up"),
    }

    def __init__(self) -> None:
        self.models_dir = settings.SAVED_MODELS_DIR
        self.eval_dir = settings.EVALUATION_DIR
        self.ml_dir = settings.DATA_ML_DIR

        self.model_pipeline_path = self.models_dir / "nifty50_direction_pipeline.joblib"
        self.feature_schema_path = self.models_dir / "nifty50_direction_features.json"
        self.model_card_path = self.eval_dir / "model_card.json"

        self._pipeline: Optional[Any] = None
        self._feature_names: Optional[list[str]] = None
        self._model_card: Optional[dict[str, Any]] = None

    # ------------------------------------------------------------------
    # Pipeline & Schema Loading
    # ------------------------------------------------------------------
    def get_pipeline(self) -> Any:
        """Load and cache the saved scikit-learn pipeline."""
        if self._pipeline is not None:
            return self._pipeline

        if not self.model_pipeline_path.is_file():
            raise ModelArtifactError(
                message="Trained model pipeline artifact not found",
                details={"expected_path": str(self.model_pipeline_path)},
            )

        try:
            self._pipeline = joblib.load(self.model_pipeline_path)
            return self._pipeline
        except Exception as exc:
            raise ModelArtifactError(
                message="Failed to load trained model pipeline artifact",
                details={"error": str(exc)},
            ) from exc

    def get_feature_names(self) -> list[str]:
        """Load and cache the expected 43 feature names in exact order."""
        if self._feature_names is not None:
            return self._feature_names

        if not self.feature_schema_path.is_file():
            raise ModelArtifactError(
                message="Model feature schema file not found",
                details={"expected_path": str(self.feature_schema_path)},
            )

        with open(self.feature_schema_path) as f:
            self._feature_names = json.load(f)

        return self._feature_names

    def get_model_card(self) -> dict[str, Any]:
        """Load and cache reproducibility model card JSON."""
        if self._model_card is not None:
            return self._model_card

        if not self.model_card_path.is_file():
            raise ModelArtifactError(
                message="Model card metadata not found",
                details={"expected_path": str(self.model_card_path)},
            )

        with open(self.model_card_path) as f:
            self._model_card = json.load(f)

        return self._model_card

    # ------------------------------------------------------------------
    # Metadata & Metrics Endpoints Support
    # ------------------------------------------------------------------
    def get_model_info(self) -> ModelInfoResponse:
        """Assemble full model architecture, parameters, and experimental provenance."""
        mc = self.get_model_card()
        feature_names = self.get_feature_names()
        pipeline = self.get_pipeline()

        steps = [step[0] for step in getattr(pipeline, "steps", [])]

        return ModelInfoResponse(
            project=mc.get("project", "NIFTY 50 Futures and Options ML"),
            selected_model=mc.get("selected_model", "Extra Trees"),
            selected_model_type=mc.get("selected_model_type", "Tuned classifier"),
            pipeline_steps=steps,
            hyperparameters=ModelParamSummary(
                n_estimators=120,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=1,
                max_features="sqrt",
                class_weight="balanced_subsample",
                random_state=mc.get("random_state", 42),
            ),
            feature_count=len(feature_names),
            feature_columns=feature_names,
            raw_class_mapping=mc.get("raw_class_mapping", {"-1": "Down", "0": "Sideways", "1": "Up"}),
            model_class_mapping=mc.get("model_class_mapping", {"0": "Down", "1": "Sideways", "2": "Up"}),
            dataset_splits={
                "training": mc.get("training_rows", 541),
                "validation": mc.get("validation_rows", 115),
                "testing": mc.get("test_rows", 117),
            },
            date_ranges={
                "training": {
                    "start": mc.get("training_start", "2021-01-01"),
                    "end": mc.get("training_end", "2025-10-14"),
                },
                "validation": {
                    "start": mc.get("validation_start", "2025-10-16"),
                    "end": mc.get("validation_end", "2026-04-06"),
                },
                "testing": {
                    "start": mc.get("test_start", "2026-04-08"),
                    "end": mc.get("test_end", "2026-09-24"),
                },
            },
            cross_validation=mc.get("cross_validation", "Expanding TimeSeriesSplit with Target_Date purging"),
            target_provenance=mc.get("target_provenance", "Daily median Underlying Value from futures contracts"),
            target_limitation=mc.get("target_limitation", "Derivatives-implied proxy, not official spot close"),
            not_a_trading_recommendation=mc.get("not_a_trading_recommendation", True),
        )

    def get_metrics(self) -> ModelMetricsResponse:
        """Load and return recorded final test metrics, validation ranking, and CV summary."""
        mc = self.get_model_card()
        final_test = mc.get("final_test_metrics", {})

        # Validation comparison
        val_path = self.eval_dir / "validation_model_comparison.csv"
        val_df = pd.read_csv(val_path)
        val_scores = [
            ValidationModelScore(
                model=str(row["Model"]),
                accuracy=round(float(row["Accuracy"]), 4),
                balanced_accuracy=round(float(row["Balanced_Accuracy"]), 4),
                macro_precision=round(float(row["Macro_Precision"]), 4),
                macro_recall=round(float(row["Macro_Recall"]), 4),
                macro_f1=round(float(row["Macro_F1"]), 4),
                log_loss=round(float(row["Log_Loss"]), 4),
            )
            for _, row in val_df.iterrows()
        ]

        # CV Summary
        cv_path = self.eval_dir / "training_cv_summary.csv"
        cv_df = pd.read_csv(cv_path)
        cv_items = [
            CVSummaryItem(
                model=str(row["Model"]),
                best_cv_macro_f1=round(float(row["Best_CV_Macro_F1"]), 4),
                cv_std=round(float(row["CV_Std"]), 4),
                mean_train_macro_f1=round(float(row["Mean_Train_Macro_F1"]), 4),
                best_params=str(row["Best_Params"]),
            )
            for _, row in cv_df.iterrows()
        ]

        # Purged CV Folds
        folds_path = self.eval_dir / "purged_cv_folds.csv"
        folds_df = pd.read_csv(folds_path)
        fold_items = [
            PurgedCVFoldItem(
                fold=int(row["Fold"]),
                train_rows=int(row["Train_Rows"]),
                validation_rows=int(row["Validation_Rows"]),
                train_end=str(row["Train_End"]),
                validation_start=str(row["Validation_Start"]),
                max_train_target_date=str(row["Max_Train_Target_Date"]),
                purged_rows=int(row["Purged_Rows"]),
            )
            for _, row in folds_df.iterrows()
        ]

        return ModelMetricsResponse(
            final_test_metrics={k: round(float(v), 4) for k, v in final_test.items()},
            validation_comparison=val_scores,
            training_cv_summary=cv_items,
            purged_cv_folds=fold_items,
        )

    def get_feature_importance(self) -> FeatureImportanceResponse:
        """Return native Gini importance and validation permutation importance."""
        native_path = self.eval_dir / "native_feature_importance.csv"
        perm_path = self.eval_dir / "permutation_feature_importance.csv"

        native_df = pd.read_csv(native_path).sort_values("Native_Importance", ascending=False)
        perm_df = pd.read_csv(perm_path).sort_values("Importance_Mean", ascending=False)

        native_items = [
            NativeImportanceItem(
                feature=str(row["Feature"]),
                importance=round(float(row["Native_Importance"]), 6),
            )
            for _, row in native_df.iterrows()
        ]

        perm_items = [
            PermutationImportanceItem(
                feature=str(row["Feature"]),
                importance_mean=round(float(row["Importance_Mean"]), 6),
                importance_std=round(float(row["Importance_Std"]), 6),
            )
            for _, row in perm_df.iterrows()
        ]

        return FeatureImportanceResponse(
            total_features=len(native_items),
            native_importance=native_items,
            permutation_importance=perm_items,
        )

    # ------------------------------------------------------------------
    # Historical Predictions & Inference
    # ------------------------------------------------------------------
    def get_historical_predictions(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 150,
        offset: int = 0,
    ) -> HistoricalPredictionsResponse:
        """Return test set predictions along with precomputed confusion matrix."""
        test_preds_path = self.eval_dir / "test_predictions.parquet"
        if not test_preds_path.is_file():
            test_preds_path = self.eval_dir / "test_predictions.csv"
            df = pd.read_csv(test_preds_path)
        else:
            df = pd.read_parquet(test_preds_path)

        df["Date_str"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
        filtered = df.copy()

        if start_date:
            filtered = filtered[filtered["Date_str"] >= start_date]
        if end_date:
            filtered = filtered[filtered["Date_str"] <= end_date]

        # Compute confusion matrix across the full test set (117 rows)
        cm_data = [
            ConfusionMatrixRow(
                actual_label="Down (-1)",
                down=int(((df["Actual_Direction"] == -1) & (df["Predicted_Direction"] == -1)).sum()),
                sideways=int(((df["Actual_Direction"] == -1) & (df["Predicted_Direction"] == 0)).sum()),
                up=int(((df["Actual_Direction"] == -1) & (df["Predicted_Direction"] == 1)).sum()),
                total=int((df["Actual_Direction"] == -1).sum()),
            ),
            ConfusionMatrixRow(
                actual_label="Sideways (0)",
                down=int(((df["Actual_Direction"] == 0) & (df["Predicted_Direction"] == -1)).sum()),
                sideways=int(((df["Actual_Direction"] == 0) & (df["Predicted_Direction"] == 0)).sum()),
                up=int(((df["Actual_Direction"] == 0) & (df["Predicted_Direction"] == 1)).sum()),
                total=int((df["Actual_Direction"] == 0).sum()),
            ),
            ConfusionMatrixRow(
                actual_label="Up (1)",
                down=int(((df["Actual_Direction"] == 1) & (df["Predicted_Direction"] == -1)).sum()),
                sideways=int(((df["Actual_Direction"] == 1) & (df["Predicted_Direction"] == 0)).sum()),
                up=int(((df["Actual_Direction"] == 1) & (df["Predicted_Direction"] == 1)).sum()),
                total=int((df["Actual_Direction"] == 1).sum()),
            ),
        ]

        paged = filtered.iloc[offset : offset + limit]

        items = [
            HistoricalPredictionItem(
                date=str(row["Date_str"]),
                target_date=pd.to_datetime(row["Target_Date"]).strftime("%Y-%m-%d"),
                actual_direction=int(row["Actual_Direction"]),
                predicted_direction=int(row["Predicted_Direction"]),
                actual_label=str(row["Actual_Label"]),
                predicted_label=str(row["Predicted_Label"]),
                correct=bool(row["Correct"]),
                probability_down=round(float(row["Probability_Down"]), 6),
                probability_sideways=round(float(row["Probability_Sideways"]), 6),
                probability_up=round(float(row["Probability_Up"]), 6),
            )
            for _, row in paged.iterrows()
        ]

        return HistoricalPredictionsResponse(
            total_records=len(filtered),
            returned_records=len(items),
            recorded_accuracy=0.3846,
            recorded_macro_f1=0.3224,
            confusion_matrix=cm_data,
            predictions=items,
        )

    def predict(self, features: dict[str, float]) -> PredictResponse:
        """Execute inference through original trained pipeline with strict 43-feature validation."""
        expected_features = self.get_feature_names()
        pipeline = self.get_pipeline()

        # Validate feature completeness
        missing = [f for f in expected_features if f not in features]
        if missing:
            raise AppException(
                message=f"Missing required feature(s): {len(missing)} features not provided",
                status_code=422,
                code="MISSING_FEATURES",
                details={"missing_count": len(missing), "missing_samples": missing[:5]},
            )

        # Validate feature types & values
        invalid_values = {}
        for f in expected_features:
            val = features[f]
            if val is None or not isinstance(val, (int, float)) or np.isnan(val) or np.isinf(val):
                invalid_values[f] = str(val)

        if invalid_values:
            raise AppException(
                message="Invalid numerical value in features payload",
                status_code=422,
                code="INVALID_FEATURE_VALUES",
                details={"invalid_features": list(invalid_values.keys())[:5]},
            )

        # Build DataFrame strictly in the expected feature order
        ordered_data = {feat: [float(features[feat])] for feat in expected_features}
        input_df = pd.DataFrame(ordered_data)[expected_features]

        # Execute pipeline
        raw_pred = int(pipeline.predict(input_df)[0])
        probas = pipeline.predict_proba(input_df)[0]

        # Map internal class (0, 1, 2) to domain direction (-1, 0, 1) and label
        direction, label = self.MODEL_TO_DOMAIN_MAP.get(raw_pred, (0, "Sideways"))

        prob_down = round(float(probas[0]), 6)
        prob_side = round(float(probas[1]), 6)
        prob_up = round(float(probas[2]), 6)
        confidence = round(float(np.max(probas)), 4)

        steps = [step[0] for step in getattr(pipeline, "steps", [])]

        return PredictResponse(
            predicted_direction=direction,
            predicted_label=label,
            confidence=confidence,
            probabilities=DirectionProbabilities(
                down=prob_down,
                sideways=prob_side,
                up=prob_up,
            ),
            model_name="Extra Trees",
            pipeline_steps=steps,
            is_historical=False,
            disclaimer="Experimental machine learning classification. Not investment, trading, or financial advice.",
            target_limitation="Trained on derivatives-implied Underlying Value proxy, not official NIFTY 50 cash spot close.",
        )

    def get_sample_features(
        self,
        split: str = "test",
        index: int = 0,
    ) -> SampleFeaturesResponse:
        """Fetch a real historical feature vector to quickly test live inference."""
        filename_map = {
            "test": "test_dataset.parquet",
            "validation": "validation_dataset.parquet",
            "train": "train_dataset.parquet",
        }
        if split not in filename_map:
            raise NotFoundError(
                message=f"Invalid split '{split}'",
                details={"allowed_splits": list(filename_map.keys())},
            )

        parquet_path = self.ml_dir / filename_map[split]
        df = pd.read_parquet(parquet_path)

        if index >= len(df) or index < 0:
            index = 0

        row = df.iloc[index]
        feature_names = self.get_feature_names()

        features_dict = {feat: float(row[feat]) for feat in feature_names}
        direction = int(row["Target_Direction"])
        label_map = {-1: "Down", 0: "Sideways", 1: "Up"}

        return SampleFeaturesResponse(
            date=pd.to_datetime(row["Date"]).strftime("%Y-%m-%d"),
            target_date=pd.to_datetime(row["Target_Date"]).strftime("%Y-%m-%d"),
            actual_direction=direction,
            actual_label=label_map.get(direction, "Unknown"),
            split=split,
            features=features_dict,
        )


ml_service = MLService()
