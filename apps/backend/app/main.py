"""FastAPI application entry point for 00o.uz."""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from loguru import logger
import time
import sentry_sdk

from app.core.config import settings
from app.core.database import db as database
from app.core.redis_client import redis_client
from app.api.v1 import auth, ai

# Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(dsn=settings.SENTRY_DSN, environment=settings.APP_ENV)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("🚀 Starting 00o.uz API...")
    await database.connect()
    await redis_client.connect()
    logger.info("✅ Connected to database and Redis")
    yield
    logger.info("👋 Shutting down...")
    await database.disconnect()
    await redis_client.disconnect()


# Create app
app = FastAPI(
    title="00o.uz API",
    description="AI Startup & Freelancer Hub API",
    version="1.0.0",
    docs_url="/api/docs" if settings.APP_DEBUG else None,
    redoc_url="/api/redoc" if settings.APP_DEBUG else None,
    openapi_url="/api/openapi.json" if settings.APP_DEBUG else None,
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time", "X-Request-ID"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])


@app.middleware("http")
async def add_process_time(request: Request, call_next):
    """Add process time header."""
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{time.time() - start:.3f}"
    return response


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "error": "Validation error", "details": exc.errors()},
    )


@app.exception_handler(Exception)
async def general_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error", "message": str(exc) if settings.APP_DEBUG else "An error occurred"},
    )


# Routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "00o.uz API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/api/docs",
    }


@app.get("/health")
async def health():
    """Health check."""
    try:
        await database.get().user.count()
        await redis_client.get().ping()
        return {"status": "healthy", "database": "ok", "redis": "ok"}
    except Exception as e:
        return JSONResponse(status_code=503, content={"status": "unhealthy", "error": str(e)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.APP_DEBUG)
