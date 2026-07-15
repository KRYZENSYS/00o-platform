"""AI Service for GroqCloud integration with streaming, history, retry logic."""
import httpx
import json
import time
from typing import AsyncGenerator, Optional, List, Dict, Any
from enum import Enum
from loguru import logger
from app.core.config import settings


class AIModel(str, Enum):
    """Available AI models on GroqCloud."""
    LLAMA_70B = "llama-3.3-70b-versatile"
    LLAMA_8B = "llama-3.1-8b-instant"
    LLAMA_VISION = "llama-3.2-90b-vision-preview"
    LLAMA_GUARD = "llama-guard-3-8b"
    DEEPSEEK_R1 = "deepseek-r1-distill-llama-70b"
    QWEN_32B = "qwen-2.5-32b"
    QWEN_CODER = "qwen-2.5-coder-32b"
    WHISPER = "whisper-large-v3"
    MISTRAL_8x7B = "mixtral-8x7b-32768"
    GEMMA_9B = "gemma2-9b-it"


class AIFeature(str, Enum):
    """AI feature types for prompt optimization."""
    CHAT = "chat"
    CODE = "code"
    ANALYZE = "analyze"
    GENERATE = "generate"
    TRANSLATE = "translate"
    SUMMARIZE = "summarize"
    STARTUP_IDEA = "startup_idea"
    BUSINESS_PLAN = "business_plan"
    PITCH_DECK = "pitch_deck"
    RESUME = "resume"
    COVER_LETTER = "cover_letter"
    JOB_DESCRIPTION = "job_description"
    MARKETING = "marketing"
    SEO = "seo"
    BLOG = "blog"
    EMAIL = "email"
    SQL = "sql"
    UI = "ui"
    PROJECT_PLAN = "project_plan"
    BRAINSTORM = "brainstorm"
    FINANCIAL = "financial"
    MARKET = "market"
    COMPETITOR = "competitor"
    BUG_FIX = "bug_fix"
    CODE_REVIEW = "code_review"
    API_DOCS = "api_docs"
    LOGO_PROMPT = "logo_prompt"
    DOMAIN = "domain"
    NAME = "name"
    IMAGE_ANALYZE = "image_analyze"
    PDF_ANALYZE = "pdf_analyze"


