"""Auth endpoints: register, login, telegram, refresh, logout."""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr, Field

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    generate_referral_code, verify_telegram_init_data,
)
from app.core.config import settings
from app.core.redis_client import get_redis
from app.api.deps import get_current_user
from app.models.user import User
from app.models.token import Referral
from app.schemas.user import UserOut, TokenOut, RegisterIn, LoginIn

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(data: RegisterIn, db: AsyncSession = Depends(get_db)):
    """Register with email & password."""
    # Check existing
    result = await db.execute(
        select(User).where((User.email == data.email) | (User.username == data.username))
    )
    if result.scalar_one_or_none():
        raise HTTPException(400, "Bu email yoki username band")

    # Create user
    user = User(
        email=data.email,
        username=data.username,
        firstName=data.first_name,
        lastName=data.last_name or "",
        password=hash_password(data.password),
        tokens=settings.SIGNUP_BONUS,
        xp=0,
        referralCode=generate_referral_code(),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Process referral
    if data.referral_code:
        ref = await db.execute(select(User).where(User.referralCode == data.referral_code))
        referrer = ref.scalar_one_or_none()
        if referrer and referrer.id != user.id:
            user.referredById = referrer.id
            referrer.tokens += settings.REFERRAL_BONUS
            user.tokens += settings.REFERRAL_BONUS
            db.add(Referral(referrerId=referrer.id, referredId=user.id, code=data.referral_code, bonus=100))
            await db.commit()

    return {
        "success": True,
        "data": {
            "user": user.to_dict(),
            "token": create_access_token(user.id),
            "refreshToken": create_refresh_token(user.id),
        }
    }


@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn, db: AsyncSession = Depends(get_db)):
    """Login with email & password."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not user.password or not verify_password(data.password, user.password):
        raise HTTPException(401, "Email yoki parol noto'g'ri")
    if not user.isActive:
        raise HTTPException(403, "Akkaunt bloklangan")

    user.lastSeenAt = datetime.now(timezone.utc)
    await db.commit()
    return {
        "success": True,
        "data": {
            "user": user.to_dict(),
            "token": create_access_token(user.id),
            "refreshToken": create_refresh_token(user.id),
        }
    }


class TelegramIn(BaseModel):
    telegramId: int
    username: str | None = None
    firstName: str | None = None
    lastName: str | None = None
    languageCode: str | None = "uz"
    isPremium: bool = False
    photoUrl: str | None = None


@router.post("/telegram", response_model=TokenOut)
async def login_telegram(data: TelegramIn, db: AsyncSession = Depends(get_db)):
    """Login or register via Telegram."""
    result = await db.execute(select(User).where(User.telegramId == data.telegramId))
    user = result.scalar_one_or_none()

    if not user:
        # Create new
        base_username = data.username or f"user{data.telegramId}"
        # Ensure unique
        existing = await db.execute(select(User).where(User.username == base_username))
        if existing.scalar_one_or_none():
            base_username = f"{base_username}_{data.telegramId}"

        user = User(
            telegramId=data.telegramId,
            username=base_username,
            firstName=data.firstName or "User",
            lastName=data.lastName or "",
            avatar=data.photoUrl,
            isTelegramPremium=data.isPremium,
            tokens=settings.SIGNUP_BONUS,
            xp=0,
            referralCode=generate_referral_code(),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    user.lastSeenAt = datetime.now(timezone.utc)
    if data.photoUrl and not user.avatar:
        user.avatar = data.photoUrl
    await db.commit()
    await db.refresh(user)

    return {
        "success": True,
        "data": {
            "user": user.to_dict(),
            "token": create_access_token(user.id),
            "refreshToken": create_refresh_token(user.id),
        }
    }


class RefreshIn(BaseModel):
    refreshToken: str


@router.post("/refresh")
async def refresh(data: RefreshIn):
    """Refresh access token."""
    payload = decode_token(data.refreshToken)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Yaroqsiz refresh token")
    user_id = payload.get("sub")
    return {
        "success": True,
        "data": {
            "token": create_access_token(int(user_id)),
            "refreshToken": create_refresh_token(int(user_id)),
        }
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout (invalidate token)."""
    redis = await get_redis()
    if redis:
        await redis.set(f"blacklist:{current_user.id}", "1", ex=86400 * 7)
    return {"success": True, "data": {"message": "Tizimdan chiqdingiz"}}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info."""
    return {"success": True, "data": current_user.to_dict()}


class ForgotIn(BaseModel):
    email: EmailStr


@router.post("/forgot")
async def forgot_password(data: ForgotIn, db: AsyncSession = Depends(get_db)):
    """Request password reset."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    # Always return success to prevent email enumeration
    return {
        "success": True,
        "data": {"message": "Agar email mavjud bo'lsa, tiklash havolasi yuborildi"}
    }


class ResetIn(BaseModel):
    token: str
    newPassword: str = Field(min_length=8)


@router.post("/reset")
async def reset_password(data: ResetIn, db: AsyncSession = Depends(get_db)):
    """Reset password with token."""
    redis = await get_redis()
    if not redis:
        raise HTTPException(500, "Xizmat vaqtincha mavjud emas")
    user_id = await redis.get(f"reset:{data.token}")
    if not user_id:
        raise HTTPException(400, "Yaroqsiz yoki eskirgan token")
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    user.password = hash_password(data.newPassword)
    await redis.delete(f"reset:{data.token}")
    await db.commit()
    return {"success": True, "data": {"message": "Parol yangilandi"}}
