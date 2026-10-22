import os
import uuid
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

from app.core.config import settings
from app.core.db import get_db_connection, get_default_user_id
from app.services.cv_pipeline import generate_multimodal_embedding

def create_item_image(
    filename: str,
    shape_type: str,
    primary_color: tuple,
    secondary_color: tuple,
    details: str = ""
) -> str:
    """
    Renders aesthetic graphic garment and accessory cutouts with alpha transparency.
    """
    w, h = 600, 600
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = w // 2, h // 2

    if shape_type == "boxy_hoodie":
        draw.polygon([
            (cx - 160, cy - 100), (cx + 160, cy - 100),
            (cx + 170, cy + 160), (cx - 170, cy + 160)
        ], fill=primary_color)
        draw.polygon([
            (cx - 160, cy - 100), (cx - 260, cy + 70),
            (cx - 210, cy + 100), (cx - 140, cy - 20)
        ], fill=primary_color)
        draw.polygon([
            (cx + 160, cy - 100), (cx + 260, cy + 70),
            (cx + 210, cy + 100), (cx + 140, cy - 20)
        ], fill=primary_color)
        draw.polygon([
            (cx - 90, cy - 100), (cx - 70, cy - 220),
            (cx + 70, cy - 220), (cx + 90, cy - 100)
        ], fill=secondary_color)
        draw.polygon([
            (cx - 110, cy + 60), (cx + 110, cy + 60),
            (cx + 130, cy + 140), (cx - 130, cy + 140)
        ], fill=secondary_color)
        draw.line([(cx - 30, cy - 90), (cx - 30, cy - 10)], fill=(200, 200, 200), width=4)
        draw.rectangle([(cx - 34, cy - 10), (cx - 26, cy + 5)], fill=(225, 225, 230))
        draw.line([(cx + 30, cy - 90), (cx + 30, cy - 10)], fill=(200, 200, 200), width=4)
        draw.rectangle([(cx + 26, cy - 10), (cx + 34, cy + 5)], fill=(225, 225, 230))

    elif shape_type == "pleated_trouser":
        draw.rectangle([(cx - 130, cy - 200), (cx + 130, cy - 150)], fill=secondary_color)
        draw.polygon([
            (cx - 130, cy - 150), (cx - 10, cy - 20),
            (cx - 30, cy + 240), (cx - 170, cy + 240)
        ], fill=primary_color)
        draw.polygon([
            (cx + 130, cy - 150), (cx + 10, cy - 20),
            (cx + 30, cy + 240), (cx + 170, cy + 240)
        ], fill=primary_color)
        draw.line([(cx - 90, cy - 150), (cx - 100, cy + 220)], fill=secondary_color, width=3)
        draw.line([(cx + 90, cy - 150), (cx + 100, cy + 220)], fill=secondary_color, width=3)

    elif shape_type == "oversized_tee":
        draw.polygon([
            (cx - 150, cy - 130), (cx + 150, cy - 130),
            (cx + 160, cy + 180), (cx - 160, cy + 180)
        ], fill=primary_color)
        draw.polygon([
            (cx - 150, cy - 130), (cx - 250, cy - 20),
            (cx - 200, cy + 50), (cx - 140, cy - 30)
        ], fill=primary_color)
        draw.polygon([
            (cx + 150, cy - 130), (cx + 250, cy - 20),
            (cx + 200, cy + 50), (cx + 140, cy - 30)
        ], fill=primary_color)
        draw.arc([(cx - 65, cy - 155), (cx + 65, cy - 105)], 0, 180, fill=secondary_color, width=8)

    elif shape_type == "knit_polo":
        draw.polygon([
            (cx - 150, cy - 120), (cx + 150, cy - 120),
            (cx + 160, cy + 180), (cx - 160, cy + 180)
        ], fill=primary_color)
        draw.polygon([
            (cx - 150, cy - 120), (cx - 240, cy),
            (cx - 190, cy + 60), (cx - 130, cy - 20)
        ], fill=primary_color)
        draw.polygon([
            (cx + 150, cy - 120), (cx + 240, cy),
            (cx + 190, cy + 60), (cx + 130, cy - 20)
        ], fill=primary_color)
        # Knit Ribbed Collar & Placket
        draw.polygon([(cx - 70, cy - 140), (cx - 20, cy - 50), (cx - 70, cy - 70)], fill=secondary_color)
        draw.polygon([(cx + 70, cy - 140), (cx + 20, cy - 50), (cx + 70, cy - 70)], fill=secondary_color)
        draw.rectangle([(cx - 15, cy - 80), (cx + 15, cy + 10)], fill=secondary_color)

    elif shape_type == "knit_vest":
        draw.polygon([
            (cx - 130, cy - 140), (cx + 130, cy - 140),
            (cx + 145, cy + 170), (cx - 145, cy + 170)
        ], fill=primary_color)
        # V-Neck Cutout
        draw.polygon([(cx - 60, cy - 140), (cx, cy - 30), (cx + 60, cy - 140)], fill=(0, 0, 0, 0))
        draw.line([(cx - 60, cy - 140), (cx, cy - 30)], fill=secondary_color, width=8)
        draw.line([(cx + 60, cy - 140), (cx, cy - 30)], fill=secondary_color, width=8)
        # Ribbed hem
        draw.rectangle([(cx - 145, cy + 150), (cx + 145, cy + 170)], fill=secondary_color)

    elif shape_type == "chunky_sneaker":
        draw.polygon([
            (cx - 220, cy + 100), (cx + 220, cy + 100),
            (cx + 200, cy + 160), (cx - 240, cy + 160)
        ], fill=(235, 230, 220))
        draw.polygon([
            (cx - 200, cy + 100), (cx - 140, cy - 40),
            (cx + 80, cy - 50), (cx + 190, cy + 60),
            (cx + 210, cy + 100)
        ], fill=primary_color)
        draw.polygon([
            (cx - 100, cy - 20), (cx + 40, cy - 30),
            (cx + 100, cy + 50), (cx - 60, cy + 60)
        ], fill=secondary_color)
        for ly in range(cy - 20, cy + 40, 15):
            draw.line([(cx - 30, ly), (cx + 30, ly)], fill=(255, 255, 255), width=3)

    elif shape_type == "diver_watch":
        draw.rectangle([(cx - 40, cy - 220), (cx + 40, cy + 220)], fill=(180, 185, 190))
        for sy in range(cy - 200, cy + 200, 20):
            draw.line([(cx - 40, sy), (cx + 40, sy)], fill=(140, 145, 150), width=2)
        draw.ellipse([(cx - 110, cy - 110), (cx + 110, cy + 110)], fill=(215, 220, 225), outline=(130, 135, 140), width=4)
        draw.ellipse([(cx - 95, cy - 95), (cx + 95, cy + 95)], fill=(30, 35, 42), outline=(190, 195, 200), width=3)
        draw.ellipse([(cx - 75, cy - 75), (cx + 75, cy + 75)], fill=(15, 18, 24))
        draw.line([(cx, cy), (cx, cy - 45)], fill=(255, 255, 255), width=4)
        draw.line([(cx, cy), (cx + 35, cy + 10)], fill=(255, 255, 255), width=3)
        draw.line([(cx, cy), (cx - 30, cy + 30)], fill=(230, 50, 50), width=2)

    elif shape_type == "gold_watch":
        # Leather black strap
        draw.rectangle([(cx - 35, cy - 220), (cx + 35, cy + 220)], fill=(25, 25, 28))
        # Gold Tank rectangular case
        draw.rectangle([(cx - 75, cy - 95), (cx + 75, cy + 95)], fill=(212, 175, 55), outline=(180, 145, 35), width=5)
        # White dial
        draw.rectangle([(cx - 55, cy - 75), (cx + 55, cy + 75)], fill=(248, 245, 238))
        # Roman style hands
        draw.line([(cx, cy), (cx, cy - 40)], fill=(20, 20, 20), width=3)
        draw.line([(cx, cy), (cx + 30, cy)], fill=(20, 20, 20), width=2)

    elif shape_type == "sunglasses":
        # Acetate Wayfarer / Browline frame
        draw.polygon([(cx - 180, cy - 40), (cx - 15, cy - 40), (cx - 30, cy + 50), (cx - 165, cy + 50)], fill=primary_color)
        draw.polygon([(cx + 15, cy - 40), (cx + 180, cy - 40), (cx + 165, cy + 50), (cx + 30, cy + 50)], fill=primary_color)
        # Bridge
        draw.rectangle([(cx - 20, cy - 35), (cx + 20, cy - 20)], fill=secondary_color)
        # Dark Lenses
        draw.polygon([(cx - 165, cy - 30), (cx - 30, cy - 30), (cx - 40, cy + 40), (cx - 155, cy + 40)], fill=(20, 22, 28))
        draw.polygon([(cx + 30, cy - 30), (cx + 165, cy - 30), (cx + 155, cy + 40), (cx + 40, cy + 40)], fill=(20, 22, 28))

    elif shape_type == "crossbody_bag":
        # Leather messenger / crossbody
        draw.polygon([
            (cx - 140, cy - 80), (cx + 140, cy - 80),
            (cx + 150, cy + 120), (cx - 150, cy + 120)
        ], fill=primary_color)
        # Flap cover
        draw.polygon([
            (cx - 140, cy - 80), (cx + 140, cy - 80),
            (cx + 130, cy + 30), (cx - 130, cy + 30)
        ], fill=secondary_color)
        # Silver lock clasp
        draw.rectangle([(cx - 15, cy + 15), (cx + 15, cy + 45)], fill=(210, 215, 220), outline=(140, 145, 150), width=2)
        # Crossbody strap
        draw.line([(cx - 130, cy - 80), (cx - 200, cy - 220)], fill=secondary_color, width=8)
        draw.line([(cx + 130, cy - 80), (cx + 200, cy - 220)], fill=secondary_color, width=8)

    elif shape_type == "silver_chain":
        # Cuban link circular loop
        draw.arc([(cx - 120, cy - 120), (cx + 120, cy + 120)], 0, 360, fill=(200, 205, 210), width=10)
        draw.arc([(cx - 110, cy - 110), (cx + 110, cy + 110)], 0, 360, fill=(230, 235, 240), width=5)

    elif shape_type == "cargo_pants":
        draw.rectangle([(cx - 140, cy - 200), (cx + 140, cy - 150)], fill=secondary_color)
        draw.polygon([
            (cx - 140, cy - 150), (cx - 10, cy - 20),
            (cx - 40, cy + 240), (cx - 180, cy + 240)
        ], fill=primary_color)
        draw.polygon([
            (cx + 140, cy - 150), (cx + 10, cy - 20),
            (cx + 40, cy + 240), (cx + 180, cy + 240)
        ], fill=primary_color)
        draw.rectangle([(cx - 175, cy - 30), (cx - 105, cy + 60)], fill=secondary_color, outline=(70, 75, 85), width=2)
        draw.rectangle([(cx + 105, cy - 30), (cx + 175, cy + 60)], fill=secondary_color, outline=(70, 75, 85), width=2)

    elif shape_type == "chore_jacket":
        draw.polygon([
            (cx - 170, cy - 120), (cx + 170, cy - 120),
            (cx + 180, cy + 180), (cx - 180, cy + 180)
        ], fill=primary_color)
        draw.polygon([
            (cx - 170, cy - 120), (cx - 260, cy + 80),
            (cx - 210, cy + 110), (cx - 150, cy - 30)
        ], fill=primary_color)
        draw.polygon([
            (cx + 170, cy - 120), (cx + 260, cy + 80),
            (cx + 210, cy + 110), (cx + 150, cy - 30)
        ], fill=primary_color)
        draw.line([(cx, cy - 120), (cx, cy + 180)], fill=secondary_color, width=4)
        for by in range(cy - 80, cy + 160, 50):
            draw.ellipse([(cx - 6, by - 6), (cx + 6, by + 6)], fill=(210, 215, 220), outline=(100, 105, 110), width=2)
        draw.rectangle([(cx - 140, cy - 40), (cx - 70, cy + 30)], fill=secondary_color)

    cutout_path = settings.UPLOAD_DIR / "cutouts" / filename
    original_path = settings.UPLOAD_DIR / "originals" / filename
    img.save(cutout_path, "PNG")

    bg = Image.new("RGBA", (w, h), (245, 245, 247, 255))
    bg.paste(img, (0, 0), img)
    bg.save(original_path, "PNG")

    return f"{settings.STATIC_UPLOADS_URL}/cutouts/{filename}"

