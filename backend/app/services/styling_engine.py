import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import math

from app.models.schemas import (
    ClothingItemResponse,
    OutfitResponse,
    WeatherCondition,
    GenerateOutfitRequest,
    MicroStylingInstruction,
    BodyTypeProfile,
    OutfitCombination,
    PieceCombinationsResponse
)
from app.core.config import settings

# Color theory harmony sets
NEUTRAL_FAMILIES = {"pitch_black", "charcoal_grey", "slate_grey", "off_white", "cream_beige"}
EARTH_FAMILIES = {"olive_green", "forest_green", "sage_green", "mocha_brown", "khaki_tan", "terracotta_rust", "mustard_ochre"}
COOL_FAMILIES = {"navy_blue", "royal_blue", "sky_blue", "slate_grey", "lavender_fog"}

def generate_morphological_advice(body: BodyTypeProfile) -> str:
    """
    Generates haute-couture morphological advice tailored to body geometry, facial shape, and height/weight.
    """
    # 1. Body type rule
    body_rules = {
        "inverted_triangle": (
            "Broad Shoulders & V-Taper: Balance upper torso volume by wearing wide-leg Korean pleated trousers "
            "or relaxed carpenter pants. Avoid skinny/tapered bottoms that make the torso appear disproportionately heavy."
        ),
        "rectangle": (
            "Athletic Linear Build: Create visual proportion by wearing cropped/boxy 350 GSM tops with a visible belt line. "
            "This creates the optical illusion of an elongated lower half and defined waist (Golden 1:2 ratio)."
        ),
        "oval": (
            "Fuller Midsection / Relaxed Frame: Maximize vertical layering. Keep your chore jacket or overshirt unzipped "
            "to create two slimming vertical sightlines. Choose dropped-shoulder cuts that drape cleanly over the midsection."
        ),
        "trapezoid": (
            "Naturally Balanced Frame: Highly versatile. You can transition effortlessly between cropped boxy streetwear "
            "and fluid wide-leg tailoring."
        ),
        "triangle": (
            "Wider Hips / Sloped Shoulders: Broaden the shoulder line with structured boxy hoodies, chore jackets with collar points, "
            "and pair with dark, straight/relaxed trousers to streamline hips."
        )
    }

    # 2. Facial shape & eyewear / neckline rule
    face_rules = {
        "oval": "Oval Face: Compatible with all necklines (crew, mock, hoodie) and classic acetate wayfarer or wireframe frames.",
        "round": "Round Face: Elongate with V-necks, open camp collars, or structured hood drape; pair with geometric/square eyewear.",
        "square": "Chiseled Square Jaw: Soften sharp angles with relaxed crewnecks, curved hood collars, and round/wireframe sunglasses.",
        "heart": "Heart Face: Balance a pointed chin with wide collars, drop-shoulder hoodies, and classic clubmaster frames.",
        "diamond": "Diamond Face: Accentuate cheekbones with relaxed crew collars and rimless or browline eyewear."
    }

    # 3. Height / Stature cue
    if body.height_cm < 172.0:
        height_cue = "Height Tip (<172cm): Wear high-rise trousers and fold top hems inward 1 inch to elevate your waistline and elongate leg length."
    elif body.height_cm > 182.0:
        height_cue = "Height Tip (>182cm): Can effortlessly carry full cascading trouser pooling and oversized outer coats."
    else:
        height_cue = "Height Tip: Standard 1:2 proportional drape creates optimal editorial runway balance."

    b_text = body_rules.get(body.body_type, body_rules["inverted_triangle"])
    f_text = face_rules.get(body.facial_shape, face_rules["oval"])

    return f"{b_text} | {f_text} | {height_cue}"

