# 📊 NIFTY 50 Futures and Options
### An Exploratory Data Analysis (EDA) Project

<p align="center">
  <strong>Exploring the Indian derivatives market through exploratory data analysis, statistical modeling, machine learning, and an interactive financial analytics application.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" />
  <img src="https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white" />
</p>

---

## 📌 About

This project presents an empirical **exploratory data analysis of the NIFTY 50 Futures and Options market**, utilizing historical contract-level data from the National Stock Exchange of India (NSE).

The study analyzes market behaviour across NIFTY 50 Index Futures, Call Options (CE), and Put Options (PE), examining trading volume, notional turnover, Open Interest dynamics, strike concentrations, Put-Call Ratios (PCR), and statistical relationships across varying market regimes from **January 2021 to September 2026** (September partial).

Beyond traditional notebook-based research, the project includes:
- A high-performance **FastAPI backend** exposing clean analytics, time-series, and ML inference endpoints.
- A financial terminal-inspired **Next.js 14 web application** featuring dark and light modes, interactive Recharts visualizations, date-range filtering, and a live machine learning inference playground.

---

## 🎯 Objectives

- Clean, preprocess, and deduplicate 2.68 million+ historical NSE derivatives records.
- Convert raw tick data into columnar, optimized Parquet datasets.
- Conduct univariate and bivariate exploratory data analysis on price discovery and liquidity.
- Compare trading distributions and correlations between Futures, Calls, and Puts.
- Engineer 43 time-aware market features (momentum, volatility, PCR oscillators).
- Formulate and benchmark an experimental 3-class market direction classification model.
- Deliver an interactive, responsive analytics dashboard for researchers and analysts.

---

## 📈 Project Highlights

| Dimension | Specification |
|---|---|
| **Market Coverage** | NIFTY 50 Futures, Call Options (CE), Put Options (PE) |
| **Study Period** | January 2021 – September 2026 (September 2026 partial) |
| **Raw Records** | 2,681,746 contract observations |
| **Cleaned Records** | Futures: 4,294 · CE: 1,261,810 · PE: 1,300,689 |
| **Common Sessions** | 1,421 simultaneously aligned trading days |
| **ML Predictors** | 43 engineered features |
| **Selected ML Model** | Extra Trees Classifier (120 trees, balanced subsample) |
| **Recorded Metrics** | Test Accuracy: 38.46% · Test Macro F1: 0.3224 |
| **Architecture** | FastAPI Backend + Next.js 14 App Router Frontend |

---

## 📊 Dataset Overview