SYSTEM_PROMPTS: Dict[AIFeature, str] = {
    AIFeature.CHAT: "Siz 00o.uz platformasining AI yordamchisisiz. O'zbek va Rus tillarida ishlaysiz. Yordam bering, savollarga javob bering, g'oyalar taklif qiling.",
    AIFeature.CODE: "Siz senior dasturchisiz. Clean, efficient, well-commented code yozing. Best practices ga amal qiling.",
    AIFeature.STARTUP_IDEA: "Siz startup mentor va VC siz. Yangi, original, amaliy biznes g'oyalar yarating. Bozorni, raqobatchilarni, monetizatsiyani hisobga oling.",
    AIFeature.BUSINESS_PLAN: "Siz professional biznes konsultant siz. To'liq, batafsil, amaliy biznes reja tuzing - bozor tahlili, marketing strategiya, moliyaviy prognoz.",
    AIFeature.PITCH_DECK: "Siz pitch deck mutaxassisisiz. Investorlarni jalb qiluvchi 10-12 slaydli pitch deck kontentini yarating.",
    AIFeature.RESUME: "Siz professional HR va resume writer siz. ATS-friendly, zamonaviy, samarali resume yarating.",
    AIFeature.COVER_LETTER: "Siz cover letter mutaxassisisiz. Shaxsiy, professional, kompaniyaga mos cover letter yozing.",
    AIFeature.MARKETING: "Siz marketing strateg siz. Digital marketing, SMM, content marketing strategiyalari ishlab chiqing.",
    AIFeature.SEO: "Siz SEO mutaxassisisiz. Keywords, meta tags, content optimization, technical SEO bo'yicha maslahat bering.",
    AIFeature.BLOG: "Siz professional kontent yozuvchi siz. SEO-optimized, qiziqarli, foydali blog maqolalari yozing.",
    AIFeature.TRANSLATE: "Siz professional tarjimonsiz. Matnning ma'nosini saqlagan holda aniq, tabiiy tarjima qiling.",
    AIFeature.SUMMARIZE: "Siz matn tahlilchisiz. Asosiy g'oyalarni, muhim ma'lumotlarni ajratib, qisqa va aniq xulosa bering.",
    AIFeature.CODE_REVIEW: "Siz senior code reviewer siz. Kod sifatini, xavfsizlik, performance, best practices bo'yicha tahlil qiling.",
    AIFeature.BUG_FIX: "Siz debugging mutaxassisisiz. Muammolarni aniqlang, tushuntiring va yechim bering.",
    AIFeature.SQL: "Siz database mutaxassisisiz. Optimallashtirilgan, xavfsiz SQL querylar yozing.",
    AIFeature.UI: "Siz UI/UX dizayner siz. Zamonaviy, foydalanuvchiga qulay interfeys tavsifini yarating.",
    AIFeature.FINANCIAL: "Siz moliyaviy maslahatchisiz. Moliyaviy tahlil, prognoz, strategiya bo'yicha yordam bering.",
    AIFeature.MARKET: "Siz bozor tadqiqotchisi siz. Bozor hajmi, o'sish sur'atlari, tendentsiyalar, raqobatchilarni tahlil qiling.",
    AIFeature.COMPETITOR: "Siz strategik tahlilchisiz. Raqobatchilarni chuqur tahlil qilib, strategiya taklif qiling.",
    AIFeature.PROJECT_PLAN: "Siz project manager siz. To'liq project plan, timeline, resurslar, risklarni belgilang.",
    AIFeature.BRAINSTORM: "Siz kreativ fikrlovchisiz. Cheksiz g'oyalar, noodatiy yechimlar, innovatsion yondashuvlar taklif qiling.",
    AIFeature.LOGO_PROMPT: "Siz AI image prompt mutaxassisisiz. Logo yaratish uchun batafsil, aniq prompt yozing.",
    AIFeature.DOMAIN: "Siz branding mutaxassisisiz. Biznes uchun mos, esda qolarli domain nomlari taklif qiling.",
    AIFeature.NAME: "Siz naming mutaxassisisiz. Biznes, startup, mahsulot uchun kreativ, esda qolarli nomlar yarating.",
    AIFeature.JOB_DESCRIPTION: "Siz HR mutaxassisisiz. Aniq, professional, jozibali vakansiya tavsifi yozing.",
    AIFeature.EMAIL: "Siz professional email yozuvchi siz. Turli holatlar uchun - biznes, marketing, shaxsiy.",
    AIFeature.API_DOCS: "Siz API documentation mutaxassisisiz. To'liq, tushunarli, misollar bilan API docs yozing.",
    AIFeature.IMAGE_ANALYZE: "Siz visual tahlilchisiz. Rasmlarni batafsil tahlil qilib, tavsif bering.",
    AIFeature.PDF_ANALYZE: "Siz hujjat tahlilchisiz. PDF kontentini tahlil qilib, asosiy ma'lumotlarni ajrating.",
}


