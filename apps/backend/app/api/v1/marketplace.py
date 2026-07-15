"""Marketplace, Jobs, Investors, Chats, Feed endpoints - all in one file for batch."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from pydantic import BaseModel
from typing import Optional, List
import re

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.marketplace import Service, Order, Review
from app.models.jobs import Job, JobApplication, Investor, Pitch
from app.models.chat import Chat, Message, Post, Comment, Like
from app.models.payment import Payment
from app.models.notification import Notification


def slugify(text: str) -> str:
    s = re.sub(r'[^\w\s-]', '', text.lower().strip())
    s = re.sub(r'[\s_-]+', '-', s)
    return s.strip('-')[:100]


# ================== MARKETPLACE ==================
marketplace_router = APIRouter()

class ServiceCreate(BaseModel):
    title: str
    description: str
    category: str
    subcategory: Optional[str] = None
    price: float
    priceType: str = "fixed"
    deliveryDays: int = 7
    tags: List[str] = []
    packages: List[dict] = []
    faqs: List[dict] = []
    cover: Optional[str] = None

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    deliveryDays: Optional[int] = None
    tags: Optional[List[str]] = None
    isActive: Optional[bool] = None

class OrderCreate(BaseModel):
    serviceId: int
    packageName: Optional[str] = None
    requirements: Optional[str] = None


@marketplace_router.get("/categories")
async def get_categories():
    return {"success": True, "data": [
        {"id": "design", "name": "Dizayn", "icon": "🎨"},
        {"id": "development", "name": "Dasturlash", "icon": "💻"},
        {"id": "marketing", "name": "Marketing", "icon": "📈"},
        {"id": "writing", "name": "Kontent yozish", "icon": "✍️"},
        {"id": "video", "name": "Video production", "icon": "🎬"},
        {"id": "audio", "name": "Audio production", "icon": "🎵"},
        {"id": "business", "name": "Biznes konsultatsiya", "icon": "💼"},
        {"id": "ai", "name": "AI xizmatlari", "icon": "🤖"},
        {"id": "translation", "name": "Tarjima", "icon": "🌐"},
        {"id": "legal", "name": "Yuridik", "icon": "⚖️"},
        {"id": "finance", "name": "Moliyaviy", "icon": "💰"},
        {"id": "coaching", "name": "Koučing", "icon": "🎯"},
    ]}

@marketplace_router.get("/services")
async def list_services(
    q: Optional[str] = None,
    category: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    featured: bool = False,
    limit: int = Query(20, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    query = select(Service).where(Service.is_active == True)
    if q:
        query = query.where(or_(Service.title.ilike(f"%{q}%"), Service.description.ilike(f"%{q}%")))
    if category:
        query = query.where(Service.category == category)
    if minPrice is not None:
        query = query.where(Service.price >= minPrice)
    if maxPrice is not None:
        query = query.where(Service.price <= maxPrice)
    if featured:
        query = query.where(Service.is_featured == True)
    query = query.order_by(Service.is_featured.desc(), Service.rating.desc(), Service.orders_count.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return {"success": True, "data": [s.to_dict() for s in result.scalars().all()]}

@marketplace_router.get("/services/me")
async def my_services(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.seller_id == user.id).order_by(Service.created_at.desc()))
    return {"success": True, "data": [s.to_dict() for s in result.scalars().all()]}

@marketplace_router.post("/services", status_code=201)
async def create_service(data: ServiceCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    base_slug = slugify(data.title)
    slug = base_slug
    i = 1
    while True:
        check = await db.execute(select(Service).where(Service.slug == slug))
        if not check.scalar_one_or_none():
            break
        i += 1
        slug = f"{base_slug}-{i}"
    service = Service(slug=slug, seller_id=user.id, **data.model_dump())
    db.add(service)
    await db.flush()
    return {"success": True, "data": service.to_dict()}

@marketplace_router.get("/services/{service_id}")
async def get_service(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    service.views_count = (service.views_count or 0) + 1
    return {"success": True, "data": service.to_dict()}

@marketplace_router.patch("/services/{service_id}")
async def update_service(service_id: int, data: ServiceUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if service.seller_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(service, k, v)
    return {"success": True, "data": service.to_dict()}

@marketplace_router.delete("/services/{service_id}")
async def delete_service(service_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if service.seller_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.delete(service)
    return {"success": True, "data": {"deleted": True}}

@marketplace_router.post("/orders", status_code=201)
async def create_order(data: OrderCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.id == data.serviceId))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if service.seller_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot order own service")
    order = Order(
        service_id=data.serviceId,
        buyer_id=user.id,
        seller_id=service.seller_id,
        package_name=data.packageName,
        requirements=data.requirements,
        amount=service.price,
        currency=service.currency,
        deadline=datetime.utcnow() + __import__('datetime').timedelta(days=service.delivery_days),
    )
    db.add(order)
    await db.flush()
    return {"success": True, "data": order.to_dict()}

@marketplace_router.get("/orders")
async def list_orders(status: Optional[str] = None, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    query = select(Order).where(or_(Order.buyer_id == user.id, Order.seller_id == user.id))
    if status:
        query = query.where(Order.status == status)
    result = await db.execute(query.order_by(Order.created_at.desc()))
    return {"success": True, "data": [o.to_dict() for o in result.scalars().all()]}

@marketplace_router.get("/orders/{order_id}")
async def get_order(order_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order or (order.buyer_id != user.id and order.seller_id != user.id and user.role != "admin"):
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "data": order.to_dict()}

@marketplace_router.patch("/orders/{order_id}")
async def update_order(order_id: int, data: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != user.id and order.seller_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in data.items():
        if hasattr(order, k) and k not in ('id', 'buyer_id', 'seller_id', 'service_id'):
            setattr(order, k, v)
    if data.get("status") == "delivered":
        order.delivered_at = datetime.utcnow()
    elif data.get("status") == "completed":
        order.completed_at = datetime.utcnow()
    return {"success": True, "data": order.to_dict()}

@marketplace_router.get("/services/{service_id}/reviews")
async def get_reviews(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review, User)
        .join(User, User.id == Review.user_id)
        .where(Review.service_id == service_id)
        .order_by(Review.created_at.desc())
    )
    reviews = []
    for r, u in result.all():
        reviews.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "user": {"username": u.username, "avatar": u.avatar, "firstName": u.first_name} if not r.is_anonymous else None,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
        })
    return {"success": True, "data": reviews}

@marketplace_router.post("/services/{service_id}/reviews", status_code=201)
async def create_review(service_id: int, data: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    review = Review(
        service_id=service_id,
        user_id=user.id,
        rating=data.get("rating", 5),
        comment=data.get("comment"),
        is_anonymous=data.get("isAnonymous", False),
    )
    db.add(review)
    # Update service rating
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.service_id == service_id)
    )
    avg, count = result.one()
    svc_result = await db.execute(select(Service).where(Service.id == service_id))
    service = svc_result.scalar_one_or_none()
    if service:
        service.rating = avg or 0
        service.reviews_count = count
    await db.flush()
    return {"success": True, "data": {"id": review.id}}
