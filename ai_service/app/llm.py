import re
import json
import os

# ──────────────────────────────────────────────
#  Smart Rule-Based Activity Parser (No Ollama)
#  Falls back to Gemini API if GEMINI_API_KEY is set
# ──────────────────────────────────────────────

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def _rule_based_parse(text: str) -> dict | None:
    """Parse common activity descriptions without any LLM."""
    t = text.lower().strip()

    # ── TRAVEL ──────────────────────────────────────────────
    travel_modes = {
        "car": ["car", "drove", "drive", "taxi", "cab", "uber", "ola", "auto"],
        "bike": ["bike", "bicycle", "cycling", "cycled", "cycle"],
        "bus": ["bus", "minibus", "coach"],
        "train": ["train", "metro", "subway", "rail", "tube"],
        "plane": ["plane", "flight", "flew", "airplane", "aircraft", "fly"],
        "walk": ["walk", "walked", "on foot", "walking"],
        "scooter": ["scooter", "moped", "e-scooter"],
        "motorcycle": ["motorcycle", "motorbike", "bike ride", "two-wheeler"],
    }

    for mode, keywords in travel_modes.items():
        if any(kw in t for kw in keywords):
            # Extract distance
            dist = None
            m = re.search(r"(\d+(?:\.\d+)?)\s*km", t)
            if m:
                dist = float(m.group(1))
            else:
                m = re.search(r"(\d+(?:\.\d+)?)\s*mile", t)
                if m:
                    dist = round(float(m.group(1)) * 1.609, 1)
                else:
                    m = re.search(r"(\d+(?:\.\d+)?)\s*k\b", t)
                    if m:
                        dist = float(m.group(1))

            recs = {
                "car": "Try carpooling or switching to public transport.",
                "bike": "Great choice! Cycling is zero-emission.",
                "bus": "Buses are 4x more efficient than solo driving.",
                "train": "Rail travel is one of the cleanest options.",
                "plane": "Consider trains or video calls for short trips.",
                "walk": "Walking is zero-emission and healthy!",
                "scooter": "E-scooters are low-emission for short trips.",
                "motorcycle": "Motorcycles emit less than cars; consider electric.",
            }
            savings = {"car": 2.1, "plane": 50, "motorcycle": 0.5, "scooter": 0.1,
                       "bike": 0, "bus": 0.3, "train": 0.2, "walk": 0}

            return {
                "type": "travel",
                "mode": mode,
                "distance_km": dist or 10.0,
                "electricity_kwh": None,
                "food_type": None,
                "item_type": None,
                "recommendation": recs.get(mode, "Choose greener transport."),
                "potential_savings_kg": savings.get(mode, 1.0),
            }

    # ── ELECTRICITY ─────────────────────────────────────────
    elec_keywords = ["kwh", "electricity", "power", "ac", "air condition",
                     "fan", "heater", "appliance", "used electricity", "electric"]
    if any(kw in t for kw in elec_keywords):
        kwh = None
        m = re.search(r"(\d+(?:\.\d+)?)\s*kwh", t)
        if m:
            kwh = float(m.group(1))
        else:
            m = re.search(r"(\d+(?:\.\d+)?)\s*unit", t)
            if m:
                kwh = float(m.group(1))
            else:
                m = re.search(r"(\d+(?:\.\d+)?)\s*hour", t)
                if m:
                    kwh = round(float(m.group(1)) * 1.5, 1)

        return {
            "type": "electricity",
            "mode": None,
            "distance_km": None,
            "electricity_kwh": kwh or 5.0,
            "food_type": None,
            "item_type": None,
            "recommendation": "Switch to LED, set AC to 24°C, unplug devices.",
            "potential_savings_kg": round((kwh or 5.0) * 0.4, 2),
        }

    # ── FOOD ────────────────────────────────────────────────
    veg_keywords = ["salad", "vegetables", "vegetarian", "vegan", "tofu",
                    "lentils", "dal", "fruit", "plant-based", "legumes"]
    non_veg_keywords = ["chicken", "beef", "pork", "lamb", "fish", "meat",
                        "burger", "steak", "mutton", "prawn", "shrimp", "egg"]
    packaged_keywords = ["packaged", "processed", "chips", "snack", "junk",
                         "fast food", "pizza", "instant", "frozen", "ready meal"]
    food_general = ["ate", "eat", "meal", "food", "lunch", "dinner",
                    "breakfast", "cooked", "ordered", "had"]

    food_type = None
    if any(kw in t for kw in veg_keywords):
        food_type = "veg"
    elif any(kw in t for kw in non_veg_keywords):
        food_type = "non-veg"
    elif any(kw in t for kw in packaged_keywords):
        food_type = "packaged"
    elif any(kw in t for kw in food_general):
        food_type = "veg"  # default to veg for generic food mentions

    if food_type:
        recs = {
            "veg": "Plant-based meals are 5x lower in emissions.",
            "non-veg": "Try replacing one meal/week with a plant-based option.",
            "packaged": "Home-cooked meals produce 50% less packaging waste.",
        }
        savings = {"veg": 0, "non-veg": 2.5, "packaged": 0.8}
        return {
            "type": "food",
            "mode": None,
            "distance_km": None,
            "electricity_kwh": None,
            "food_type": food_type,
            "item_type": None,
            "recommendation": recs.get(food_type, "Choose seasonal, local food."),
            "potential_savings_kg": savings.get(food_type, 1.0),
        }

    # ── SHOPPING ────────────────────────────────────────────
    shop_keywords = ["bought", "purchased", "buy", "shopping", "order",
                     "delivered", "package", "shirt", "jeans", "shoes",
                     "laptop", "phone", "electronics", "clothes", "book",
                     "furniture", "appliance", "device"]
    item_map = {
        "shirt": "clothing", "jeans": "clothing", "dress": "clothing",
        "shoes": "clothing", "clothes": "clothing", "clothing": "clothing",
        "laptop": "electronics", "phone": "electronics", "tablet": "electronics",
        "electronics": "electronics", "device": "electronics",
        "furniture": "furniture", "sofa": "furniture", "chair": "furniture",
        "book": "book", "books": "book",
    }

    if any(kw in t for kw in shop_keywords):
        item = "general"
        for key, val in item_map.items():
            if key in t:
                item = val
                break
        savings_map = {"clothing": 5.0, "electronics": 20.0,
                       "furniture": 15.0, "book": 1.0, "general": 3.0}
        return {
            "type": "shopping",
            "mode": None,
            "distance_km": None,
            "electricity_kwh": None,
            "food_type": None,
            "item_type": item,
            "recommendation": "Buy second-hand or repair instead of replacing.",
            "potential_savings_kg": savings_map.get(item, 3.0),
        }

    return None


