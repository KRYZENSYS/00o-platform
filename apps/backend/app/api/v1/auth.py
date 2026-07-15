"""Authentication API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
import secrets

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    verify_access_token, verify_refresh_token,
    generate_otp, verify_2fa_code, generate_2fa_secret,
    get_2fa_qr_code, verify_telegram_auth,
)
from app.core.config import settings
from app.services.email import send_email

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# Schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(..., min_length=8, max_length=128)
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    referralCode: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str
    twoFactorCode: Optional[str] = None


class TelegramLoginRequest(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
    expiresIn: int
    user: dict


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    newPassword: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str = Field(..., min_length=8)


async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> dict:
    """Get current authenticated user."""
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await db.user.find_unique(where={"id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user["status"] != "ACTIVE":
        raise HTTPException(status_code=403, detail="Account is not active")

    return user


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, background_tasks: BackgroundTasks, db=Depends(get_db)):
    """Register a new user."""
    # Check if email/username exists
    existing = await db.user.find_first(where={"OR": [{"email": data.email}, {"username": data.username}]})
    if existing:
        if existing["email"] == data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail="Username already taken")

    # Check referral
    referred_by = None
    if data.referralCode:
        referrer = await db.user.find_first(where={"referralCode": data.referralCode})
        if referrer:
            referred_by = referrer["id"]

    # Create user
    user = await db.user.create(data={
        "email": data.email,
        "username": data.username,
        "passwordHash": hash_password(data.password),
        "firstName": data.firstName,
        "lastName": data.lastName,
        "referredBy": referred_by,
        "emailVerified": False,
    })

    # Generate verification token
    verify_token = secrets.token_urlsafe(32)
    await db.token.create(data={
        "userId": user["id"],
        "type": "EMAIL_VERIFY",
        "token": verify_token,
        "expiresAt": datetime.utcnow() + timedelta(days=7),
    })

    # Send verification email
    background_tasks.add_task(send_email, data.email, "Verify your email", f"Click to verify: {settings.APP_URL}/verify-email?token={verify_token}")

    # Generate tokens
    access_token = create_access_token(user["id"])
    refresh_token = create_refresh_token(user["id"])

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={"id": user["id"], "email": user["email"], "username": user["username"]},
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db=Depends(get_db)):
    """Login with email and password."""
    user = await db.user.find_unique(where={"email": data.email})

    if not user or not user.get("passwordHash"):
        await db.loginaudit.create(data={"email": data.email, "ip": "0.0.0.0", "success": False, "reason": "User not found"})
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user["status"] != "ACTIVE":
        raise HTTPException(status_code=403, detail="Account is not active")

    if not verify_password(data.password, user["passwordHash"]):
        await db.loginaudit.create(data={"userId": user["id"], "email": data.email, "ip": "0.0.0.0", "success": False, "reason": "Wrong password"})
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check 2FA
    if user.get("twoFactorEnabled"):
        if not data.twoFactorCode:
            raise HTTPException(status_code=401, detail="2FA code required")
        if not verify_2fa_code(user["twoFactorSecret"], data.twoFactorCode):
            raise HTTPException(status_code=401, detail="Invalid 2FA code")

    # Update last seen
    await db.user.update(where={"id": user["id"]}, data={"lastSeen": datetime.utcnow()})

    access_token = create_access_token(user["id"])
    refresh_token = create_refresh_token(user["id"])

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={"id": user["id"], "email": user["email"], "username": user["username"], "role": user["role"]},
    )


@router.post("/telegram", response_model=TokenResponse)
async def telegram_login(data: TelegramLoginRequest, db=Depends(get_db)):
    """Login via Telegram."""
    if not settings.TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=503, detail="Telegram login not configured")

    auth_data = data.dict()
    if not verify_telegram_auth(auth_data, settings.TELEGRAM_BOT_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid Telegram auth")

    # Check auth date (not older than 1 day)
    if datetime.utcnow().timestamp() - data.auth_date > 86400:
        raise HTTPException(status_code=401, detail="Auth data is too old")

    # Find or create user
    telegram_id = str(data.id)
    user = await db.user.find_first(where={"telegram": telegram_id})

    if not user:
        username = data.username or f"tg_{telegram_id}"
        # Ensure unique username
        counter = 1
        original = username
        while await db.user.find_unique(where={"username": username}):
            username = f"{original}_{counter}"
            counter += 1

        user = await db.user.create(data={
            "email": f"{telegram_id}@telegram.00o.uz",
            "username": username,
            "firstName": data.first_name,
            "lastName": data.last_name,
            "avatar": data.photo_url,
            "telegram": telegram_id,
            "emailVerified": False,
            "isVerified": True,
        })
    else:
        await db.user.update(where={"id": user["id"]}, data={"lastSeen": datetime.utcnow()})

    access_token = create_access_token(user["id"])
    refresh_token = create_refresh_token(user["id"])

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={"id": user["id"], "email": user["email"], "username": user["username"]},
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: dict, db=Depends(get_db)):
    """Refresh access token."""
    token = data.get("refreshToken")
    if not token:
        raise HTTPException(status_code=400, detail="Refresh token required")

    payload = verify_refresh_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await db.user.find_unique(where={"id": payload["sub"]})
    if not user or user["status"] != "ACTIVE":
        raise HTTPException(status_code=401, detail="User not found or inactive")

    new_access = create_access_token(user["id"])
    new_refresh = create_refresh_token(user["id"])

    return TokenResponse(
        accessToken=new_access,
        refreshToken=new_refresh,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={"id": user["id"], "email": user["email"]},
    )


@router.post("/logout")
async def logout(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Logout user (invalidate sessions)."""
    await db.session.delete_many(where={"userId": current_user["id"]})
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(data: PasswordResetRequest, background_tasks: BackgroundTasks, db=Depends(get_db)):
    """Send password reset email."""
    user = await db.user.find_unique(where={"email": data.email})
    if user:
        reset_token = secrets.token_urlsafe(32)
        await db.token.create(data={
            "userId": user["id"],
            "type": "RESET_PASSWORD",
            "token": reset_token,
            "expiresAt": datetime.utcnow() + timedelta(hours=1),
        })
        background_tasks.add_task(send_email, data.email, "Reset Password", f"Click: {settings.APP_URL}/reset-password?token={reset_token}")

    return {"message": "If email exists, reset link has been sent"}


