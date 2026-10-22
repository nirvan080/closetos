from typing import List, Dict, Any
from app.models.schemas import (
    ClothingItemResponse,
    WardrobeGapRecommendation,
    WardrobeGapAnalysisResponse
)

def perform_wardrobe_gap_analysis(items: List[ClothingItemResponse]) -> WardrobeGapAnalysisResponse:
    category_counts = {
        "top": 0,
        "bottom": 0,
        "shoes": 0,
        "outerwear": 0,
        "watch": 0,
        "accessory": 0
    }
    thermal_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    hardware_breakdown = {"silver": 0, "gold": 0, "none": 0}
    color_families_present = set()

    for it in items:
        cat = it.category.lower()
        if cat in category_counts:
            category_counts[cat] += 1
        else:
            category_counts["accessory"] += 1

        tr = it.thermal_rating or 2
        thermal_distribution[tr] = thermal_distribution.get(tr, 0) + 1

        hw = (it.hardware_color or "none").lower()
        hardware_breakdown[hw] = hardware_breakdown.get(hw, 0) + 1

        if it.color_family:
            color_families_present.add(it.color_family)

    recommendations: List[WardrobeGapRecommendation] = []

    # 1. Check for Heavyweight 350 GSM Boxy Layer (Essential Staple)
    has_heavy_boxy_top = any(
        it.category == "top" and "boxy" in (it.fit_type or "").lower() and (it.thermal_rating or 0) >= 3
        for it in items
    )
    if not has_heavy_boxy_top or category_counts["top"] < 3:
        target_color = "off_white" if "charcoal_grey" in color_families_present else "charcoal_grey"
        recommendations.append(WardrobeGapRecommendation(
            id="gap-heavy-boxy-top",
            item_title="Heavyweight 350 GSM Boxy Drop-Shoulder Sweatshirt",
            category="top",
            target_color_family=target_color,
            target_color_hex="#f0eee9" if target_color == "off_white" else "#3c4043",
            fabric_spec="350+ GSM 100% French Terry Cotton, Ribbed Mock Neck & Cuffs",
            silhouette_fit="Boxy cropped drape, dropped shoulders",
            target_budget_inr="₹499 – ₹799",
            urgency_roi="High ROI",
            rationale="Crucial structural anchor. The cropped 350 GSM boxy cut pairs effortlessly with wide pleated bottoms to satisfy the 1:2 Golden Silhouette rule.",
            unlocks_outfits_count=6,
            pair_with_item_names=["Korean Pleated Trouser", "Baggy Cargo Pants", "Chunky Retro Sneakers"],
            suggested_retail_search="Zudio / Westside / Bonkers 350 GSM Boxy French Terry Sweatshirt"
        ))

    # 2. Check for Korean Pleated Wide-Leg Trouser
    has_pleated_bottom = any(
        it.category == "bottom" and "pleated" in (it.sub_category or "").lower()
        for it in items
    )
    if not has_pleated_bottom:
        recommendations.append(WardrobeGapRecommendation(
            id="gap-korean-pleated-trouser",
            item_title="Korean Pleated Wide-Leg Drape Trousers",
            category="bottom",
            target_color_family="olive_green" if "olive_green" not in color_families_present else "charcoal_grey",
            target_color_hex="#556b2f" if "olive_green" not in color_families_present else "#2f3542",
            fabric_spec="Poly-Viscose Twill with fluid drape and deep double front pleats",
            silhouette_fit="High-rise waist, wide relaxed drape pooling at shoe",
            target_budget_inr="₹599 – ₹799",
            urgency_roi="High ROI",
            rationale="Transforms casual tees and hoodies into elevated smart-casual Korean street aesthetic. Essential for Tuition and Evening settings.",
            unlocks_outfits_count=8,
            pair_with_item_names=["Boxy Hoodie", "Oversized Tee", "Minimalist Derbies"],
            suggested_retail_search="Snitch / Urbanic / H&M Wide Leg Pleated Smart Trousers"
        ))

    # 3. Check for Footwear Color Sandwich Anchor
    has_neutral_shoes = any(
        it.category == "shoes" and it.color_family in ["off_white", "cream_beige"]
        for it in items
    )
    if not has_neutral_shoes:
        recommendations.append(WardrobeGapRecommendation(
            id="gap-offwhite-chunky-sneakers",
            item_title="Achromatic Off-White Chunky Sole Sneakers",
            category="shoes",
            target_color_family="off_white",
            target_color_hex="#f8f6f0",
            fabric_spec="Matte PU leather with breathable mesh inserts and vulcanized EVA midsole",
            silhouette_fit="Chunky silhouette with 4.5cm platform lift",
            target_budget_inr="₹699 – ₹899",
            urgency_roi="Essential Staple",
            rationale="Unlocks the 'Color Sandwich' rule: anchors dark/earth-toned pants with clean light base, framing your boxy top.",
            unlocks_outfits_count=10,
            pair_with_item_names=["Olive Pleated Trousers", "Pitch Black Baggy Denim", "Charcoal Boxy Hoodie"],
            suggested_retail_search="Red Tape / Zudio Retro Chunky Off-White Sneakers"
        ))

    # 4. Check for Hardware Metal Synchronization (Silver/Steel Watch)
    if category_counts["watch"] == 0:
        recommendations.append(WardrobeGapRecommendation(
            id="gap-silver-diver-watch",
            item_title="Stainless Steel Silver Diver / Minimalist Bracelet Watch",
            category="watch",
            target_color_family="slate_grey",
            target_color_hex="#c0c0c0",
            fabric_spec="316L Brushed Stainless Steel Casing with Sunburst Dial",
            silhouette_fit="40mm case diameter, brushed oyster steel link bracelet",
            target_budget_inr="₹499 – ₹799",
            urgency_roi="High ROI",
            rationale="Elevates rolled-sleeve micro-styling instantly. Synchronizes with silver zipper hardware on hoodies and cargo pants.",
            unlocks_outfits_count=12,
            pair_with_item_names=["Every outfit with rolled sleeves", "Quarter-Zip Tops", "Boxy Hoodies"],
            suggested_retail_search="Timex / Casio / Sonata Poze Silver Steel Bracelet Watch"
        ))

    # Calculate overall capsule versatility score
    score = 40.0
    if category_counts["top"] >= 2: score += 15.0
    if category_counts["bottom"] >= 2: score += 15.0
    if category_counts["shoes"] >= 1: score += 10.0
    if category_counts["watch"] >= 1: score += 10.0
    if len(color_families_present) >= 3: score += 10.0

    capsule_score = min(98.0, score)

    return WardrobeGapAnalysisResponse(
        total_items=len(items),
        category_counts=category_counts,
        thermal_distribution=thermal_distribution,
        hardware_breakdown=hardware_breakdown,
        overall_capsule_score=capsule_score,
        recommendations=recommendations
    )
