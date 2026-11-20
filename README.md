# 📊 NIFTY 50 Futures and Options
### An Exploratory Data Analysis (EDA) Project

<p align="center">
  <strong>Exploring the Indian derivatives market through data analysis, statistical insights, and machine learning.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white" />
  <img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white" />
  <img src="https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" />
  <img src="https://img.shields.io/badge/Jupyter-F37626?style=for-the-badge&logo=jupyter&logoColor=white" />
</p>

---

## 📌 About

This project focuses on the **exploratory data analysis of the NIFTY 50 Futures and Options market**, using historical contract-wise data obtained from the National Stock Exchange of India (NSE).

It explores market behaviour across NIFTY 50 Index Futures, Call Options (CE), and Put Options (PE), with an emphasis on trading activity, price movements, volume, turnover, open interest, and statistical relationships.

The project extends beyond traditional EDA through feature engineering and an experimental machine-learning workflow for classifying the direction of the next observed trading session.

## 🎯 Objectives

- Understand and inspect historical NIFTY 50 derivatives data.
- Clean and preprocess large datasets.
- Perform exploratory data analysis and visualize market trends.
- Compare Futures, Call Options, and Put Options.
- Conduct comparative statistical analysis.
- Engineer meaningful features from derivatives-market data.
- Experiment with machine-learning models for next-session market-direction classification.

## 📈 Project Highlights

| Area | Highlights |
|---|---|
| Market coverage | NIFTY 50 Futures, CE and PE |
| Study period | January 2021 – September 2026 |
| Raw dataset | 2.68 million+ records |
| Data processing | Cleaning, preprocessing and duplicate removal |
| Analytics | Exploratory and comparative statistical analysis |
| Feature engineering | Time-aware market features |
| Machine learning | Three-class direction classification |
| Selected model | Extra Trees Classifier |

## 📊 Dataset Overview

The data was obtained from the NSE historical contract-wise price-volume reports.

