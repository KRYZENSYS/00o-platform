"""Security utilities: JWT, password hashing."""
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
import secrets
import hashlib

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status
import pyotp

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt", "argon2"], deprecated="auto", bcrypt__rounds=settings.BCRYPT_ROUNDS)


def hash_password(password: str) -> str:
    """Hash password."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify password."""
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def generate_random_token(length: int = 32) -> str:
    """Generate random token."""
    return secrets.token_urlsafe(length)


def generate_otp(length: int = 6) -> str:
    """Generate numeric OTP."""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])


def generate_2fa_secret() -> str:
    """Generate 2FA secret."""
    return pyotp.random_base32()


def verify_2fa_code(secret: str, code: str) -> bool:
    """Verify 2FA TOTP code."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


def get_2fa_uri(secret: str, username: str) -> str:
    """Get 2FA provisioning URI."""
    return pyotp.TOTP(secret).provisioning_uri(name=username, issuer_name="00o.uz")


def verify_telegram_init_data(init_data: str) -> Optional[dict]:
    """Verify Telegram WebApp initData and extract user info."""
    try:
        # Parse initData
        params = dict(x.split('=', 1) for x in init_data.split('&') if '=' in x)
        if 'hash' not in params:
            return None
        received_hash = params.pop('hash')

        # Build data check string
        data_check = '\n'.join(f"{k}={v}" for k, v in sorted(params.items()))

        # Use TELEGRAM_BOT_TOKEN as secret
        if not settings.TELEGRAM_BOT_TOKEN:
            return None
        secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()
        computed_hash = hmac.new(secret_key, data_check.encode(), hashlib.sha256).hexdigest()

        if computed_hash != received_hash:
            return None

        import json
        user_data = json.loads(params.get('user', '{}'))
        return {
            'id': user_data.get('id'),
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'username': user_data.get('username'),
            'photo_url': user_data.get('photo_url'),
        }
    except Exception:
        return None


import hmac
