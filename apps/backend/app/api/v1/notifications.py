"""Notifications, Uploads, Analytics, Admin endpoints."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
import shutil

from app.core.database import get_db
from app.core.deps import get_current_user, get_admin_user
from app.core.config import settings
from app.models.user import User
from app.models.notification import Notification
from app.models.ai import AIMessage
from app.models.startup import Startup
from app.models.marketplace import Service, Order

router = APIRouter()


# ===== NOTIFICATIONS =====

@router.get("")
async def list_notifications(
    limit: int = Query(50, le=200),
    unread: bool = False,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Notification).where(Notification.user_id == user.id)
    if unread:
        query = query.where(Notification.is_read == False)
    result = await db.execute(query.order_by(Notification.created_at.desc()).limit(limit))
    return {"success": True, "data": [n.to_dict() for n in result.scalars().all()]}


@router.post("/{notif_id}/read")
async def mark_read(notif_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.id == notif_id, Notification.user_id == user.id))
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Not found")
    n.is_read = True
    n.read_at = datetime.utcnow()
    return {"success": True, "data": {"read": True}}


@router.post("/read-all")
async def mark_all_read(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import update
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.is_read == False)
        .values(is_read=True, read_at=datetime.utcnow())
    )
    return {"success": True, "data": {"read": True}}


@router.get("/unread/count")
async def unread_count(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.count(Notification.id)).where(Notification.user_id == user.id, Notification.is_read == False)
    )
    return {"success": True, "data": {"count": result.scalar() or 0}}


# ===== UPLOADS =====

upload_router = APIRouter()

@upload_router.post("/file")
async def upload_file(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    if file.content_type not in settings.ALLOWED_FILE_TYPES and file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    filename = f"files/{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    url = f"/uploads/{filename}"
    return {"success": True, "data": {"url": url, "filename": filename, "size": len(content), "type": file.content_type}}


@upload_router.post("/image")
async def upload_image(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image type")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"images/{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    url = f"/uploads/{filename}"
    return {"success": True, "data": {"url": url, "filename": filename, "size": len(content)}}


# ===== ANALYTICS =====

analytics_router = APIRouter()

@analytics_router.get("/dashboard")
async def dashboard(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    today = datetime.utcnow().date()
    week_ago = datetime.utcnow() - timedelta(days=7)
    month_ago = datetime.utcnow() - timedelta(days=30)

    startups = await db.execute(select(func.count(Startup.id)).where(Startup.owner_id == user.id))
    ai_today = await db.execute(
        select(func.count(AIMessage.id)).where(AIMessage.user_id == user.id, func.date(AIMessage.created_at) == today)
    )
    ai_week = await db.execute(
        select(func.count(AIMessage.id)).where(AIMessage.user_id == user.id, AIMessage.created_at >= week_ago)
    )
    orders = await db.execute(
        select(func.count(Order.id)).where(or_(Order.buyer_id == user.id, Order.seller_id == user.id))
    )

    return {
        "success": True,
        "data": {
            "startups": startups.scalar() or 0,
            "aiUsage": {"today": ai_today.scalar() or 0, "week": ai_week.scalar() or 0},
            "orders": orders.scalar() or 0,
            "followers": user.followers_count,
            "following": user.following_count,
            "tokens": user.tokens,
            "xp": user.xp,
            "level": user.level,
        }
    }


@analytics_router.get("/user")
async def user_analytics(period: str = "30d", user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    days = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}.get(period, 30)
    since = datetime.utcnow() - timedelta(days=days)
    ai_count = await db.execute(
        select(func.count(AIMessage.id)).where(AIMessage.user_id == user.id, AIMessage.created_at >= since)
    )
    return {"success": True, "data": {"period": period, "aiMessages": ai_count.scalar() or 0}}


@analytics_router.get("/platform")
async def platform_analytics(db: AsyncSession = Depends(get_db)):
    users = await db.execute(select(func.count(User.id)))
    startups = await db.execute(select(func.count(Startup.id)))
    services = await db.execute(select(func.count(Service.id)))
    orders = await db.execute(select(func.count(Order.id)))
    return {
        "success": True,
        "data": {
            "users": users.scalar() or 0,
            "startups": startups.scalar() or 0,
            "services": services.scalar() or 0,
            "orders": orders.scalar() or 0,
        }
    }


# ===== ADMIN =====

admin_router = APIRouter()

@admin_router.get("/stats")
async def admin_stats(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    users = await db.execute(select(func.count(User.id)))
    active_users = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    premium = await db.execute(select(func.count(User.id)).where(User.is_premium == True))
    startups = await db.execute(select(func.count(Startup.id)))
    services = await db.execute(select(func.count(Service.id)))
    orders = await db.execute(select(func.count(Order.id)))
    revenue = await db.execute(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == "completed"))

    today = datetime.utcnow().date()
    new_today = await db.execute(select(func.count(User.id)).where(func.date(User.created_at) == today))
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_week = await db.execute(select(func.count(User.id)).where(User.created_at >= week_ago))

    return {
        "success": True,
        "data": {
            "totalUsers": users.scalar() or 0,
            "activeUsers": active_users.scalar() or 0,
            "premiumUsers": premium.scalar() or 0,
            "totalStartups": startups.scalar() or 0,
            "totalServices": services.scalar() or 0,
            "totalOrders": orders.scalar() or 0,
            "totalRevenue": revenue.scalar() or 0,
            "newUsersToday": new_today.scalar() or 0,
            "newUsersWeek": new_week.scalar() or 0,
        }
    }


@admin_router.get("/users")
async def admin_list_users(
    q: Optional[str] = None,
    role: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)
    if q:
        query = query.where(or_(User.username.ilike(f"%{q}%"), User.email.ilike(f"%{q}%")))
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query.order_by(User.created_at.desc()).limit(limit).offset(offset))
    return {"success": True, "data": [u.to_dict() for u in result.scalars().all()]}


@admin_router.post("/users/{user_id}/ban")
async def ban_user(user_id: str, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")
    user.is_active = False
    return {"success": True, "data": {"banned": True}}


@admin_router.post("/users/{user_id}/unban")
async def unban_user(user_id: str, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    return {"success": True, "data": {"unbanned": True}}


@admin_router.get("/reports")
async def admin_reports(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    # Placeholder
    return {"success": True, "data": []}


@admin_router.post("/reports/{report_id}/resolve")
async def resolve_report(report_id: int, data: dict, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    return {"success": True, "data": {"resolved": True}}
