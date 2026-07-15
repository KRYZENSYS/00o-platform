"""Startup, Member, Funding, Metric models."""
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from app.core.database import Base


class Startup(Base):
    __tablename__ = "startups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    tagline: Mapped[Optional[str]] = mapped_column(String(300))
    description: Mapped[Optional[str]] = mapped_column(Text)
    logo: Mapped[Optional[str]] = mapped_column(String(500))
    cover: Mapped[Optional[str]] = mapped_column(String(500))
    website: Mapped[Optional[str]] = mapped_column(String(255))
    industry: Mapped[Optional[str]] = mapped_column(String(100))
    stage: Mapped[str] = mapped_column(String(50), default="idea")  # idea, mvp, beta, growth, scale
    funding_stage: Mapped[Optional[str]] = mapped_column(String(50))  # pre-seed, seed, series-a, etc
    funding_amount: Mapped[Optional[float]] = mapped_column(Float)
    valuation: Mapped[Optional[float]] = mapped_column(Float)
    revenue: Mapped[float] = mapped_column(Float, default=0)
    users_count: Mapped[int] = mapped_column(Integer, default=0)
    team_size: Mapped[int] = mapped_column(Integer, default=1)
    location: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(50), default="Uzbekistan")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    social_links: Mapped[dict] = mapped_column(JSON, default=dict)

    owner_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)

    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_hiring: Mapped[bool] = mapped_column(Boolean, default=False)

    views_count: Mapped[int] = mapped_column(Integer, default=0)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    followers_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "tagline": self.tagline,
            "description": self.description,
            "logo": self.logo,
            "cover": self.cover,
            "website": self.website,
            "industry": self.industry,
            "stage": self.stage,
            "fundingStage": self.funding_stage,
            "fundingAmount": self.funding_amount,
            "valuation": self.valuation,
            "revenue": self.revenue,
            "usersCount": self.users_count,
            "teamSize": self.team_size,
            "location": self.location,
            "country": self.country,
            "tags": self.tags,
            "socialLinks": self.social_links,
            "ownerId": self.owner_id,
            "isPublished": self.is_published,
            "isFeatured": self.is_featured,
            "isHiring": self.is_hiring,
            "viewsCount": self.views_count,
            "likesCount": self.likes_count,
            "followersCount": self.followers_count,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class StartupMember(Base):
    __tablename__ = "startup_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    startup_id: Mapped[int] = mapped_column(Integer, ForeignKey("startups.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(50))  # founder, ceo, cto, dev, designer, marketing
    equity: Mapped[float] = mapped_column(Float, default=0)
    is_founder: Mapped[bool] = mapped_column(Boolean, default=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StartupFunding(Base):
    __tablename__ = "startup_fundings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    startup_id: Mapped[int] = mapped_column(Integer, ForeignKey("startups.id", ondelete="CASCADE"), index=True)
    round: Mapped[str] = mapped_column(String(50))  # pre-seed, seed, series-a
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    investors: Mapped[str] = mapped_column(Text)  # comma separated
    announced_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StartupMetric(Base):
    __tablename__ = "startup_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    startup_id: Mapped[int] = mapped_column(Integer, ForeignKey("startups.id", ondelete="CASCADE"), index=True)
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    revenue: Mapped[float] = mapped_column(Float, default=0)
    users: Mapped[int] = mapped_column(Integer, default=0)
    active_users: Mapped[int] = mapped_column(Integer, default=0)
    mrr: Mapped[float] = mapped_column(Float, default=0)
    arr: Mapped[float] = mapped_column(Float, default=0)
    burn_rate: Mapped[float] = mapped_column(Float, default=0)
    runway_months: Mapped[float] = mapped_column(Float, default=0)
