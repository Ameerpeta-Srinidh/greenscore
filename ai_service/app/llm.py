import re
import json
import os

# ──────────────────────────────────────────────
#  Smart Rule-Based Activity Parser (No Ollama)
#  Falls back to Gemini API if GEMINI_API_KEY is set
#  Updated with Indian transport modes & food items
# ──────────────────────────────────────────────

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def _rule_based_parse(text: str) -> dict | None:
    """Parse common activity descriptions without any LLM."""
    t = text.lower().strip()

    # ── TRAVEL ──────────────────────────────────────────────
    travel_modes = {
        "car": ["car", "drove", "drive", "taxi", "cab", "uber", "ola"],
        "car-diesel": ["diesel car", "diesel vehicle"],
        "car-cng": ["cng car", "cng vehicle"],
        "car-ev": ["electric car", "ev car", "tesla"],
        "bike": ["bicycle", "cycling", "cycled", "cycle", "pedal"],
        "bus": ["bus", "minibus", "coach", "volvo bus"],
        "ac-bus": ["ac bus", "a/c bus"],
        "train": ["train", "railway", "rail", "rajdhani", "shatabdi", "local train"],
        "metro": ["metro", "subway", "tube", "namma metro", "delhi metro", "mumbai metro"],
        "plane": ["plane", "flight", "flew", "airplane", "aircraft", "fly", "indigo", "spicejet", "vistara", "air india"],
        "walk": ["walk", "walked", "on foot", "walking"],
        "scooter": ["scooter", "moped", "e-scooter", "activa", "access"],
        "motorcycle": ["motorcycle", "motorbike", "bike ride", "bullet", "pulsar", "splendor"],
        "two-wheeler": ["two-wheeler", "two wheeler", "2-wheeler", "scooty"],
        "auto-rickshaw": ["auto-rickshaw", "auto rickshaw", "auto", "autorickshaw", "tuk-tuk", "tuk tuk"],
        "e-rickshaw": ["e-rickshaw", "e rickshaw", "electric rickshaw", "e-auto"],
        "shared-auto": ["shared auto", "share auto", "shared ride"],
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
                "car-diesel": "Diesel emits more particulates. Consider CNG or EV.",
                "car-cng": "CNG is cleaner than petrol! Great intermediate step.",
                "car-ev": "Electric vehicles are the cleanest option! 🌱",
                "bike": "Great choice! Cycling is zero-emission.",
                "bus": "Buses are 4x more efficient than solo driving.",
                "ac-bus": "AC buses emit slightly more but are still efficient.",
                "train": "Indian Railways is one of the cleanest transport options!",
                "metro": "Metro is extremely efficient. Great choice!",
                "plane": "Consider trains or video calls for short trips.",
                "walk": "Walking is zero-emission and healthy!",
                "scooter": "Two-wheelers emit less than cars; consider electric.",
                "motorcycle": "Motorcycles emit less than cars; consider electric.",
                "two-wheeler": "Two-wheelers are efficient; EV versions are even better.",
                "auto-rickshaw": "Autos are shared-friendly. Try sharing when possible!",
                "e-rickshaw": "E-rickshaws are very low emission. Great choice!",
                "shared-auto": "Sharing rides is one of the best ways to reduce emissions!",
            }
            savings = {
                "car": 2.1, "car-diesel": 2.5, "car-cng": 1.2, "car-ev": 0.2,
                "plane": 50, "motorcycle": 0.5, "scooter": 0.3,
                "two-wheeler": 0.4, "auto-rickshaw": 0.3,
                "bike": 0, "bus": 0.3, "ac-bus": 0.4, "train": 0.1,
                "metro": 0.1, "walk": 0, "e-rickshaw": 0.1, "shared-auto": 0.1,
            }

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
                     "fan", "heater", "appliance", "used electricity", "electric",
                     "geyser", "inverter", "solar", "generator", "ups"]
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

    # ── FOOD (Indian-specific + International) ─────────────
    food_mappings = {
        # Indian vegetarian
        "dal-rice": ["dal rice", "dal chawal", "daal rice", "daal chawal"],
        "dosa": ["dosa", "masala dosa", "rava dosa"],
        "idli": ["idli", "idly"],
        "paratha": ["paratha", "aloo paratha", "gobi paratha", "stuffed paratha"],
        "roti-sabzi": ["roti sabzi", "roti subzi", "chapati", "sabzi", "roti"],
        "veg-thali": ["veg thali", "vegetarian thali", "thali"],
        "paneer": ["paneer", "paneer tikka", "palak paneer", "shahi paneer", "paneer butter masala"],
        "dosa": ["dosa", "uttapam", "appam"],
        "street-food": ["pani puri", "golgappa", "chaat", "samosa", "vada pav", "pav bhaji",
                        "bhel puri", "aloo tikki", "jalebi", "pakora", "bhajiya", "kachori"],
        # Indian non-veg
        "chicken-biryani": ["chicken biryani", "hyderabadi biryani"],
        "mutton-biryani": ["mutton biryani", "gosht biryani"],
        "chicken": ["chicken", "chicken curry", "butter chicken", "chicken tikka",
                    "tandoori chicken", "chicken 65", "chicken fry"],
        "mutton": ["mutton", "mutton curry", "rogan josh", "nihari", "gosht"],
        "fish": ["fish", "fish curry", "fish fry", "pomfret", "surmai", "hilsa"],
        "egg": ["egg", "omelette", "omelet", "anda", "egg curry", "egg bhurji", "boiled egg"],
        # International
        "non-veg-thali": ["non veg thali", "non-veg thali", "nonveg thali"],
        "beef": ["beef", "steak", "beef burger"],
        "pork": ["pork", "bacon", "ham"],
        "burger": ["burger", "hamburger", "veggie burger"],
        "pizza": ["pizza"],
        "salad": ["salad"],
        "fruit": ["fruit", "fruits"],
    }

    # Generic categories
    veg_keywords = ["vegetables", "vegetarian", "vegan", "tofu",
                    "lentils", "legumes", "plant-based"]
    non_veg_keywords = ["meat", "lamb", "prawn", "shrimp", "crab", "lobster"]
    packaged_keywords = ["packaged", "processed", "chips", "snack", "junk",
                         "fast food", "instant", "frozen", "ready meal",
                         "maggi", "noodles", "cup noodles"]
    food_general = ["ate", "eat", "meal", "food", "lunch", "dinner",
                    "breakfast", "cooked", "ordered", "had", "tiffin"]

    # Check specific Indian foods first
    for food_type, keywords in food_mappings.items():
        if any(kw in t for kw in keywords):
            recs = {
                "dal-rice": "Dal rice is one of the lowest-emission meals! 🌱",
                "dosa": "South Indian breakfasts are very eco-friendly!",
                "idli": "Idli is one of the most sustainable meals!",
                "paratha": "Home-cooked parathas have lower emissions than eating out.",
                "roti-sabzi": "Simple home meals are great for the planet!",
                "veg-thali": "A full veg thali has 3x less emissions than non-veg.",
                "paneer": "Paneer has moderate emissions. Try dal for even lower impact.",
                "street-food": "Street food is typically low-emission!",
                "chicken-biryani": "Try veg biryani — same taste, 60% less emissions!",
                "mutton-biryani": "Mutton has high emissions. Try chicken biryani instead.",
                "chicken": "Chicken is the lowest-emission meat. But plant-based is even better!",
                "mutton": "Mutton has very high emissions. Try chicken or paneer instead.",
                "fish": "Fish has moderate emissions. Choose locally sourced when possible.",
                "egg": "Eggs are a protein-efficient food with moderate emissions.",
                "non-veg-thali": "Try a veg thali once a week to cut emissions by 25%.",
                "beef": "Beef has the highest food emissions. Any substitute helps!",
                "pork": "Pork emissions are moderate. Try plant-based alternatives.",
                "burger": "A veggie burger has 90% less emissions than beef!",
                "pizza": "Margherita pizza has lower emissions than meat-topped ones.",
                "salad": "Salads are one of the lowest-emission meals!",
                "fruit": "Fruits are ultra-low emission. Great choice!",
            }
            savings_map = {
                "dal-rice": 0, "dosa": 0, "idli": 0, "paratha": 0,
                "roti-sabzi": 0, "veg-thali": 0, "paneer": 0.5, "street-food": 0,
                "chicken-biryani": 2.5, "mutton-biryani": 4.0, "chicken": 2.0,
                "mutton": 4.0, "fish": 1.5, "egg": 0.5,
                "non-veg-thali": 2.0, "beef": 5.0, "pork": 2.5,
                "burger": 2.5, "pizza": 1.0, "salad": 0, "fruit": 0,
            }
            return {
                "type": "food",
                "mode": None,
                "distance_km": None,
                "electricity_kwh": None,
                "food_type": food_type,
                "item_type": None,
                "recommendation": recs.get(food_type, "Choose seasonal, local food."),
                "potential_savings_kg": savings_map.get(food_type, 1.0),
            }

    # Check generic food categories
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
                     "furniture", "appliance", "device", "amazon", "flipkart",
                     "myntra", "ajio", "meesho"]
    item_map = {
        "shirt": "clothing", "jeans": "clothing", "dress": "clothing",
        "shoes": "clothing", "clothes": "clothing", "clothing": "clothing",
        "saree": "clothing", "kurta": "clothing", "kurti": "clothing",
        "laptop": "electronics", "phone": "electronics", "tablet": "electronics",
        "electronics": "electronics", "device": "electronics", "mobile": "electronics",
        "furniture": "furniture", "sofa": "furniture", "chair": "furniture",
        "table": "furniture", "desk": "furniture", "bed": "furniture",
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