**Source:** [NSE – F&O Equity Security](https://www.nseindia.com/report-detail/fo_eq_security)

### Raw dataset statistics

| Dataset | Records |
|---|---:|
| NIFTY Futures | 4,348 |
| NIFTY Call Options (CE) | 1,319,036 |
| NIFTY Put Options (PE) | 1,358,362 |
| **Total** | **2,681,746** |

The study covers January 2021 to September 2026. September 2026 represents partial data rather than a complete calendar month.

> **Data consideration:** The available `Underlying Value` field is used as a derivatives-implied proxy in the machine-learning target construction. It is not an independently verified official NIFTY 50 spot closing-price series.

## 🔬 Research Pipeline

The project is organized into six Jupyter notebooks, each representing a stage of the analytical workflow.

| Notebook | Stage | Description |
|---|---|---|
| 01 | Data Understanding | Dataset inspection, schema analysis, data types and coverage |
| 02 | Data Cleaning | Missing-value assessment, duplicate removal and preprocessing |
| 03 | Exploratory Data Analysis | Market trends, distributions, trading activity and visualizations |
| 04 | Statistical Analysis | Comparative analysis of Futures, CE and PE |
| 05 | Feature Engineering | Feature construction, target generation and chronological dataset splitting |
| 06 | Machine Learning | Model training, validation, tuning and final evaluation |

## 🤖 Machine Learning

The machine-learning experiment investigates whether engineered derivatives-market features can help classify the direction of the next observed trading session.

### Prediction classes

| Label | Direction |
|---:|---|
| -1 | 🔴 Down |
| 0 | 🟡 Sideways |
| 1 | 🟢 Up |

A threshold of ±0.10% is used to distinguish directional movements from sideways movements.

### Experimental setup

- 775 labelled observations in the full engineered dataset.
- 43 predictor features.
- Chronological training, validation and test partitions.
- Baseline classifier comparisons.
- Multiple tree-based and linear classification approaches.
- Time-aware cross-validation and hyperparameter tuning.
- Evaluation using Macro F1, Balanced Accuracy, Accuracy and Log Loss.

### Selected model: Extra Trees

**Recorded test-set results**

| Evaluation Metric | Score |
|---|---:|
| Accuracy | 38.46% |
| Balanced Accuracy | 32.27% |
| Macro Precision | 32.23% |
| Macro Recall | 32.27% |
| Macro F1 | 32.24% |
| Log Loss | 1.0262 |

The test set contained 117 observations, of which the model correctly classified 45.

The recorded partition sizes are:

| Partition | Observations |
|---|---:|
| Training | 541 |
| Validation | 115 |
| Test | 117 |
| **Total in partitions** | **773** |

The full engineered dataset contains 775 labelled observations, while the reported train, validation and test partitions account for 773. The two-observation difference is retained here transparently rather than assuming a reason that has not been verified.

The results show that predicting market direction from the available features remains challenging. The experiment is exploratory and should not be interpreted as a reliable forecasting or trading system.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Programming | Python |
| Data Processing | Pandas, NumPy |
| Visualization | Matplotlib, Seaborn, Plotly |
| Statistical Analysis | SciPy, Statsmodels |
| Machine Learning | Scikit-learn, XGBoost (optional) |
| Data Storage | CSV, Parquet, JSON |
| Development | Jupyter Notebook, VS Code |
| Version Control | Git, GitHub |

## 📁 Repository Structure

```text
nifty50-FnO-eda/
│
├── data/
│   ├── raw/
│   │   └── Original NSE datasets
│   │
│   ├── processed/
│   │   └── Cleaned Parquet datasets
│   │
│   └── ml/
│       ├── full_ml_dataset.parquet
│       ├── train_dataset.parquet
│       ├── validation_dataset.parquet
│       ├── test_dataset.parquet
│       ├── feature_columns.json
│       └── ml_metadata.json
│
├── notebooks/
│   ├── 01_data_understanding.ipynb
│   ├── 02_data_cleaning_preprocessing.ipynb
│   ├── 03_exploratory_data_analysis.ipynb
│   ├── 04_comparative_statistical_analysis.ipynb
│   ├── 05_feature_engineering.ipynb
│   └── 06_machine_learning.ipynb
│
├── requirements.txt
├── .gitignore
├── LICENSE
└── README.md
```

Some large datasets and generated artifacts may be excluded from Git. The notebooks document the data preparation and export workflow.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yashrajzzz/nifty50-FnO-eda.git
cd nifty50-FnO-eda
```

### 2. Create a virtual environment

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows PowerShell**

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

For Parquet support, install PyArrow if it is not already included:

```bash
pip install pyarrow
```

### 4. Prepare the datasets

Place the original NSE data archives in the expected `data/raw/` directory.

Run the notebooks in numerical order, beginning with:

```text
01_data_understanding.ipynb
```

Continue through Notebook 06 to reproduce the analytical and machine-learning workflow.

> The original NSE data archives may need to be obtained separately. Notebook 6 also depends on the processed machine-learning datasets exported by Notebook 5.

## 🖥️ Future Development

The completed notebooks provide the analytical foundation for a possible interactive web application.

**Planned technology stack**

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Python + FastAPI |
| Data Processing | Pandas + NumPy |
| Data Storage | Parquet |
| ML Inference | Scikit-learn |
| Visualization | Interactive charts |

Potential modules include:

- **Market Overview** — Key market statistics and historical trends.
- **Futures Analytics** — Futures volume, turnover and open-interest analysis.
- **Options Analytics** — CE/PE comparisons and options-market insights.
- **Statistical Analytics** — Interactive research visualizations.
- **ML Predictions** — Historical model inference and classification results.
- **Model Evaluation** — Model performance, class-wise metrics and feature importance.

These are planned extensions, not currently deployed live-market services. Live predictions would require an appropriate live data source.

## 📌 Project Roadmap

- [x] Data understanding and exploration
- [x] Data cleaning and preprocessing
- [x] Exploratory data analysis
- [x] Comparative statistical analysis
- [x] Feature engineering
- [x] Machine-learning experimentation
- [ ] FastAPI backend development
- [ ] Next.js frontend development
- [ ] Interactive dashboard integration
- [ ] Testing and deployment
- [ ] Final project documentation

## ⚠️ Limitations

- The supervised-learning dataset contains substantially fewer observations than the original contract-level dataset.
- The target uses a derivatives-implied underlying-value proxy, not an independently verified official spot-index close series.
- Class imbalance affects the classification results, particularly the Sideways class.
- Feature importance does not establish causation.
- No live NSE data integration or trading backtest is included in the completed research.
- Transaction costs, slippage, execution constraints and risk-adjusted trading returns have not been evaluated.
- The model's results are experimental and should not be treated as investment advice or trading recommendations.

## 📚 References

- [National Stock Exchange of India](https://www.nseindia.com/)
- [NSE Historical F&O Data](https://www.nseindia.com/report-detail/fo_eq_security)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Scikit-learn Documentation](https://scikit-learn.org/stable/)

---

<p align="center">
  <strong>Built with Python, curiosity, and a passion for financial data.</strong>
  <br/>
  Educational and research project - Not financial or investment advice.
</p>