Data was collected from the NSE historical contract-wise price and volume reports ([NSE F&O Equity Security](https://www.nseindia.com/report-detail/fo_eq_security)).

### Raw vs. Deduplicated Records

| Instrument | Raw Records | Post-Cleaning Records |
|---|---:|---:|
| NIFTY Futures | 4,348 | 4,294 |
| NIFTY Call Options (CE) | 1,319,036 | 1,261,810 |
| NIFTY Put Options (PE) | 1,358,362 | 1,300,689 |
| **Total** | **2,681,746** | **2,566,793** |

> **Critical Data Limitation:** The `Underlying Value` field in the dataset is a derivatives-implied settlement proxy (~68.26% direct date coverage), **not** an independently verified official NIFTY 50 cash spot closing series.

---

## 🔬 Research Pipeline (Notebooks)

The research foundation is structured across six sequential Jupyter notebooks:

| # | Notebook | Focus |
|---|---|---|
| 01 | `01_data_understanding.ipynb` | Schema audit, missingness inspection, contract expirations, trading calendar validation. |
| 02 | `02_data_cleaning_preprocessing.ipynb` | Deduplication, timestamp parsing, zero-volume handling, and export to Parquet. |
| 03 | `03_exploratory_data_analysis.ipynb` | Volume/turnover trends, price distributions, and Put-Call Ratio (PCR) trajectory. |
| 04 | `04_comparative_statistical_analysis.ipynb` | Descriptive statistics, quartiles, skewness, kurtosis, and Spearman rank correlations. |
| 05 | `05_feature_engineering.ipynb` | 43 engineered features, thresholded target labeling (-1, 0, +1), and chronological train/val/test splits. |
| 06 | `06_machine_learning.ipynb` | Expanding purged cross-validation, hyperparameter tuning, model evaluation, and artifact export. |

---

## 🤖 Machine Learning Integration

The machine learning task is formulated as a 3-class market direction classification problem predicting next-session direction:

| Label | Class | Threshold |
|---:|---|---|
| **-1** | 🔴 Down | Session return < -0.10% |
| **0** | 🟡 Sideways | Session return between -0.10% and +0.10% |
| **+1** | 🟢 Up | Session return > +0.10% |

### Recorded Test-Set Benchmark (Extra Trees)

| Metric | Score |
|---|---:|
| **Accuracy** | **38.46%** |
| **Macro F1** | **0.3224** |
| **Balanced Accuracy** | 32.27% |
| **Macro Precision** | 32.23% |
| **Macro Recall** | 32.27% |
| **Multiclass Log Loss** | 1.0262 |

### Dataset Partitions

| Partition | Observation Count | Percentage |
|---|---:|---:|
| Training | 541 | 70% |
| Validation | 115 | 15% |
| Untouched Test | 117 | 15% |
| **Partition Total** | **773** | 100% |

*Note on Split Discrepancy:* The full engineered dataset contains 775 observations, while the partitions total 773. Exactly 2 boundary records were purged to eliminate lookahead contamination across temporal boundaries.

---

## 🖥️ Web Application Features

The full-stack web application provides an intuitive interface for exploring the research outputs:

1. **Overview Dashboard (`/`):**
   - High-level scale indicators, trading days, and date span.
   - Market share breakdown for Volume and Open Interest.
   - ML experiment summary and data constraint disclosure notices.
2. **Futures Analytics (`/futures`):**
   - Area chart of closing price trajectories.
   - Daily volume bars and Open Interest trendlines.
   - Interactive date-range filters with financial presets (`All`, `2021-22`, `2023-24`, `2025-26`).
   - Paginated, sortable contract records table.
3. **Options Analytics (`/options`):**
   - Put-Call Ratio (PCR) trajectory comparing OI-based vs. volume-based ratios.
   - Side-by-side CE vs. PE volume and open interest comparisons.
   - Strike-price distribution table (top active strikes).
   - Expiry cycle and cluster breakdown table.
4. **Comparative Analytics (`/analytics`):**
   - Full descriptive statistics table (mean, std, quartiles, skewness, kurtosis).
   - Dynamic Heatmap toggling between Spearman rank and Pearson linear correlation matrices.
   - Cross-instrument market share allocations.
5. **Machine Learning & Playground (`/ml`):**
   - Complete architectural hyperparameters and 3x3 test confusion matrix.
   - Top 15 features by Gini impurity importance.
   - **Interactive Live Inference Playground:** loads authentic test/validation vectors and runs real-time inference against the trained model pipeline (`/api/v1/ml/predict`).
6. **About Page (`/about`):**
   - Methodology, technology stack, and academic disclaimers.

---

## 🛠️ Technology Stack

```text
nifty50-FnO-eda/
├── backend/                  # FastAPI REST API
│   ├── app/
│   │   ├── api/routes/       # Endpoints: overview, futures, options, analytics, ml, health
│   │   ├── core/             # Configuration, CORS, error handling
│   │   ├── schemas/          # Pydantic v2 validation models
│   │   └── services/         # Data loading, analytics, and ML inference services
│   ├── tests/                # 30 Pytest integration tests
│   └── requirements.txt
│
├── frontend/                 # Next.js 14 App Router Application
│   ├── src/
│   │   ├── app/              # Routes: /, /futures, /options, /analytics, /ml, /about
│   │   ├── components/       # Layouts, Sidebar, Header, ThemeProvider, UI components
│   │   └── lib/              # Centralized API client, TypeScript interfaces, utilities
│   ├── tailwind.config.js    # Financial terminal design system tokens
│   └── package.json
│
├── data/                     # Raw, processed Parquet, and ML datasets
├── models/                   # Serialized Extra Trees pipeline artifacts
└── notebooks/                # 6 Research Jupyter notebooks
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.10+ (tested with Python 3.11/3.15)
- Node.js 18+ (tested with Node 20/26)
- npm 9+

### 1. Clone the Repository
```bash
git clone https://github.com/yashrajzzz/nifty50-FnO-eda.git
cd nifty50-FnO-eda
```

### 2. Backend Setup
```bash
# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run backend test suite
PYTHONPATH=. pytest backend/tests -v

# Start FastAPI backend server
PYTHONPATH=. uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)  
Health check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Run type check and lint
npm run type-check
npm run lint

# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment Setup

You can run the entire full-stack application with a single command via Docker Compose:

```bash
docker-compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Production Hosting Recommendations

| Service | Recommended Platform | Notes |
|---|---|---|
| **Frontend** | Vercel / Netlify / Node Container | Set `NEXT_PUBLIC_API_URL` to your production backend URL. |
| **Backend** | Render / Fly.io / AWS ECS / GCP Cloud Run | Dedicated container with **minimum 1GB RAM** to retain parquet datasets and the Extra Trees joblib pipeline in memory. |

---

## ⚠️ Research Disclaimer & Limitations

- **Educational & Exploratory Tool:** This project is an academic research demonstration. It is not an algorithmic execution engine and does not provide financial or trading advice.
- **Underlying Value Field:** Represents an options/futures proxy with ~68.26% coverage; it is not verified official cash spot closing data.
- **No Lookahead Bias:** Feature engineering and cross-validation strictly employ purged walk-forward splits to prevent data leakage.
- **Market Dynamics:** Derivatives direction prediction with historical end-of-day features is noisy; a 38.46% test accuracy reflects the difficulty of directional forecasting without intraday order flow or macroeconomic factors.

---

## 📄 License & Credits

Built for academic research using public National Stock Exchange of India (NSE) historical reports. Distributed under the MIT License.
