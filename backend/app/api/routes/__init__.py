"""Route registrations and combined API router."""

from fastapi import APIRouter
from backend.app.api.routes.health import router as health_router

api_router = APIRouter()

# Register endpoint routers
api_router.include_router(health_router, tags=["Health"])
