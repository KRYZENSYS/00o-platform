"""AI endpoints."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.ai import AIConversation, AIMessage
from app.services.ai_service import ai_service, GROQ_MODELS

router = APIRouter(prefix="/ai", tags=["AI"])


class ChatIn(BaseModel):
    messages: List[Dict[str, str]]
    type: str = "chat"
    model: str = "llama-3.3-70b-versatile"
    conversationId: Optional[int] = None
    temperature: float = 0.7
    maxTokens: int = 2048


@router.get("/models")
async def list_models(current_user: User = Depends(get_current_user)):
    """List available AI models."""
    return {"success": True, "data": GROQ_MODELS}


@router.post("/chat")
async def chat(data: ChatIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Chat with AI."""
    # Check daily limits
    limit = settings.PREMIUM_AI_REQUESTS_PER_DAY if current_user.isPremium else settings.FREE_AI_REQUESTS_PER_DAY
    # (In real app, count today's usage)
    if current_user.tokens <= 0 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas. Iltimos, to'ldiring.")

    if data.model not in GROQ_MODELS:
        raise HTTPException(400, "Noto'g'ri model")

    # Save conversation
    conv = None
    if data.conversationId:
        result = await db.execute(select(AIConversation).where(AIConversation.id == data.conversationId, AIConversation.userId == current_user.id))
        conv = result.scalar_one_or_none()

    if not conv:
        title = data.messages[0]["content"][:50] if data.messages else "Yangi chat"
        conv = AIConversation(userId=current_user.id, title=title, model=data.model)
        db.add(conv)
        await db.commit()
        await db.refresh(conv)

    # Save user message
    user_msg_content = data.messages[-1].get("content", "") if data.messages else ""
    db.add(AIMessage(conversationId=conv.id, role="user", content=user_msg_content))
    await db.commit()

    # Call AI
    try:
        response_text = await ai_service.chat(
            messages=data.messages,
            model=data.model,
            temperature=data.temperature,
            max_tokens=data.maxTokens,
        )
    except Exception as e:
        raise HTTPException(500, f"AI xatolik: {str(e)}")

    # Save AI message
    db.add(AIMessage(conversationId=conv.id, role="assistant", content=response_text, model=data.model))

    # Deduct tokens (1 token per request for free, configurable for premium)
    cost = 5 if not current_user.isPremium else 1
    if current_user.tokens >= cost:
        current_user.tokens -= cost
    current_user.xp = (current_user.xp or 0) + 2

    await db.commit()

    return {
        "success": True,
        "data": {
            "message": response_text,
            "conversationId": conv.id,
            "model": data.model,
            "tokensUsed": cost,
            "tokensLeft": current_user.tokens,
        }
    }


