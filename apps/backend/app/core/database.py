"""Database connection and session management."""
from prisma import Prisma
from typing import Optional
from functools import lru_cache
from app.core.config import settings


class Database:
    """Database connection manager."""

    client: Optional[Prisma] = None

    @classmethod
    async def connect(cls):
        """Connect to database."""
        if cls.client is None:
            cls.client = Prisma(datasource={"url": settings.DATABASE_URL})
            await cls.client.connect()

    @classmethod
    async def disconnect(cls):
        """Disconnect from database."""
        if cls.client is not None:
            await cls.client.disconnect()
            cls.client = None

    @classmethod
    def get(cls) -> Prisma:
        """Get database client."""
        if cls.client is None:
            raise RuntimeError("Database not initialized. Call connect() first.")
        return cls.client


db = Database()


async def get_db() -> Prisma:
    """Dependency to get database client."""
    return db.get()
