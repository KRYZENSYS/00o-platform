"""User and Profile models."""
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
import uuid

from app.core.database import Base


def gen_id():
    return uuid.uuid4().hex[:24]


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=gen_id)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Profile
    first_name: Mapped[Optional[str]] = mapped_column(String(100))
    last_name: Mapped[Optional[str]] = mapped_column(String(100))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    avatar: Mapped[Optional[str]] = mapped_column(String(500))
    cover: Mapped[Optional[str]] = mapped_column(String(500))
    location: Mapped[Optional[str]] = mapped_column(String(100))
    website: Mapped[Optional[str]] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(32))

    # Auth
    role: Mapped[str] = mapped_column(String(20), default="user")  # user, admin, moderator
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    two_fa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    two_fa_secret: Mapped[Optional[str]] = mapped_column(String(64))

    # Tokens & XP
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[str] = mapped_column(String(20), default="Bronze")
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)

    # Stats
    followers_count: Mapped[int] = mapped_column(Integer, default=0)
    following_count: Mapped[int] = mapped_column(Integer, default=0)
    posts_count: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)

    # Telegram
    telegram_id: Mapped[Optional[str]] = mapped_column(String(32), unique=True, index=True)
    telegram_username: Mapped[Optional[str]] = mapped_column(String(64))

    # Referral
    referred_by: Mapped[Optional[str]] = mapped_column(String(32))
    referral_count: Mapped[int] = mapped_column(Integer, default=0)

    # Settings
    language: Mapped[str] = mapped_column(String(8), default="uz")
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Tashkent")
    is_online: Mapped[bool] = mapped_column(Boolean, default=False)
    last_seen_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    notification_settings: Mapped[dict] = mapped_column(JSON, default=dict)
    privacy_settings: Mapped[dict] = mapped_column(JSON, default=dict)

    # Security
    email_verification_token: Mapped[Optional[str]] = mapped_column(String(64))
    reset_password_token: Mapped[Optional[str]] = mapped_column(String(64))
    reset_password_expires: Mapped[Optional[float]] = mapped_column(Float)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    last_login_ip: Mapped[Optional[str]] = mapped_column(String(64))
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[Optional[float]] = mapped_column(Float)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "bio": self.bio,
            "avatar": self.avatar,
            "cover": self.cover,
            "location": self.location,
            "website": self.website,
            "role": self.role,
            "isActive": self.is_active,
            "verified": self.is_verified,
            "premium": self.is_premium,
            "tokens": self.tokens,
            "xp": self.xp,
            "level": self.level,
            "followersCount": self.followers_count,
            "followingCount": self.following_count,
            "postsCount": self.posts_count,
            "rating": self.rating,
            "reviewsCount": self.reviews_count,
            "language": self.language,
            "timezone": self.timezone,
            "isOnline": self.is_online,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Follow(Base):
    __tablename__ = "follows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    follower_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    following_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