@router.post("/reset-password")
async def reset_password(data: PasswordResetConfirm, db=Depends(get_db)):
    """Reset password with token."""
    token_record = await db.token.find_unique(where={"token": data.token})
    if not token_record or token_record["type"] != "RESET_PASSWORD" or token_record["expiresAt"] < datetime.utcnow() or token_record["used"]:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    await db.user.update(where={"id": token_record["userId"]}, data={"passwordHash": hash_password(data.newPassword)})
    await db.token.update(where={"id": token_record["id"]}, data={"used": True})

    return {"message": "Password reset successful"}


@router.post("/verify-email")
async def verify_email(token: str, db=Depends(get_db)):
    """Verify email address."""
    token_record = await db.token.find_unique(where={"token": token})
    if not token_record or token_record["type"] != "EMAIL_VERIFY" or token_record["expiresAt"] < datetime.utcnow() or token_record["used"]:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    await db.user.update(where={"id": token_record["userId"]}, data={"emailVerified": True})
    await db.token.update(where={"id": token_record["id"]}, data={"used": True})

    return {"message": "Email verified successfully"}


@router.post("/2fa/setup")
async def setup_2fa(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Setup 2FA - generate secret and QR code."""
    secret = generate_2fa_secret()
    qr_code = get_2fa_qr_code(current_user["email"], secret)

    await db.user.update(where={"id": current_user["id"]}, data={"twoFactorSecret": secret})

    return {"secret": secret, "qrCode": f"data:image/png;base64,{qr_code}"}


@router.post("/2fa/enable")
async def enable_2fa(data: dict, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Enable 2FA after verifying code."""
    code = data.get("code")
    secret = current_user.get("twoFactorSecret")

    if not secret or not verify_2fa_code(secret, code):
        raise HTTPException(status_code=400, detail="Invalid code")

    await db.user.update(where={"id": current_user["id"]}, data={"twoFactorEnabled": True})
    return {"message": "2FA enabled"}


@router.post("/2fa/disable")
async def disable_2fa(data: dict, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Disable 2FA."""
    code = data.get("code")
    if not verify_2fa_code(current_user["twoFactorSecret"], code):
        raise HTTPException(status_code=400, detail="Invalid code")

    await db.user.update(where={"id": current_user["id"]}, data={"twoFactorEnabled": False, "twoFactorSecret": None})
    return {"message": "2FA disabled"}


@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Change password."""
    if not verify_password(data.currentPassword, current_user["passwordHash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    await db.user.update(where={"id": current_user["id"]}, data={"passwordHash": hash_password(data.newPassword)})
    return {"message": "Password changed successfully"}


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    """Get current user profile."""
    return current_user
