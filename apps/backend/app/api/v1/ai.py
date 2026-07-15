"""AI endpoints with GroqCloud integration."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import List, Optional
from loguru import logger

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.ai import AIChat, AIMessage, AIUsage
from app.services.ai import get_ai_response, stream_ai_response, AI_MODELS

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    feature: str = "chat"
    model: Optional[str] = None
    stream: bool = False


class ToolRequest(BaseModel):
    prompt: str
    context: Optional[dict] = None
    language: str = "uz"


# ============ CHAT ============

@router.post("/chat")
async def chat(
    data: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """AI chat endpoint."""
    # Check rate limit
    today = datetime.utcnow().date()
    usage = await db.execute(
        select(func.count(AIMessage.id))
        .where(AIMessage.user_id == user.id)
        .where(func.date(AIMessage.created_at) == today)
    )
    used = usage.scalar() or 0
    limit = settings.AI_DAILY_LIMIT_PRO if user.is_premium else settings.AI_DAILY_LIMIT_FREE
    if used >= limit:
        raise HTTPException(status_code=429, detail=f"Daily limit reached ({limit}). Upgrade to Pro for more.")

    # Save chat
    chat = None
    if not data.messages or data.messages[0].role != "system":
        # Find or create chat session
        chat_result = await db.execute(
            select(AIChat).where(AIChat.user_id == user.id).order_by(AIChat.updated_at.desc()).limit(1)
        )
        chat = chat_result.scalar_one_or_none()
        if not chat:
            chat = AIChat(user_id=user.id, title=data.messages[-1].content[:50] if data.messages else "Chat")
            db.add(chat)
            await db.flush()

    # Save user message
    if data.messages:
        user_msg = AIMessage(
            chat_id=chat.id if chat else None,
            user_id=user.id,
            role="user",
            content=data.messages[-1].content,
            feature=data.feature,
        )
        db.add(user_msg)

    # Get AI response
    model = data.model or settings.GROQ_DEFAULT_MODEL
    try:
        result = await get_ai_response(
            messages=[m.model_dump() for m in data.messages],
            model=model,
            feature=data.feature,
        )
    except Exception as e:
        logger.error(f"AI error: {e}")
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")

    # Save assistant message
    if chat:
        ai_msg = AIMessage(
            chat_id=chat.id,
            user_id=user.id,
            role="assistant",
            content=result["content"],
            model=model,
            tokens_used=result.get("tokens", 0),
        )
        db.add(ai_msg)
        chat.updated_at = datetime.utcnow()

    # Track usage
    usage_record = AIUsage(
        user_id=user.id,
        feature=data.feature,
        model=model,
        tokens=result.get("tokens", 0),
        cost=result.get("cost", 0),
    )
    db.add(usage_record)

    return {
        "success": True,
        "data": {
            "content": result["content"],
            "model": model,
            "tokens": result.get("tokens", 0),
            "chatId": chat.id if chat else None,
        }
    }


@router.post("/stream")
async def stream_chat(
    data: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Streaming AI chat."""
    from fastapi.responses import StreamingResponse
    model = data.model or settings.GROQ_DEFAULT_MODEL

    async def generate():
        async for chunk in stream_ai_response([m.model_dump() for m in data.messages], model=model):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


# ============ TOOLS (20+) ============

@router.post("/tools/startup-idea")
async def tool_startup_idea(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate startup idea."""
    system = "Siz startup ekspertisiz. Foydalanuvchiga batafsil, amaliy va innovatsion startup g'oya taklif qiling. O'zbek tilida javob bering."
    user_msg = f"Menga {data.context.get('industry', 'texnologiya')} sohasida startup g'oya kerak. Byudjet: {data.context.get('budget', '100M so\\'m')}. Bozor: O'zbekiston."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user_msg}],
        feature="startup-idea",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/business-plan")
async def tool_business_plan(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate business plan."""
    system = "Siz biznes-plan ekspertisiz. Batafsil biznes-plan tuzing: executive summary, market analysis, products, marketing, financial projections. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="business-plan",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/code")
async def tool_code(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Code generation."""
    system = "Siz senior dasturchisiz. To'liq, ishlaydigan kod yozing. Izohlar qo'shing. Best practices ga rioya qiling."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        model="qwen-2.5-coder-32b",
        feature="code",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/code-review")
async def tool_code_review(
    data: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Code review."""
    code = data.get("code", "")
    language = data.get("language", "typescript")
    system = f"Siz senior code reviewer siz. {language} tilidagi kodni tekshiring. Xatolar, yaxshilashlar, best practices bo'yicha tavsiyalar bering. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": code}],
        model="qwen-2.5-coder-32b",
        feature="code-review",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/resume")
async def tool_resume(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Resume/CV generator."""
    system = "Siz HR ekspertisiz. Professional rezyume tuzing. ATS-friendly format. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="resume",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/cover-letter")
async def tool_cover_letter(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cover letter."""
    system = "Siz HR mutaxassisiz. Ishga kirish uchun ariza xati yozing. Professional, qisqa, ta'sirli. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="cover-letter",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/translate")
