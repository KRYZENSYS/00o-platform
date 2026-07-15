"""Telegram bot for 00o.uz platform."""
import os
import logging
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo, KeyboardButton, ReplyKeyboardMarkup,
)
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
import httpx
import redis.asyncio as aioredis

from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://00o.uz")
API_URL = os.getenv("API_URL", "http://localhost:8000")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()
redis: aioredis.Redis = None


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    """Handle /start command."""
    user = message.from_user
    args = message.text.split() if message.text else []
    ref_code = args[1] if len(args) > 1 and args[1].startswith("ref_") else None

    # Register or login user
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                f"{API_URL}/api/v1/auth/telegram",
                json={
                    "telegramId": user.id,
                    "username": user.username,
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                    "languageCode": user.language_code,
                    "isPremium": user.is_premium or False,
                    "photoUrl": None,
                },
                timeout=10.0,
            )
            data = res.json().get("data", {})
            token = data.get("token")
            if token and redis:
                await redis.set(f"tg:token:{user.id}", token, ex=86400 * 30)
        except Exception as e:
            logger.error(f"Auth error: {e}")
            token = None

    # Process referral
    if ref_code:
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{API_URL}/api/v1/payments/referral/process",
                    json={"code": ref_code},
                    headers={"Authorization": f"Bearer {token}"} if token else {},
                    timeout=10.0,
                )
        except Exception as e:
            logger.error(f"Referral error: {e}")

    kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🚀 Mini App", web_app=WebAppInfo(url=WEBAPP_URL))],
            [
                KeyboardButton(text="🤖 AI Chat"),
                KeyboardButton(text="💼 Marketplace"),
            ],
            [
                KeyboardButton(text="💼 Ish"),
                KeyboardButton(text="💰 Investorlar"),
            ],
            [
                KeyboardButton(text="📊 Feed"),
                KeyboardButton(text="👤 Profil"),
            ],
        ],
        resize_keyboard=True,
    )

    text = (
        f"👋 <b>Salom, {user.first_name}!</b>\n\n"
        f"Men <b>00o.uz</b> botiman - O'zbekistondagi #1 AI Startup Hub ga xush kelibsiz! 🚀\n\n"
        f"💎 Mini App orqali:\n"
        f"• AI yordamchi (20+ vosita)\n"
        f"• Startup yaratish va rivojlantirish\n"
        f"• Professional xizmatlar\n"
        f"• Investorlar bilan bog'lanish\n"
        f"• Ish topish / xodim jalb qilish\n\n"
        f"🎁 Yangi foydalanuvchilar uchun <b>100 token bonus</b>!"
    )

    if ref_code:
        text += f"\n\n🎁 Referral code <code>{ref_code}</code> qabul qilindi! +100 🪙 bonus"

    await message.answer(text, reply_markup=kb)


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    text = (
        "📚 <b>Yordam</b>\n\n"
        "<b>Asosiy buyruqlar:</b>\n"
        "/start - Botni boshlash\n"
        "/app - Mini App ochish\n"
        "/ai - AI yordamchi\n"
        "/profile - Profilim\n"
        "/tokens - Tokenlarim\n"
        "/referral - Referral link\n\n"
        "<b>Yoki quyidagi tugmalardan foydalaning 👇</b>"
    )
    await message.answer(text)


@dp.message(Command("app"))
async def cmd_app(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Mini App ochish", web_app=WebAppInfo(url=WEBAPP_URL))],
    ])
    await message.answer("Mini App ni oching:", reply_markup=kb)


@dp.message(Command("ai"))
async def cmd_ai(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="💡 G'oya", callback_data="ai:startup_idea"),
            InlineKeyboardButton(text="📊 Biznes-plan", callback_data="ai:business_plan"),
        ],
        [
            InlineKeyboardButton(text="💻 Kod", callback_data="ai:code"),
            InlineKeyboardButton(text="📝 Rezyume", callback_data="ai:resume"),
        ],
        [
            InlineKeyboardButton(text="🌐 Tarjima", callback_data="ai:translate"),
            InlineKeyboardButton(text="✍️ Blog", callback_data="ai:blog"),
        ],
        [InlineKeyboardButton(text="🚀 AI Chat", web_app=WebAppInfo(url=f"{WEBAPP_URL}/ai"))],
    ])
    await message.answer("🤖 <b>AI yordamchini tanlang:</b>", reply_markup=kb)


