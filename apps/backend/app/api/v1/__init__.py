"""API v1 router."""
from fastapi import APIRouter
from app.api.v1 import auth, users, ai, startups, marketplace, jobs, investors, chats, feed, payments, subscriptions, tokens, referrals, notifications, admin, uploads, analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(startups.router, prefix="/startups", tags=["Startups"])
api_router.include_router(marketplace.router, prefix="/marketplace", tags=["Marketplace"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(investors.router, prefix="/investors", tags=["Investors"])
api_router.include_router(chats.router, prefix="/chats", tags=["Chats"])
api_router.include_router(feed.router, prefix="/feed", tags=["Feed"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
api_router.include_router(tokens.router, prefix="/tokens", tags=["Tokens"])
api_router.include_router(referrals.router, prefix="/referrals", tags=["Referrals"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
