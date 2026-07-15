"""AI API endpoints - 20+ AI tools with streaming support."""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import time

from app.core.database import get_db
from app.services.ai_service import ai_service, AIFeature
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])


# Schemas
class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    chatId: Optional[str] = None
    model: Optional[str] = None
    feature: AIFeature = AIFeature.CHAT
    temperature: Optional[float] = None
    maxTokens: Optional[int] = None
    stream: bool = False


class GenerateRequest(BaseModel):
    prompt: str
    feature: AIFeature
    model: Optional[str] = None
    options: Optional[Dict[str, Any]] = None


class StartupIdeaRequest(BaseModel):
    industry: Optional[str] = None
    budget: Optional[str] = None
    skills: Optional[str] = None
    target: Optional[str] = None


class BusinessPlanRequest(BaseModel):
    idea: str
    audience: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None


class CodeRequest(BaseModel):
    language: str = "python"
    description: str
    framework: Optional[str] = None


class ReviewRequest(BaseModel):
    code: str
    language: str = "python"


class EmailRequest(BaseModel):
    type: str  # marketing, business, support
    subject: str
    context: str
    tone: Optional[str] = "professional"


class BlogRequest(BaseModel):
    topic: str
    keywords: Optional[List[str]] = None
    length: int = 1500
    style: Optional[str] = "informative"


class TranslateRequest(BaseModel):
    text: str
    fromLang: str = "uz"
    toLang: str = "en"


class SQLRequest(BaseModel):
    description: str
    schema: Optional[str] = None
    database: str = "postgresql"