class ToolIn(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None


@router.post("/tools/startup-idea")
async def tool_startup_idea(data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Generate startup ideas."""
    if current_user.tokens < 10 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    result = await ai_service.startup_idea(
        data.context.get("industry", "tech") if data.context else "tech",
        data.context.get("skills", "") if data.context else "",
        data.context.get("budget", "0-10000") if data.context else "0-10000",
    )
    if current_user.tokens >= 10:
        current_user.tokens -= 10
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 10}}


@router.post("/tools/business-plan")
async def tool_business_plan(data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.tokens < 20 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    ctx = data.context or {}
    result = await ai_service.business_plan(ctx.get("name", "Startup"), ctx.get("industry", "tech"), data.prompt)
    if current_user.tokens >= 20:
        current_user.tokens -= 20
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 20}}


@router.post("/tools/code")
async def tool_code(data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.tokens < 5 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    ctx = data.context or {}
    result = await ai_service.code_assistant(data.prompt, ctx.get("language", "auto"), ctx.get("task", "write"))
    if current_user.tokens >= 5:
        current_user.tokens -= 5
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 5}}


@router.post("/tools/translate")
async def tool_translate(data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.tokens < 2 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    ctx = data.context or {}
    result = await ai_service.translate(data.prompt, ctx.get("from", "auto"), ctx.get("to", "en"))
    if current_user.tokens >= 2:
        current_user.tokens -= 2
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 2}}


@router.post("/tools/blog")
async def tool_blog(data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.tokens < 8 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    ctx = data.context or {}
    result = await ai_service.blog(data.prompt, ctx.get("tone", "professional"), ctx.get("length", "medium"))
    if current_user.tokens >= 8:
        current_user.tokens -= 8
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 8}}


@router.post("/tools/resume")
async def tool_resume(data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.tokens < 10 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    result = await ai_service.resume(data.prompt)
    if current_user.tokens >= 10:
        current_user.tokens -= 10
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 10}}


@router.post("/tools/cover-letter")
async def tool_cover_letter(data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.tokens < 5 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    messages = [
        {"role": "system", "content": "Siz HR mutaxassisiz. Professional cover letter yozing."},
        {"role": "user", "content": data.prompt},
    ]
    result = await ai_service.chat(messages, max_tokens=1500)
    if current_user.tokens >= 5:
        current_user.tokens -= 5
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 5}}


@router.post("/tools/summarize")
async def tool_summarize(data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.tokens < 3 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    ctx = data.context or {}
    result = await ai_service.summarize(data.prompt, ctx.get("maxWords", 200))
    if current_user.tokens >= 3:
        current_user.tokens -= 3
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 3}}


@router.post("/tools/pitch")
async def tool_pitch(data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.tokens < 15 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    ctx = data.context or {}
    result = await ai_service.pitch(data.prompt, ctx.get("audience", "investors"))
    if current_user.tokens >= 15:
        current_user.tokens -= 15
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 15}}


@router.post("/tools/{tool_name}")
async def generic_tool(tool_name: str, data: ToolIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Generic tool handler for remaining AI tools."""
    prompts = {
        "social": "Ijtimoiy tarmoq uchun qisqa, jozibali post yozing.",
        "email": "Professional email yozing.",
        "market-research": "Bozor tadqiqoti o'tkazing.",
        "financial-model": "Moliyaviy model yarating.",
        "legal": "Yuridik maslahat bering (umumiy ma'lumot).",
        "brand-name": "Brend nomlari taklif qiling.",
        "logo": "Logotip g'oyasini tasvirlab bering.",
        "code-review": "Kodni ko'rib chiqing va tavsiyalar bering.",
    }
    if tool_name not in prompts:
        raise HTTPException(404, "Vositа topilmadi")
    if current_user.tokens < 5 and not current_user.isPremium:
        raise HTTPException(402, "Tokenlar yetarli emas")
    messages = [
        {"role": "system", "content": prompts[tool_name]},
        {"role": "user", "content": data.prompt},
    ]
    result = await ai_service.chat(messages, max_tokens=2000)
    if current_user.tokens >= 5:
        current_user.tokens -= 5
    await db.commit()
    return {"success": True, "data": {"result": result, "tokensUsed": 5}}


@router.get("/conversations")
async def list_conversations(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(AIConversation).where(AIConversation.userId == current_user.id).order_by(AIConversation.updatedAt.desc()).limit(50)
    )
    convs = res.scalars().all()
    return {"success": True, "data": [c.to_dict() for c in convs]}


@router.get("/conversations/{conv_id}")
async def get_conversation(conv_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(AIConversation).where(AIConversation.id == conv_id, AIConversation.userId == current_user.id)
    )
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(404, "Suhbat topilmadi")
    return {"success": True, "data": conv.to_dict(include_messages=True)}


@router.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(AIConversation).where(AIConversation.id == conv_id, AIConversation.userId == current_user.id)
    )
    conv = res.scalar_one_or_none()
    if conv:
        await db.delete(conv)
        await db.commit()
    return {"success": True, "data": {"deleted": True}}


@router.get("/usage")
async def usage_stats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(AIConversation).where(AIConversation.userId == current_user.id)
    )
    convs = res.scalars().all()
    return {
        "success": True,
        "data": {
            "totalConversations": len(convs),
            "tokensLeft": current_user.tokens,
            "isPremium": current_user.isPremium,
            "dailyLimit": settings.PREMIUM_AI_REQUESTS_PER_DAY if current_user.isPremium else settings.FREE_AI_REQUESTS_PER_DAY,
        }
    }
