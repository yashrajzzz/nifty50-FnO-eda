# NIFTY 50 Futures & Options — Exploratory Data Analysis and Machine Learning

An end-to-end study of the Indian derivatives market using historical NIFTY 50 Futures, Call Options (CE), and Put Options (PE) data from the National Stock Exchange of India (NSE).

The project combines data understanding, cleaning, exploratory data analysis, comparative statistical analysis, feature engineering, and an experimental machine-learning workflow for next-observed-session direction classification.

> **Research disclaimer:** This is an academic analytics project, not investment advice or a trading system. The machine-learning target uses a derivatives-implied `Underlying Value` proxy; it is not an independently verified official NIFTY 50 spot closing-price series.

---

## 1. Project Objectives

- Explore historical NIFTY 50 Futures and Options market activity.
- Clean and standardize large contract-wise datasets.
- Study price, turnover, volume, open interest, and related market measures.
- Compare Futures, CE, and PE behaviour using descriptive and statistical analysis.
- Engineer time-aware features from the available derivatives data.
- Experiment with classifying the next observed trading session as **Down**, **Sideways**, or **Up**.
- Preserve a reproducible workflow and prepare the analysis for an interactive web application.

## 2. Dataset

| Item | Description |
|---|---|
| Source | NSE historical contract-wise price-volume data |
| Source page | [NSE — F&O Equity Security](https://www.nseindia.com/report-detail/fo_eq_security) |
| Instruments | NIFTY Index Futures, Call Options (CE), Put Options (PE) |
| Study period | January 2021 – September 2026 |
| Coverage note | September 2026 is partial |
| Raw files | Three ZIP archives containing quarterly CSV files |

### Raw record counts

| Dataset | Raw records |
|---|---:|
| Futures | 4,348 |
| Call Options (CE) | 1,319,036 |
| Put Options (PE) | 1,358,362 |
| **Total** | **2,681,746** |

The project removes exact duplicate records during preprocessing. Missing values are treated according to their meaning and are not automatically interpreted as zero. The cleaned datasets are stored in Parquet format for efficient reuse.

**Data note:** The repository's raw and processed datasets may be excluded from Git because of file size and data-management considerations. Follow the notebook instructions and obtain the source data separately where it is not included.

## 3. Project Workflow

| Notebook | Focus | Main work |
|---|---|---|
| `01_data_understanding.ipynb` | Data understanding | Inspect source files, schema, columns, data types, date coverage, and record counts |
| `02_data_cleaning_preprocessing.ipynb` | Data preparation | Standardize data, handle missing values, remove exact duplicates, and export clean datasets |
| `03_exploratory_data_analysis.ipynb` | EDA | Explore distributions, trends, trading activity, and market behaviour |
| `04_comparative_statistical_analysis.ipynb` | Statistical comparison | Compare Futures, CE, and PE using statistical summaries and tests |
| `05_feature_engineering.ipynb` | Feature engineering | Build model features, create next-session direction labels, and export chronological ML partitions |
| `06_machine_learning.ipynb` | Machine learning | Train baselines and classifiers, tune using purged chronological CV, select on validation data, and evaluate on the test partition |

## 4. Machine-Learning Experiment

Notebook 6 treats the task as a three-class classification problem:

| Raw target | Class |
|---:|---|
| -1 | Down |
| 0 | Sideways |
| 1 | Up |

The executed experiment contains **775 labelled observations** and **43 predictor features**, split chronologically:

| Partition | Observations |
|---|---:|
| Training | 541 |
| Validation | 115 |
| Test | 117 |
| **Total** | **773** |

The split counts above are reported from the recorded Notebook 6 execution. The notebook's recorded full dataset count is 775; partition counts should be interpreted from the actual exported split files and notebook outputs.

### Methodology

- Chronological training, validation, and test partitions.
- Dummy classifiers as baseline references.
- Logistic Regression, Random Forest, Extra Trees, and Histogram-based Gradient Boosting; XGBoost is optional when installed.
- Expanding time-series cross-validation with target-date purging.
- Hyperparameter search restricted to training data.
- Model selection using validation Macro F1, with Balanced Accuracy as a secondary metric.
- One final evaluation on the untouched test partition.
- Model pipeline export and reload verification.

### Recorded model results

The recorded run selected **Extra Trees**.

| Metric | Validation | Test |
|---|---:|---:|
| Accuracy | 0.4696 | 0.3846 |
| Balanced Accuracy | 0.3720 | 0.3227 |
| Macro F1 | 0.3704 | 0.3224 |

The test set contained 117 observations, of which 45 were correctly classified. Performance was weakest for the Sideways class. The decline from validation to test performance and the high training score relative to cross-validation indicate overfitting and/or temporal variation. These results do not establish reliable market forecasting.

### Important limitations

1. The target is derived from a derivatives-implied `Underlying Value` proxy, not an independently verified official spot-index close series.
2. The source data contains millions of contract records, but the engineered supervised-learning dataset contains a much smaller number of labelled observations.
3. Sideways observations are relatively scarce, making class-wise metrics sensitive to individual predictions.
4. Feature importance is model-specific and does not demonstrate causality.
5. The experiment does not include transaction costs, slippage, execution constraints, position sizing, or a trading-strategy backtest.
6. Predicted probabilities have not undergone a separate probability-calibration study.

## 5. Repository Structure

```text
nifty50-FnO-eda/
├── data/
│   ├── raw/                 # Original NSE archives / CSVs
│   ├── processed/           # Cleaned Futures, CE, and PE Parquet files
│   └── ml/                  # Feature dataset, splits, and metadata from Notebook 5
├── notebooks/
│   ├── 01_data_understanding.ipynb
│   ├── 02_data_cleaning_preprocessing.ipynb
│   ├── 03_exploratory_data_analysis.ipynb
│   ├── 04_comparative_statistical_analysis.ipynb
│   ├── 05_feature_engineering.ipynb
│   └── 06_machine_learning.ipynb
├── models/
│   ├── saved_models/        # Exported model pipeline
│   └── evaluation/
│       └── notebook_06/     # Metrics, predictions, and model card
├── README.md
└── requirements.txt
```

Some generated data and model artifacts may be stored locally rather than committed, depending on repository size and the project's `.gitignore` rules.

## 6. Technology Stack

- **Language:** Python
- **Data manipulation:** Pandas, NumPy
- **Visualization:** Matplotlib, Seaborn, Plotly
- **Statistics:** SciPy, Statsmodels
- **Machine learning:** Scikit-learn, optional XGBoost
- **Storage:** CSV, Parquet, JSON
- **Development:** Jupyter Notebook, VS Code, Git, GitHub

## 7. Setup

Clone the repository:

```bash
git clone https://github.com/yashrajzzz/nifty50-FnO-eda.git
cd nifty50-FnO-eda
```

Create and activate a virtual environment:

**Linux / macOS**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows PowerShell**

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

If the requirements file does not yet include all libraries used by the notebooks, install the missing packages in the active environment. For Parquet support, `pyarrow` is required. XGBoost is optional.

### Data preparation

Place the source archives in the expected `data/raw/` location and follow Notebook 1 and Notebook 2. Run the notebooks in numerical order because later notebooks depend on the outputs of earlier stages.

Notebook 6 expects the ML exports created by Notebook 5 under `data/ml/`, including:

- `train_dataset.parquet`
- `validation_dataset.parquet`
- `test_dataset.parquet`
- `full_ml_dataset.parquet`
- `feature_columns.json`
- `ml_metadata.json`

## 8. Outputs

Notebook 5 produces the engineered datasets and metadata used by Notebook 6.

Notebook 6 exports the trained pipeline and evaluation artifacts, including:

- `nifty50_direction_pipeline.joblib`
- `nifty50_direction_features.json`
- Validation model comparison
- Purged CV fold summary
- Final test metrics
- Feature-importance tables
- Test prediction audit
- Model card and experiment metadata

The exact output paths are defined in the notebook.

## 9. Planned Application

The analysis is intended to form the research foundation for an interactive web application:

- **Frontend:** Next.js
- **Backend:** Python + FastAPI
- **Planned views:** Market Overview, Futures, Options, Analytics, ML Predictions, and Model Evaluation

The application layer is a planned extension of the completed notebook workflow; it should display historical research outputs clearly and distinguish them from live market data.

## 10. Project Status

- [x] Data understanding
- [x] Data cleaning and preprocessing
- [x] Exploratory data analysis
- [x] Comparative statistical analysis
- [x] Feature engineering
- [x] Machine-learning experiment and evaluation
- [ ] FastAPI backend
- [ ] Next.js frontend
- [ ] Application integration and testing
- [ ] Deployment
- [ ] Final project report and presentation

## 11. References

- [National Stock Exchange of India — F&O Equity Security](https://www.nseindia.com/report-detail/fo_eq_security)
- [Scikit-learn documentation](https://scikit-learn.org/stable/)
- [Scikit-learn TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)
- [Scikit-learn RandomizedSearchCV](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.RandomizedSearchCV.html)

---

**Disclaimer:** This repository is intended for educational and research purposes only. It does not provide investment advice, buy/sell recommendations, or guaranteed market predictions.
