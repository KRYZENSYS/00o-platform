"""Marketplace models: Service, Order, Review."""
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(80), index=True)  # design, dev, marketing, etc
    subcategory: Mapped[Optional[str]] = mapped_column(String(80))
    cover: Mapped[Optional[str]] = mapped_column(String(500))
    gallery: Mapped[list] = mapped_column(JSON, default=list)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    price_type: Mapped[str] = mapped_column(String(20), default="fixed")  # fixed, hourly, starting
    currency: Mapped[str] = mapped_column(String(10), default="UZS")
    delivery_days: Mapped[int] = mapped_column(Integer, default=7)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    packages: Mapped[list] = mapped_column(JSON, default=list)  # [{name, price, days, features}]
    faqs: Mapped[list] = mapped_column(JSON, default=list)

    seller_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

    orders_count: Mapped[int] = mapped_column(Integer, default=0)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "subcategory": self.subcategory,
            "cover": self.cover,
            "gallery": self.gallery,
            "price": self.price,
            "priceType": self.price_type,
            "currency": self.currency,
            "deliveryDays": self.delivery_days,
            "tags": self.tags,
            "packages": self.packages,
            "faqs": self.faqs,
            "sellerId": self.seller_id,
            "isActive": self.is_active,
            "isFeatured": self.is_featured,
            "ordersCount": self.orders_count,
            "viewsCount": self.views_count,
            "rating": self.rating,
            "reviewsCount": self.reviews_count,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    service_id: Mapped[int] = mapped_column(Integer, ForeignKey("services.id", ondelete="CASCADE"), index=True)
    buyer_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    seller_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    package_name: Mapped[Optional[str]] = mapped_column(String(100))
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10), default="UZS")
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, in_progress, delivered, completed, cancelled, refunded
    requirements: Mapped[Optional[str]] = mapped_column(Text)
    delivery_files: Mapped[list] = mapped_column(JSON, default=list)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    cancelled_reason: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "serviceId": self.service_id,
            "buyerId": self.buyer_id,
            "sellerId": self.seller_id,
            "packageName": self.package_name,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "requirements": self.requirements,
            "deliveryFiles": self.delivery_files,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "deliveredAt": self.delivered_at.isoformat() if self.delivered_at else None,
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    service_id: Mapped[int] = mapped_column(Integer, ForeignKey("services.id", ondelete="CASCADE"), index=True)
    order_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("orders.id", ondelete="SET NULL"))
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    rating: Mapped[float] = mapped_column(Float)  # 1-5
    comment: Mapped[Optional[str]] = mapped_column(Text)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