def evaluate_color_harmony(items: List[ClothingItemResponse]) -> Tuple[float, str]:
    fams = [it.color_family for it in items]
    top_item = next((it for it in items if it.category == "top"), None)
    bottom_item = next((it for it in items if it.category == "bottom"), None)
    shoes_item = next((it for it in items if it.category == "shoes"), None)

    sandwich_bonus = 0.0
    sandwich_note = ""
    if top_item and shoes_item:
        if top_item.color_family == shoes_item.color_family:
            sandwich_bonus = 0.20
            sandwich_note = f"Color Sandwich applied: {top_item.color_family.replace('_', ' ').title()} top is anchored by matching footwear, visually framing the outfit."
        elif top_item.color_family in NEUTRAL_FAMILIES and shoes_item.color_family in NEUTRAL_FAMILIES:
            sandwich_bonus = 0.15
            sandwich_note = "Achromatic Sandwich: Clean neutral top and shoe balance the statement bottom piece."

    unique_fams = set(fams)
    if len(unique_fams) <= 2:
        base_score = 0.86
        cohesion_note = "Minimalist tonal harmony with controlled color palette."
    elif unique_fams.issubset(NEUTRAL_FAMILIES.union(EARTH_FAMILIES)):
        base_score = 0.92
        cohesion_note = "Earth-tone & neutral synergy (Olive, Sage, Mocha, and Off-White)."
    elif unique_fams.issubset(NEUTRAL_FAMILIES.union(COOL_FAMILIES)):
        base_score = 0.89
        cohesion_note = "Modern Scandinavian cool palette with Slate, Royal Blue, and Pitch Black."
    else:
        base_score = 0.75
        cohesion_note = "Dynamic chromatic accents with balanced visual contrast."

    total_color_score = min(1.0, base_score + sandwich_bonus)
    rationale = f"{cohesion_note} {sandwich_note}".strip()
    return total_color_score, rationale

def evaluate_silhouette_harmony(items: List[ClothingItemResponse], body: BodyTypeProfile) -> Tuple[float, str]:
    top_item = next((it for it in items if it.category in ["top", "outerwear"]), None)
    bottom_item = next((it for it in items if it.category == "bottom"), None)

    if not top_item or not bottom_item:
        return 0.75, "Standard relaxed silhouette."

    top_fit = (top_item.fit_type or "regular").lower()
    bottom_fit = (bottom_item.fit_type or "regular").lower()

    if ("boxy" in top_fit or "cropped" in top_fit) and ("baggy" in bottom_fit or "pleated" in bottom_fit or "loose" in bottom_fit):
        return 0.98, f"Golden 1:2 Silhouette: Boxy dropped-shoulder top paired with wide-leg draped trousers creates modern editorial volume, ideally balancing your {body.body_type.replace('_', ' ').title()} frame."
    elif "relaxed" in top_fit and ("baggy" in bottom_fit or "pleated" in bottom_fit):
        return 0.92, "Contemporary fluid silhouette: Cascading relaxed top drape harmonizes with wide-leg pants."
    elif "regular" in top_fit and "baggy" in bottom_fit:
        return 0.85, "Balanced bottom-heavy silhouette with structured regular base."
    elif "skinny" in top_fit or "skinny" in bottom_fit:
        return 0.60, "Narrow silhouette; recommend transitioning to wide-leg or pleated bottoms for modern drape."
    else:
        return 0.82, f"Comfort-first streetwear fit ({top_fit} top with {bottom_fit} bottom)."

def evaluate_hardware_harmony(items: List[ClothingItemResponse], preferred_hw: Optional[str] = None) -> Tuple[float, str]:
    hardwares = [it.hardware_color.lower() for it in items if it.hardware_color and it.hardware_color != "none"]
    watch_item = next((it for it in items if it.category in ["watch", "accessory"]), None)

    if not hardwares:
        return 0.90, "Minimalist hardware: No conflicting metallic elements detected."

    gold_count = hardwares.count("gold")
    silver_count = hardwares.count("silver")

    if gold_count > 0 and silver_count > 0:
        return 0.70, "Mixed Metal Notice: Detected both gold and silver hardware. For maximum luxury refinement, harmonize all accents to a single metallic tone."

    if silver_count > 0:
        w_title = watch_item.sub_category.replace("_", " ").title() if watch_item else "Watch"
        return 0.97, f"Monolithic Silver Harmony: {w_title} casing synchronizes with brushed silver zipper pulls and metal eyelets."
    elif gold_count > 0:
        w_title = watch_item.sub_category.replace("_", " ").title() if watch_item else "Watch"
        return 0.97, f"Warm Gold Refinement: {w_title} case echoes warm metallic detailing throughout the fit."

    return 0.88, "Clean execution with discreet neutral hardware."

