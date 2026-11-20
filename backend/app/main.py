"""FastAPI application factory and main server entrypoint."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import api_router
from backend.app.api.routes.health import router as health_router
from backend.app.core.config import settings
from backend.app.core.errors import register_exception_handlers
from backend.app.schemas.base import ApiResponse, RootResponse


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context for startup and shutdown events."""
    # Startup: logging and readiness check
    print(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENV}]")
    print(f"Data ML directory: {settings.DATA_ML_DIR}")
    print(f"Models directory: {settings.SAVED_MODELS_DIR}")
    yield
    # Shutdown clean up
    print("Shutting down backend application")


def create_app() -> FastAPI:
    """Initialize and configure the FastAPI application instance."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        debug=settings.DEBUG,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Configure CORS for frontend access
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register centralized exception handlers
    register_exception_handlers(app)

    # Root welcome endpoint
    @app.get(
        "/",
        response_model=ApiResponse[RootResponse],
        tags=["General"],
        summary="API Root",
    )
    async def root() -> ApiResponse[RootResponse]:
        return ApiResponse(
            data=RootResponse(
                name=settings.PROJECT_NAME,
                version=settings.VERSION,
                docs_url="/docs",
                health_url="/health",
            ),
            message="Welcome to the NIFTY 50 Futures and Options Analytics API",
        )

    # Register top-level /health endpoint (direct access)
    app.include_router(health_router, tags=["Health"])

    # Register versioned /api/v1 routes
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
