import base64
import json
import io
from typing import Dict, Any, Optional
from PIL import Image
import httpx

from app.core.config import settings

GEMINI_TAGGING_PROMPT = """
You are an expert haute-couture and modern streetwear wardrobe archivist and personal stylist.
Analyze this digitized clothing garment image carefully and output a strictly valid JSON object with the following fields:
{
  "category": "top" | "bottom" | "shoes" | "outerwear" | "accessory" | "watch",
  "sub_category": "boxy_hoodie" | "korean_pleated_trouser" | "cargo_pants" | "oversized_tee" | "baggy_jeans" | "chunky_sneaker" | "minimalist_derby" | "diver_watch" | "chore_jacket" | "quarter_zip",
  "fabric_type": "cotton_fleece" | "french_terry" | "twill" | "poly_lycra" | "raw_denim" | "corduroy" | "linen" | "stainless_steel",
  "fabric_weight": "heavyweight_350gsm" | "midweight" | "lightweight",
  "pattern": "solid" | "backprint" | "embroidered" | "ribbed" | "striped" | "textured",
  "hardware_color": "gold" | "silver" | "none",
  "thermal_rating": integer between 1 (summer breathable) to 5 (sub-zero thermal/wool/heavy fleece),
  "fit_type": "boxy" | "baggy" | "relaxed" | "korean-pleated" | "regular" | "oversized",
  "tags": ["modern-silhouette", "versatile", "capsule-staple"]
}
Only output the JSON object with no markdown fences or other text.
"""

def heuristic_tagger(
    img_pil: Image.Image,
    primary_hex: str,
    color_family: str,
    hardware_color: str
) -> Dict[str, Any]:
    """
    Intelligent heuristic classifier based on visual geometry and color when LLM is unavailable.
    """
    w, h = img_pil.size
    aspect_ratio = h / float(w)

    # Detect category from geometric silhouette proportions
    if aspect_ratio >= 1.45:
        category = "bottom"
        sub_category = "korean_pleated_trouser" if "grey" in color_family or "black" in color_family or "olive" in color_family else "cargo_pants"
        fabric_type = "twill"
        fabric_weight = "midweight"
        fit_type = "korean-pleated"
        thermal_rating = 2
        tags = ["high-rise", "draped-hem", "wide-leg"]
    elif aspect_ratio < 0.75:
        category = "shoes"
        sub_category = "chunky_sneaker"
        fabric_type = "leather_mesh"
        fabric_weight = "midweight"
        fit_type = "regular"
        thermal_rating = 2
        tags = ["chunky-sole", "streetwear-staple"]
    elif 0.8 <= aspect_ratio <= 1.2 and (w < 400 or hardware_color in ["silver", "gold"]):
        # Compact or metallic: Watch or accessory
        if hardware_color in ["silver", "gold"]:
            category = "watch"
            sub_category = "diver_watch" if hardware_color == "silver" else "dress_watch"
            fabric_type = "stainless_steel"
            fabric_weight = "heavyweight_350gsm"
            fit_type = "regular"
            thermal_rating = 1
            tags = [f"{hardware_color}-case", "metal-bracelet"]
        else:
            category = "top"
            sub_category = "boxy_hoodie"
            fabric_type = "cotton_fleece"
            fabric_weight = "heavyweight_350gsm"
            fit_type = "boxy"
            thermal_rating = 4
            tags = ["dropped-shoulder", "cropped-hem"]
    else:
        # Standard top or outerwear
        category = "top"
        sub_category = "boxy_hoodie" if thermal_rating_guess(color_family) >= 3 else "oversized_tee"
        fabric_type = "cotton_fleece" if "hoodie" in sub_category else "french_terry"
        fabric_weight = "heavyweight_350gsm"
        fit_type = "boxy"
        thermal_rating = 3
        tags = ["boxy-cut", "relaxed-neckline"]

    return {
        "category": category,
        "sub_category": sub_category,
        "fabric_type": fabric_type,
        "fabric_weight": fabric_weight,
        "pattern": "solid",
        "hardware_color": hardware_color,
        "thermal_rating": thermal_rating,
        "fit_type": fit_type,
        "tags": tags
    }

def thermal_rating_guess(color_family: str) -> int:
    if color_family in ["charcoal_grey", "mocha_brown", "pitch_black"]:
        return 3
    elif color_family in ["off_white", "cream_beige", "sky_blue"]:
        return 2
    return 2

async def tag_garment_with_gemini(
    img_pil: Image.Image,
    primary_hex: str,
    color_family: str,
    detected_hardware: str
) -> Dict[str, Any]:
    """
    Calls Gemini Vision model if API key is provided, or gracefully falls back to heuristic tagging.
    """
    if not settings.GEMINI_API_KEY:
        return heuristic_tagger(img_pil, primary_hex, color_family, detected_hardware)

    try:
        # Convert PIL image to JPEG base64
        buffered = io.BytesIO()
        img_pil.convert("RGB").save(buffered, format="JPEG", quality=85)
        img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": GEMINI_TAGGING_PROMPT},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": img_b64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text.strip())
                # Hardware fallback validation
                if detected_hardware != "none" and parsed.get("hardware_color") == "none":
                    parsed["hardware_color"] = detected_hardware
                return parsed
    except Exception as e:
        print(f"Gemini API call failed, using heuristic fallback: {e}")

    return heuristic_tagger(img_pil, primary_hex, color_family, detected_hardware)
