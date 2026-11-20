# NIFTY 50 Futures and Options - FastAPI Backend

Backend service powering the full-stack web application for the **NIFTY 50 Futures and Options Exploratory Data Analysis & Machine Learning** research project.

---

## 🛠️ Technology Stack

- **Framework:** FastAPI
- **ASGI Server:** Uvicorn
- **Configuration & Validation:** Pydantic v2 & Pydantic Settings
- **Data & Model Support:** Scikit-learn, Joblib, Pandas, NumPy, PyArrow
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
│   │       └── health.py    # Health check & artifact readiness
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Centralized settings & path resolution
│   │   └── errors.py        # Custom exception classes & global JSON error handlers
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── base.py          # Generic ApiResponse[T], HealthResponse, Error schemas
│   ├── services/
│   │   └── __init__.py      # Business logic & ML inference services (upcoming)
│   └── models/
│       └── __init__.py      # Domain and data models
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures and TestClient setup
│   └── test_health.py       # Endpoint and configuration tests
├── requirements.txt         # Backend Python dependencies
├── .env.example             # Template environment variables
└── README.md
```

---

## 🚀 Getting Started

### 1. Environment Setup

Ensure the virtual environment is activated from the repository root:

```bash
# From repository root
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

### 2. Configuration

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

Available environment variables:
- `PROJECT_NAME`: Title of the application (default: `"NIFTY 50 Futures and Options Analytics API"`).
- `ENV`: Environment mode (`development` or `production`).
- `DEBUG`: Boolean flag (`true` or `false`).
- `API_V1_STR`: API prefix path (default: `"/api/v1"`).
- `HOST`: Server bind address (default: `"0.0.0.0"`).
- `PORT`: Server port (default: `8000`).
- `BACKEND_CORS_ORIGINS`: JSON array of allowed origins for the Next.js frontend.

### 3. Running the Backend Server

Start the development server with live reload:

```bash
# Run from repository root
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Or run via Python directly:

```bash
python -m backend.app.main
```

### 4. Interactive API Documentation

Once started, access the OpenAPI documentation at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI Schema:** http://localhost:8000/openapi.json
- **Health Check:** http://localhost:8000/health

---

## 🧪 Running Tests

Execute the backend test suite:

```bash
PYTHONPATH=. pytest backend/tests -v
```
