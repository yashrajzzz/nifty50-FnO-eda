"""Route registrations and combined API router."""

from fastapi import APIRouter
from backend.app.api.routes.analytics import router as analytics_router
from backend.app.api.routes.futures import router as futures_router
from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.ml import router as ml_router
from backend.app.api.routes.options import router as options_router
from backend.app.api.routes.overview import router as overview_router

api_router = APIRouter()

# Register all v1 API routers
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(overview_router)
api_router.include_router(futures_router)
api_router.include_router(options_router)
api_router.include_router(analytics_router)
api_router.include_router(ml_router)
