"""Main FastAPI application for 00o.uz."""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from loguru import logger
import time
import sentry_sdk

from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import api_router

if settings.SENTRY_DSN:
    sentry_sdk.init(dsn=settings.SENTRY_DSN, environment=settings.APP_ENV)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events."""
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    yield
    logger.info("👋 Shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="00o.uz - O'zbekistondagi eng katta AI Startup Hub",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time", "X-Request-ID"],
)

# Trusted hosts
if not settings.DEBUG:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header."""
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(time.time() - start)
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests."""
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    logger.info(
        f"{request.method} {request.url.path} {response.status_code} {duration:.1f}ms"
    )
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "path": str(request.url.path),
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    errors = []
    for err in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in err.get("loc", [])),
            "message": err.get("msg"),
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": 422,
                "message": "Validation error",
                "details": errors,
                "path": str(request.url.path),
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unhandled exceptions."""
    logger.exception(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": 500,
                "message": "Internal server error" if not settings.DEBUG else str(exc),
                "path": str(request.url.path),
            }
        }
    )


# Health check
@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.APP_ENV,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "disabled",
        "status": "running",
    }


# API v1
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