# Endpoints
@router.post("/chat")
async def ai_chat(data: ChatRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    """AI chat with history support."""
    start = time.time()

    # Get or create chat
    chat = None
    if data.chatId:
        chat = await db.aichat.find_unique(where={"id": data.chatId})
    if not chat:
        chat = await db.aichat.create(data={
            "userId": current_user["id"],
            "title": data.messages[-1]["content"][:50] if data.messages else "New chat",
            "model": data.model or ai_service.default_model,
        })

    # Save user message
    await db.aimessage.create(data={
        "chatId": chat["id"],
        "role": "user",
        "content": data.messages[-1]["content"],
    })

    if data.stream:
        async def generate():
            full_response = ""
            async for chunk in ai_service.stream_chat(
                data.messages, model=data.model, feature=data.feature,
                temperature=data.temperature, max_tokens=data.maxTokens,
            ):
                full_response += chunk
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "data: [DONE]\n\n"

            # Save assistant message
            await db.aimessage.create(data={
                "chatId": chat["id"],
                "role": "assistant",
                "content": full_response,
                "model": data.model or ai_service.default_model,
            })
        return StreamingResponse(generate(), media_type="text/event-stream")

    # Non-streaming
    result = await ai_service.chat(
        data.messages, model=data.model, feature=data.feature,
        temperature=data.temperature, max_tokens=data.maxTokens,
    )

    await db.aimessage.create(data={
        "chatId": chat["id"],
        "role": "assistant",
        "content": result["content"],
        "tokens": result["tokens_in"] + result["tokens_out"],
        "model": result["model"],
    })

    await db.ailog.create(data={
        "userId": current_user["id"],
        "feature": data.feature.value,
        "model": result["model"],
        "tokensIn": result["tokens_in"],
        "tokensOut": result["tokens_out"],
        "duration": int(result["duration"] * 1000),
        "success": True,
    })

    return {
        "content": result["content"],
        "chatId": chat["id"],
        "model": result["model"],
        "usage": {"tokensIn": result["tokens_in"], "tokensOut": result["tokens_out"]},
    }


@router.get("/chats")
async def get_chats(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get user's AI chats."""
    chats = await db.aichat.find_many(
        where={"userId": current_user["id"]},
        order={"updatedAt": "desc"},
        take=50,
    )
    return chats


@router.get("/chats/{chat_id}")
async def get_chat(chat_id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get chat with messages."""
    chat = await db.aichat.find_unique(where={"id": chat_id})
    if not chat or chat["userId"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = await db.aimessage.find_many(where={"chatId": chat_id}, order={"createdAt": "asc"})
    return {"chat": chat, "messages": messages}


@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    """Delete chat."""
    chat = await db.aichat.find_unique(where={"id": chat_id})
    if not chat or chat["userId"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Chat not found")
    await db.aimessage.delete_many(where={"chatId": chat_id})
    await db.aichat.delete(where={"id": chat_id})
    return {"message": "Deleted"}


@router.post("/startup-idea")
async def startup_idea(data: StartupIdeaRequest, current_user=Depends(get_current_user)):
    """Generate startup ideas."""
    prompt = f"""5 ta yangi, original startup g'oya yarating.

Talablar:
- Soha: {data.industry or 'Istalgan'}
- Byudjet: {data.budget or 'Istalgan'}
- Ko'nikmalar: {data.skills or 'Istalgan'}
- Maqsadli auditoriya: {data.target or 'Keng'}

Har bir g'oya uchun quyidagilarni bering:
1. Nomi va slug
2. Tagline (1 qator)
3. Muammo va yechim
4. Monetizatsiya modeli
5. Dastlabki 3 oy reja
6. Potentsial foyda (yiliga)

Jadval formatida, har birini aniq tushuntiring."""

    result = await ai_service.generate_text(prompt, feature=AIFeature.STARTUP_IDEA)
    return {"result": result}


@router.post("/business-plan")
async def business_plan(data: BusinessPlanRequest, current_user=Depends(get_current_user)):
    """Generate business plan."""
    prompt = f"""To'liq biznes reja tuzing:

G'oya: {data.idea}
Auditoriya: {data.audience or 'Keng'}
Byudjet: {data.budget or 'Belgilanmagan'}
Muddat: {data.timeline or '1 yil'}

Quyidagi bo'limlarni batafsil yozing:
1. Xulosa (Executive Summary)
2. Kompaniya tavsifi
3. Mahsulot/Xizmat
4. Bozor tahlili
5. Marketing strategiya
6. Operatsion rejim
7. Boshqaruv jamoasi
8. Moliyaviy prognoz (3 yil)
9. Xavflar va yechimlar
10. Ilova (kelajak rejalar)"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.BUSINESS_PLAN)
    return {"result": result}


@router.post("/pitch-deck")
async def pitch_deck(data: dict, current_user=Depends(get_current_user)):
    """Generate pitch deck content."""
    prompt = f"""10 slaydli investor pitch deck kontentini yarating.

Startup: {data.get('startup')}
Mahsulot: {data.get('product')}
Maqsad: {data.get('goal', 'Series A')}

Har bir slayd uchun:
- Sarlavha
- 3-5 bullet point
- Speaker notes

Slaydlar:
1. Title (kompaniya nomi, tagline)
2. Muammo
3. Yechim
4. Mahsulot
5. Bozor hajmi (TAM, SAM, SOM)
6. Biznes modeli
7. Traction (o'sish ko'rsatkichlari)
8. Raqobatchilar
9. Jamoa
10. So'rov (qancha, nima uchun, nima berishadi)"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.PITCH_DECK)
    return {"result": result}


@router.post("/resume")
async def resume_builder(data: dict, current_user=Depends(get_current_user)):
    """Generate professional resume."""
    prompt = f"""Professional, ATS-friendly resume yarating:

Shaxsiy ma'lumot: {data.get('personal', '')}
Maqsad: {data.get('position', '')}
Tajriba: {data.get('experience', '')}
Ko'nikmalar: {data.get('skills', '')}
Ta'lim: {data.get('education', '')}
Yutuqlar: {data.get('achievements', '')}

Quyidagi formatda:
1. Header (kontakt ma'lumotlari)
2. Professional Summary (3-4 qator)
3. Skills (texnik + soft)
4. Experience (3-4 lavozim, har birida 4-5 bullet)
5. Education
6. Projects
7. Certifications
8. Languages"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.RESUME)
    return {"result": result}


@router.post("/cover-letter")
async def cover_letter(data: dict, current_user=Depends(get_current_user)):
    """Generate cover letter."""
    prompt = f"""Professional cover letter yozing:

Lavozim: {data.get('position')}
Kompaniya: {data.get('company')}
Mening tajribam: {data.get('experience')}
Nega aynan shu kompaniya: {data.get('motivation', '')}
Qobiliyatlar: {data.get('skills', '')}

Qisqa (300-400 so'z), professional, shaxsiy, kompaniyaga mos bo'lsin."""

    result = await ai_service.generate_text(prompt, feature=AIFeature.COVER_LETTER)
    return {"result": result}


@router.post("/code")
async def generate_code(data: CodeRequest, current_user=Depends(get_current_user)):
    """Generate code from description."""
    prompt = f"""Quyidagi tavsifga asosan kod yozing:

Til: {data.language}
Framework: {data.framework or 'Standart'}
Tavsif: {data.description}

Talablar:
- To'liq ishlaydigan kod
- To'liq izohlar
- Error handling
- Best practices
- Input validation
- Test misollari (bonus)

Kodni markdown code block ichida bering."""

    result = await ai_service.generate_text(prompt, feature=AIFeature.CODE)
    return {"result": result}


@router.post("/code/review")
async def code_review(data: ReviewRequest, current_user=Depends(get_current_user)):
    """Review code and provide feedback."""
    prompt = f"""Quyidagi kodni professional darajada tahlil qiling:

Til: {data.language}

Kod:
```
{data.code}
```

Tahlil:
1. ✅ Yaxshi tomonlar
2. ⚠️ Muammolar va xavfsizlik
3. 🚀 Performance optimallashtirish
4. 🧹 Code quality va best practices
5. 📝 Yaxshilangan kod (to'liq)
6. 🧪 Testlar"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.CODE_REVIEW)
    return {"result": result}


@router.post("/code/bug-fix")
async def bug_fix(data: dict, current_user=Depends(get_current_user)):
    """Fix bugs in code."""
    prompt = f"""Quyidagi kodda xatolarni toping va tuzating:

Kod:
```
{data.get('code', '')}
```

Xato tavsifi: {data.get('error', '')}

Javob:
1. Xatolar tahlili
2. Tuzatilgan kod
3. Tushuntirish"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.BUG_FIX)
    return {"result": result}


@router.post("/sql")
async def sql_generator(data: SQLRequest, current_user=Depends(get_current_user)):
    """Generate SQL query."""
    prompt = f"""SQL query yarating:

Database: {data.database}
Tavsif: {data.description}
Sxema: {data.schema or 'mavjud emas'}

Talablar:
- To'g'ri sintaksis
- Optimallashtirilgan
- Index tavsiyalari
- Xavfsiz (SQL injection oldini olish)
- Tushuntirish"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.SQL)
    return {"result": result}


@router.post("/translate")
async def translate(data: TranslateRequest, current_user=Depends(get_current_user)):
    """Translate text."""
    prompt = f"""Quyidagi matnni {data.fromLang} tilidan {data.toLang} tiliga tarjima qiling:

Matn:
{data.text}

Tabiiy, aniq, ma'no saqlangan holda tarjima qiling. Faqat tarjimani bering."""

    result = await ai_service.generate_text(prompt, feature=AIFeature.TRANSLATE)
    return {"result": result}


@router.post("/summarize")
async def summarize(data: dict, current_user=Depends(get_current_user)):
    """Summarize text."""
    prompt = f"""Quyidagi matnni qisqa va aniq xulosa qilib bering.

Matn:
{data.get('text', '')}

Xulosa:
- Asosiy g'oyalar (3-5 bullet)
- Muhim raqamlar/faktlar
- Xulosa (1-2 jumla)"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.SUMMARIZE)
    return {"result": result}


@router.post("/blog")
async def blog_generator(data: BlogRequest, current_user=Depends(get_current_user)):
    """Generate blog post."""
    prompt = f"""Blog maqolasi yozing:

Mavzu: {data.topic}
Kalit so'zlar: {', '.join(data.keywords or [])}
Uzunlik: ~{data.length} so'z
Uslub: {data.style}

Maqola strukturasi:
1. Qiziqarli sarlavha (SEO)
2. Meta description (155 belgi)
3. Kirish (muammoni ko'taring)
4. Asosiy qism (5-7 bo'lim, har birida H2)
5. Xulosa
6. CTA (Call to action)

Markdown formatida, SEO-optimallashtirilgan."""

    result = await ai_service.generate_text(prompt, feature=AIFeature.BLOG)
    return {"result": result}


@router.post("/email")
async def email_generator(data: EmailRequest, current_user=Depends(get_current_user)):
    """Generate email."""
    prompt = f"""Professional email yozing:

Turi: {data.type}
Mavzu: {data.subject}
Kontekst: {data.context}
Ohang: {data.tone}

Qisqa, aniq, samarali. Subject line ham taklif qiling."""

    result = await ai_service.generate_text(prompt, feature=AIFeature.EMAIL)
    return {"result": result}


@router.post("/marketing")
async def marketing_strategy(data: dict, current_user=Depends(get_current_user)):
    """Generate marketing strategy."""
    prompt = f"""To'liq marketing strategiyasi tuzing:

Mahsulot: {data.get('product')}
Auditoriya: {data.get('audience')}
Byudjet: {data.get('budget', '')}
Muddat: {data.get('timeline', '3 oy')}

Bo'limlar:
1. Auditorya tahlili
2. Raqobatchilar tahlili
3. Unique value proposition
4. Marketing kanallar
5. Content strategiyasi
6. Social media rejasi
7. Email marketing
8. SEO strategiyasi
9. Byudjet taqsimoti
10. KPI va o'lchash
11. Timeline"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.MARKETING)
    return {"result": result}


@router.post("/seo")
async def seo_generator(data: dict, current_user=Depends(get_current_user)):
    """SEO analysis and suggestions."""
    prompt = f"""SEO tahlil va tavsiyalar:

Mavzu/Sahifa: {data.get('topic')}
Kalit so'zlar: {data.get('keywords', '')}
URL: {data.get('url', '')}

Javob:
1. Asosiy kalit so'zlar
2. Long-tail kalit so'zlar
3. Title tag (60 belgi)
4. Meta description (155 belgi)
5. H1, H2 tavsiyalar
6. Content strukturasi
7. Internal linking
8. Backlink strategiyasi
9. Technical SEO
10. Schema markup"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.SEO)
    return {"result": result}


@router.post("/logo-prompt")
async def logo_prompt(data: dict, current_user=Depends(get_current_user)):
    """Generate logo design prompt for AI image generators."""
    prompt = f"""AI image generator (Midjourney/DALL-E) uchun batafsil logo prompt yarating:

Brend: {data.get('brand')}
Soha: {data.get('industry')}
Uslub: {data.get('style', 'modern minimalist')}
Ranglar: {data.get('colors', '')}

Prompt formati:
- Logo tavsifi
- Shakl va kompozitsiya
- Ranglar (aniq hex kodlar)
- Shrift uslubi
- Orqa fon
- Texnika
- 3 ta variant prompt

Ingliz tilida, batafsil."""

    result = await ai_service.generate_text(prompt, feature=AIFeature.LOGO_PROMPT)
    return {"result": result}


@router.post("/domain")
async def domain_suggestions(data: dict, current_user=Depends(get_current_user)):
    """Suggest domain names."""
    prompt = f"""Biznes uchun domain nomlari taklif qiling:

Biznes: {data.get('business')}
Soha: {data.get('industry')}
Maqsad: {data.get('vibe', 'zamonaviy')}

15 ta domain taklif qiling:
- .com
- .uz
- .io
- .co
- .ai

Har biri uchun:
- Domain nomi
- Qisqacha ma'nosi
- Afzalliklari

Qisqa, esda qolarli, brandable."""

    result = await ai_service.generate_text(prompt, feature=AIFeature.DOMAIN)
    return {"result": result}


@router.post("/brainstorm")
async def brainstorm(data: dict, current_user=Depends(get_current_user)):
    """Brainstorming assistant."""
    prompt = f"""Mavzu bo'yicha kreativ g'oyalar generatsiya qiling:

Mavzu: {data.get('topic')}
Maqsad: {data.get('goal', '')}
Cheklovlar: {data.get('constraints', '')}

20 ta turli xil g'oya taklif qiling:
- Auditorya g'oyalar
- Texnik g'oyalar
- Marketing g'oyalar
- Biznes model g'oyalar
- Noodatiy yondashuvlar

Har birini 1-2 jumla bilan tushuntiring."""

    result = await ai_service.generate_text(prompt, feature=AIFeature.BRAINSTORM)
    return {"result": result}


@router.post("/project-plan")
async def project_plan(data: dict, current_user=Depends(get_current_user)):
    """Generate project plan."""
    prompt = f"""Batafsil project plan tuzing:

Loyiha: {data.get('project')}
Maqsad: {data.get('goal')}
Muddat: {data.get('timeline', '')}
Jamoa: {data.get('team', '')}

Bo'limlar:
1. Loyiha tavsifi
2. Maqsad va ko'rsatkichlar
3. Scope (qamrov)
4. Work Breakdown Structure
5. Timeline (Gantt chart format)
6. Resurslar
7. Jamoa rollari
8. Risklarni boshqarish
9. Budget
10. Kommunikatsiya rejasi
11. Sifat nazorati
12. Yetkazib berish"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.PROJECT_PLAN)
    return {"result": result}


@router.post("/analyze-text")
async def analyze_text(data: dict, current_user=Depends(get_current_user)):
    """Analyze text content."""
    prompt = f"""Quyidagi matnni chuqur tahlil qiling:

Matn:
{data.get('text', '')}

Tahlil:
1. Asosiy mavzu
2. Muhim g'oyalar
3. Ton va ohang
4. Ijobiy tomonlar
5. Salbiy tomonlar
6. Yaxshilash takliflari
7. Target audience
8. Engagement darajasi"""

    result = await ai_service.generate_text(prompt, feature=AIFeature.ANALYZE)
    return {"result": result}


@router.get("/usage")
async def get_usage(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get AI usage statistics."""
    logs = await db.ailog.find_many(
        where={"userId": current_user["id"]},
        order={"createdAt": "desc"},
        take=1000,
    )
    total_in = sum(l.get("tokensIn", 0) for l in logs)
    total_out = sum(l.get("tokensOut", 0) for l in logs)
    total_calls = len(logs)

    return {
        "totalCalls": total_calls,
        "tokensIn": total_in,
        "tokensOut": total_out,
        "totalTokens": total_in + total_out,
        "byFeature": {},
        "byModel": {},
    }


@router.get("/models")
async def list_models():
    """List available AI models."""
    return {
        "models": [
            {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B", "provider": "Groq", "type": "chat", "context": 128000, "recommended": True},
            {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B (Fast)", "provider": "Groq", "type": "chat", "context": 128000},
            {"id": "llama-3.2-90b-vision-preview", "name": "Llama 3.2 90B Vision", "provider": "Groq", "type": "vision", "context": 128000},
            {"id": "deepseek-r1-distill-llama-70b", "name": "DeepSeek R1", "provider": "Groq", "type": "reasoning", "context": 128000},
            {"id": "qwen-2.5-32b", "name": "Qwen 2.5 32B", "provider": "Groq", "type": "chat", "context": 128000},
            {"id": "qwen-2.5-coder-32b", "name": "Qwen 2.5 Coder 32B", "provider": "Groq", "type": "code", "context": 128000, "recommended_for": ["code", "sql", "review"]},
            {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B", "provider": "Groq", "type": "chat", "context": 32768},
            {"id": "gemma2-9b-it", "name": "Gemma 2 9B", "provider": "Groq", "type": "chat", "context": 8192},
        ]
    }
