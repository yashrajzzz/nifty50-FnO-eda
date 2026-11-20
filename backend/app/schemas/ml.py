"""Pydantic schemas for Machine Learning endpoints."""

from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator


class ModelParamSummary(BaseModel):
    """Summary of tuned hyperparameters."""

    n_estimators: int = Field(120, description="Number of trees")
    max_depth: Optional[int] = Field(10, description="Maximum tree depth")
    min_samples_split: int = Field(5, description="Minimum samples to split an internal node")
    min_samples_leaf: int = Field(1, description="Minimum samples at a leaf node")
    max_features: str = Field("sqrt", description="Number of features to consider when looking for best split")
    class_weight: str = Field("balanced_subsample", description="Class weighting strategy")
    random_state: int = Field(42, description="Random seed")


class ModelInfoResponse(BaseModel):
    """Detailed model metadata and experimental specifications."""

    project: str = Field(..., description="Research project name")
    selected_model: str = Field(..., description="Selected classifier name")
    selected_model_type: str = Field(..., description="Tuned classifier description")
    pipeline_steps: list[str] = Field(..., description="Preprocessing and model pipeline steps")
    hyperparameters: ModelParamSummary = Field(..., description="Trained model hyperparameters")
    feature_count: int = Field(43, description="Expected predictor feature count")
    feature_columns: list[str] = Field(..., description="Exact 43 feature names in inference order")
    raw_class_mapping: dict[str, str] = Field(..., description="Domain class mapping (-1, 0, 1)")
    model_class_mapping: dict[str, str] = Field(..., description="Internal pipeline encoded classes (0, 1, 2)")
    dataset_splits: dict[str, int] = Field(..., description="Row counts for train, validation, and test")
    date_ranges: dict[str, dict[str, str]] = Field(..., description="Date bounds for each partition")
    cross_validation: str = Field(..., description="Purged time-series CV description")
    target_provenance: str = Field(..., description="Derivatives source of underlying value proxy")
    target_limitation: str = Field(..., description="Proxy constraint and missingness notice")
    not_a_trading_recommendation: bool = Field(True, description="Strict disclaimer flag")


class ValidationModelScore(BaseModel):
    """Comparison metric for a candidate model evaluated during validation."""

    model: str = Field(..., description="Model name")
    accuracy: float = Field(..., description="Validation accuracy")
    balanced_accuracy: float = Field(..., description="Validation balanced accuracy")
    macro_precision: float = Field(..., description="Validation macro precision")
    macro_recall: float = Field(..., description="Validation macro recall")
    macro_f1: float = Field(..., description="Validation macro F1 score (primary selection metric)")
    log_loss: float = Field(..., description="Validation multiclass log loss")


class CVSummaryItem(BaseModel):
    """Candidate model cross-validation results."""

    model: str = Field(..., description="Model name")
    best_cv_macro_f1: float = Field(..., description="Mean CV macro F1 across purged folds")
    cv_std: float = Field(..., description="Standard deviation across CV folds")
    mean_train_macro_f1: float = Field(..., description="Training fold macro F1")
    best_params: str = Field(..., description="Selected hyperparameter combination")


class PurgedCVFoldItem(BaseModel):
    """Specification of an expanding purged time-series fold."""

    fold: int = Field(..., description="Fold index (1, 2, 3)")
    train_rows: int = Field(..., description="Training observation count")
    validation_rows: int = Field(..., description="Validation observation count")
    train_end: str = Field(..., description="End of training window")
    validation_start: str = Field(..., description="Start of validation window")
    max_train_target_date: str = Field(..., description="Maximum target date in train partition")
    purged_rows: int = Field(..., description="Observations purged to avoid lookahead contamination")


class ModelMetricsResponse(BaseModel):
    """Consolidated evaluation metrics replicating Notebook 06 artifacts."""

    final_test_metrics: dict[str, float] = Field(..., description="Recorded untouched test metrics")
    validation_comparison: list[ValidationModelScore] = Field(..., description="Validation benchmark ranking")
    training_cv_summary: list[CVSummaryItem] = Field(..., description="Hyperparameter search results")
    purged_cv_folds: list[PurgedCVFoldItem] = Field(..., description="Purged CV fold partitions")


class NativeImportanceItem(BaseModel):
    """Native Gini / impurity feature importance."""

    feature: str = Field(..., description="Feature name")
    importance: float = Field(..., description="Gini importance score")


class PermutationImportanceItem(BaseModel):
    """Validation permutation feature importance."""

    feature: str = Field(..., description="Feature name")
    importance_mean: float = Field(..., description="Validation macro F1 drop mean")
    importance_std: float = Field(..., description="Permutation importance standard deviation")


