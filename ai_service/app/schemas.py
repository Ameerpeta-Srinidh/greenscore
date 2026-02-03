from pydantic import BaseModel
from typing import Optional

class ParsedActivity(BaseModel):
    type: str
    mode: Optional[str] = None
    distance_km: Optional[float] = None
    electricity_kwh: Optional[float] = None
    food_type: Optional[str] = None