def _gemini_parse(text: str) -> dict | None:
    """Use Gemini API if available."""
    if not GEMINI_API_KEY:
        return None
    try:
        import urllib.request
        from app.prompt import SYSTEM_PROMPT

        prompt = f"{SYSTEM_PROMPT}\n\nInput: \"{text}\"\nOutput:"
        body = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}]
        }).encode()

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        req = urllib.request.Request(url, data=body,
                                      headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            raw = result["candidates"][0]["content"]["parts"][0]["text"]
            raw = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(raw)
    except Exception as e:
        print(f"Gemini fallback failed: {e}")
        return None


def call_llm(text: str, system_prompt: str = None) -> str:
    """
    Main entry point. Returns a JSON string representing the parsed activity.
    Tries rule-based parser first, then Gemini if key is set.
    """
    # 1. Rule-based (always works offline)
    result = _rule_based_parse(text)

    # 2. Gemini fallback (if API key set and rules didn't match)
    if result is None:
        result = _gemini_parse(text)

    # 3. Final fallback: treat as generic travel
    if result is None:
        result = {
            "type": "travel",
            "mode": "car",
            "distance_km": 10.0,
            "electricity_kwh": None,
            "food_type": None,
            "item_type": None,
            "recommendation": "Consider greener transport alternatives.",
            "potential_savings_kg": 1.5,
        }

    return json.dumps(result)
