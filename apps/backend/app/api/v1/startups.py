"""Startup endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.security import generate_slug
from app.api.deps import get_current_user
from app.models.user import User
from app.models.startup import Startup, StartupMember, StartupUpdate
from app.models.chat import Like

router = APIRouter(prefix="/startups", tags=["Startups"])


class StartupIn(BaseModel):
    name: str
    tagline: Optional[str] = None
    description: str
    category: str
    stage: str = "idea"
    location: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    logo: Optional[str] = None
    coverImage: Optional[str] = None
    fundingGoal: int = 0
    currency: str = "USD"
    problem: Optional[str] = None
    solution: Optional[str] = None
    tags: List[str] = []


@router.get("")
async def list_startups(
    q: Optional[str] = None,
    category: Optional[str] = None,
    stage: Optional[str] = None,
    sort: str = "recent",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Startup)
    if q:
        query = query.where(or_(
            Startup.name.ilike(f"%{q}%"),
            Startup.description.ilike(f"%{q}%"),
            Startup.tagline.ilike(f"%{q}%"),
        ))
    if category:
        query = query.where(Startup.category == category)
    if stage:
        query = query.where(Startup.stage == stage)

    if sort == "popular":
        query = query.order_by((Startup.viewsCount + Startup.likesCount * 2).desc())
    elif sort == "funding":
        query = query.order_by(Startup.fundingRaised.desc())
    else:
        query = query.order_by(Startup.createdAt.desc())

    query = query.offset((page - 1) * limit).limit(limit)
    res = await db.execute(query)
    items = res.scalars().all()
    total = await db.execute(select(func.count(Startup.id)))
    return {
        "success": True,
        "data": [s.to_dict() for s in items],
        "meta": {"page": page, "limit": limit, "total": total.scalar()}
    }


@router.get("/featured")
async def featured(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Startup).where(Startup.isFeatured == True).order_by(Startup.likesCount.desc()).limit(10)
    )
    return {"success": True, "data": [s.to_dict() for s in res.scalars().all()]}


@router.get("/trending")
async def trending(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Startup).order_by((Startup.viewsCount * 0.3 + Startup.likesCount * 0.7).desc()).limit(10)
    )
    return {"success": True, "data": [s.to_dict() for s in res.scalars().all()]}


@router.post("", status_code=201)
async def create(data: StartupIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    slug = generate_slug(data.name)
    # Ensure unique
    existing = await db.execute(select(Startup).where(Startup.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{int(__import__('time').time())}"

    s = Startup(
        ownerId=current_user.id,
        slug=slug,
        name=data.name,
        tagline=data.tagline,
        description=data.description,
        category=data.category,
        stage=data.stage,
        location=data.location,
        website=data.website,
        email=data.email,
        phone=data.phone,
        logo=data.logo,
        coverImage=data.coverImage,
        fundingGoal=data.fundingGoal,
        currency=data.currency,
        problem=data.problem,
        solution=data.solution,
        tags=data.tags,
    )
    db.add(s)
    await db.commit()
    await db.refresh(s)

    # Add owner as team member
    db.add(StartupMember(startupId=s.id, userId=current_user.id, role="Founder"))
    current_user.startupsCount = (current_user.startupsCount or 0) + 1
    await db.commit()
    await db.refresh(s)
    return {"success": True, "data": s.to_dict()}


@router.get("/{slug}")
async def get(slug: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Startup).where(Startup.slug == slug))
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(404, "Topilmadi")
    s.viewsCount = (s.viewsCount or 0) + 1
    await db.commit()
    await db.refresh(s)
    return {"success": True, "data": s.to_dict()}


@router.patch("/{startup_id}")
async def update(startup_id: int, data: StartupIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Startup).where(Startup.id == startup_id))
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(404, "Topilmadi")
    if s.ownerId != current_user.id and current_user.role != "admin":
        raise HTTPException(403, "Ruxsat yo'q")

    update = data.model_dump(exclude_unset=True)
    for k, v in update.items():
        if v is not None:
            setattr(s, k, v)
    await db.commit()
    await db.refresh(s)
    return {"success": True, "data": s.to_dict()}


@router.delete("/{startup_id}")
async def delete(startup_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Startup).where(Startup.id == startup_id))
    s = res.scalar_one_or_none()
    if not s or (s.ownerId != current_user.id and current_user.role != "admin"):
        raise HTTPException(403, "Ruxsat yo'q")
    await db.delete(s)
    await db.commit()
    return {"success": True, "data": {"deleted": True}}


@router.post("/{startup_id}/like")
async def like(startup_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Startup).where(Startup.id == startup_id))
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(404, "Topilmadi")
    existing = await db.execute(select(Like).where(Like.userId == current_user.id, Like.targetType == "startup", Like.targetId == startup_id))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Allaqachon yoqtirilgan")
    db.add(Like(userId=current_user.id, targetType="startup", targetId=startup_id))
    s.likesCount = (s.likesCount or 0) + 1
    await db.commit()
    return {"success": True, "data": {"liked": True, "likesCount": s.likesCount}}


@router.delete("/{startup_id}/like")
async def unlike(startup_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Like).where(Like.userId == current_user.id, Like.targetType == "startup", Like.targetId == startup_id))
    like_obj = res.scalar_one_or_none()
    if like_obj:
        await db.delete(like_obj)
        s_res = await db.execute(select(Startup).where(Startup.id == startup_id))
        s = s_res.scalar_one_or_none()
        if s and s.likesCount > 0:
            s.likesCount -= 1
            await db.commit()
    return {"success": True, "data": {"liked": False}}


@router.get("/{startup_id}/team")
async def team(startup_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(StartupMember).where(StartupMember.startupId == startup_id))
    return {"success": True, "data": [m.to_dict() for m in res.scalars().all()]}


@router.get("/{startup_id}/updates")
async def updates(startup_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(StartupUpdate).where(StartupUpdate.startupId == startup_id).order_by(StartupUpdate.createdAt.desc())
    )
    return {"success": True, "data": [u.to_dict() for u in res.scalars().all()]}


class UpdateIn(BaseModel):
    title: str
    content: str
    image: Optional[str] = None


@router.post("/{startup_id}/updates", status_code=201)
async def add_update(startup_id: int, data: UpdateIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    s = (await db.execute(select(Startup).where(Startup.id == startup_id))).scalar_one_or_none()
    if not s or s.ownerId != current_user.id:
        raise HTTPException(403, "Ruxsat yo'q")
    upd = StartupUpdate(startupId=startup_id, **data.model_dump())
    db.add(upd)
    await db.commit()
    await db.refresh(upd)
    return {"success": True, "data": upd.to_dict()}
