import json
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings
from app.models.schemas import (
    AIConsultationRequest,
    AIConsultationResponse,
    ClothingItemResponse,
    OutfitResponse,
    BodyTypeProfile,
    WeatherCondition
)
from app.services.styling_engine import select_best_outfit, generate_morphological_advice
from app.models.schemas import GenerateOutfitRequest

SYSTEM_PROMPT = """You are an elite haute-couture personal stylist and master of modern proportion theory (Korean drape, boxy streetwear, Golden 1:2 ratio, and hardware synchronization).
You provide actionable, charismatic, and technically precise fashion advice based on the user's wardrobe inventory, body type, facial shape, and current weather.
Always provide specific micro-styling tips (e.g. cuff folds, hem tucks, collar positioning) and explain *why* certain pieces harmonize."""

async def consult_ai_stylist(
    request: AIConsultationRequest,
    items: List[ClothingItemResponse]
) -> AIConsultationResponse:
    body = request.body_profile or BodyTypeProfile()
    weather = request.weather or WeatherCondition()
    query = request.query.strip().lower()

    # Generate morphological advice
    morph_tip = generate_morphological_advice(body)

    # 1. Try Gemini API if key is available
    if settings.GEMINI_API_KEY:
        try:
            wardrobe_summary = [
                f"- [{it.category.upper()}] {it.sub_category} ({it.color_family}, {it.fit_type}, HW: {it.hardware_color})"
                for it in items[:15]
            ]
            wardrobe_text = "\n".join(wardrobe_summary)

            prompt = f"""User Query: "{request.query}"
Occasion: {request.occasion}
Aesthetic Vibe: {request.aesthetic_vibe}
Weather: {weather.temp_c}°C ({weather.condition})
User Profile:
- Height: {body.height_cm}cm, Weight: {body.weight_kg}kg
- Body Type: {body.body_type.replace('_', ' ').title()}
- Facial Shape: {body.facial_shape.title()}
- Skin Undertone: {body.skin_undertone.title()}

User Wardrobe:
{wardrobe_text}

Provide:
1. A concise, authoritative styling answer directly answering their question.
2. Suggested specific color palette harmony.
3. 2 key style rules applied.
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": SYSTEM_PROMPT + "\n\n" + prompt}]}],
                "generationConfig": {"temperature": 0.4}
            }
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    answer_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    
                    # Generate a matching outfit if relevant
                    outfit_req = GenerateOutfitRequest(
                        occasion=request.occasion or "coding",
                        aesthetic_vibe=request.aesthetic_vibe or "korean_minimal",
                        weather=weather,
                        body_profile=body
                    )
                    suggested_outfit = select_best_outfit(items, outfit_req)

                    return AIConsultationResponse(
                        answer=answer_text,
                        suggested_outfit=suggested_outfit,
                        style_rules_applied=["Golden 1:2 Silhouette Proportion", "Hardware Metal Synchronization", "Color Sandwich Anchoring"],
                        color_palette_advice=f"Prioritize {body.skin_undertone.capitalize()} undertones: Olive Green, Charcoal Grey, and Off-White accents.",
                        morphological_tip=morph_tip
                    )
        except Exception as e:
            print(f"Gemini AI Stylist error: {e}")

    # 2. Intelligent Rule-Based Stylist Engine (Heuristic Fallback)
    # Analyze query keywords
    matching_item = None
    for it in items:
        if it.sub_category.lower() in query or it.category.lower() in query or it.color_family.lower() in query:
            matching_item = it
            break

    # Build responsive answer
    outfit_req = GenerateOutfitRequest(
        occasion=request.occasion or "coding",
        aesthetic_vibe=request.aesthetic_vibe or "korean_minimal",
        weather=weather,
        body_profile=body,
        focus_item_id=matching_item.id if matching_item else None
    )
    suggested_outfit = select_best_outfit(items, outfit_req)

    item_name = matching_item.sub_category.replace('_', ' ').title() if matching_item else "pieces in your closet"

    if "how to style" in query or "pair" in query or "wear" in query:
        answer = (
            f"To style your {item_name} with maximum proportion impact: anchor it using the Golden 1:2 silhouette rule. "
            f"Pair a cropped or boxy top with wide-leg bottoms to create visual elongation. "
            f"For your {body.body_type.replace('_', ' ').title()} frame ({body.height_cm}cm, {body.weight_kg}kg), "
            f"keep the waistband visible with a gentle French-tuck or 1-inch inward hem fold. "
            f"Maintain strict hardware harmony by matching watch metals with zipper pulls."
        )
    elif "weather" in query or "cold" in query or "rain" in query or "hot" in query:
        answer = (
            f"For {weather.temp_c}°C ({weather.condition}) weather, thermal layering is essential. "
            f"Build a 3-tier system: start with a breathable base layer, add midweight 350 GSM fleece for insulation, "
            f"and finish with structured outerwear. Allow the outerwear zipper to stay half-open to reveal tonal color depth."
        )
    elif "date" in query or "dinner" in query or "formal" in query:
        answer = (
            f"For an evening date or refined dinner, lean into a monochrome or neutral palette: "
            f"Korean Pleated Trousers with a clean drape over minimalist footwear. "
            f"Roll your left sleeve twice to 3/4 forearm to showcase your timepiece—metal synchronization "
            f"signals attention to detail without looking forced."
        )
    else:
        answer = (
            f"Stylist Analysis: For your {body.body_type.replace('_', ' ').title()} morphology and {body.skin_undertone} undertone, "
            f"the strongest aesthetic right now is {request.aesthetic_vibe.replace('_', ' ').title()}. "
            f"We've curated an ensemble from your wardrobe that balances your shoulder width with wide fluid trousers, "
            f"synchronizes metallic accents, and nails the Golden 1:2 vertical ratio."
        )

    rules = [
        "Golden 1:2 Silhouette Proportion (Boxy top + Wide-leg bottom)",
        "Hardware Metal Harmony (Synchronized watch casing & zipper pulls)",
        f"Morphological Balancing for {body.body_type.replace('_', ' ').title()} Build",
        "Color Sandwich Rule (Matching top accent with footwear base)"
    ]

    palette_advice = (
        "Warm Undertone Harmony: Olive Green, Mocha Brown, Khaki Tan, and Off-White."
        if body.skin_undertone == "warm"
        else "Cool Undertone Harmony: Charcoal Grey, Pitch Black, Slate Grey, and Royal Blue."
    )

    return AIConsultationResponse(
        answer=answer,
        suggested_outfit=suggested_outfit,
        style_rules_applied=rules,
        color_palette_advice=palette_advice,
        morphological_tip=morph_tip
    )
