"""Jobs and Investor models."""
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    requirements: Mapped[list] = mapped_column(JSON, default=list)
    benefits: Mapped[list] = mapped_column(JSON, default=list)
    skills: Mapped[list] = mapped_column(JSON, default=list)

    job_type: Mapped[str] = mapped_column(String(30), default="full-time")  # full-time, part-time, contract, internship, freelance
    work_mode: Mapped[str] = mapped_column(String(20), default="remote")  # remote, onsite, hybrid
    experience_level: Mapped[str] = mapped_column(String(30), default="mid")  # junior, mid, senior, lead

    salary_min: Mapped[Optional[float]] = mapped_column(Float)
    salary_max: Mapped[Optional[float]] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10), default="UZS")
    is_negotiable: Mapped[bool] = mapped_column(Boolean, default=False)

    location: Mapped[Optional[str]] = mapped_column(String(150))
    country: Mapped[str] = mapped_column(String(50), default="Uzbekistan")
    category: Mapped[Optional[str]] = mapped_column(String(80))
    tags: Mapped[list] = mapped_column(JSON, default=list)

    startup_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("startups.id", ondelete="SET NULL"))
    posted_by: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_urgent: Mapped[bool] = mapped_column(Boolean, default=False)

    applications_count: Mapped[int] = mapped_column(Integer, default=0)
    views_count: Mapped[int] = mapped_column(Integer, default=0)

    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "company": self.company,
            "description": self.description,
            "requirements": self.requirements,
            "benefits": self.benefits,
            "skills": self.skills,
            "jobType": self.job_type,
            "workMode": self.work_mode,
            "experienceLevel": self.experience_level,
            "salaryMin": self.salary_min,
            "salaryMax": self.salary_max,
            "currency": self.currency,
            "isNegotiable": self.is_negotiable,
            "location": self.location,
            "country": self.country,
            "category": self.category,
            "tags": self.tags,
            "startupId": self.startup_id,
            "postedBy": self.posted_by,
            "isActive": self.is_active,
            "isFeatured": self.is_featured,
            "isUrgent": self.is_urgent,
            "applicationsCount": self.applications_count,
            "viewsCount": self.views_count,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class JobApplication(Base):
    __tablename__ = "job_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    cover_letter: Mapped[Optional[str]] = mapped_column(Text)
    resume_url: Mapped[Optional[str]] = mapped_column(String(500))
    expected_salary: Mapped[Optional[float]] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(30), default="applied")  # applied, reviewed, interview, offered, hired, rejected
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "jobId": self.job_id,
            "userId": self.user_id,
            "coverLetter": self.cover_letter,
            "resumeUrl": self.resume_url,
            "expectedSalary": self.expected_salary,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Investor(Base):
    __tablename__ = "investors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    firm_name: Mapped[Optional[str]] = mapped_column(String(255))
    fund_type: Mapped[str] = mapped_column(String(50), default="angel")  # angel, vc, accelerator, corporate
    bio: Mapped[Optional[str]] = mapped_column(Text)
    website: Mapped[Optional[str]] = mapped_column(String(255))
    linkedin: Mapped[Optional[str]] = mapped_column(String(255))
    logo: Mapped[Optional[str]] = mapped_column(String(500))

    check_size_min: Mapped[Optional[float]] = mapped_column(Float)
    check_size_max: Mapped[Optional[float]] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10), default="USD")

    stages: Mapped[list] = mapped_column(JSON, default=list)  # idea, mvp, seed, etc
    industries: Mapped[list] = mapped_column(JSON, default=list)
    locations: Mapped[list] = mapped_column(JSON, default=list)
    portfolio: Mapped[list] = mapped_column(JSON, default=list)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    investments_count: Mapped[int] = mapped_column(Integer, default=0)
    total_invested: Mapped[float] = mapped_column(Float, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "userId": self.user_id,
            "firmName": self.firm_name,
            "fundType": self.fund_type,
            "bio": self.bio,
            "website": self.website,
            "linkedin": self.linkedin,
            "logo": self.logo,
            "checkSizeMin": self.check_size_min,
            "checkSizeMax": self.check_size_max,
            "currency": self.currency,
            "stages": self.stages,
            "industries": self.industries,
            "locations": self.locations,
            "portfolio": self.portfolio,
            "isActive": self.is_active,
            "isVerified": self.is_verified,
            "investmentsCount": self.investments_count,
            "totalInvested": self.total_invested,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Pitch(Base):
    __tablename__ = "pitches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    investor_id: Mapped[int] = mapped_column(Integer, ForeignKey("investors.id", ondelete="CASCADE"), index=True)
    startup_id: Mapped[int] = mapped_column(Integer, ForeignKey("startups.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    pitch: Mapped[str] = mapped_column(Text)
    deck_url: Mapped[Optional[str]] = mapped_column(String(500))
    funding_amount: Mapped[Optional[float]] = mapped_column(Float)
    equity_offered: Mapped[Optional[float]] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(30), default="sent")  # sent, viewed, interested, meeting, deal, rejected
    response: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "investorId": self.investor_id,
            "startupId": self.startup_id,
            "userId": self.user_id,
            "title": self.title,
            "pitch": self.pitch,
            "deckUrl": self.deck_url,
            "fundingAmount": self.funding_amount,
            "equityOffered": self.equity_offered,
            "status": self.status,
            "response": self.response,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
