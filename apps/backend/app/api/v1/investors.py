"""Investor endpoints."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.jobs import Investor, Pitch

router = APIRouter()


class InvestorRegister(BaseModel):
    firmName: Optional[str] = None
    fundType: str = "angel"
    bio: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    logo: Optional[str] = None
    checkSizeMin: Optional[float] = None
    checkSizeMax: Optional[float] = None
    currency: str = "USD"
    stages: List[str] = []
    industries: List[str] = []
    locations: List[str] = []


class InvestorUpdate(BaseModel):
    firmName: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    checkSizeMin: Optional[float] = None
    checkSizeMax: Optional[float] = None
    stages: Optional[List[str]] = None
    industries: Optional[List[str]] = None
    isActive: Optional[bool] = None


class PitchCreate(BaseModel):
    investorId: int
    startupId: int
    title: str
    pitch: str
    deckUrl: Optional[str] = None
    fundingAmount: Optional[float] = None
    equityOffered: Optional[float] = None


@router.get("")
async def list_investors(
    fundType: Optional[str] = None,
    stage: Optional[str] = None,
    industry: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Investor, User).join(User, User.id == Investor.user_id).where(Investor.is_active == True)
    if fundType:
        query = query.where(Investor.fund_type == fundType)
    result = await db.execute(query.order_by(Investor.is_verified.desc(), Investor.total_invested.desc()).limit(limit))
    items = []
    for inv, u in result.all():
        data = inv.to_dict()
        data["user"] = u.to_dict()
        items.append(data)
    return {"success": True, "data": items}


@router.get("/pitches/me")
async def my_pitches(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Pitch).where(Pitch.user_id == user.id).order_by(Pitch.created_at.desc())
    )
    return {"success": True, "data": [p.to_dict() for p in result.scalars().all()]}


@router.post("", status_code=201)
async def register_investor(data: InvestorRegister, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check if already registered
    existing = await db.execute(select(Investor).where(Investor.user_id == user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already registered as investor")
    investor = Investor(user_id=user.id, **data.model_dump())
    db.add(investor)
    user.role = "investor"
    await db.flush()
    return {"success": True, "data": investor.to_dict()}


@router.get("/{investor_id}")
async def get_investor(investor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Investor, User)
        .join(User, User.id == Investor.user_id)
        .where(Investor.id == investor_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Investor not found")
    inv, u = row
    data = inv.to_dict()
    data["user"] = u.to_dict()
    return {"success": True, "data": data}


@router.patch("/{investor_id}")
async def update_investor(investor_id: int, data: InvestorUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Investor).where(Investor.id == investor_id))
    investor = result.scalar_one_or_none()
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    if investor.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(investor, k, v)
    return {"success": True, "data": investor.to_dict()}


@router.get("/{investor_id}/portfolio")
async def get_portfolio(investor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Investor).where(Investor.id == investor_id))
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investor not found")
    return {"success": True, "data": inv.portfolio or []}


@router.post("/{investor_id}/pitch", status_code=201)
async def send_pitch(investor_id: int, data: PitchCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Investor).where(Investor.id == investor_id))
    investor = result.scalar_one_or_none()
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    pitch = Pitch(
        investor_id=investor_id,
        startup_id=data.startupId,
        user_id=user.id,
        title=data.title,
        pitch=data.pitch,
        deck_url=data.deckUrl,
        funding_amount=data.fundingAmount,
        equity_offered=data.equityOffered,
    )
    db.add(pitch)
    investor.investments_count = (investor.investments_count or 0) + 1
    await db.flush()
    return {"success": True, "data": pitch.to_dict()}
