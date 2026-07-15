"""Marketplace endpoints."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.marketplace import Service, ServicePackage, Review, Order

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


class ServiceIn(BaseModel):
    title: str
    description: str
    category: str
    subcategory: Optional[str] = None
    price: int
    currency: str = "UZS"
    deliveryDays: int = 7
    revisions: int = 1
    images: List[str] = []
    features: List[str] = []
    tags: List[str] = []
    packages: List[dict] = []


@router.get("/services")
async def list_services(
    q: Optional[str] = None,
    category: Optional[str] = None,
    sort: str = "recent",
    minPrice: Optional[int] = None,
    maxPrice: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Service).where(Service.isActive == True)
    if q:
        query = query.where(Service.title.ilike(f"%{q}%"))
    if category:
        query = query.where(Service.category == category)
    if minPrice:
        query = query.where(Service.price >= minPrice)
    if maxPrice:
        query = query.where(Service.price <= maxPrice)

    if sort == "popular":
        query = query.order_by(Service.ordersCount.desc())
    elif sort == "rating":
        query = query.order_by(Service.rating.desc())
    elif sort == "price_low":
        query = query.order_by(Service.price.asc())
    elif sort == "price_high":
        query = query.order_by(Service.price.desc())
    else:
        query = query.order_by(Service.createdAt.desc())

    query = query.offset((page - 1) * limit).limit(limit)
    res = await db.execute(query)
    return {
        "success": True,
        "data": [s.to_dict() for s in res.scalars().all()],
        "meta": {"page": page, "limit": limit}
    }


@router.get("/services/featured")
async def featured(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Service).where(Service.isFeatured == True, Service.isActive == True).order_by(Service.rating.desc()).limit(10)
    )
    return {"success": True, "data": [s.to_dict() for s in res.scalars().all()]}


@router.get("/services/{service_id}")
async def get_service(service_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Service).where(Service.id == service_id))
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(404, "Topilmadi")
    s.viewsCount = (s.viewsCount or 0) + 1
    await db.commit()
    return {"success": True, "data": s.to_dict(include_seller=True)}


@router.post("/services", status_code=201)
async def create_service(data: ServiceIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    s = Service(
        sellerId=current_user.id,
        title=data.title,
        description=data.description,
        category=data.category,
        subcategory=data.subcategory,
        price=data.price,
        currency=data.currency,
        deliveryDays=data.deliveryDays,
        revisions=data.revisions,
        images=data.images,
        features=data.features,
        tags=data.tags,
    )
    db.add(s)
    await db.commit()
    await db.refresh(s)
    # Add packages
    for pkg in data.packages:
        db.add(ServicePackage(serviceId=s.id, **pkg))
    await db.commit()
    return {"success": True, "data": s.to_dict()}


@router.patch("/services/{service_id}")
async def update_service(service_id: int, data: ServiceIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Service).where(Service.id == service_id))
    s = res.scalar_one_or_none()
    if not s or s.sellerId != current_user.id:
        raise HTTPException(403, "Ruxsat yo'q")
    update = data.model_dump(exclude_unset=True)
    packages = update.pop("packages", None)
    for k, v in update.items():
        if v is not None:
            setattr(s, k, v)
    await db.commit()
    return {"success": True, "data": s.to_dict()}


@router.delete("/services/{service_id}")
async def delete_service(service_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Service).where(Service.id == service_id))
    s = res.scalar_one_or_none()
    if not s or s.sellerId != current_user.id:
        raise HTTPException(403, "Ruxsat yo'q")
    await db.delete(s)
    await db.commit()
    return {"success": True, "data": {"deleted": True}}


@router.get("/services/{service_id}/reviews")
async def reviews(service_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Review).where(Review.serviceId == service_id).order_by(Review.createdAt.desc()))
    return {"success": True, "data": [r.to_dict() for r in res.scalars().all()]}


class ReviewIn(BaseModel):
    rating: int
    comment: str


@router.post("/services/{service_id}/reviews", status_code=201)
async def add_review(service_id: int, data: ReviewIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    s = (await db.execute(select(Service).where(Service.id == service_id))).scalar_one_or_none()
    if not s:
        raise HTTPException(404, "Xizmat topilmadi")
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(400, "Reyting 1-5 oralig'ida")
    rev = Review(serviceId=service_id, userId=current_user.id, rating=data.rating, comment=data.comment)
    db.add(rev)
    # Update avg
    avg_res = await db.execute(select(func.avg(Review.rating), func.count(Review.id)).where(Review.serviceId == service_id))
    avg, count = avg_res.first()
    s.rating = float(avg or data.rating)
    s.reviewsCount = (count or 0) + 1
    await db.commit()
    return {"success": True, "data": rev.to_dict()}


class OrderIn(BaseModel):
    serviceId: int
    requirements: str
    deliveryDays: int = 7
    packageIndex: int = 0


@router.post("/orders", status_code=201)
async def create_order(data: OrderIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    s = (await db.execute(select(Service).where(Service.id == data.serviceId))).scalar_one_or_none()
    if not s or not s.isActive:
        raise HTTPException(404, "Xizmat topilmadi")
    if s.sellerId == current_user.id:
        raise HTTPException(400, "O'z xizmatingizga buyurtma bera olmaysiz")

    order = Order(
        serviceId=data.serviceId,
        buyerId=current_user.id,
        sellerId=s.sellerId,
        requirements=data.requirements,
        deliveryDays=data.deliveryDays,
        amount=s.price,
        currency=s.currency,
        status="pending",
        dueDate=datetime.now(timezone.utc).timestamp() + data.deliveryDays * 86400,
    )
    db.add(order)
    s.ordersCount = (s.ordersCount or 0) + 1
    await db.commit()
    await db.refresh(order)
    return {"success": True, "data": order.to_dict()}


@router.get("/orders")
async def my_orders(
    role: str = "buyer",
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    field = Order.buyerId if role == "buyer" else Order.sellerId
    query = select(Order).where(field == current_user.id)
    if status:
        query = query.where(Order.status == status)
    query = query.order_by(Order.createdAt.desc())
    res = await db.execute(query)
    return {"success": True, "data": [o.to_dict() for o in res.scalars().all()]}


@router.get("/orders/{order_id}")
async def get_order(order_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Order).where(Order.id == order_id))
    o = res.scalar_one_or_none()
    if not o or (o.buyerId != current_user.id and o.sellerId != current_user.id):
        raise HTTPException(403, "Ruxsat yo'q")
    return {"success": True, "data": o.to_dict()}


@router.post("/orders/{order_id}/accept")
async def accept_order(order_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    o = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if not o or o.sellerId != current_user.id:
        raise HTTPException(403, "Ruxsat yo'q")
    o.status = "in_progress"
    await db.commit()
    return {"success": True, "data": o.to_dict()}


@router.post("/orders/{order_id}/deliver")
async def deliver_order(order_id: int, files: List[str], message: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    o = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if not o or o.sellerId != current_user.id:
        raise HTTPException(403, "Ruxsat yo'q")
    o.status = "delivered"
    o.deliveryFiles = files
    o.deliveryMessage = message
    await db.commit()
    return {"success": True, "data": o.to_dict()}


@router.post("/orders/{order_id}/complete")
async def complete_order(order_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    o = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if not o or o.buyerId != current_user.id:
        raise HTTPException(403, "Ruxsat yo'q")
    o.status = "completed"
    o.completedAt = datetime.now(timezone.utc)
    await db.commit()
    return {"success": True, "data": o.to_dict()}


@router.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: int, reason: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    o = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if not o or (o.buyerId != current_user.id and o.sellerId != current_user.id):
        raise HTTPException(403, "Ruxsat yo'q")
    o.status = "cancelled"
    o.cancelReason = reason
    await db.commit()
    return {"success": True, "data": o.to_dict()}
