"""Payment, Subscription models."""
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON, Index, Float,
)
from app.core.database import Base
import uuid


class Payment(Base):
    """Payment record."""
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type = Column(String(30), index=True)  # subscription, tokens, order, one_time
    amount = Column(Float, default=0)
    currency = Column(String(10), default="UZS")
    provider = Column(String(20))  # stripe, payme, click, uzum
    status = Column(String(20), default="pending", index=True)  # pending, completed, failed, refunded
    transaction_id = Column(String(100), unique=True, index=True)
    description = Column(Text, nullable=True)
    metadata_json = Column("metadata_json", JSON, default=dict)
    paid_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "userId": self.user_id, "type": self.type, "amount": self.amount,
            "currency": self.currency, "provider": self.provider, "status": self.status,
            "transactionId": self.transaction_id, "description": self.description,
            "paidAt": self.paid_at.isoformat() if self.paid_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Subscription(Base):
    """User subscription."""
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    plan = Column(String(20), index=True)  # pro, business, enterprise
    status = Column(String(20), default="active", index=True)  # active, cancelled, expired, paused
    starts_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, index=True)
    cancelled_at = Column(DateTime, nullable=True)
    auto_renew = Column(Boolean, default=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    tokens_balance = Column(Integer, default=0)
    ai_daily_limit = Column(Integer, default=10)
    features = Column(JSON, default=list)
    metadata_json = Column("metadata_json", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "userId": self.user_id, "plan": self.plan, "status": self.status,
            "startsAt": self.starts_at.isoformat() if self.starts_at else None,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "autoRenew": self.auto_renew, "tokensBalance": self.tokens_balance,
            "aiDailyLimit": self.ai_daily_limit, "features": self.features or [],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Order(Base):
    """Marketplace order."""
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    seller_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    product_id = Column(Integer, nullable=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(Float, default=0)
    currency = Column(String(10), default="UZS")
    status = Column(String(20), default="pending", index=True)  # pending, paid, in_progress, delivered, completed, cancelled, refunded
    delivery_days = Column(Integer, default=7)
    requirements = Column(Text, nullable=True)
    deliverables = Column(JSON, default=list)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    rating = Column(Integer, nullable=True)
    review = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    metadata_json = Column("metadata_json", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "buyerId": self.buyer_id, "sellerId": self.seller_id,
            "serviceId": self.service_id, "title": self.title, "description": self.description,
            "amount": self.amount, "currency": self.currency, "status": self.status,
            "deliveryDays": self.delivery_days, "rating": self.rating, "review": self.review,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
