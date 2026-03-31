from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.llm import call_llm
from app.parser import parse_response

app = FastAPI(title="GreenScore+ AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/parse-text")
def parse_text(payload: dict):
    try:
        text = payload.get("text")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")

        raw = call_llm(text)
        print(f"DEBUG: LLM Raw Output: {raw}")
        parsed = parse_response(raw)
        print(f"DEBUG: Parsed Output: {parsed}")

        if not parsed:
            raise HTTPException(status_code=500, detail="Failed to parse activity")

        return parsed
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/analyze")
def analyze_stats(payload: dict):
    import json

    try:
        stats = payload.get("stats")
        if not stats:
            raise HTTPException(status_code=400, detail="Stats are required")

        breakdown = stats.get("breakdown", {})
        total = stats.get("totalCarbon", 0)

        tips = []
        if breakdown.get("travel", 0) > total * 0.4:
            tips.append("Your biggest emissions come from travel. Try public transport or carpooling.")
        if breakdown.get("electricity", 0) > total * 0.3:
            tips.append("High electricity usage detected. Set AC to 24°C and use LED bulbs.")
        if breakdown.get("food", 0) > total * 0.2:
            tips.append("Food emissions are significant. Adding one plant-based meal per week saves ~2.5 kg CO₂.")
        if breakdown.get("shopping", 0) > total * 0.2:
            tips.append("Shopping is contributing to your footprint. Consider buying second-hand items.")
        if not tips:
            tips.append("Great work! Keep logging activities to get personalized tips.")
            tips.append("Try setting a monthly carbon goal to stay on track.")

        return {"tips": tips}

    except Exception as e:
        print(f"Analysis failed: {e}")
        return {"tips": ["Keep logging activities to get personalized eco tips!"]}
