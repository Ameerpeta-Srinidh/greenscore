import requests
import os
from fastapi import HTTPException
from app.prompt import SYSTEM_PROMPT

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
MODEL = os.getenv("MODEL", "llama3.2:1b")

def call_llm(text: str, system_prompt: str = SYSTEM_PROMPT):
    payload = {
        "model": MODEL,
        "prompt": text,
        "system": system_prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()["response"]
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="AI Service unavailable (Ollama connection failed)")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="AI Service timed out")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"AI Service error: {str(e)}")
