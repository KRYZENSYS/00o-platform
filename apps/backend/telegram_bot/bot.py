"""Telegram Bot for 00o.uz with full features."""
import asyncio
import logging
from datetime import datetime
from typing import Optional

from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    InlineKeyboardButton, InlineKeyboardMarkup,
    KeyboardButton, ReplyKeyboardMarkup,
    WebAppInfo,
)
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import async_session_maker
from app.models.user import User
from app.models.subscription import Subscription

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(token=settings.TELEGRAM_BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher(storage=MemoryStorage())


# States
class AuthStates(StatesGroup):
    waiting_email = State()
    waiting_password = State()


class AIStates(StatesGroup):
    chatting = State()
    waiting_prompt = State()


# Keyboards
def main_menu_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="🚀 Bosh sahifa"), KeyboardButton(text="💼 Marketplace")],
        [KeyboardButton(text="🤖 AI Chat"), KeyboardButton(text="📊 Startaplar")],
        [KeyboardButton(text="💬 Xabarlar"), KeyboardButton(text="👤 Profil")],
        [KeyboardButton(text="⚙️ Sozlamalar"), KeyboardButton(text="💎 Premium")],
    ], resize_keyboard=True)


def webapp_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🌐 Web ilovani ochish", web_app=WebAppInfo(url=f"{settings.APP_URL}"))],
        [InlineKeyboardButton(text="🤖 AI Chat", web_app=WebAppInfo(url=f"{settings.APP_URL}/ai"))],
        [InlineKeyboardButton(text="🚀 Startaplar", web_app=WebAppInfo(url=f"{settings.APP_URL}/startups"))],
    ])


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    """Handle /start command."""
    args = message.text.split()
    referral = args[1] if len(args) > 1 else None

    text = f"""👋 Assalomu alaykum, <b>{message.from_user.first_name}</b>!

🎉 <b>00o.uz</b> - O'zbekistondagi eng katta AI Startup Hub ga xush kelibsiz!

🚀 Startaplar yarating
💼 Frilanserlik qiling
💰 Investitsiya toping
🤖 AI bilan ishlang

Quyidagi tugmalardan birini tanlang:"""

    await message.answer(text, reply_markup=main_menu_kb())
    await message.answer("Yoki web ilovamizni oching:", reply_markup=webapp_kb())

    if referral:
        await process_referral(message.from_user.id, referral)


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Handle /help command."""
    text = """<b>📖 Yordam</b>

<b>Asosiy komandalar:</b>
/start - Botni ishga tushirish
/help - Yordam
/profile - Profilingiz
/ai - AI bilan chat
/ideas - Startup g'oyalar
/marketplace - Marketplace
/premium - Premium tarif

<b>Tugmalar:</b>
🏠 Bosh sahifa - Asosiy menyu
🤖 AI Chat - AI bilan suhbat
💼 Marketplace - Xizmatlar
📊 Startaplar - Startap ko'rish

<b>Aloqa:</b>
📧 support@00o.uz
🌐 00o.uz"""

    await message.answer(text)


@dp.message(Command("ai"))
async def cmd_ai(message: types.Message, state: FSMContext):
    """Start AI chat."""
    await state.set_state(AIStates.chatting)
    await message.answer("""🤖 <b>AI Chat</b>

Savolingizni yozing. Men sizga yordam beraman:

💡 Masalan:
• "Menga startup g'oya kerak"
• "Python da REST API yoz"
• "Resume yaratib ber"
• "Marketing strategiya tuz"

Yoki /cancel ni bosing.""")


@dp.message(AIStates.chatting)
async def handle_ai_chat(message: types.Message, state: FSMContext):
    """Handle AI chat messages."""
    if message.text == "/cancel":
        await state.clear()
        await message.answer("Bekor qilindi.", reply_markup=main_menu_kb())
        return

    # Show typing
    await message.answer("🤔 O'ylayapman...")

    # Call backend AI API
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.BACKEND_URL}/api/v1/ai/chat",
                json={"messages": [{"role": "user", "content": message.text}], "feature": "chat"},
                headers={"Authorization": f"Bearer {settings.BOT_API_KEY}"}
            )

            if response.status_code == 200:
                result = response.json()
                text = result.get("content", "Xatolik yuz berdi")
                # Split long messages
                if len(text) > 4000:
                    for i in range(0, len(text), 4000):
                        await message.answer(text[i:i+4000])
                else:
                    await message.answer(text)
            else:
                await message.answer("⚠️ AI xizmati vaqtincha ishlamayapti. Keyinroq urinib ko'ring.")
    except Exception as e:
        logger.error(f"AI error: {e}")
        await message.answer("⚠️ Xatolik yuz berdi. Qayta urinib ko'ring.")


@dp.message(F.text == "🤖 AI Chat")
async def ai_chat_button(message: types.Message, state: FSMContext):
    await cmd_ai(message, state)


@dp.message(F.text == "🚀 Bosh sahifa")
async def home_button(message: types.Message):
    await message.answer("🏠 Bosh sahifa", reply_markup=webapp_kb())


@dp.message(F.text == "💼 Marketplace")
async def marketplace_button(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Marketplace ochish", web_app=WebAppInfo(url=f"{settings.APP_URL}/marketplace"))]
    ])
    await message.answer("💼 Marketplace - professional xizmatlar", reply_markup=kb)


@dp.message(F.text == "📊 Startaplar")
async def startups_button(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Startaplarni ko'rish", web_app=WebAppInfo(url=f"{settings.APP_URL}/startups"))]
    ])
    await message.answer("📊 Startaplar - yangi g'oyalar", reply_markup=kb)


@dp.message(F.text == "💎 Premium")
async def premium_button(message: types.Message):
    text = """💎 <b>Premium tarif</b>

