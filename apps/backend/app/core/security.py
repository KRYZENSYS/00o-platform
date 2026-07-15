"""Security utilities: JWT, password hashing, encryption."""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
import hashlib
import pyotp
import qrcode
from io import BytesIO
import base64

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against hash."""
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def create_access_token(subject: str | Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    if isinstance(subject, dict):
        to_encode = subject.copy()
    else:
        to_encode = {"sub": str(subject)}

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
        "jti": secrets.token_hex(16),
    })

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str) -> str:
    """Create JWT refresh token."""
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh",
        "jti": secrets.token_hex(16),
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify access token and return payload."""
    payload = decode_token(token)
    if not payload:
        return None
    if payload.get("type") != "access":
        return None
    return payload


def verify_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify refresh token and return payload."""
    payload = decode_token(token)
    if not payload:
        return None
    if payload.get("type") != "refresh":
        return None
    return payload


def generate_token(length: int = 32) -> str:
    """Generate secure random token."""
    return secrets.token_urlsafe(length)


def generate_otp(length: int = 6) -> str:
    """Generate numeric OTP."""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])


def hash_token(token: str) -> str:
    """Hash token for storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def generate_2fa_secret() -> str:
    """Generate TOTP secret."""
    return pyotp.random_base32()


def verify_2fa_code(secret: str, code: str) -> bool:
    """Verify TOTP code."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


def get_2fa_qr_code(user_email: str, secret: str) -> str:
    """Generate QR code for 2FA setup."""
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=user_email, issuer_name="00o.uz")
    img = qrcode.make(uri)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode()


def verify_telegram_auth(data: Dict[str, Any], bot_token: str) -> bool:
    """Verify Telegram Login Widget data."""
    check_hash = data.get("hash")
    if not check_hash:
        return False

    data_check = {k: v for k, v in data.items() if k != "hash"}
    data_check_arr = [f"{k}={v}" for k, v in sorted(data_check.items())]
    data_check_string = "\n".join(data_check_arr)

    import hmac
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    hmac_string = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    return hmac.compare_digest(hmac_string, check_hash)
