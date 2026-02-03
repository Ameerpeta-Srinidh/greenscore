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
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/analyze")
def analyze_stats(payload: dict):
    from app.prompt import ANALYSIS_PROMPT
    import json
    
    try:
        stats = payload.get("stats")
        if not stats:
             raise HTTPException(status_code=400, detail="Stats are required")

        # Format the prompt with the user's stats
        user_input = json.dumps(stats, indent=2)
        
        # Call LLM with the new system prompt logic
        response_text = call_llm(user_input, system_prompt=ANALYSIS_PROMPT)
        
        # Parse logic
        try:
            clean_text = response_text.replace("```json", "").replace("```", "").strip()
            if "{" not in clean_text:
                 # sometimes LLM just returns text
                 return {"tips": [clean_text[:100]]}
            
            result = json.loads(clean_text)
            return result
        except:
             # Fallback
            return {"tips": ["Reduce travel emissions.", "Conserve electricity.", "Consider plant-based options."]}
            
    except Exception as e:
        print(f"Analysis failed: {e}")
        return {"tips": []}
