"""Database seed for 00o.uz"""
import asyncio
from prisma import Prisma
from datetime import datetime, timedelta
import random
import hashlib

async def main():
    db = Prisma()
    await db.connect()

    print("🌱 Seeding database...")

    # Categories
    categories = [
        {"slug": "web-dev", "name": "Web Development", "icon": "💻", "type": "service", "order": 1},
        {"slug": "mobile-dev", "name": "Mobile Development", "icon": "📱", "type": "service", "order": 2},
        {"slug": "design", "name": "Design", "icon": "🎨", "type": "service", "order": 3},
        {"slug": "marketing", "name": "Marketing", "icon": "📈", "type": "service", "order": 4},
        {"slug": "writing", "name": "Writing", "icon": "✍️", "type": "service", "order": 5},
        {"slug": "video", "name": "Video & Animation", "icon": "🎬", "type": "service", "order": 6},
        {"slug": "ai", "name": "AI & ML", "icon": "🤖", "type": "service", "order": 7},
        {"slug": "data", "name": "Data Science", "icon": "📊", "type": "service", "order": 8},
        {"slug": "fintech", "name": "FinTech", "icon": "💰", "type": "startup", "order": 1},
        {"slug": "edtech", "name": "EdTech", "icon": "📚", "type": "startup", "order": 2},
        {"slug": "healthtech", "name": "HealthTech", "icon": "🏥", "type": "startup", "order": 3},
        {"slug": "ecommerce", "name": "E-commerce", "icon": "🛒", "type": "startup", "order": 4},
        {"slug": "saas", "name": "SaaS", "icon": "☁️", "type": "startup", "order": 5},
    ]

    for cat in categories:
        await db.category.upsert(where={"slug": cat["slug"]}, data={"create": cat, "update": cat})

    # Achievements
    achievements = [
        {"slug": "first-login", "title": "First Login", "description": "Welcome to 00o.uz", "icon": "👋", "xp": 10, "category": "starter"},
        {"slug": "first-post", "title": "First Post", "description": "Create your first post", "icon": "📝", "xp": 50, "category": "social"},
        {"slug": "first-startup", "title": "Startup Founder", "description": "Create your first startup", "icon": "🚀", "xp": 200, "category": "startup"},
        {"slug": "first-investment", "title": "Investor", "description": "Make your first investment", "icon": "💰", "xp": 300, "category": "investor"},
        {"slug": "first-sale", "title": "First Sale", "description": "Complete your first order", "icon": "💵", "xp": 100, "category": "marketplace"},
        {"slug": "100-followers", "title": "Popular", "description": "Get 100 followers", "icon": "⭐", "xp": 500, "category": "social"},
        {"slug": "7-streak", "title": "Week Streak", "description": "7 days in a row", "icon": "🔥", "xp": 200, "category": "engagement"},
        {"slug": "30-streak", "title": "Month Streak", "description": "30 days in a row", "icon": "🏆", "xp": 1000, "category": "engagement"},
        {"slug": "ai-power-user", "title": "AI Power User", "description": "Use AI 100 times", "icon": "🤖", "xp": 300, "category": "ai"},
        {"slug": "verified", "title": "Verified", "description": "Get verified badge", "icon": "✅", "xp": 500, "category": "trust"},
    ]

    for ach in achievements:
        await db.achievement.upsert(where={"slug": ach["slug"]}, data={"create": ach, "update": ach})

    # Settings
    settings = [
        {"key": "site_name", "value": {"value": "00o.uz"}, "category": "general", "isPublic": True},
        {"key": "site_description", "value": {"value": "AI Startup & Freelancer Hub"}, "category": "general", "isPublic": True},
        {"key": "default_language", "value": {"value": "uz"}, "category": "general", "isPublic": True},
        {"key": "ai_default_model", "value": {"value": "llama-3.3-70b-versatile"}, "category": "ai", "isPublic": False},
        {"key": "ai_max_tokens", "value": {"value": 4096}, "category": "ai", "isPublic": False},
        {"key": "ai_temperature", "value": {"value": 0.7}, "category": "ai", "isPublic": False},
        {"key": "premium_price", "value": {"value": 99000}, "category": "payment", "isPublic": True},
        {"key": "commission_rate", "value": {"value": 0.10}, "category": "payment", "isPublic": False},
        {"key": "min_withdraw", "value": {"value": 50000}, "category": "payment", "isPublic": True},
        {"key": "enable_telegram_login", "value": {"value": True}, "category": "auth", "isPublic": True},
        {"key": "enable_google_login", "value": {"value": True}, "category": "auth", "isPublic": True},
        {"key": "enable_2fa", "value": {"value": True}, "category": "auth", "isPublic": True},
        {"key": "enable_registration", "value": {"value": True}, "category": "auth", "isPublic": True},
    ]

    for s in settings:
        await db.setting.upsert(where={"key": s["key"]}, data={"create": s, "update": s})

    # Admin user
    admin_password = hashlib.sha256("admin123".encode()).hexdigest()
    admin = await db.user.upsert(
        where={"email": "admin@00o.uz"},
        data={
            "create": {
                "email": "admin@00o.uz",
                "username": "admin",
                "passwordHash": admin_password,
                "firstName": "Admin",
                "lastName": "00o.uz",
                "role": "SUPER_ADMIN",
                "isVerified": True,
                "emailVerified": True,
                "xpPoints": 9999,
                "level": 99,
            },
            "update": {}
        }
    )

    # Sample users
    sample_users = [
        {"email": "demo@00o.uz", "username": "demo", "firstName": "Demo", "lastName": "User", "role": "USER"},
        {"email": "aziz@00o.uz", "username": "aziz_k", "firstName": "Aziz", "lastName": "Karimov", "role": "FREELANCER"},
        {"email": "malika@00o.uz", "username": "malika_y", "firstName": "Malika", "lastName": "Yusupova", "role": "STARTUP_OWNER"},
        {"email": "investor@00o.uz", "username": "investor", "firstName": "Bobur", "lastName": "Investor", "role": "INVESTOR"},
    ]

    for u in sample_users:
        await db.user.upsert(
            where={"email": u["email"]},
            data={
                "create": {**u, "passwordHash": admin_password, "isVerified": True, "emailVerified": True, "xpPoints": 500},
                "update": {}
            }
        )

    print(f"✅ Seeded: {len(categories)} categories, {len(achievements)} achievements, {len(settings)} settings, {len(sample_users) + 1} users")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
