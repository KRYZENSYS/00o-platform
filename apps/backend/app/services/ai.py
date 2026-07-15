"""AI service - GroqCloud integration."""
from typing import List, Dict, AsyncGenerator
import httpx
from loguru import logger

from app.core.config import settings

AI_MODELS = [
    {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B", "provider": "Groq", "speed": "fast", "quality": "high", "context": 128000, "features": ["chat", "analysis", "creative"]},
    {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B", "provider": "Groq", "speed": "ultra-fast", "quality": "medium", "context": 128000, "features": ["chat", "simple"]},
    {"id": "qwen-2.5-coder-32b", "name": "Qwen 2.5 Coder", "provider": "Groq", "speed": "fast", "quality": "high", "context": 32000, "features": ["code"]},
    {"id": "deepseek-r1-distill-llama-70b", "name": "DeepSeek R1", "provider": "Groq", "speed": "medium", "quality": "high", "context": 128000, "features": ["reasoning", "analysis"]},
    {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B", "provider": "Groq", "speed": "fast", "quality": "high", "context": 32768, "features": ["chat", "multilingual"]},
    {"id": "gemma2-9b-it", "name": "Gemma2 9B", "provider": "Groq", "speed": "fast", "quality": "medium", "context": 8192, "features": ["chat"]},
]


async def get_ai_response(
    messages: List[Dict[str, str]],
    model: str = None,
    feature: str = "chat",
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> Dict:
    """Get AI response from GroqCloud."""
    if not settings.GROQ_API_KEY:
        # Fallback response for development
        return {
            "content": get_fallback_response(messages, feature),
            "tokens": 100,
            "model": model or settings.GROQ_DEFAULT_MODEL,
            "cost": 0,
        }

    model = model or settings.GROQ_DEFAULT_MODEL
    url = f"{settings.GROQ_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"Groq API error: {response.status_code} {response.text}")
                return {
                    "content": get_fallback_response(messages, feature),
                    "tokens": 0,
                    "model": model,
                    "cost": 0,
                }
            data = response.json()
            choice = data.get("choices", [{}])[0]
            usage = data.get("usage", {})
            return {
                "content": choice.get("message", {}).get("content", ""),
                "tokens": usage.get("total_tokens", 0),
                "model": model,
                "cost": usage.get("total_tokens", 0) * 0.0001,
            }
    except Exception as e:
        logger.error(f"AI service error: {e}")
        return {
            "content": get_fallback_response(messages, feature),
            "tokens": 0,
            "model": model,
            "cost": 0,
        }


async def stream_ai_response(
    messages: List[Dict[str, str]],
    model: str = None,
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> AsyncGenerator[str, None]:
    """Stream AI response from GroqCloud."""
    if not settings.GROQ_API_KEY:
        yield get_fallback_response(messages, "chat")
        return

    model = model or settings.GROQ_DEFAULT_MODEL
    url = f"{settings.GROQ_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, json=payload, headers=headers) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        chunk = line[6:]
                        if chunk == "[DONE]":
                            break
                        try:
                            import json
                            data = json.loads(chunk)
                            content = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if content:
                                yield content
                        except Exception:
                            pass
    except Exception as e:
        logger.error(f"AI stream error: {e}")
        yield get_fallback_response(messages, "chat")


def get_fallback_response(messages: List[Dict], feature: str) -> str:
    """Fallback response when API key is missing."""
    user_msg = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")

    fallbacks = {
        "chat": f"👋 Assalomu alaykum! Men sizning AI yordamchingizman. Sizning savolingiz: \"{user_msg[:100]}\"\n\n⚠️ Hozirda AI xizmati test rejimida. GroqCloud API kalitini .env faylida sozlang.\n\nGROQ_API_KEY=your_key_here",
        "startup-idea": "💡 Startup g'oya: AI-powered language learning platform for Uzbek speakers\n\n• Target: 5M+ Uzbek speakers wanting to learn English/Russian\n• Revenue: freemium + B2B schools\n• MVP: 3 months, $50K\n• Moat: native language AI tutor\n\n⚠️ To'liq javob olish uchun GROQ_API_KEY ni sozlang.",
        "code": f"// Code generation\n// Sizning so'rovingiz: {user_msg[:50]}...\n\nfunction example() {{\n  // AI generated code will appear here\n  return 'Configure GROQ_API_KEY';\n}}\n\n⚠️ GROQ_API_KEY ni .env faylida sozlang.",
        "business-plan": "📊 Business Plan (qisqacha):\n\n1. Executive Summary\n2. Market Analysis\n3. Products/Services\n4. Marketing Strategy\n5. Financial Projections\n6. Funding Requirements\n\n⚠️ Batafsil versiya uchun GROQ_API_KEY ni sozlang.",
    }
    return fallbacks.get(feature, fallbacks["chat"])
