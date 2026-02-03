import json
from app.schemas import ParsedActivity

def parse_response(raw: str):
    try:
        data = json.loads(raw)
        parsed = ParsedActivity(**data)
        return parsed.model_dump()
    except Exception:
        return None
