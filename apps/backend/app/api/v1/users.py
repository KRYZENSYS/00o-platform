"""User endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional

from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.api.deps import get_current_user, get_pagination, Pagination
from app.models.user import User
from app.models.chat import Follow

router = APIRouter(prefix="/users", tags=["Users"])


class UpdateIn(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    occupation: Optional[str] = None
    phone: Optional[str] = None
    username: Optional[str] = None


class PasswordIn(BaseModel):
    current: str
    new: str = Field(min_length=8)


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {"success": True, "data": current_user.to_dict(include_private=True)}


@router.patch("/me")
async def update_me(data: UpdateIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    update = data.model_dump(exclude_unset=True)
    for k, v in update.items():
        setattr(current_user, k, v)
    await db.commit()
    await db.refresh(current_user)
    return {"success": True, "data": current_user.to_dict(include_private=True)}


@router.post("/me/password")
async def change_password(data: PasswordIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not verify_password(data.current, current_user.password):
        raise HTTPException(400, "Joriy parol noto'g'ri")
    current_user.password = hash_password(data.new)
    await db.commit()
    return {"success": True, "data": {"message": "Parol yangilandi"}}


@router.get("/{username}")
async def get_by_username(username: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    return {"success": True, "data": user.to_dict(include_private=False)}


@router.post("/{user_id}/follow")
async def follow(user_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(400, "O'zingizga follow qila olmaysiz")
    target = await db.execute(select(User).where(User.id == user_id))
    if not target.scalar_one_or_none():
        raise HTTPException(404, "Foydalanuvchi topilmadi")

    existing = await db.execute(select(Follow).where(Follow.followerId == current_user.id, Follow.followingId == user_id))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Allaqachon follow qilingan")

    db.add(Follow(followerId=current_user.id, followingId=user_id))
    target_user = (await db.execute(select(User).where(User.id == user_id))).scalar_one()
    target_user.followersCount = (target_user.followersCount or 0) + 1
    current_user.followingCount = (current_user.followingCount or 0) + 1
    await db.commit()
    return {"success": True, "data": {"following": True, "followersCount": target_user.followersCount}}


@router.delete("/{user_id}/follow")
async def unfollow(user_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Follow).where(Follow.followerId == current_user.id, Follow.followingId == user_id))
    rel = existing.scalar_one_or_none()
    if rel:
        await db.delete(rel)
        target_user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if target_user and target_user.followersCount > 0:
            target_user.followersCount -= 1
        if current_user.followingCount > 0:
            current_user.followingCount -= 1
        await db.commit()
    return {"success": True, "data": {"following": False}}


@router.get("")
async def list_users(
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).where(User.isActive == True)
    if q:
        query = query.where(or_(
            User.username.ilike(f"%{q}%"),
            User.firstName.ilike(f"%{q}%"),
            User.lastName.ilike(f"%{q}%"),
        ))
    query = query.order_by(User.followersCount.desc()).offset((page - 1) * limit).limit(limit)
    res = await db.execute(query)
    users = res.scalars().all()
    return {"success": True, "data": [u.to_dict() for u in users]}


@router.get("/suggestions/list")
async def suggestions(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get suggested users to follow."""
    # Random users not following yet
    following = await db.execute(select(Follow.followingId).where(Follow.followerId == current_user.id))
    following_ids = [r[0] for r in following.all()]
    following_ids.append(current_user.id)
    query = select(User).where(User.isActive == True, User.id.notin_(following_ids)).order_by(func.random()).limit(10)
    res = await db.execute(query)
    users = res.scalars().all()
    return {"success": True, "data": [u.to_dict() for u in users]}
