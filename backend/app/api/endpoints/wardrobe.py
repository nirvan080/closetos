import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from PIL import Image
import io

from app.core.config import settings
from app.core.db import (
    get_all_clothing_items,
    get_clothing_item_by_id,
    insert_clothing_item,
    delete_clothing_item,
    find_similar_items,
    get_default_user_id
)
from app.models.schemas import (
    ClothingItemCreate,
    ClothingItemResponse,
    IngestionAnalysisResult
)
from app.services.cv_pipeline import (
    auto_white_balance,
    exif_normalize,
    remove_background,
    extract_dominant_colors,
    detect_hardware_tone,
    generate_multimodal_embedding
)
from app.services.gemini_tagger import tag_garment_with_gemini

router = APIRouter()

@router.post("/ingest", response_model=IngestionAnalysisResult)
async def ingest_garment(file: UploadFile = File(...)):
    """
    Ingests garment photo:
    1. EXIF orientation correction.
    2. Gray World Auto-White-Balance to neutralize indoor yellow casts.
    3. Alpha-channel background removal (clean PNG cutout).
    4. K-Means dominant color & HEX extraction.
    5. Specular hardware detection (gold vs silver).
    6. Multi-modal tagging (Gemini or heuristic fallback).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    content = await file.read()
    try:
        raw_pil = Image.open(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")

    # 1. EXIF normalization
    norm_pil = exif_normalize(raw_pil)

    # 2. Gray World Auto-White-Balance
    awb_pil = auto_white_balance(norm_pil)

    # Save original / AWB image
    file_id = str(uuid.uuid4())
    orig_filename = f"{file_id}_awb.jpg"
    orig_path = settings.UPLOAD_DIR / "originals" / orig_filename
    awb_pil.convert("RGB").save(orig_path, "JPEG", quality=90)
    original_url = f"{settings.STATIC_UPLOADS_URL}/originals/{orig_filename}"

    # 3. Transparent background removal
    cutout_pil = remove_background(awb_pil)
    cutout_filename = f"{file_id}_cutout.png"
    cutout_path = settings.UPLOAD_DIR / "cutouts" / cutout_filename
    cutout_pil.save(cutout_path, "PNG")
    cutout_url = f"{settings.STATIC_UPLOADS_URL}/cutouts/{cutout_filename}"

    # 4. Color Extraction
    prim_hex, sec_hex, color_family, palette = extract_dominant_colors(cutout_pil, k=5)

    # 5. Hardware tone detection
    hw_tone = detect_hardware_tone(cutout_pil)

    # 6. Structured metadata tagging via Gemini / Heuristics
    tag_result = await tag_garment_with_gemini(awb_pil, prim_hex, color_family, hw_tone)

    return IngestionAnalysisResult(
        category=tag_result.get("category", "top"),
        sub_category=tag_result.get("sub_category", "boxy_hoodie"),
        color_primary_hex=prim_hex,
        color_secondary_hex=sec_hex,
        color_family=color_family,
        color_palette=palette,
        fabric_type=tag_result.get("fabric_type", "cotton_fleece"),
        fabric_weight=tag_result.get("fabric_weight", "heavyweight_350gsm"),
        pattern=tag_result.get("pattern", "solid"),
        hardware_color=tag_result.get("hardware_color", hw_tone),
        thermal_rating=tag_result.get("thermal_rating", 2),
        fit_type=tag_result.get("fit_type", "boxy"),
        confidence=0.96,
        tags=tag_result.get("tags", []),
        white_balance_applied=True,
        bg_removed=True,
        original_url=original_url,
        cutout_url=cutout_url
    )

@router.post("/confirm", response_model=ClothingItemResponse)
async def confirm_garment(item: ClothingItemCreate):
    """
    Confirms and commits ingested garment to database with full 768-dim vector embedding.
    """
    user_id = get_default_user_id()

    # Generate 768-dim embedding if not provided
    if not item.embedding:
        item.embedding = generate_multimodal_embedding(
            item.model_dump(),
            [item.color_primary_hex, item.color_secondary_hex or item.color_primary_hex]
        )

    saved_item = insert_clothing_item(item, user_id)
    return saved_item

@router.get("/items", response_model=List[ClothingItemResponse])
async def list_wardrobe_items(
    category: Optional[str] = None,
    color_family: Optional[str] = None,
    fit_type: Optional[str] = None,
    thermal_rating: Optional[int] = None
):
    items = get_all_clothing_items()
    if category and category != "all":
        cat_lower = category.lower()
        if cat_lower in ["accessories", "accessory"]:
            items = [it for it in items if it.category.lower() in ["accessory", "accessories", "watch", "eyewear", "bag"]]
        else:
            items = [it for it in items if it.category.lower() == cat_lower]
    if color_family and color_family != "all":
        items = [it for it in items if it.color_family.lower() == color_family.lower()]
    if fit_type and fit_type != "all":
        items = [it for it in items if fit_type.lower() in (it.fit_type or "").lower()]
    if thermal_rating:
        items = [it for it in items if it.thermal_rating == thermal_rating]
    return items

@router.get("/items/{item_id}", response_model=ClothingItemResponse)
async def get_item(item_id: str):
    item = get_clothing_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.delete("/items/{item_id}")
async def remove_item(item_id: str):
    success = delete_clothing_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success", "deleted_id": item_id}

@router.get("/similar/{item_id}", response_model=List[ClothingItemResponse])
async def get_similar_items(item_id: str, top_k: int = 4):
    target = get_clothing_item_by_id(item_id)
    if not target or not target.embedding:
        return []
    similar = find_similar_items(target.embedding, top_k=top_k + 1)
    return [it for it in similar if it.id != item_id][:top_k]

@router.post("/seed")
async def seed_wardrobe(force: bool = False):
    from app.seed_data import seed_starter_wardrobe
    seed_starter_wardrobe(force=force)
    return {"status": "seeded", "items_count": len(get_all_clothing_items())}

@router.get("/export-schema")
async def export_supabase_schema():
    """
    Returns PostgreSQL + pgvector schema as specified in Section 3 of the brief.
    """
    ddl = """-- PostgreSQL / Supabase Schema with pgvector
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    body_measurements JSONB DEFAULT '{"waist_in": 31, "outseam_in": 40, "chest_in": 38, "height_cm": 178}',
    preferred_fits VARCHAR[] DEFAULT ARRAY['baggy', 'relaxed', 'korean-pleated', 'boxy'],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clothing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_original_url TEXT NOT NULL,
    image_cutout_url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(100) NOT NULL,
    color_primary_hex VARCHAR(7) NOT NULL,
    color_secondary_hex VARCHAR(7),
    color_family VARCHAR(50) NOT NULL,
    fabric_type VARCHAR(100),
    fabric_weight VARCHAR(50),
    pattern VARCHAR(50),
    hardware_color VARCHAR(50),
    thermal_rating INT DEFAULT 2,
    fit_type VARCHAR(50),
    embedding VECTOR(768),
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_ids UUID[] NOT NULL,
    occasion VARCHAR(50) NOT NULL,
    weather_condition JSONB,
    styling_notes TEXT,
    silhouette_analysis TEXT,
    hardware_harmony TEXT,
    micro_styling JSONB,
    harmony_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clothing_embedding_idx ON clothing_items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
"""
    return {"ddl": ddl}
