"""AI service - GroqCloud integration."""
import json
import logging
from typing import List, Dict, Any, Optional, AsyncGenerator
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


# Available Groq models
GROQ_MODELS = {
    "llama-3.3-70b-versatile": {
        "name": "Llama 3.3 70B",
        "max_tokens": 8192,
        "category": "general",
        "description": "Eng kuchli umumiy model",
    },
    "llama-3.1-8b-instant": {
        "name": "Llama 3.1 8B",
        "max_tokens": 8192,
        "category": "general",
        "description": "Tez va arzon",
    },
    "qwen/qwen-2.5-coder-32b": {
        "name": "Qwen Coder 32B",
        "max_tokens": 8000,
        "category": "code",
        "description": "Kod yozish uchun eng yaxshi",
    },
    "deepseek-r1-distill-llama-70b": {
        "name": "DeepSeek R1 70B",
        "max_tokens": 8000,
        "category": "reasoning",
        "description": "Mantiqiy fikrlash uchun",
    },
    "mixtral-8x7b-32768": {
        "name": "Mixtral 8x7B",
        "max_tokens": 32768,
        "category": "general",
        "description": "Uzun kontekst",
    },
}


class AIService:
    """AI service for chat completions and tools."""

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = settings.GROQ_BASE_URL

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "llama-3.3-70b-versatile",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stream: bool = False,
    ) -> str | AsyncGenerator[str, None]:
        """Send chat completion request to GroqCloud."""
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not configured")

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
        }

        if stream:
            return self._stream(url, headers, payload)
        else:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                res.raise_for_status()
                data = res.json()
                return data["choices"][0]["message"]["content"]

    async def _stream(self, url: str, headers: dict, payload: dict) -> AsyncGenerator[str, None]:
        """Stream chat completion."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as res:
                async for line in res.aiter_lines():
                    if line.startswith("data: "):
                        chunk = line[6:]
                        if chunk.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(chunk)
                            content = data["choices"][0]["delta"].get("content", "")
                            if content:
                                yield content
                        except (json.JSONDecodeError, KeyError):
                            continue

    async def startup_idea(self, industry: str, skills: str, budget: str) -> str:
        """Generate startup idea."""
        messages = [
            {"role": "system", "content": "Siz startup ekspertisiz. G'oyalarni real va amaliy qilib bering. Javob o'zbek tilida."},
            {"role": "user", "content": f"Quyidagi ma'lumotlarga asosan 3 ta startup g'oya taklif qiling:\n\nSohasi: {industry}\nKo'nikmalari: {skills}\nByudjeti: {budget}\n\nHar bir g'oya uchun:\n1. Nomi\n2. Muammo\n3. Yechim\n4. Maqsadli auditoriya\n5. Daromad modeli\n6. Dastlabki qadamlar"},
        ]
        return await self.chat(messages, max_tokens=2500)

    async def business_plan(self, name: str, industry: str, description: str) -> str:
        """Generate business plan."""
        messages = [
            {"role": "system", "content": "Siz biznes-konsultantsiz. Reja batafsil, real va amaliy bo'lsin. Javob o'zbek tilida."},
            {"role": "user", "content": f"Biznes-reja tuzing:\n\nNomi: {name}\nSohasi: {industry}\nTavsifi: {description}\n\nRejada:\n1. Xulosa\n2. Kompaniya tavsifi\n3. Bozor tahlili\n4. Marketing strategiya\n5. Operatsion reja\n6. Moliyaviy prognoz (1 yil)\n7. Risklar"},
        ]
        return await self.chat(messages, max_tokens=3000)

    async def code_assistant(self, prompt: str, language: str = "auto", task: str = "write") -> str:
        """Code assistant."""
        messages = [
            {"role": "system", "content": f"Siz dasturchisiz. {language} tilida toza, samarali kod yozing. Izohlar bilan."},
            {"role": "user", "content": f"{task} uchun kod:\n\n{prompt}"},
        ]
        return await self.chat(messages, model="qwen/qwen-2.5-coder-32b", max_tokens=3000)

    async def translate(self, text: str, from_lang: str, to_lang: str) -> str:
        """Translate text."""
        messages = [
            {"role": "system", "content": f"Siz professional tarjimonsiz. {from_lang} dan {to_lang} ga tarjima qiling. Faqat tarjimani qaytaring, izohsiz."},
            {"role": "user", "content": text},
        ]
        return await self.chat(messages, model="llama-3.1-8b-instant", max_tokens=len(text) * 3)

    async def resume(self, info: str) -> str:
        """Generate resume."""
        messages = [
            {"role": "system", "content": "Siz HR ekspertisiz. Professional rezyume yarating. Javob o'zbek tilida, Markdown formatida."},
            {"role": "user", "content": f"Quyidagi ma'lumot asosida rezyume yarating:\n\n{info}"},
        ]
        return await self.chat(messages, max_tokens=2000)

    async def blog(self, topic: str, tone: str = "professional", length: str = "medium") -> str:
        """Generate blog post."""
        word_target = {"short": 300, "medium": 700, "long": 1500}.get(length, 700)
        messages = [
            {"role": "system", "content": f"Siz kontent yozuvchisiz. SEO-optimallashtirilgan, qiziqarli blog maqola yozing. Tone: {tone}. Taxminan {word_target} so'z. Markdown formatida."},
            {"role": "user", "content": f"Mavzu: {topic}"},
        ]
        return await self.chat(messages, max_tokens=min(word_target * 2, 4000))

    async def summarize(self, text: str, max_words: int = 200) -> str:
        """Summarize text."""
        messages = [
            {"role": "system", "content": f"Siz ma'lumot qisqartiruvchisiz. Matnni {max_words} so'zga qisqartiring. Asosiy fikrlarni saqlang."},
            {"role": "user", "content": text},
        ]
        return await self.chat(messages, max_tokens=max_words * 2)

    async def pitch(self, startup: str, audience: str = "investors") -> str:
        """Create pitch deck content."""
        messages = [
            {"role": "system", "content": f"Siz pitch deck mutaxassisiz. {audience} uchun ta'sirli pitch yarating. Markdown."},
            {"role": "user", "content": f"Startup: {startup}"},
        ]
        return await self.chat(messages, max_tokens=2500)


# Singleton
ai_service = AIService()