def seed_starter_wardrobe(force: bool = False):
    conn = get_db_connection()
    cursor = conn.cursor()

    if force:
        cursor.execute("DELETE FROM clothing_items")
        conn.commit()

    cursor.execute("SELECT COUNT(*) as count FROM clothing_items")
    count = cursor.fetchone()["count"]
    if count >= 12 and not force:
        conn.close()
        return

    user_id = get_default_user_id()

    starter_items = [
        # Tops
        {
            "filename": "charcoal_boxy_hoodie.png",
            "shape": "boxy_hoodie",
            "primary_rgb": (56, 59, 64),
            "secondary_rgb": (38, 40, 44),
            "category": "top",
            "sub_category": "boxy_hoodie",
            "color_primary_hex": "#383b40",
            "color_secondary_hex": "#26282c",
            "color_family": "charcoal_grey",
            "fabric_type": "cotton_fleece",
            "fabric_weight": "heavyweight_350gsm",
            "pattern": "solid",
            "hardware_color": "silver",
            "thermal_rating": 4,
            "fit_type": "boxy",
            "metadata_json": {"tags": ["boxy-crop", "350gsm", "essential"]}
        },
        {
            "filename": "sage_green_oversized_tee.png",
            "shape": "oversized_tee",
            "primary_rgb": (158, 172, 149),
            "secondary_rgb": (118, 133, 110),
            "category": "top",
            "sub_category": "oversized_tee",
            "color_primary_hex": "#9eac95",
            "color_secondary_hex": "#76856e",
            "color_family": "sage_green",
            "fabric_type": "french_terry",
            "fabric_weight": "heavyweight_350gsm",
            "pattern": "solid",
            "hardware_color": "none",
            "thermal_rating": 2,
            "fit_type": "boxy",
            "metadata_json": {"tags": ["earth-tone", "drop-shoulder"]}
        },
        {
            "filename": "terracotta_knit_polo.png",
            "shape": "knit_polo",
            "primary_rgb": (194, 91, 61),
            "secondary_rgb": (145, 65, 42),
            "category": "top",
            "sub_category": "knit_polo",
            "color_primary_hex": "#c25b3d",
            "color_secondary_hex": "#91412a",
            "color_family": "terracotta_rust",
            "fabric_type": "ribbed_cotton",
            "fabric_weight": "midweight",
            "pattern": "textured",
            "hardware_color": "none",
            "thermal_rating": 2,
            "fit_type": "relaxed",
            "metadata_json": {"tags": ["retro-knit", "textured-placket"]}
        },
        {
            "filename": "royal_blue_boxy_hoodie.png",
            "shape": "boxy_hoodie",
            "primary_rgb": (37, 99, 235),
            "secondary_rgb": (29, 78, 216),
            "category": "top",
            "sub_category": "boxy_hoodie",
            "color_primary_hex": "#2563eb",
            "color_secondary_hex": "#1d4ed8",
            "color_family": "royal_blue",
            "fabric_type": "cotton_fleece",
            "fabric_weight": "heavyweight_350gsm",
            "pattern": "solid",
            "hardware_color": "silver",
            "thermal_rating": 4,
            "fit_type": "boxy",
            "metadata_json": {"tags": ["statement-color", "streetwear"]}
        },
        {
            "filename": "cream_cable_knit_vest.png",
            "shape": "knit_vest",
            "primary_rgb": (243, 239, 230),
            "secondary_rgb": (215, 208, 195),
            "category": "top",
            "sub_category": "knit_vest",
            "color_primary_hex": "#f3efe6",
            "color_secondary_hex": "#d7d0c3",
            "color_family": "cream_beige",
            "fabric_type": "wool_blend",
            "fabric_weight": "midweight",
            "pattern": "cable_knit",
            "hardware_color": "none",
            "thermal_rating": 3,
            "fit_type": "boxy",
            "metadata_json": {"tags": ["preppy-layer", "v-neck-drape"]}
        },
        # Bottoms
        {
            "filename": "olive_korean_pleated_trousers.png",
            "shape": "pleated_trouser",
            "primary_rgb": (74, 83, 56),
            "secondary_rgb": (52, 59, 39),
            "category": "bottom",
            "sub_category": "korean_pleated_trouser",
            "color_primary_hex": "#4a5338",
            "color_secondary_hex": "#343b27",
            "color_family": "olive_green",
            "fabric_type": "twill",
            "fabric_weight": "midweight",
            "pattern": "solid",
            "hardware_color": "none",
            "thermal_rating": 2,
            "fit_type": "korean-pleated",
            "metadata_json": {"tags": ["wide-drape", "double-pleat", "high-rise"]}
        },
        {
            "filename": "pitch_black_cargo_denim.png",
            "shape": "cargo_pants",
            "primary_rgb": (27, 30, 36),
            "secondary_rgb": (47, 53, 66),
            "category": "bottom",
            "sub_category": "cargo_pants",
            "color_primary_hex": "#1b1e24",
            "color_secondary_hex": "#2f3542",
            "color_family": "pitch_black",
            "fabric_type": "raw_denim",
            "fabric_weight": "heavyweight_350gsm",
            "pattern": "solid",
            "hardware_color": "silver",
            "thermal_rating": 3,
            "fit_type": "baggy",
            "metadata_json": {"tags": ["tactical-pockets", "deep-stacking"]}
        },
        # Shoes
        {
            "filename": "offwhite_chunky_sneakers.png",
            "shape": "chunky_sneaker",
            "primary_rgb": (237, 232, 223),
            "secondary_rgb": (180, 175, 165),
            "category": "shoes",
            "sub_category": "chunky_sneaker",
            "color_primary_hex": "#ede8df",
            "color_secondary_hex": "#b4afa5",
            "color_family": "off_white",
            "fabric_type": "leather_mesh",
            "fabric_weight": "midweight",
            "pattern": "textured",
            "hardware_color": "none",
            "thermal_rating": 2,
            "fit_type": "regular",
            "metadata_json": {"tags": ["chunky-sole", "achromatic-sandwich"]}
        },
        # Outerwear
        {
            "filename": "tan_workwear_chore_jacket.png",
            "shape": "chore_jacket",
            "primary_rgb": (140, 123, 100),
            "secondary_rgb": (90, 77, 59),
            "category": "outerwear",
            "sub_category": "chore_jacket",
            "color_primary_hex": "#8c7b64",
            "color_secondary_hex": "#5a4d3b",
            "color_family": "khaki_tan",
            "fabric_type": "canvas_cotton",
            "fabric_weight": "heavyweight_350gsm",
            "pattern": "solid",
            "hardware_color": "silver",
            "thermal_rating": 4,
            "fit_type": "relaxed",
            "metadata_json": {"tags": ["silver-buttons", "box-layering"]}
        },
        # Watches & Accessories
        {
            "filename": "silver_diver_watch.png",
            "shape": "diver_watch",
            "primary_rgb": (200, 209, 217),
            "secondary_rgb": (30, 35, 42),
            "category": "watch",
            "sub_category": "diver_watch",
            "color_primary_hex": "#c8d1d9",
            "color_secondary_hex": "#1e232a",
            "color_family": "slate_grey",
            "fabric_type": "stainless_steel",
            "fabric_weight": "heavyweight_350gsm",
            "pattern": "solid",
            "hardware_color": "silver",
            "thermal_rating": 1,
            "fit_type": "regular",
            "metadata_json": {"tags": ["steel-bracelet", "hardware-sync"]}
        },
        {
            "filename": "vintage_gold_tank_watch.png",
            "shape": "gold_watch",
            "primary_rgb": (212, 175, 55),
            "secondary_rgb": (25, 25, 28),
            "category": "watch",
            "sub_category": "dress_watch",
            "color_primary_hex": "#d4af37",
            "color_secondary_hex": "#19191c",
            "color_family": "mocha_brown",
            "fabric_type": "leather_gold",
            "fabric_weight": "midweight",
            "pattern": "solid",
            "hardware_color": "gold",
            "thermal_rating": 1,
            "fit_type": "regular",
            "metadata_json": {"tags": ["tank-case", "quiet-luxury", "gold-hardware"]}
        },
        {
            "filename": "retro_acetate_sunglasses.png",
            "shape": "sunglasses",
            "primary_rgb": (89, 60, 40),
            "secondary_rgb": (212, 175, 55),
            "category": "eyewear",
            "sub_category": "acetate_sunglasses",
            "color_primary_hex": "#593c28",
            "color_secondary_hex": "#d4af37",
            "color_family": "mocha_brown",
            "fabric_type": "acetate",
            "fabric_weight": "lightweight",
            "pattern": "tortoise",
            "hardware_color": "gold",
            "thermal_rating": 1,
            "fit_type": "regular",
            "metadata_json": {"tags": ["geometric-frame", "eyewear-sync"]}
        },
        {
            "filename": "matte_black_crossbody_bag.png",
            "shape": "crossbody_bag",
            "primary_rgb": (24, 24, 27),
            "secondary_rgb": (39, 39, 42),
            "category": "bag",
            "sub_category": "crossbody_bag",
            "color_primary_hex": "#18181b",
            "color_secondary_hex": "#27272a",
            "color_family": "pitch_black",
            "fabric_type": "matte_leather",
            "fabric_weight": "heavyweight_350gsm",
            "pattern": "solid",
            "hardware_color": "silver",
            "thermal_rating": 1,
            "fit_type": "regular",
            "metadata_json": {"tags": ["silver-buckle", "minimalist-carry"]}
        },
        {
            "filename": "silver_cuban_chain.png",
            "shape": "silver_chain",
            "primary_rgb": (209, 213, 219),
            "secondary_rgb": (156, 163, 175),
            "category": "accessory",
            "sub_category": "silver_cuban_chain",
            "color_primary_hex": "#d1d5db",
            "color_secondary_hex": "#9ca3af",
            "color_family": "slate_grey",
            "fabric_type": "sterling_silver",
            "fabric_weight": "lightweight",
            "pattern": "chain_link",
            "hardware_color": "silver",
            "thermal_rating": 1,
            "fit_type": "regular",
            "metadata_json": {"tags": ["925-silver", "neck-accessory"]}
        }
    ]

    for item in starter_items:
        cutout_url = create_item_image(
            item["filename"],
            item["shape"],
            item["primary_rgb"],
            item["secondary_rgb"]
        )
        orig_url = f"{settings.STATIC_UPLOADS_URL}/originals/{item['filename']}"

        emb = generate_multimodal_embedding(item, [item["color_primary_hex"], item["color_secondary_hex"]])

        item_id = str(uuid.uuid4())
        cursor.execute("""
        INSERT INTO clothing_items (
            id, user_id, image_original_url, image_cutout_url,
            category, sub_category, color_primary_hex, color_secondary_hex,
            color_family, fabric_type, fabric_weight, pattern, hardware_color,
            thermal_rating, fit_type, embedding, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """, (
            item_id, user_id, orig_url, cutout_url,
            item["category"], item["sub_category"], item["color_primary_hex"], item["color_secondary_hex"],
            item["color_family"], item["fabric_type"], item["fabric_weight"], item["pattern"], item["hardware_color"],
            item["thermal_rating"], item["fit_type"], json.dumps(emb), json.dumps(item["metadata_json"])
        ))

    conn.commit()
    conn.close()