@dp.message(Command("profile"))
async def cmd_profile(message: types.Message):
    user_id = message.from_user.id
    token = await redis.get(f"tg:token:{user_id}") if redis else None
    if not token:
        await message.answer("Avval /start ni bosing")
        return

    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{API_URL}/api/v1/users/me", headers={"Authorization": f"Bearer {token}"}, timeout=10.0)
            data = res.json().get("data", {})
            text = (
                f"👤 <b>{data.get('firstName', '')} {data.get('lastName', '')}</b>\n"
                f"📛 @{data.get('username', '')}\n"
                f"🪙 Tokenlar: <b>{data.get('tokens', 0)}</b>\n"
                f"⭐ XP: <b>{data.get('xp', 0)}</b> ({data.get('level', 'Bronze')})\n"
                f"📈 Obunachilar: <b>{data.get('followersCount', 0)}</b>\n"
                f"💎 Premium: {'✅' if data.get('isPremium') else '❌'}\n"
            )
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📊 Dashboard", web_app=WebAppInfo(url=f"{WEBAPP_URL}/dashboard"))],
                [InlineKeyboardButton(text="⚙️ Sozlamalar", web_app=WebAppInfo(url=f"{WEBAPP_URL}/settings"))],
            ])
            await message.answer(text, reply_markup=kb)
        except Exception as e:
            logger.error(f"Profile error: {e}")
            await message.answer("❌ Profilni olishda xatolik")


@dp.message(Command("tokens"))
async def cmd_tokens(message: types.Message):
    user_id = message.from_user.id
    token = await redis.get(f"tg:token:{user_id}") if redis else None
    if not token:
        await message.answer("Avval /start ni bosing")
        return
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{API_URL}/api/v1/payments/balance", headers={"Authorization": f"Bearer {token}"}, timeout=10.0)
            data = res.json().get("data", {})
            text = (
                f"💰 <b>Sizning balansingiz:</b>\n\n"
                f"🪙 Tokenlar: <b>{data.get('tokens', 0)}</b>\n"
                f"⭐ XP: <b>{data.get('xp', 0)}</b>\n"
                f"🎖 Level: <b>{data.get('level', 'Bronze')}</b>\n"
            )
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="💎 Token sotib olish", web_app=WebAppInfo(url=f"{WEBAPP_URL}/tokens"))],
                [InlineKeyboardButton(text="🎁 Referral", callback_data="referral")],
            ])
            await message.answer(text, reply_markup=kb)
        except Exception as e:
            logger.error(f"Tokens error: {e}")


@dp.message(Command("referral"))
@dp.callback_query(F.data == "referral")
async def cmd_referral(event: types.Message | types.CallbackQuery):
    user_id = event.from_user.id
    ref_link = f"https://t.me/ooouzbot?start=ref_{user_id}"
    text = (
        f"🎁 <b>Do'stlaringizni taklif qiling!</b>\n\n"
        f"Sizning referral havolangiz:\n"
        f"<code>{ref_link}</code>\n\n"
        f"💰 Har bir taklif uchun:\n"
        f"• Siz: <b>+100 🪙</b>\n"
        f"• Do'st: <b>+100 🪙</b>\n"
        f"• Premium foydalanuvchi taklifi: <b>+500 🪙</b>\n\n"
        f"📊 Statistika: /stats"
    )
    if isinstance(event, types.CallbackQuery):
        await event.message.answer(text)
        await event.answer()
    else:
        await event.answer(text)


@dp.message(F.text == "🚀 Mini App")
async def mini_app(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Ochish", web_app=WebAppInfo(url=WEBAPP_URL))],
    ])
    await message.answer("Mini App:", reply_markup=kb)


@dp.message(F.text.in_({"🤖 AI Chat", "💼 Marketplace", "💼 Ish", "💰 Investorlar", "📊 Feed", "👤 Profil"}))
async def menu_handler(message: types.Message):
    routes = {
        "🤖 AI Chat": "/ai",
        "💼 Marketplace": "/marketplace",
        "💼 Ish": "/jobs",
        "💰 Investorlar": "/investors",
        "📊 Feed": "/feed",
        "👤 Profil": "/profile",
    }
    path = routes.get(message.text, "/dashboard")
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Ochish →", web_app=WebAppInfo(url=f"{WEBAPP_URL}{path}"))],
    ])
    await message.answer(f"{message.text} sahifasi:", reply_markup=kb)


async def main():
    global redis
    redis = aioredis.from_url(REDIS_URL, decode_responses=True)
    logger.info("Bot starting...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
