# NIFTY 50 Futures and Options - FastAPI Backend

Backend service powering the full-stack web application for the **NIFTY 50 Futures and Options Exploratory Data Analysis & Machine Learning** research project.

---

## 🛠️ Technology Stack

- **Framework:** FastAPI
- **ASGI Server:** Uvicorn
- **Configuration & Validation:** Pydantic v2 & Pydantic Settings
- **Machine Learning:** Scikit-learn (Trained `ExtraTreesClassifier` Pipeline), Joblib
- **Data Processing:** Pandas, NumPy, PyArrow
- **Testing:** Pytest, HTTPX

---

## 📁 Architecture Overview

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Application factory, CORS, exception handlers, entrypoint
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/          # API route definitions
│   │       ├── __init__.py  # Route aggregator
│   │       ├── health.py    # Health check & artifact readiness
│   │       ├── overview.py  # Project summary & dataset inventory
│   │       ├── futures.py   # Futures summary, OHLC prices, volume, OI
│   │       ├── options.py   # Options comparison, PCR, strike & expiry analysis
│   │       ├── analytics.py # Descriptive statistics, correlations & comparisons
│   │       └── ml.py        # Model card, evaluation metrics, historical & live inference
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Centralized settings & path resolution
│   │   └── errors.py        # Custom exception classes & global JSON error handlers
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── base.py          # Generic ApiResponse[T], HealthResponse, Error schemas
│   │   ├── overview.py      # Inventory & overview schemas
│   │   ├── futures.py       # Futures time-series schemas
│   │   ├── options.py       # Options comparison & strike schemas
│   │   ├── analytics.py     # Descriptive & correlation matrix schemas
│   │   └── ml.py            # Model info, metrics, predictions & inference schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_service.py  # Reusable data loader with in-memory caching
│   │   ├── analytics_service.py # Notebook 04 statistical methods
│   │   └── ml_service.py    # Notebook 06 model loading & inference engine
│   └── models/
│       └── __init__.py      # Domain models
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures and TestClient setup
│   ├── test_health.py       # Health and configuration tests
│   ├── test_overview.py     # Overview and inventory endpoint tests
│   ├── test_futures.py      # Futures price, volume, and OI tests
│   ├── test_options.py      # Options comparison, strike, and expiry tests
│   ├── test_analytics.py    # Descriptive, correlation, and comparison tests
│   └── test_ml.py           # Model info, metrics, historical & live prediction tests
├── requirements.txt         # Backend Python dependencies
├── .env.example             # Template environment variables
└── README.md
```

---

## 📡 API Endpoints Summary

### 1. System & Overview
- `GET /health`: Health status and ML artifact readiness.
- `GET /api/v1/overview`: Overall market summary, total 2.68M raw records, instrument breakdown, and data limitation notice.
- `GET /api/v1/overview/datasets`: Detailed dataset specifications, column schemas, data types, null percentage, and file sizes.

### 2. NIFTY 50 Futures
- `GET /api/v1/futures/summary`: Aggregate statistics (4,294 records, 1,421 trading sessions, total contracts, turnover, average/max Open Interest).
- `GET /api/v1/futures/prices`: Historical OHLC, settlement prices, and underlying values with `start_date`, `end_date`, and pagination.
- `GET /api/v1/futures/volume`: Daily contract volume series and percentage changes over time.
- `GET /api/v1/futures/turnover`: Daily trading turnover series in ₹ Lakhs.
- `GET /api/v1/futures/open-interest`: Daily aggregate Open Interest and absolute/percentage OI changes.

### 3. NIFTY 50 Options
- `GET /api/v1/options/summary`: High-level Call vs Put options metrics, total turnover, contracts, premium turnover, and aggregate Put-Call Ratio.
- `GET /api/v1/options/comparison`: Daily side-by-side comparison of Call and Put contracts, Open Interest, PCR OI, PCR Volume, notional turnover, and premium turnover.
- `GET /api/v1/options/volume`: Time-series of Call vs Put contracts traded and daily CE/PE volume ratios.
- `GET /api/v1/options/premium-turnover`: Daily Call vs Put premium turnover in ₹ Lakhs.
- `GET /api/v1/options/strike-analysis`: Open Interest and contract volume distribution across strike prices (with optional `target_date` filter).
- `GET /api/v1/options/expiry-analysis`: Volume, peak Open Interest, and unique strike counts aggregated across contract expiration dates.

### 4. Comparative Statistical Analytics
- `GET /api/v1/analytics/descriptive`: Descriptive summary (count, mean, standard deviation, quartiles, min, max, skewness, kurtosis) across Futures returns, PCR, volumes, and Open Interest.
- `GET /api/v1/analytics/correlation`: Pearson and Spearman correlation matrices across daily market variables.
- `GET /api/v1/analytics/comparison`: Key comparative market dynamics from Notebook 04 (common trading days: 1,421, volume shares, and OI shares).

### 5. Machine Learning Integration
- `GET /api/v1/ml/model-info`: Hyperparameters, pipeline steps, 43 feature names, split dates, and target provenance.
- `GET /api/v1/ml/metrics`: Recorded test metrics (Accuracy: 38.46%, Macro F1: 0.3224), validation ranking (7 models), and purged CV summary.
- `GET /api/v1/ml/feature-importance`: Native Gini importance and validation permutation importance across all 43 features.
- `GET /api/v1/ml/historical-predictions`: Test set predictions for 117 observations, confidence probabilities, and confusion matrix.
- `GET /api/v1/ml/sample`: Fetch a real sample feature vector from test/validation splits for quick live testing.
- `POST /api/v1/ml/predict`: Live experimental prediction on 43 engineered features returning direction (`-1: Down`, `0: Sideways`, `1: Up`), label, and class probabilities.

---

## 🚀 Getting Started

### 1. Environment Setup

Ensure the virtual environment is activated from the repository root:

```bash
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 2. Running the Backend Server

Start the development server with live reload:

```bash
PYTHONPATH=. uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Interactive Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🧪 Running Tests

Execute the full backend test suite:

```bash
PYTHONPATH=. pytest backend/tests -v
```
