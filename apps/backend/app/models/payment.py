"""Payment, Subscription, Token, Referral models."""
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(30))  # subscription, tokens, order, pitch
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10), default="UZS")
    provider: Mapped[str] = mapped_column(String(30), default="stripe")  # stripe, payme, click, manual
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, completed, failed, refunded
    transaction_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    external_id: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    refunded_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "userId": self.user_id,
            "type": self.type,
            "amount": self.amount,
            "currency": self.currency,
            "provider": self.provider,
            "status": self.status,
            "transactionId": self.transaction_id,
            "description": self.description,
            "paidAt": self.paid_at.isoformat() if self.paid_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    plan: Mapped[str] = mapped_column(String(30))  # free, pro, business, enterprise
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, cancelled, expired, paused
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=True)
    payment_id: Mapped[Optional[int]] = mapped_column(Integer)
    features: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "userId": self.user_id,
            "plan": self.plan,
            "status": self.status,
            "startedAt": self.started_at.isoformat() if self.started_at else None,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "autoRenew": self.auto_renew,
        }


class TokenTransaction(Base):
    __tablename__ = "token_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(30))  # earn, spend, buy, gift, refund, referral
    amount: Mapped[int] = mapped_column(Integer)  # positive=earn, negative=spend
    balance_after: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(255))
    related_id: Mapped[Optional[str]] = mapped_column(String(64))
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type,
            "amount": self.amount,
            "balanceAfter": self.balance_after,
            "reason": self.reason,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Referral(Base):
    __tablename__ = "referrals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    referrer_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    referred_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(32), index=True)
    bonus_referrer: Mapped[int] = mapped_column(Integer, default=100)
    bonus_referred: Mapped[int] = mapped_column(Integer, default=100)
    is_premium_referral: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "referrerId": self.referrer_id,
            "referredId": self.referred_id,
            "code": self.code,
            "bonusReferrer": self.bonus_referrer,
            "bonusReferred": self.bonus_referred,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