class AIService:
    """AI service for GroqCloud integration."""

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.api_base = settings.GROQ_API_BASE
        self.default_model = settings.AI_DEFAULT_MODEL
        self.fallback_model = settings.AI_FALLBACK_MODEL
        self.max_tokens = settings.AI_MAX_TOKENS
        self.temperature = settings.AI_TEMPERATURE

    def _get_headers(self) -> Dict[str, str]:
        """Get request headers."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _get_model_for_feature(self, feature: AIFeature) -> str:
        """Get optimal model for feature."""
        model_map = {
            AIFeature.CODE: AIModel.QWEN_CODER.value,
            AIFeature.CODE_REVIEW: AIModel.QWEN_CODER.value,
            AIFeature.BUG_FIX: AIModel.QWEN_CODER.value,
            AIFeature.SQL: AIModel.QWEN_CODER.value,
            AIFeature.TRANSLATE: AIModel.LLAMA_70B.value,
            AIFeature.SUMMARIZE: AIModel.LLAMA_8B.value,
            AIFeature.STARTUP_IDEA: AIModel.LLAMA_70B.value,
            AIFeature.BUSINESS_PLAN: AIModel.LLAMA_70B.value,
            AIFeature.PITCH_DECK: AIModel.LLAMA_70B.value,
            AIFeature.MARKETING: AIModel.LLAMA_70B.value,
            AIFeature.SEO: AIModel.LLAMA_70B.value,
            AIFeature.BLOG: AIModel.LLAMA_70B.value,
            AIFeature.COMPETITOR: AIModel.LLAMA_70B.value,
            AIFeature.MARKET: AIModel.LLAMA_70B.value,
            AIFeature.FINANCIAL: AIModel.LLAMA_70B.value,
        }
        return model_map.get(feature, self.default_model)

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        feature: AIFeature = AIFeature.CHAT,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        stream: bool = False,
    ) -> Dict[str, Any]:
        """Send chat request to GroqCloud."""
        start_time = time.time()
        model = model or self._get_model_for_feature(feature)
        temperature = temperature if temperature is not None else self.temperature
        max_tokens = max_tokens or self.max_tokens

        # Add system prompt
        system_prompt = SYSTEM_PROMPTS.get(feature, SYSTEM_PROMPTS[AIFeature.CHAT])
        if not messages or messages[0].get("role") != "system":
            messages = [{"role": "system", "content": system_prompt}] + messages

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.api_base}/chat/completions",
                    json=payload,
                    headers=self._get_headers(),
                )

                if response.status_code != 200:
                    logger.error(f"AI API error: {response.status_code} - {response.text}")
                    # Try fallback model
                    if model != self.fallback_model:
                        return await self.chat(
                            messages, model=self.fallback_model, feature=feature,
                            temperature=temperature, max_tokens=max_tokens, stream=stream
                        )
                    raise Exception(f"AI API error: {response.status_code}")

                result = response.json()
                duration = time.time() - start_time

                usage = result.get("usage", {})
                return {
                    "content": result["choices"][0]["message"]["content"],
                    "model": model,
                    "tokens_in": usage.get("prompt_tokens", 0),
                    "tokens_out": usage.get("completion_tokens", 0),
                    "duration": duration,
                    "finish_reason": result["choices"][0].get("finish_reason"),
                }

        except Exception as e:
            logger.error(f"AI service error: {e}")
            raise

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        feature: AIFeature = AIFeature.CHAT,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """Stream chat response from GroqCloud."""
        model = model or self._get_model_for_feature(feature)
        temperature = temperature if temperature is not None else self.temperature
        max_tokens = max_tokens or self.max_tokens

        system_prompt = SYSTEM_PROMPTS.get(feature, SYSTEM_PROMPTS[AIFeature.CHAT])
        if not messages or messages[0].get("role") != "system":
            messages = [{"role": "system", "content": system_prompt}] + messages

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{self.api_base}/chat/completions",
                    json=payload,
                    headers=self._get_headers(),
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]
                            if data.strip() == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data)
                                delta = chunk["choices"][0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            logger.error(f"AI stream error: {e}")
            yield f"\n\n[Xatolik: {str(e)}]"

    async def generate_text(
        self,
        prompt: str,
        feature: AIFeature = AIFeature.GENERATE,
        model: Optional[str] = None,
        **kwargs,
    ) -> str:
        """Generate text from prompt."""
        messages = [{"role": "user", "content": prompt}]
        result = await self.chat(messages, feature=feature, model=model, **kwargs)
        return result["content"]

    async def analyze_file(
        self,
        file_content: str,
        instruction: str,
        feature: AIFeature = AIFeature.PDF_ANALYZE,
    ) -> str:
        """Analyze file content."""
        prompt = f"""Quyidagi fayl kontentini tahlil qiling.

Fayl:
{file_content[:15000]}

Topshiriq:
{instruction}

Tahlil natijasini batafsil bering."""
        return await self.generate_text(prompt, feature=feature)

    async def analyze_image(
        self,
        image_url: str,
        prompt: str = "Bu rasmni batafsil tavsiflang.",
    ) -> str:
        """Analyze image via vision model."""
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ]

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.api_base}/chat/completions",
                    json={
                        "model": AIModel.LLAMA_VISION.value,
                        "messages": messages,
                        "max_tokens": 1024,
                    },
                    headers=self._get_headers(),
                )
                result = response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Image analyze error: {e}")
            return f"Rasm tahlilida xatolik: {str(e)}"


ai_service = AIService()
