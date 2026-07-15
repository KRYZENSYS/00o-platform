"""User endpoints."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from pydantic import BaseModel
from typing import Optional
import os
import uuid

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional
from app.core.config import settings
from app.models.user import User, Follow

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    notificationSettings: Optional[dict] = None
    privacySettings: Optional[dict] = None


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user."""
    return {"success": True, "data": user.to_dict()}


@router.patch("/me")
async def update_me(
    data: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user."""
    update_data = data.model_dump(exclude_none=True)
    field_map = {
        "firstName": "first_name",
        "lastName": "last_name",
        "notificationSettings": "notification_settings",
        "privacySettings": "privacy_settings",
    }
    for key, value in update_data.items():
        setattr(user, field_map.get(key, key), value)

    user.updated_at = datetime.utcnow()
    return {"success": True, "data": user.to_dict()}


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload user avatar."""
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"avatars/{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    user.avatar = f"/uploads/{filename}"
    return {"success": True, "data": {"url": user.avatar, "user": user.to_dict()}}


@router.get("/me/stats")
async def get_my_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user stats."""
    return {
        "success": True,
        "data": {
            "followers": user.followers_count,
            "following": user.following_count,
            "posts": user.posts_count,
            "rating": user.rating,
            "reviews": user.reviews_count,
            "tokens": user.tokens,
            "xp": user.xp,
            "level": user.level,
        }
    }


@router.get("/by/{username}")
async def get_by_username(
    username: str,
    db: AsyncSession = Depends(get_db),
    current: Optional[User] = Depends(get_current_user_optional),
):
    """Get user by username."""
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_following = False
    if current:
        f = await db.execute(
            select(Follow).where(
                Follow.follower_id == current.id,
                Follow.following_id == user.id,
            )
        )
        is_following = f.scalar_one_or_none() is not None

    data = user.to_dict()
    data["isFollowing"] = is_following
    return {"success": True, "data": data}


@router.get("/{user_id}")
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current: Optional[User] = Depends(get_current_user_optional),
):
    """Get user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_following = False
    if current:
        f = await db.execute(
            select(Follow).where(
                Follow.follower_id == current.id,
                Follow.following_id == user.id,
            )
        )
        is_following = f.scalar_one_or_none() is not None

    data = user.to_dict()
    data["isFollowing"] = is_following
    return {"success": True, "data": data}


@router.get("/search/all")
async def search_users(
    q: str = "",
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Search users."""
    if not q or len(q) < 2:
        return {"success": True, "data": []}
    result = await db.execute(
        select(User)
        .where(or_(
            User.username.ilike(f"%{q}%"),
            User.first_name.ilike(f"%{q}%"),
            User.last_name.ilike(f"%{q}%"),
        ))
        .limit(limit)
    )
    users = result.scalars().all()
    return {"success": True, "data": [u.to_dict() for u in users]}


@router.post("/{user_id}/follow")
async def follow_user(
    user_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Follow a user."""
    if user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    target = await db.execute(select(User).where(User.id == user_id))
    target_user = target.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.execute(
        select(Follow).where(
            Follow.follower_id == user.id,
            Follow.following_id == user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already following")

    follow = Follow(follower_id=user.id, following_id=user_id)
    db.add(follow)
    user.following_count = (user.following_count or 0) + 1
    target_user.followers_count = (target_user.followers_count or 0) + 1

    return {"success": True, "data": {"following": True}}


@router.delete("/{user_id}/follow")
async def unfollow_user(
    user_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Unfollow a user."""
    result = await db.execute(
        select(Follow).where(
            Follow.follower_id == user.id,
            Follow.following_id == user_id,
        )
    )
    follow = result.scalar_one_or_none()
    if not follow:
        raise HTTPException(status_code=400, detail="Not following")

    await db.delete(follow)
    user.following_count = max(0, (user.following_count or 0) - 1)
    target = await db.execute(select(User).where(User.id == user_id))
    target_user = target.scalar_one_or_none()
    if target_user:
        target_user.followers_count = max(0, (target_user.followers_count or 0) - 1)

    return {"success": True, "data": {"following": False}}


@router.get("/{user_id}/followers")
async def get_followers(user_id: str, db: AsyncSession = Depends(get_db), limit: int = 50):
    """Get user followers."""
    result = await db.execute(
        select(User)
        .join(Follow, Follow.follower_id == User.id)
        .where(Follow.following_id == user_id)
        .limit(limit)
    )
    return {"success": True, "data": [u.to_dict() for u in result.scalars().all()]}


@router.get("/{user_id}/following")
async def get_following(user_id: str, db: AsyncSession = Depends(get_db), limit: int = 50):
    """Get users that this user follows."""
    result = await db.execute(
        select(User)
        .join(Follow, Follow.following_id == User.id)
        .where(Follow.follower_id == user_id)
        .limit(limit)
    )
    return {"success": True, "data": [u.to_dict() for u in result.scalars().all()]}
