"""Common dependencies: auth, pagination, etc."""
from typing import Optional
from fastapi import Depends, HTTPException, status, Query, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Avtorizatsiya kerak")

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Yaroqsiz token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Yaroqsiz token")

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Foydalanuvchi topilmadi")
    if not user.isActive:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Akkaunt bloklangan")

    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get current user if authenticated, else None."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


async def require_admin(user: User = Depends(get_current_user)) -> User:
    """Require admin role."""
    if user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin kerak")
    return user


async def require_premium(user: User = Depends(get_current_user)) -> User:
    """Require premium subscription."""
    if not user.isPremium:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Premium kerak")
    return user


class Pagination:
    """Pagination parameters."""
    def __init__(
        self,
        page: int = Query(1, ge=1),
        limit: int = Query(20, ge=1, le=100),
    ):
        self.page = page
        self.limit = limit
        self.offset = (page - 1) * limit

    @property
    def skip(self) -> int:
        return self.offset


async def get_pagination(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100)) -> Pagination:
    return Pagination(page, limit)
