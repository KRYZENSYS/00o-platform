"""Token, Referral, Notification models."""
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, ForeignKey, JSON, Index, Float, BigInteger,
)
from app.core.database import Base


class TokenTransaction(Base):
    """Token transactions history."""
    __tablename__ = "token_transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type = Column(String(20), index=True)  # buy, spend, earn, refund, referral, bonus, admin
    amount = Column(Integer, default=0)  # can be negative for spending
    balance_after = Column(Integer, default=0)
    reason = Column(String(200), nullable=True)
    reference_id = Column(String(100), nullable=True)  # order/payment id
    reference_type = Column(String(30), nullable=True)
    metadata_json = Column("metadata_json", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id, "userId": self.user_id, "type": self.type, "amount": self.amount,
            "balanceAfter": self.balance_after, "reason": self.reason,
            "referenceId": self.reference_id, "referenceType": self.reference_type,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Referral(Base):
    """User referral."""
    __tablename__ = "referrals"
    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    referred_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    code = Column(String(50), index=True)
    bonus_referrer = Column(Integer, default=0)
    bonus_referred = Column(Integer, default=0)
    status = Column(String(20), default="completed")  # pending, completed, expired
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (Index("idx_referral_unique", "referrer_id", "referred_id", unique=True),)

    def to_dict(self):
        return {
            "id": self.id, "referrerId": self.referrer_id, "referredId": self.referred_id,
            "code": self.code, "bonusReferrer": self.bonus_referrer, "bonusReferred": self.bonus_referred,
            "status": self.status, "completedAt": self.completed_at.isoformat() if self.completed_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Notification(Base):
    """User notification."""
    __tablename__ = "notifications"
    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type = Column(String(30), index=True)  # like, comment, follow, message, order, ai, system, etc.
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=True)
    icon = Column(String(10), default="🔔")
    image = Column(String(500), nullable=True)
    action_url = Column(String(500), nullable=True)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    target_type = Column(String(30), nullable=True)
    target_id = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    read_at = Column(DateTime, nullable=True)
    metadata_json = Column("metadata_json", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id, "userId": self.user_id, "type": self.type, "title": self.title,
            "body": self.body, "icon": self.icon, "image": self.image, "actionUrl": self.action_url,
            "senderId": self.sender_id, "targetType": self.target_type, "targetId": self.target_id,
            "isRead": self.is_read, "readAt": self.read_at.isoformat() if self.read_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Report(Base):
    """User report (content moderation)."""
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    target_type = Column(String(20), index=True)  # post, comment, user, startup, service
    target_id = Column(String(50), index=True)
    reason = Column(String(50))  # spam, harassment, inappropriate, scam, other
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending", index=True)  # pending, reviewing, resolved, dismissed
    resolved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    action_taken = Column(String(50), nullable=True)  # warning, content_removed, ban
    metadata_json = Column("metadata_json", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id, "reporterId": self.reporter_id, "targetType": self.target_type,
            "targetId": self.target_id, "reason": self.reason, "description": self.description,
            "status": self.status, "actionTaken": self.action_taken,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
