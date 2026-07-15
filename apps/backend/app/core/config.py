"""Application configuration."""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    APP_NAME: str = "00o.uz"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    APP_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    API_V1_PREFIX: str = "/api/v1"

    # Security
    JWT_SECRET: str = "change-me-in-production-use-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    JWT_REFRESH_EXPIRE_DAYS: int = 30
    BCRYPT_ROUNDS: int = 12

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ooouzb"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600

    # AI (GroqCloud)
    GROQ_API_KEY: str = ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_DEFAULT_MODEL: str = "llama-3.3-70b-versatile"
    AI_DAILY_LIMIT_FREE: int = 10
    AI_DAILY_LIMIT_PRO: int = 1000
    AI_TOKENS_PER_REQUEST: int = 100

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBAPP_URL: str = ""
    BOT_API_KEY: str = ""

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@00o.uz"
    SENDGRID_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", "http://localhost:3001",
        "https://00o.uz", "https://www.00o.uz",
        "https://app.00o.uz", "https://admin.00o.uz",
    ]
    ALLOWED_HOSTS: List[str] = ["*"]

    # File uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    ALLOWED_FILE_TYPES: List[str] = [
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain", "text/csv",
    ]

    # Storage
    STORAGE_TYPE: str = "local"  # local | s3 | r2
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""
    AWS_BUCKET: str = ""
    AWS_REGION: str = "us-east-1"
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY: str = ""
    R2_SECRET_KEY: str = ""
    R2_BUCKET: str = ""

    # Payments
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    PAYME_MERCHANT_ID: str = ""
    PAYME_SECRET_KEY: str = ""
    CLICK_MERCHANT_ID: str = ""
    CLICK_SERVICE_ID: str = ""
    CLICK_SECRET_KEY: str = ""

    # Subscriptions / Tokens
    TOKEN_PRICE: int = 100  # 100 UZS per 1 token
    PRO_PRICE: int = 99000
    BUSINESS_PRICE: int = 299000
    REFERRAL_BONUS: int = 100
    PREMIUM_REFERRAL_BONUS: int = 500

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    RATE_LIMIT_LOGIN_PER_HOUR: int = 5
    RATE_LIMIT_REGISTER_PER_DAY: int = 3

    # Monitoring
    SENTRY_DSN: str = ""
    POSTHOG_KEY: str = ""

    # Security flags
    ENABLE_2FA: bool = True
    ENABLE_EMAIL_VERIFICATION: bool = True
    ENABLE_TELEGRAM_AUTH: bool = True
    ENABLE_REGISTRATION: bool = True


settings = Settings()
