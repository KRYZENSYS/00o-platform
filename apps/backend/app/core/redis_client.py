"""Redis client and cache utilities."""
import redis.asyncio as redis
from typing import Optional, Any
import json
from app.core.config import settings


class RedisClient:
    """Redis connection manager."""

    client: Optional[redis.Redis] = None

    @classmethod
    async def connect(cls):
        """Connect to Redis."""
        if cls.client is None:
            cls.client = redis.from_url(
                settings.REDIS_URL,
                password=settings.REDIS_PASSWORD,
                decode_responses=True,
            )
            await cls.client.ping()

    @classmethod
    async def disconnect(cls):
        """Disconnect from Redis."""
        if cls.client is not None:
            await cls.client.close()
            cls.client = None

    @classmethod
    def get(cls) -> redis.Redis:
        """Get Redis client."""
        if cls.client is None:
            raise RuntimeError("Redis not initialized.")
        return cls.client


redis_client = RedisClient()


async def get_redis() -> redis.Redis:
    """Dependency to get Redis client."""
    return redis_client.get()


# Cache helpers
async def cache_get(key: str) -> Optional[Any]:
    """Get value from cache."""
    try:
        r = redis_client.get()
        value = await r.get(key)
        if value:
            return json.loads(value)
    except Exception:
        return None
    return None


async def cache_set(key: str, value: Any, expire: int = 300):
    """Set value in cache."""
    try:
        r = redis_client.get()
        await r.setex(key, expire, json.dumps(value, default=str))
    except Exception:
        pass


async def cache_delete(key: str):
    """Delete key from cache."""
    try:
        r = redis_client.get()
        await r.delete(key)
    except Exception:
        pass


async def cache_delete_pattern(pattern: str):
    """Delete keys matching pattern."""
    try:
        r = redis_client.get()
        keys = await r.keys(pattern)
        if keys:
            await r.delete(*keys)
    except Exception:
        pass