async def tool_translate(
    data: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Translate text."""
    text = data.get("text", "")
    from_lang = data.get("from", "uz")
    to_lang = data.get("to", "en")
    lang_names = {"uz": "O'zbek", "en": "English", "ru": "Русский"}
    system = f"Siz professional tarjimonsiz. {lang_names.get(from_lang, from_lang)} tilidan {lang_names.get(to_lang, to_lang)} tiliga tarjima qiling. Faqat tarjima matnini qaytaring."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": text}],
        feature="translate",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/blog")
async def tool_blog(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Blog post generator."""
    system = "Siz professional blogger siz. SEO-optimallashtirilgan blog maqola yozing. Sarlavha, kirish, asosiy qism, xulosa. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="blog",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/social")
async def tool_social(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Social media post."""
    system = "Siz SMM mutaxassisiz. Engaging, qisqa ijtimoiy tarmoq posti yozing. Emoji va hashtag ishlating. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="social",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/email")
async def tool_email(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Email generator."""
    system = "Siz professional email yozuvchi siz. Professional, qisqa email yozing. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="email",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/summarize")
async def tool_summarize(
    data: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Text summarizer."""
    text = data.get("text", "")
    system = "Siz matn tahlilchisiz. Matnni qisqacha, asosiy fikrlarni saqlagan holda umumlashtiring. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": text}],
        feature="summarize",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/pitch")
async def tool_pitch(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Startup pitch generator."""
    system = "Siz pitch deck ekspertisiz. Investorlarga mo'ljallangan 5 daqiqalik pitch yarating: Muammo, Yechim, Bozor, Biznes-model, Jamoa, So'rov. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="pitch",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/market-research")
async def tool_market_research(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Market research."""
    system = "Siz market analitik siz. Bozor tadqiqoti o'tkazing: hajmi, tendensiyalar, raqobatchilar, imkoniyatlar. O'zbek va Markaziy Osiyo bozoriga e'tibor bering."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="market-research",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/financial-model")
async def tool_financial_model(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Financial model."""
    system = "Siz moliyaviy tahlilchisiz. 3 yillik moliyaviy model yarating: revenue, costs, profit, cash flow. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="financial-model",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/legal")
async def tool_legal(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Legal document generator."""
    system = "Siz yurist maslahatchisiz. O'zbekiston qonunchiligiga muvofiq hujjatlar tayyorlang. FAQAT UMUMIY MASLAHAT bering, professional yurist bilan tekshiring."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="legal",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/brand-name")
async def tool_brand_name(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Brand name generator."""
    system = "Siz brending mutaxassisiz. 10 ta kreativ, esda qolarli brend nomi taklif qiling. Domen, trademark tekshiruvi bilan."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="brand-name",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/logo")
async def tool_logo(
    data: ToolRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Logo concept generator."""
    system = "Siz logo dizayner siz. Logo konsepsiyasi va tavsifini yarating. Ranglar, shakl, ma'no. O'zbek tilida."
    result = await get_ai_response(
        messages=[{"role": "system", "content": system}, {"role": "user", "content": data.prompt}],
        feature="logo",
    )
    return {"success": True, "data": {"result": result["content"]}}


@router.post("/tools/analyze-image")
async def tool_analyze_image(
    data: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze image via AI."""
    # In production, use vision model
    return {"success": True, "data": {"result": "Image analysis coming soon"}}


# ============ HISTORY & USAGE ============

@router.get("/history")
async def get_history(
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get AI chat history."""
    result = await db.execute(
        select(AIChat)
        .where(AIChat.user_id == user.id)
        .order_by(AIChat.updated_at.desc())
        .limit(limit)
    )
    chats = result.scalars().all()
    return {"success": True, "data": [c.to_dict() for c in chats]}


@router.get("/models")
async def get_models():
    """Get available AI models."""
    return {"success": True, "data": AI_MODELS}


@router.get("/usage")
async def get_usage(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user AI usage stats."""
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)

    used_today = await db.execute(
        select(func.count(AIMessage.id))
        .where(AIMessage.user_id == user.id)
        .where(func.date(AIMessage.created_at) == today)
    )
    used_month = await db.execute(
        select(func.count(AIMessage.id))
        .where(AIMessage.user_id == user.id)
        .where(AIMessage.created_at >= month_start)
    )

    limit = settings.AI_DAILY_LIMIT_PRO if user.is_premium else settings.AI_DAILY_LIMIT_FREE
    return {
        "success": True,
        "data": {
            "today": used_today.scalar() or 0,
            "month": used_month.scalar() or 0,
            "limit": limit,
            "remaining": max(0, limit - (used_today.scalar() or 0)),
            "isPremium": user.is_premium,
        }
    }
