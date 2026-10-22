from typing import List, Optional
import io
from PIL import Image
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.core.db import get_all_clothing_items, get_clothing_item_by_id, insert_outfit, get_outfits
from app.models.schemas import (
    GenerateOutfitRequest,
    OutfitResponse,
    AIConsultationRequest,
    AIConsultationResponse,
    PieceCombinationsResponse,
    FaceAnalysisResponse
)
from app.services.styling_engine import select_best_outfit, generate_piece_combinations
from app.services.weather_service import fetch_realtime_weather
from app.services.ai_stylist import consult_ai_stylist
from app.services.face_analyzer import analyze_face_and_skin

router = APIRouter()

@router.post("/generate", response_model=OutfitResponse)
async def generate_outfit(request: GenerateOutfitRequest):
    """
    Generates an intelligent outfit recommendation based on weather, occasion,
    body type morphology, aesthetic vibe, silhouette rules (1:2 Golden Ratio), and hardware harmony.
    """
    items = get_all_clothing_items()
    if len(items) < 2:
        raise HTTPException(
            status_code=400,
            detail="Wardrobe requires at least a top and a bottom to generate an outfit."
        )

    if not request.weather:
        preset_map = {
            "tuition": "chilly",
            "coding": "coding",
            "market": "evening",
            "formal": "evening",
            "home": "coding",
            "date_night": "evening",
            "airport": "coding"
        }
        preset = preset_map.get(request.occasion.lower(), "coding")
        request.weather = await fetch_realtime_weather(preset=preset)

    outfit = select_best_outfit(items, request)
    insert_outfit(outfit)
    return outfit

@router.post("/consult", response_model=AIConsultationResponse)
async def ai_stylist_chat(request: AIConsultationRequest):
    """
    Interactive AI Stylist Co-Pilot:
    Answers styling questions conditioned on wardrobe state, body type, face shape, and weather.
    """
    items = get_all_clothing_items()
    return await consult_ai_stylist(request, items)

@router.get("/combinations/{item_id}", response_model=PieceCombinationsResponse)
async def get_piece_combinations(item_id: str):
    """
    Generates 3 complete, distinct outfits built around a single piece:
    - Look 1: Korean Minimalist Smart
    - Look 2: Relaxed Boxy Streetwear
    - Look 3: Quiet Luxury Evening
    """
    all_items = get_all_clothing_items()
    focus = get_clothing_item_by_id(item_id)
    if not focus:
        raise HTTPException(status_code=404, detail="Item not found")

    return generate_piece_combinations(focus, all_items)

@router.get("/aesthetics")
async def get_aesthetic_vibes():
    return [
        {
            "id": "korean_minimal",
            "label": "Korean Minimalist",
            "tagline": "Fluid drapes, high-rise pleats, boxy drop-shoulders",
            "colors": ["#4a5338", "#ede8df", "#383b40", "#f3efe6"]
        },
        {
            "id": "gorpcore",
            "label": "Gorpcore / Tech Utility",
            "tagline": "Tactical cargo pockets, bungee cords, functional layering",
            "colors": ["#1b1e24", "#8c7b64", "#2563eb", "#5c4033"]
        },
        {
            "id": "streetwear",
            "label": "Modern Streetwear",
            "tagline": "Heavyweight 350 GSM fleece, deep pooling hems, chunky soles",
            "colors": ["#383b40", "#2563eb", "#1b1e24", "#ede8df"]
        },
        {
            "id": "quiet_luxury",
            "label": "Quiet Luxury / Old Money",
            "tagline": "Monochrome tones, knit polos, gold dress watches, minimalist derbies",
            "colors": ["#d4af37", "#f3efe6", "#19191c", "#c25b3d"]
        },
        {
            "id": "vintage_americana",
            "label": "Vintage Americana Workwear",
            "tagline": "Canvas chore jackets, raw denim, earth tones, sturdy brass/silver",
            "colors": ["#8c7b64", "#c25b3d", "#1b1e24", "#593c28"]
        }
    ]

@router.get("/history")
async def list_outfit_history(limit: int = 10):
    return get_outfits(limit=limit)

@router.get("/occasions")
async def get_occasion_presets():
    return [
        {"id": "coding", "label": "Desk Work / Coding", "icon": "Code"},
        {"id": "tuition", "label": "Tuition / Lectures", "icon": "GraduationCap"},
        {"id": "market", "label": "Market / Outings", "icon": "Coffee"},
        {"id": "date_night", "label": "Date Night / Dinner", "icon": "Heart"},
        {"id": "formal", "label": "Formal / Evening", "icon": "GlassWater"},
        {"id": "airport", "label": "Airport / Travel", "icon": "Plane"},
        {"id": "home", "label": "Home Lounge", "icon": "Armchair"}
    ]

@router.post("/analyze-face", response_model=FaceAnalysisResponse)
async def analyze_face_endpoint(file: UploadFile = File(...)):
    """
    Analyzes uploaded selfie / face photo:
    - Detects facial geometry & bone structure (Oval, Round, Square, Heart, Diamond, Oblong).
    - Extracts dominant skin HEX color, undertone (Warm, Cool, Neutral, Olive), and contrast level.
    - Generates personalized recommendations for eyewear frames, neckline cuts, flattering colors, and jewelry metal harmony.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image file received.")
    
    try:
        image = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")
        
    analysis = await analyze_face_and_skin(image)
    return analysis

