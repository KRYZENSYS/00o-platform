"""Authentication endpoints."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr, Field, field_validator
from loguru import logger

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    verify_telegram_init_data, generate_2fa_secret, verify_2fa_code, get_2fa_uri,
    generate_random_token,
)
from app.core.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription
from app.services.email import send_email

router = APIRouter()


# ===== Schemas =====
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    username: str = Field(min_length=3, max_length=32, pattern=r'^[a-zA-Z0-9_]+$')
    firstName: str | None = None
    lastName: str | None = None
    referralCode: str | None = None

    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain digit')
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class TelegramAuthRequest(BaseModel):
    initData: str


class TokenResponse(BaseModel):
    success: bool = True
    data: dict


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    firstName: str | None
    lastName: str | None
    avatar: str | None
    role: str
    verified: bool
    premium: bool
    tokens: int
    xp: int
    level: str


# ===== Endpoints =====
@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Register new user."""
    # Check existing
    existing = await db.execute(
        select(User).where((User.email == data.email) | (User.username == data.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or username already taken")

    # Create user
    user = User(
        id=generate_random_token(16),
        email=data.email,
        username=data.username,
        password_hash=hash_password(data.password),
        first_name=data.firstName,
        last_name=data.lastName,
        role="user",
        tokens=100,  # Welcome bonus
        email_verification_token=generate_random_token(32),
    )
    db.add(user)

    # Process referral
    if data.referralCode:
        # Find referrer
        referrer_id = data.referralCode.replace("ref_", "")
        referrer = await db.execute(select(User).where(User.id == referrer_id))
        ref_user = referrer.scalar_one_or_none()
        if ref_user:
            ref_user.referral_count = (ref_user.referral_count or 0) + 1
            ref_user.tokens = (ref_user.tokens or 0) + 100
            user.referred_by = ref_user.id

    await db.flush()

    # Send verification email (best-effort)
    try:
        await send_email(user.email, "verify_email", {"token": user.email_verification_token, "name": user.first_name or user.username})
    except Exception as e:
        logger.warning(f"Failed to send verification email: {e}")

    # Generate tokens
    access = create_access_token({"sub": user.id})
    refresh = create_refresh_token({"sub": user.id})

    return {
        "success": True,
        "data": {
            "access_token": access,
            "refresh_token": refresh,
            "user": user.to_dict(),
        }
    }


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Login user."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    # Update last login
    user.last_login_at = datetime.utcnow()
    user.last_login_ip = request.client.host if request.client else None

    access = create_access_token({"sub": user.id})
    refresh = create_refresh_token({"sub": user.id})

    return {
        "success": True,
        "data": {
            "access_token": access,
            "refresh_token": refresh,
            "user": user.to_dict(),
        }
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: dict, db: AsyncSession = Depends(get_db)):
    """Refresh access token."""
    token = data.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="Refresh token required")

    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    access = create_access_token({"sub": user.id})
    refresh = create_refresh_token({"sub": user.id})

    return {
        "success": True,
        "data": {
            "access_token": access,
            "refresh_token": refresh,
        }
    }


@router.post("/logout")
async def logout(user: User = Depends(get_current_user)):
    """Logout user (invalidate session)."""
    # In production: blacklist token in Redis
    return {"success": True, "data": {"message": "Logged out"}}


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user info."""
    return {"success": True, "data": user.to_dict()}


@router.post("/telegram", response_model=TokenResponse)
async def telegram_auth(data: TelegramAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate via Telegram WebApp."""
    tg_user = verify_telegram_init_data(data.initData)
    if not tg_user or not tg_user.get("id"):
        raise HTTPException(status_code=401, detail="Invalid Telegram data")

    tg_id = str(tg_user["id"])
    result = await db.execute(select(User).where(User.telegram_id == tg_id))
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        username = tg_user.get("username") or f"user_{tg_id}"
        # Ensure unique username
        i = 0
        original = username
        while True:
            check = await db.execute(select(User).where(User.username == username))
            if not check.scalar_one_or_none():
                break
            i += 1
            username = f"{original}_{i}"

        user = User(
            id=generate_random_token(16),
            email=f"{tg_id}@telegram.00o.uz",
            username=username,
            password_hash=hash_password(generate_random_token(32)),
            first_name=tg_user.get("first_name"),
            last_name=tg_user.get("last_name"),
            avatar=tg_user.get("photo_url"),
            telegram_id=tg_id,
            is_verified=True,
            tokens=100,
        )
        db.add(user)
        await db.flush()

    access = create_access_token({"sub": user.id})
    refresh = create_refresh_token({"sub": user.id})

    return {
        "success": True,
        "data": {
            "access_token": access,
            "refresh_token": refresh,
            "user": user.to_dict(),
        }
    }


@router.post("/forgot-password")
async def forgot_password(data: dict, db: AsyncSession = Depends(get_db)):
    """Send password reset email."""
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if user:
        token = generate_random_token(32)
        user.reset_password_token = token
        user.reset_password_expires = datetime.utcnow().timestamp() + 3600
        try:
            await send_email(user.email, "reset_password", {"token": token, "name": user.first_name or user.username})
        except Exception as e:
            logger.error(f"Failed to send reset email: {e}")

    return {"success": True, "data": {"message": "If email exists, reset link sent"}}


@router.post("/reset-password")
async def reset_password(data: dict, db: AsyncSession = Depends(get_db)):
    """Reset password with token."""
    token = data.get("token")
    new_password = data.get("password")
    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and password required")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password too short")

    result = await db.execute(select(User).where(User.reset_password_token == token))
    user = result.scalar_one_or_none()

    if not user or not user.reset_password_expires or user.reset_password_expires < datetime.utcnow().timestamp():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.password_hash = hash_password(new_password)
    user.reset_password_token = None
    user.reset_password_expires = None

    return {"success": True, "data": {"message": "Password updated"}}


@router.post("/verify-email")
async def verify_email(data: dict, db: AsyncSession = Depends(get_db)):
    """Verify email with token."""
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token required")

    result = await db.execute(select(User).where(User.email_verification_token == token))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    user.is_verified = True
    user.email_verification_token = None

    return {"success": True, "data": {"message": "Email verified"}}


@router.post("/2fa/enable")
async def enable_2fa(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Enable 2FA - returns secret and QR URI."""
    secret = generate_2fa_secret()
    user.two_fa_secret = secret
    user.two_fa_enabled = False
    uri = get_2fa_uri(secret, user.username)
    return {"success": True, "data": {"secret": secret, "uri": uri}}


@router.post("/2fa/verify")
async def verify_2fa(data: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Verify 2FA code and enable 2FA."""
    code = data.get("code")
    if not code or not user.two_fa_secret:
        raise HTTPException(status_code=400, detail="Code and pending secret required")

    if not verify_2fa_code(user.two_fa_secret, code):
        raise HTTPException(status_code=400, detail="Invalid code")

    user.two_fa_enabled = True
    return {"success": True, "data": {"message": "2FA enabled"}}