def generate_micro_styling_instructions(
    items: List[ClothingItemResponse],
    occasion: str,
    body: BodyTypeProfile
) -> List[MicroStylingInstruction]:
    instructions: List[MicroStylingInstruction] = []
    top = next((it for it in items if it.category == "top"), None)
    bottom = next((it for it in items if it.category == "bottom"), None)
    watch = next((it for it in items if it.category in ["watch", "accessory"]), None)
    shoes = next((it for it in items if it.category == "shoes"), None)
    outerwear = next((it for it in items if it.category == "outerwear"), None)
    accessory = next((it for it in items if it.category in ["eyewear", "bag", "accessory"] and it != watch), None)

    # 1. Top micro-styling
    if top:
        if "hoodie" in top.sub_category.lower() or "boxy" in (top.fit_type or "").lower():
            instructions.append(MicroStylingInstruction(
                action="Fold bottom waistband inward 1 inch",
                reason=f"Creates a structured cropped balloon drape resting at the belt line, emphasizing the 1:2 Golden Ratio for your {body.body_type.replace('_', ' ')} frame.",
                target_item="top"
            ))
        elif "tee" in top.sub_category.lower():
            if bottom and "pleated" in bottom.sub_category.lower():
                instructions.append(MicroStylingInstruction(
                    action="Apply a relaxed French-tuck at the front buckle",
                    reason="Defines the high waistline and accentuates the Korean trouser pleats while keeping the back loose.",
                    target_item="top"
                ))
            else:
                instructions.append(MicroStylingInstruction(
                    action="Keep tee untucked with natural dropped-shoulder drape",
                    reason="Maintains relaxed boxy proportions over wide pants.",
                    target_item="top"
                ))

    # 2. Watch & Sleeve micro-styling
    if watch:
        hw = (watch.hardware_color or "silver").capitalize()
        instructions.append(MicroStylingInstruction(
            action="Roll left sleeve twice to 3/4 forearm",
            reason=f"Exposes the {hw} {watch.sub_category.replace('_', ' ')} bezel and balances wrist accessories.",
            target_item="watch"
        ))

    # 3. Bottom & Trouser Break micro-styling
    if bottom:
        if "pleated" in bottom.sub_category.lower() or "baggy" in (bottom.fit_type or "").lower():
            instructions.append(MicroStylingInstruction(
                action="Allow hem to pool with a soft single-break over footwear",
                reason="Enhances the drape and volume of the pleated fabric without dragging on the pavement.",
                target_item="bottom"
            ))
        elif "cargo" in bottom.sub_category.lower():
            instructions.append(MicroStylingInstruction(
                action="Fasten ankle bungee cords to 80% tension",
                reason="Creates a tapered streetwear cuff that frames the chunky sneaker profile.",
                target_item="bottom"
            ))

    # 4. Footwear micro-styling
    if shoes:
        if "sneaker" in shoes.sub_category.lower():
            instructions.append(MicroStylingInstruction(
                action="Slightly loosen upper laces for a relaxed tongue stance",
                reason="Allows the wide trouser hem to rest naturally without bunching awkwardly.",
                target_item="shoes"
            ))
        elif "derby" in shoes.sub_category.lower():
            instructions.append(MicroStylingInstruction(
                action="Ensure dark ribbed ankle socks are worn",
                reason="Creates seamless black-on-black ankle transition beneath tailored trousers.",
                target_item="shoes"
            ))

    # 5. Outerwear micro-styling
    if outerwear:
        instructions.append(MicroStylingInstruction(
            action="Leave outerwear zipper or buttons open to mid-chest",
            reason="Creates two vertical visual sightlines, framing the inner top while adding depth.",
            target_item="outerwear"
        ))

    # 6. Eyewear or Bag micro-styling
    if accessory:
        instructions.append(MicroStylingInstruction(
            action=f"Style {accessory.sub_category.replace('_', ' ')} naturally",
            reason=f"Complements your {body.facial_shape} facial profile with clean geometric framing.",
            target_item="accessory"
        ))

    return instructions

