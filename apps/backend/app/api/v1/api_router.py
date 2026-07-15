"""API v1 router aggregator."""
from fastapi import APIRouter
from app.api.v1 import auth, users, ai, startups, marketplace

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(ai.router)
api_router.include_router(startups.router)
api_router.include_router(marketplace.router)