<b>Pro - 99,000 so'm/oy</b>
✅ Cheksiz AI so'rovlar
✅ Barcha vositalar
✅ Prioritet qo'llab-quvvatlash
✅ Analytics
✅ Custom branding

<b>Enterprise - Aloqada</b>
✅ Hammasi Pro dan
✅ API access
✅ White-label
✅ Shaxsiy menejer

To'lov uchun: @mira_support"""
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Premium sotib olish", web_app=WebAppInfo(url=f"{settings.APP_URL}/premium"))]
    ])
    await message.answer(text, reply_markup=kb)


@dp.message(F.text == "👤 Profil")
async def profile_button(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Profilingiz", web_app=WebAppInfo(url=f"{settings.APP_URL}/profile"))]
    ])
    await message.answer(f"👤 <b>{message.from_user.first_name}</b>\n\nProfilingizni ko'ring:", reply_markup=kb)


@dp.message(Command("ideas"))
async def cmd_ideas(message: types.Message):
    """Generate startup ideas."""
    await message.answer("💡 Startup g'oyalar tayyorlanmoqda...")
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.BACKEND_URL}/api/v1/ai/startup-idea",
                json={},
                headers={"Authorization": f"Bearer {settings.BOT_API_KEY}"}
            )
            if response.status_code == 200:
                result = response.json().get("result", "Xatolik")
                if len(result) > 4000:
                    for i in range(0, len(result), 4000):
                        await message.answer(result[i:i+4000])
                else:
                    await message.answer(result)
            else:
                await message.answer("⚠️ Xatolik yuz berdi")
    except Exception as e:
        logger.error(f"Ideas error: {e}")
        await message.answer("⚠️ Xatolik yuz berdi")


async def process_referral(user_id: int, referral_code: str):
    """Process referral."""
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{settings.BACKEND_URL}/api/v1/referrals/process",
                json={"telegramId": user_id, "code": referral_code},
                headers={"Authorization": f"Bearer {settings.BOT_API_KEY}"}
            )
    except Exception as e:
        logger.error(f"Referral error: {e}")


@dp.message(Command("referral"))
async def cmd_referral(message: types.Message):
    """Get referral link."""
    user_id = message.from_user.id
    code = f"ref_{user_id}"
    text = f"""🎁 <b>Referral dasturi</b>

Sizning havolangiz:
<code>https://t.me/ooouzbot?start={code}</code>

<b>Bonuslar:</b>
👥 Har bir do'st uchun: <b>+100 🪙</b>
👑 Premium do'st uchun: <b>+500 🪙</b>
🎁 10 ta do'st = <b>1 oy Pro bepul!</b>

Statistika: /referral_stats"""

    await message.answer(text)


@dp.callback_query(F.data.startswith("ai_"))
async def ai_callback(callback: types.CallbackQuery):
    """Handle AI tool callbacks."""
    tool = callback.data.replace("ai_", "")
    tools = {
        "idea": "startup-idea",
        "code": "code",
        "resume": "resume",
        "plan": "business-plan",
        "translate": "translate",
        "blog": "blog",
    }
    feature = tools.get(tool, "chat")
    await callback.message.answer(f"🤖 {tool} tanlandi. Savolingizni yozing:")
    await callback.answer()


@dp.message()
async def echo(message: types.Message):
    """Echo handler for unknown messages."""
    await message.answer("🤖 Tushunmadim. /help ni bosing yoki menyudan tanlang.", reply_markup=main_menu_kb())


async def main():
    """Start bot."""
    logger.info("Starting Telegram bot...")
    await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())


if __name__ == "__main__":
    asyncio.run(main())