def select_best_outfit(
    all_items: List[ClothingItemResponse],
    request: GenerateOutfitRequest
) -> OutfitResponse:
    weather = request.weather or WeatherCondition()
    target_temp = weather.temp_c
    occasion = request.occasion.lower()
    body = request.body_profile or BodyTypeProfile()
    vibe = request.aesthetic_vibe or "korean_minimal"

    tops = [it for it in all_items if it.category == "top"]
    bottoms = [it for it in all_items if it.category == "bottom"]
    shoes = [it for it in all_items if it.category == "shoes"]
    outerwears = [it for it in all_items if it.category == "outerwear"]
    watches = [it for it in all_items if it.category in ["watch", "accessory"]]
    accessories = [it for it in all_items if it.category in ["accessory", "eyewear", "bag"]]

    if not tops:
        raise ValueError("No tops found in wardrobe. Ingest at least one top garment.")
    if not bottoms:
        raise ValueError("No bottoms found in wardrobe. Ingest at least one bottom garment.")
    if not shoes:
        shoes = [bottoms[0]]

    # 1. Focus Item Override (if requested)
    best_top = None
    best_bottom = None
    if request.focus_item_id:
        focus = next((it for it in all_items if it.id == request.focus_item_id), None)
        if focus:
            if focus.category == "top": best_top = focus
            elif focus.category == "bottom": best_bottom = focus

    # 2. Select Top if not focused
    if not best_top:
        def top_score(t: ClothingItemResponse) -> float:
            score = 1.0
            fit = (t.fit_type or "").lower()
            if "boxy" in fit: score += 0.5
            if vibe == "korean_minimal" and "fleece" in (t.fabric_type or "").lower(): score += 0.3
            if vibe == "vintage_americana" and "jacket" in (t.sub_category or "").lower(): score += 0.4
            # Thermal check
            tr = t.thermal_rating or 2
            if target_temp < 16.0 and tr >= 3: score += 0.6
            elif target_temp > 24.0 and tr <= 2: score += 0.6
            # Undertone match
            if body.skin_undertone == "warm" and t.color_family in EARTH_FAMILIES: score += 0.3
            elif body.skin_undertone == "cool" and t.color_family in COOL_FAMILIES: score += 0.3
            return score

        sorted_tops = sorted(tops, key=top_score, reverse=True)
        best_top = sorted_tops[0]

    # 3. Select Bottom if not focused
    if not best_bottom:
        def bottom_score(b: ClothingItemResponse) -> float:
            fit = (b.fit_type or "").lower()
            score = 1.0
            if "pleated" in fit or "korean" in fit:
                score += (0.6 if vibe == "korean_minimal" else 0.4)
            elif "baggy" in fit or "cargo" in (b.sub_category or "").lower():
                score += (0.6 if vibe in ["streetwear", "gorpcore"] else 0.4)
            # Body type adjustment
            if body.body_type == "inverted_triangle" and ("baggy" in fit or "pleated" in fit):
                score += 0.5
            return score

        sorted_bottoms = sorted(bottoms, key=bottom_score, reverse=True)
        best_bottom = sorted_bottoms[0]

    # 4. Select Footwear (Sandwich Color match)
    best_shoe = shoes[0]
    for sh in shoes:
        if sh.color_family == best_top.color_family or sh.color_family in NEUTRAL_FAMILIES:
            best_shoe = sh
            break

    # 5. Select Watch / Hardware Sync
    target_hw = request.preferred_hardware or best_top.hardware_color or "silver"
    best_watch = None
    if watches:
        matching_watches = [w for w in watches if w.hardware_color == target_hw]
        best_watch = matching_watches[0] if matching_watches else watches[0]

    # 6. Select Outerwear if cold (< 17°C)
    best_outer = None
    if target_temp < 17.0 and outerwears:
        best_outer = outerwears[0]

    # 7. Select Eyewear or Bag
    best_acc = None
    if accessories and accessories != [best_watch]:
        extra_accs = [a for a in accessories if a != best_watch]
        if extra_accs:
            best_acc = extra_accs[0]

    selected_items: List[ClothingItemResponse] = [best_top, best_bottom, best_shoe]
    if best_outer:
        selected_items.append(best_outer)
    if best_watch:
        selected_items.append(best_watch)
    if best_acc:
        selected_items.append(best_acc)

    # Harmonies
    color_score, color_note = evaluate_color_harmony(selected_items)
    silhouette_score, silhouette_note = evaluate_silhouette_harmony(selected_items, body)
    hardware_score, hardware_note = evaluate_hardware_harmony(selected_items, target_hw)
    morph_advice = generate_morphological_advice(body)

    overall_harmony = round((color_score * 0.35) + (silhouette_score * 0.40) + (hardware_score * 0.25), 2)
    overall_harmony = max(0.60, min(0.99, overall_harmony))

    # Layering breakdown
    layering = {
        "Base Inner Layer": f"{best_top.sub_category.replace('_', ' ').title()} ({best_top.fabric_weight or '350 GSM'})",
        "Tonal Lower Column": f"{best_bottom.sub_category.replace('_', ' ').title()} ({best_bottom.fit_type} cut)",
        "Footwear Foundation": f"{best_shoe.sub_category.replace('_', ' ').title()} ({best_shoe.color_family.replace('_', ' ').title()})"
    }
    if best_outer:
        layering["Outer Shell"] = f"{best_outer.sub_category.replace('_', ' ').title()} (Thermal Insulation)"
    if best_watch:
        layering["Metal Accent"] = f"{best_watch.sub_category.replace('_', ' ').title()} ({best_watch.hardware_color.capitalize()})"

    occasion_labels = {
        "tuition": "Tuition & University Lectures",
        "coding": "Desk Work & Deep Coding Focus",
        "market": "Weekend Market & Casual Outing",
        "formal": "Formal Dinner & Evening Engagement",
        "home": "Home Lounge & Creative Work",
        "date_night": "Date Night & Intimate Dinner",
        "airport": "Airport Travel & Long Transit"
    }
    occ_str = occasion_labels.get(occasion, occasion.title())
    vibe_str = vibe.replace("_", " ").title()

    styling_notes = (
        f"Curated in {vibe_str} aesthetic for {occ_str} in {weather.condition} ({weather.temp_c}°C). "
        f"{silhouette_note} {color_note} {hardware_note}"
    )

    micro_instructions = generate_micro_styling_instructions(selected_items, occasion, body)

    return OutfitResponse(
        id=str(uuid.uuid4()),
        user_id=best_top.user_id,
        occasion=occasion,
        aesthetic_vibe=vibe,
        weather_condition=weather,
        items=selected_items,
        item_ids=[it.id for it in selected_items],
        silhouette_analysis=silhouette_note,
        morphological_analysis=morph_advice,
        hardware_harmony=hardware_note,
        layering_breakdown=layering,
        styling_notes=styling_notes,
        micro_styling=micro_instructions,
        harmony_score=overall_harmony,
        created_at=datetime.utcnow().isoformat()
    )

