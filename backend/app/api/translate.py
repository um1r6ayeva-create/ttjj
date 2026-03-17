from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter()

class TranslateRequest(BaseModel):
    text: str
    target: str

DEESEEK_URL = "https://api.deepseek.com/v1/chat/completions"

@router.post("/translate")
async def translate(req: TranslateRequest):
    if not req.text.strip():
        return {"translated": req.text, "target": req.target}

    headers = {"Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}"}
    payload = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": req.text}],
        "temperature": 0.0
    }

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(DEESEEK_URL, json=payload, headers=headers)
            data = resp.json()
            if resp.status_code != 200:
                # Возвращаем JSON ошибки, не падаем
                return {
                    "error": True,
                    "status": resp.status_code,
                    "message": data.get("error", {}).get("message", "DeepSeek error")
                }
            translated = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return {"translated": translated, "target": req.target}
        except httpx.RequestError as e:
            return {"error": True, "message": str(e)}
