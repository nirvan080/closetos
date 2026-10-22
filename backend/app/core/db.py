import sqlite3
import json
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
import numpy as np

from app.core.config import settings
from app.models.schemas import (
    UserProfile,
    ClothingItemCreate,
    ClothingItemResponse,
    OutfitResponse,
    WeatherCondition
)

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(settings.DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        body_measurements TEXT NOT NULL,
        preferred_fits TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    # Clothing Items Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clothing_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        image_original_url TEXT NOT NULL,
        image_cutout_url TEXT NOT NULL,
        category TEXT NOT NULL,
        sub_category TEXT NOT NULL,
        color_primary_hex TEXT NOT NULL,
        color_secondary_hex TEXT,
        color_family TEXT NOT NULL,
        fabric_type TEXT,
        fabric_weight TEXT,
        pattern TEXT,
        hardware_color TEXT,
        thermal_rating INTEGER DEFAULT 2,
        fit_type TEXT,
        embedding TEXT,
        metadata_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Outfits Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS outfits (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        item_ids TEXT NOT NULL,
        occasion TEXT NOT NULL,
        weather_condition TEXT NOT NULL,
        styling_notes TEXT,
        silhouette_analysis TEXT,
        hardware_harmony TEXT,
        micro_styling TEXT,
        harmony_score REAL NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Seed default user if not exists
    cursor.execute("SELECT id FROM users LIMIT 1")
    row = cursor.fetchone()
    if not row:
        default_user_id = "00000000-0000-0000-0000-000000000001"
        cursor.execute("""
        INSERT INTO users (id, email, body_measurements, preferred_fits, created_at)
        VALUES (?, ?, ?, ?, ?)
        """, (
            default_user_id,
            "curator@closetos.local",
            json.dumps({"waist_in": 31, "outseam_in": 40, "chest_in": 38, "height_cm": 178}),
            json.dumps(["baggy", "relaxed", "korean-pleated", "boxy"]),
            datetime.utcnow().isoformat()
        ))

    conn.commit()
    conn.close()

def get_default_user_id() -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return row["id"]
    return "00000000-0000-0000-0000-000000000001"

def get_all_clothing_items(user_id: Optional[str] = None) -> List[ClothingItemResponse]:
    conn = get_db_connection()
    cursor = conn.cursor()
    if user_id:
        cursor.execute("SELECT * FROM clothing_items WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    else:
        cursor.execute("SELECT * FROM clothing_items ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        embedding = json.loads(r["embedding"]) if r["embedding"] else None
        meta = json.loads(r["metadata_json"]) if r["metadata_json"] else None
        items.append(ClothingItemResponse(
            id=r["id"],
            user_id=r["user_id"],
            image_original_url=r["image_original_url"],
            image_cutout_url=r["image_cutout_url"],
            category=r["category"],
            sub_category=r["sub_category"],
            color_primary_hex=r["color_primary_hex"],
            color_secondary_hex=r["color_secondary_hex"],
            color_family=r["color_family"],
            fabric_type=r["fabric_type"],
            fabric_weight=r["fabric_weight"],
            pattern=r["pattern"],
            hardware_color=r["hardware_color"],
            thermal_rating=r["thermal_rating"] or 2,
            fit_type=r["fit_type"] or "regular",
            embedding=embedding,
            metadata_json=meta,
            created_at=r["created_at"]
        ))
    return items

def get_clothing_item_by_id(item_id: str) -> Optional[ClothingItemResponse]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM clothing_items WHERE id = ?", (item_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    embedding = json.loads(r["embedding"]) if r["embedding"] else None
    meta = json.loads(r["metadata_json"]) if r["metadata_json"] else None
    return ClothingItemResponse(
        id=r["id"],
        user_id=r["user_id"],
        image_original_url=r["image_original_url"],
        image_cutout_url=r["image_cutout_url"],
        category=r["category"],
        sub_category=r["sub_category"],
        color_primary_hex=r["color_primary_hex"],
        color_secondary_hex=r["color_secondary_hex"],
        color_family=r["color_family"],
        fabric_type=r["fabric_type"],
        fabric_weight=r["fabric_weight"],
        pattern=r["pattern"],
        hardware_color=r["hardware_color"],
        thermal_rating=r["thermal_rating"] or 2,
        fit_type=r["fit_type"] or "regular",
        embedding=embedding,
        metadata_json=meta,
        created_at=r["created_at"]
    )

def insert_clothing_item(item: ClothingItemCreate, user_id: str) -> ClothingItemResponse:
    item_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()

    embedding_str = json.dumps(item.embedding) if item.embedding else None
    meta_str = json.dumps(item.metadata_json) if item.metadata_json else None

    cursor.execute("""
    INSERT INTO clothing_items (
        id, user_id, image_original_url, image_cutout_url,
        category, sub_category, color_primary_hex, color_secondary_hex,
        color_family, fabric_type, fabric_weight, pattern, hardware_color,
        thermal_rating, fit_type, embedding, metadata_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item_id, user_id, item.image_original_url, item.image_cutout_url,
        item.category, item.sub_category, item.color_primary_hex, item.color_secondary_hex,
        item.color_family, item.fabric_type, item.fabric_weight, item.pattern, item.hardware_color,
        item.thermal_rating, item.fit_type, embedding_str, meta_str, now
    ))
    conn.commit()
    conn.close()

    return ClothingItemResponse(
        id=item_id,
        user_id=user_id,
        image_original_url=item.image_original_url,
        image_cutout_url=item.image_cutout_url,
        category=item.category,
        sub_category=item.sub_category,
        color_primary_hex=item.color_primary_hex,
        color_secondary_hex=item.color_secondary_hex,
        color_family=item.color_family,
        fabric_type=item.fabric_type,
        fabric_weight=item.fabric_weight,
        pattern=item.pattern,
        hardware_color=item.hardware_color,
        thermal_rating=item.thermal_rating,
        fit_type=item.fit_type,
        embedding=item.embedding,
        metadata_json=item.metadata_json,
        created_at=now
    )

def delete_clothing_item(item_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM clothing_items WHERE id = ?", (item_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def insert_outfit(outfit: OutfitResponse) -> OutfitResponse:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO outfits (
        id, user_id, item_ids, occasion, weather_condition, styling_notes,
        silhouette_analysis, hardware_harmony, micro_styling, harmony_score, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        outfit.id,
        outfit.user_id,
        json.dumps(outfit.item_ids),
        outfit.occasion,
        json.dumps(outfit.weather_condition.model_dump()),
        outfit.styling_notes,
        outfit.silhouette_analysis,
        outfit.hardware_harmony,
        json.dumps([m.model_dump() for m in outfit.micro_styling]),
        outfit.harmony_score,
        outfit.created_at
    ))
    conn.commit()
    conn.close()
    return outfit

def get_outfits(user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    if user_id:
        cursor.execute("SELECT * FROM outfits WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", (user_id, limit))
    else:
        cursor.execute("SELECT * FROM outfits ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        item_ids = json.loads(r["item_ids"])
        weather = json.loads(r["weather_condition"])
        micro = json.loads(r["micro_styling"]) if r["micro_styling"] else []
        results.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "item_ids": item_ids,
            "occasion": r["occasion"],
            "weather_condition": weather,
            "styling_notes": r["styling_notes"],
            "silhouette_analysis": r["silhouette_analysis"],
            "hardware_harmony": r["hardware_harmony"],
            "micro_styling": micro,
            "harmony_score": r["harmony_score"],
            "created_at": r["created_at"]
        })
    return results

def find_similar_items(query_embedding: List[float], top_k: int = 5, category: Optional[str] = None) -> List[ClothingItemResponse]:
    all_items = get_all_clothing_items()
    if category:
        all_items = [it for it in all_items if it.category == category]

    items_with_sim = []
    q_vec = np.array(query_embedding, dtype=np.float32)
    q_norm = np.linalg.norm(q_vec)
    if q_norm == 0:
        return all_items[:top_k]

    for item in all_items:
        if not item.embedding:
            continue
        v = np.array(item.embedding, dtype=np.float32)
        v_norm = np.linalg.norm(v)
        if v_norm == 0:
            continue
        sim = float(np.dot(q_vec, v) / (q_norm * v_norm))
        items_with_sim.append((sim, item))

    items_with_sim.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in items_with_sim[:top_k]]