def generate_piece_combinations(
    focus_item: ClothingItemResponse,
    all_items: List[ClothingItemResponse]
) -> PieceCombinationsResponse:
    """
    Generates 3 complete, distinct outfits built around a single piece, showing how to style
    it across different aesthetics:
    - Look 1: Korean Minimalist Drape
    - Look 2: Streetwear / Casual Stacking
    - Look 3: Smart Formal / Polished Layering
    """
    body = BodyTypeProfile()

    # Look 1: Korean Minimal
    req_1 = GenerateOutfitRequest(
        occasion="tuition",
        aesthetic_vibe="korean_minimal",
        focus_item_id=focus_item.id,
        preferred_hardware="silver"
    )
    outfit_1 = select_best_outfit(all_items, req_1)

    # Look 2: Streetwear
    req_2 = GenerateOutfitRequest(
        occasion="market",
        aesthetic_vibe="streetwear",
        focus_item_id=focus_item.id,
        preferred_hardware="silver"
    )
    outfit_2 = select_best_outfit(all_items, req_2)

    # Look 3: Smart Polished / Evening
    req_3 = GenerateOutfitRequest(
        occasion="formal",
        aesthetic_vibe="quiet_luxury",
        focus_item_id=focus_item.id,
        preferred_hardware=focus_item.hardware_color or "silver"
    )
    outfit_3 = select_best_outfit(all_items, req_3)

    combinations = [
        OutfitCombination(
            title=f"Look 1: Korean Minimalist Smart ({focus_item.sub_category.replace('_', ' ').title()})",
            aesthetic="Korean Minimalist",
            occasion="tuition",
            items=outfit_1.items,
            styling_notes=outfit_1.styling_notes,
            silhouette_analysis=outfit_1.silhouette_analysis,
            hardware_harmony=outfit_1.hardware_harmony,
            micro_styling=outfit_1.micro_styling,
            harmony_score=outfit_1.harmony_score
        ),
        OutfitCombination(
            title=f"Look 2: Relaxed Boxy Streetwear ({focus_item.sub_category.replace('_', ' ').title()})",
            aesthetic="Streetwear Drape",
            occasion="market",
            items=outfit_2.items,
            styling_notes=outfit_2.styling_notes,
            silhouette_analysis=outfit_2.silhouette_analysis,
            hardware_harmony=outfit_2.hardware_harmony,
            micro_styling=outfit_2.micro_styling,
            harmony_score=outfit_2.harmony_score
        ),
        OutfitCombination(
            title=f"Look 3: Quiet Luxury Evening ({focus_item.sub_category.replace('_', ' ').title()})",
            aesthetic="Quiet Luxury",
            occasion="formal",
            items=outfit_3.items,
            styling_notes=outfit_3.styling_notes,
            silhouette_analysis=outfit_3.silhouette_analysis,
            hardware_harmony=outfit_3.hardware_harmony,
            micro_styling=outfit_3.micro_styling,
            harmony_score=outfit_3.harmony_score
        )
    ]

    return PieceCombinationsResponse(
        focus_item=focus_item,
        total_combinations=len(combinations),
        combinations=combinations
    )
