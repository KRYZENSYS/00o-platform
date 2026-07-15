"""Application configuration."""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    APP_NAME: str = "00o.uz"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    API_PORT: int = 8000
    WEB_PORT: int = 3000

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ooouz"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "ooouz"
    POSTGRES_PORT: int = 5432

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PORT: int = 6379

    # JWT
    JWT_SECRET: str = "change-me-super-secret-jwt-key-min-32-chars-long-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days
    JWT_REFRESH_EXPIRE_DAYS: int = 30

    # AI (GroqCloud)
    GROQ_API_KEY: str = ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    OPENAI_API_KEY: str = ""

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_BOT_USERNAME: str = "ooouzbot"
    TELEGRAM_WEBAPP_URL: str = "https://00o.uz"

    # Payments
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    PAYME_SECRET_KEY: str = ""
    PAYME_MERCHANT_ID: str = ""
    CLICK_SECRET_KEY: str = ""
    CLICK_MERCHANT_ID: str = ""

    # SMTP
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@00o.uz"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,https://00o.uz"

    # Uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB

    # Token economy
    TOKEN_PRICE: int = 1000  # UZS per token
    REFERRAL_BONUS: int = 100
    PREMIUM_REFERRAL_BONUS: int = 500
    SIGNUP_BONUS: int = 100
    FREE_AI_REQUESTS_PER_DAY: int = 5
    PREMIUM_AI_REQUESTS_PER_DAY: int = 100

    # Subscription plans
    PRO_PRICE: int = 99000
    BUSINESS_PRICE: int = 299000
    PRO_TOKENS: int = 500
    BUSINESS_TOKENS: int = 2000

    # Sentry
    SENTRY_DSN: str = ""

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def IS_PRODUCTION(self) -> bool:
        return self.ENVIRONMENT == "production"


settings = Settings()
