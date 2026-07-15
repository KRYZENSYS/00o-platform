"""API v1 router aggregator - FINAL VERSION."""
from fastapi import APIRouter
from app.api.v1 import auth, users, ai, startups
from app.api.v1.marketplace import marketplace_router as marketplace
from app.api.v1 import jobs, investors, chats, feed
from app.api.v1.payments import router as payments_router
from app.api.v1.notifications import (
    router as notifications,
    upload_router as uploads,
    analytics_router as analytics,
    admin_router as admin,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(startups.router, prefix="/startups", tags=["Startups"])
api_router.include_router(marketplace, prefix="/marketplace", tags=["Marketplace"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(investors.router, prefix="/investors", tags=["Investors"])
api_router.include_router(chats.router, prefix="/chats", tags=["Chats"])
api_router.include_router(feed.router, prefix="/feed", tags=["Feed"])
api_router.include_router(payments_router, prefix="/payments", tags=["Payments"])
api_router.include_router(notifications, prefix="/notifications", tags=["Notifications"])
api_router.include_router(uploads, prefix="/uploads", tags=["Uploads"])
api_router.include_router(analytics, prefix="/analytics", tags=["Analytics"])
api_router.include_router(admin, prefix="/admin", tags=["Admin"])
