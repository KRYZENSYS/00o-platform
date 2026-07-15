"""Jobs endpoints."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.jobs import Job, JobApplication

router = APIRouter()


class JobCreate(BaseModel):
    title: str
    company: Optional[str] = None
    description: str
    requirements: List[str] = []
    benefits: List[str] = []
    skills: List[str] = []
    jobType: str = "full-time"
    workMode: str = "remote"
    experienceLevel: str = "mid"
    salaryMin: Optional[float] = None
    salaryMax: Optional[float] = None
    currency: str = "UZS"
    isNegotiable: bool = False
    location: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    startupId: Optional[int] = None
    isUrgent: bool = False
    expiresInDays: int = 30


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    salaryMin: Optional[float] = None
    salaryMax: Optional[float] = None
    isActive: Optional[bool] = None
    isUrgent: Optional[bool] = None


class ApplyRequest(BaseModel):
    coverLetter: Optional[str] = None
    resumeUrl: Optional[str] = None
    expectedSalary: Optional[float] = None


import re
def _slugify(text):
    s = re.sub(r'[^\w\s-]', '', text.lower().strip())
    s = re.sub(r'[\s_-]+', '-', s)
    return s.strip('-')[:100]


@router.get("")
async def list_jobs(
    q: Optional[str] = None,
    jobType: Optional[str] = None,
    workMode: Optional[str] = None,
    experienceLevel: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    featured: bool = False,
    limit: int = Query(20, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    query = select(Job).where(Job.is_active == True)
    if q:
        query = query.where(or_(Job.title.ilike(f"%{q}%"), Job.description.ilike(f"%{q}%")))
    if jobType:
        query = query.where(Job.job_type == jobType)
    if workMode:
        query = query.where(Job.work_mode == workMode)
    if experienceLevel:
        query = query.where(Job.experience_level == experienceLevel)
    if category:
        query = query.where(Job.category == category)
    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))
    if featured:
        query = query.where(Job.is_featured == True)
    query = query.order_by(Job.is_featured.desc(), Job.is_urgent.desc(), Job.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return {"success": True, "data": [j.to_dict() for j in result.scalars().all()]}


@router.get("/me")
async def my_jobs(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.posted_by == user.id).order_by(Job.created_at.desc()))
    return {"success": True, "data": [j.to_dict() for j in result.scalars().all()]}


@router.get("/applications/me")
async def my_applications(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(JobApplication, Job)
        .join(Job, Job.id == JobApplication.job_id)
        .where(JobApplication.user_id == user.id)
        .order_by(JobApplication.created_at.desc())
    )
    apps = []
    for a, j in result.all():
        item = a.to_dict()
        item["job"] = j.to_dict()
        apps.append(item)
    return {"success": True, "data": apps}


@router.get("/saved")
async def saved_jobs(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"success": True, "data": []}  # TODO: implement saved jobs


@router.post("", status_code=201)
async def create_job(data: JobCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    base = _slugify(data.title)
    slug = base
    i = 1
    while True:
        check = await db.execute(select(Job).where(Job.slug == slug))
        if not check.scalar_one_or_none():
            break
        i += 1
        slug = f"{base}-{i}"
    job = Job(
        slug=slug,
        posted_by=user.id,
        expires_at=datetime.utcnow() + timedelta(days=data.expiresInDays),
        **{k: v for k, v in data.model_dump().items() if k != "expiresInDays"}
    )
    db.add(job)
    await db.flush()
    return {"success": True, "data": job.to_dict()}


@router.get("/{job_id}")
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.views_count = (job.views_count or 0) + 1
    return {"success": True, "data": job.to_dict()}


@router.patch("/{job_id}")
async def update_job(job_id: int, data: JobUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.posted_by != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(job, k, v)
    return {"success": True, "data": job.to_dict()}


@router.delete("/{job_id}")
async def delete_job(job_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.posted_by != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.delete(job)
    return {"success": True, "data": {"deleted": True}}


@router.post("/{job_id}/apply", status_code=201)
async def apply_job(job_id: int, data: ApplyRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job or not job.is_active:
        raise HTTPException(status_code=404, detail="Job not available")
    if job.posted_by == user.id:
        raise HTTPException(status_code=400, detail="Cannot apply to own job")

    # Check if already applied
    existing = await db.execute(
        select(JobApplication).where(JobApplication.job_id == job_id, JobApplication.user_id == user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already applied")

    application = JobApplication(
        job_id=job_id,
        user_id=user.id,
        cover_letter=data.coverLetter,
        resume_url=data.resumeUrl,
        expected_salary=data.expectedSalary,
    )
    db.add(application)
    job.applications_count = (job.applications_count or 0) + 1
    await db.flush()
    return {"success": True, "data": application.to_dict()}


@router.post("/{job_id}/save")
async def save_job(job_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # TODO: implement saved jobs table
    return {"success": True, "data": {"saved": True}}


@router.get("/{job_id}/applications")
async def list_applications(job_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.posted_by != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    apps_result = await db.execute(
        select(JobApplication, User)
        .join(User, User.id == JobApplication.user_id)
        .where(JobApplication.job_id == job_id)
        .order_by(JobApplication.created_at.desc())
    )
    apps = []
    for a, u in apps_result.all():
        item = a.to_dict()
        item["user"] = u.to_dict()
        apps.append(item)
    return {"success": True, "data": apps}