class FeatureImportanceResponse(BaseModel):
    """Feature importances for all 43 engineered features."""

    total_features: int = Field(43, description="Total predictor features")
    native_importance: list[NativeImportanceItem] = Field(..., description="Gini feature importances")
    permutation_importance: list[PermutationImportanceItem] = Field(..., description="Permutation feature importances")


class HistoricalPredictionItem(BaseModel):
    """Single test set observation prediction."""

    date: str = Field(..., description="Observation date (YYYY-MM-DD)")
    target_date: str = Field(..., description="Target trading session date (YYYY-MM-DD)")
    actual_direction: int = Field(..., description="Actual direction (-1, 0, 1)")
    predicted_direction: int = Field(..., description="Predicted direction (-1, 0, 1)")
    actual_label: str = Field(..., description="Actual label (Down, Sideways, Up)")
    predicted_label: str = Field(..., description="Predicted label (Down, Sideways, Up)")
    correct: bool = Field(..., description="Whether prediction matches actual")
    probability_down: float = Field(..., description="Probability of Down (-1)")
    probability_sideways: float = Field(..., description="Probability of Sideways (0)")
    probability_up: float = Field(..., description="Probability of Up (1)")


class ConfusionMatrixRow(BaseModel):
    """Confusion matrix row."""

    actual_label: str = Field(..., description="Actual class label")
    down: int = Field(..., description="Count predicted as Down")
    sideways: int = Field(..., description="Count predicted as Sideways")
    up: int = Field(..., description="Count predicted as Up")
    total: int = Field(..., description="Row total observations")


class HistoricalPredictionsResponse(BaseModel):
    """Test set predictions and confusion matrix."""

    total_records: int = Field(..., description="Total test set records")
    returned_records: int = Field(..., description="Records in current response")
    recorded_accuracy: float = Field(..., description="Recorded test set accuracy (38.46%)")
    recorded_macro_f1: float = Field(..., description="Recorded test set Macro F1 (0.3224)")
    confusion_matrix: list[ConfusionMatrixRow] = Field(..., description="3x3 confusion matrix breakdown")
    predictions: list[HistoricalPredictionItem] = Field(..., description="Historical predictions")


class PredictRequest(BaseModel):
    """Inference input payload with 43 features."""

    features: dict[str, float] = Field(
        ...,
        description="Key-value mapping of exactly 43 engineered features",
    )

    @field_validator("features")
    @classmethod
    def validate_features_payload(cls, v: dict[str, float]) -> dict[str, float]:
        if not isinstance(v, dict):
            raise ValueError("features must be a JSON object mapping feature names to numbers")
        return v


class DirectionProbabilities(BaseModel):
    """Class probabilities breakdown."""

    down: float = Field(..., description="Probability of Down (return < -0.10%)")
    sideways: float = Field(..., description="Probability of Sideways (return between -0.10% and +0.10%)")
    up: float = Field(..., description="Probability of Up (return > +0.10%)")


class PredictResponse(BaseModel):
    """Live inference prediction response."""

    predicted_direction: int = Field(..., description="Predicted direction (-1: Down, 0: Sideways, 1: Up)")
    predicted_label: str = Field(..., description="Human-readable direction label (Down, Sideways, Up)")
    confidence: float = Field(..., description="Highest class probability")
    probabilities: DirectionProbabilities = Field(..., description="Probabilities for all 3 direction classes")
    model_name: str = Field("Extra Trees", description="Active classifier name")
    pipeline_steps: list[str] = Field(..., description="Active pipeline steps")
    is_historical: bool = Field(False, description="Distinguishes live inference from historical backtests")
    disclaimer: str = Field(
        "Experimental machine learning classification. Not investment, trading, or financial advice.",
        description="Mandatory disclaimer",
    )
    target_limitation: str = Field(
        "Trained on derivatives-implied Underlying Value proxy, not official NIFTY 50 cash spot close.",
        description="Proxy data constraint notice",
    )


class SampleFeaturesResponse(BaseModel):
    """Historical sample feature vector for quick inference testing."""

    date: str = Field(..., description="Observation date (YYYY-MM-DD)")
    target_date: str = Field(..., description="Target date (YYYY-MM-DD)")
    actual_direction: int = Field(..., description="Actual historical target direction")
    actual_label: str = Field(..., description="Actual historical target label")
    split: str = Field(..., description="Dataset split (test, validation, train)")
    features: dict[str, float] = Field(..., description="43 feature values")
