"""Startup endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from pydantic import BaseModel
from typing import Optional, List
import re

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.startup import Startup, StartupMember, StartupFunding, StartupMetric

router = APIRouter()


def slugify(text: str) -> str:
    s = re.sub(r'[^\w\s-]', '', text.lower().strip())
    s = re.sub(r'[\s_-]+', '-', s)
    return s.strip('-')


class StartupCreate(BaseModel):
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    stage: str = "idea"
    location: Optional[str] = None
    website: Optional[str] = None
    tags: List[str] = []
    logo: Optional[str] = None
    cover: Optional[str] = None


class StartupUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    funding_stage: Optional[str] = None
    funding_amount: Optional[float] = None
    location: Optional[str] = None
    website: Optional[str] = None
    tags: Optional[List[str]] = None
    is_hiring: Optional[bool] = None
    logo: Optional[str] = None
    cover: Optional[str] = None


@router.get("")
async def list_startups(
    q: Optional[str] = None,
    industry: Optional[str] = None,
    stage: Optional[str] = None,
    featured: bool = False,
    limit: int = Query(20, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List startups with filters."""
    query = select(Startup).where(Startup.is_published == True)
    if q:
        query = query.where(or_(
            Startup.name.ilike(f"%{q}%"),
            Startup.tagline.ilike(f"%{q}%"),
            Startup.description.ilike(f"%{q}%"),
        ))
    if industry:
        query = query.where(Startup.industry == industry)
    if stage:
        query = query.where(Startup.stage == stage)
    if featured:
        query = query.where(Startup.is_featured == True)
    query = query.order_by(Startup.is_featured.desc(), Startup.views_count.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return {"success": True, "data": [s.to_dict() for s in result.scalars().all()]}


@router.get("/me/all")
async def my_startups(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's startups."""
    result = await db.execute(
        select(Startup).where(Startup.owner_id == user.id).order_by(Startup.created_at.desc())
    )
    return {"success": True, "data": [s.to_dict() for s in result.scalars().all()]}


@router.post("", status_code=201)
async def create_startup(
    data: StartupCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create new startup."""
    base_slug = slugify(data.name)
    slug = base_slug
    i = 1
    while True:
        check = await db.execute(select(Startup).where(Startup.slug == slug))
        if not check.scalar_one_or_none():
            break
        i += 1
        slug = f"{base_slug}-{i}"

    startup = Startup(
        slug=slug,
        name=data.name,
        tagline=data.tagline,
        description=data.description,
        industry=data.industry,
        stage=data.stage,
        location=data.location,
        website=data.website,
        tags=data.tags,
        logo=data.logo,
        cover=data.cover,
        owner_id=user.id,
    )
    db.add(startup)
    await db.flush()

    # Add creator as founder
    member = StartupMember(
        startup_id=startup.id,
        user_id=user.id,
        role="founder",
        equity=100,
        is_founder=True,
    )
    db.add(member)
    await db.flush()

    return {"success": True, "data": startup.to_dict()}


@router.get("/slug/{slug}")
async def get_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Get startup by slug."""
    result = await db.execute(select(Startup).where(Startup.slug == slug))
    startup = result.scalar_one_or_none()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")

    # Increment views
    startup.views_count = (startup.views_count or 0) + 1
    return {"success": True, "data": startup.to_dict()}


@router.get("/{startup_id}")
async def get_startup(
    startup_id: int,
    db: AsyncSession = Depends(get_db),
    current: Optional[User] = Depends(get_current_user_optional),
):
    """Get startup by ID."""
    result = await db.execute(select(Startup).where(Startup.id == startup_id))
    startup = result.scalar_one_or_none()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")

    # Increment views
    startup.views_count = (startup.views_count or 0) + 1

    # Get team
    team_result = await db.execute(
        select(StartupMember, User)
        .join(User, User.id == StartupMember.user_id)
        .where(StartupMember.startup_id == startup_id)
    )
    team = [{"user": u.to_dict(), "role": m.role, "equity": m.equity, "isFounder": m.is_founder} for m, u in team_result.all()]

    data = startup.to_dict()
    data["team"] = team
    return {"success": True, "data": data}


@router.patch("/{startup_id}")
async def update_startup(
    startup_id: int,
    data: StartupUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update startup."""
    result = await db.execute(select(Startup).where(Startup.id == startup_id))
    startup = result.scalar_one_or_none()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    if startup.owner_id != user.id and user.role not in ("admin", "moderator"):
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in data.model_dump(exclude_none=True).items():
        setattr(startup, key, value)
    return {"success": True, "data": startup.to_dict()}


@router.delete("/{startup_id}")
async def delete_startup(
    startup_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete startup."""
    result = await db.execute(select(Startup).where(Startup.id == startup_id))
    startup = result.scalar_one_or_none()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    if startup.owner_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.delete(startup)
    return {"success": True, "data": {"deleted": True}}


@router.get("/{startup_id}/team")
async def get_team(startup_id: int, db: AsyncSession = Depends(get_db)):
    """Get startup team."""
    result = await db.execute(
        select(StartupMember, User)
        .join(User, User.id == StartupMember.user_id)
        .where(StartupMember.startup_id == startup_id)
    )
    team = [{"user": u.to_dict(), "role": m.role, "equity": m.equity, "isFounder": m.is_founder} for m, u in result.all()]
    return {"success": True, "data": team}


@router.post("/{startup_id}/team")
async def add_team_member(
    startup_id: int,
    data: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add team member."""
    result = await db.execute(select(Startup).where(Startup.id == startup_id))
    startup = result.scalar_one_or_none()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    if startup.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    member = StartupMember(
        startup_id=startup_id,
        user_id=data.get("userId"),
        role=data.get("role", "member"),
        equity=data.get("equity", 0),
        is_founder=data.get("isFounder", False),
    )
    db.add(member)
    await db.flush()
    return {"success": True, "data": {"id": member.id}}


@router.get("/{startup_id}/fundings")
async def get_fundings(startup_id: int, db: AsyncSession = Depends(get_db)):
    """Get startup funding history."""
    result = await db.execute(
        select(StartupFunding)
        .where(StartupFunding.startup_id == startup_id)
        .order_by(StartupFunding.announced_at.desc())
    )
    fundings = [
        {
            "id": f.id,
            "round": f.round,
            "amount": f.amount,
            "currency": f.currency,
            "investors": f.investors,
            "announcedAt": f.announced_at.isoformat() if f.announced_at else None,
        }
        for f in result.scalars().all()
    ]
    return {"success": True, "data": fundings}


@router.post("/{startup_id}/fundings", status_code=201)
async def add_funding(
    startup_id: int,
    data: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add funding round."""
    result = await db.execute(select(Startup).where(Startup.id == startup_id))
    startup = result.scalar_one_or_none()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    if startup.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    from datetime import datetime
    funding = StartupFunding(
        startup_id=startup_id,
        round=data.get("round", "seed"),
        amount=data.get("amount", 0),
        currency=data.get("currency", "USD"),
        investors=data.get("investors", ""),
        announced_at=datetime.utcnow(),
    )
    db.add(funding)
    startup.funding_amount = (startup.funding_amount or 0) + data.get("amount", 0)
    await db.flush()
    return {"success": True, "data": {"id": funding.id}}


@router.get("/{startup_id}/metrics")
async def get_metrics(startup_id: int, db: AsyncSession = Depends(get_db)):
    """Get startup metrics."""
    result = await db.execute(
        select(StartupMetric)
        .where(StartupMetric.startup_id == startup_id)
        .order_by(StartupMetric.date.desc())
        .limit(30)
    )
    return {
        "success": True,
        "data": [
            {
                "date": m.date.isoformat() if m.date else None,
                "revenue": m.revenue,
                "users": m.users,
                "activeUsers": m.active_users,
                "mrr": m.mrr,
                "arr": m.arr,
                "burnRate": m.burn_rate,
                "runwayMonths": m.runway_months,
            }
            for m in result.scalars().all()
        ]
    }
