from fastapi import APIRouter
from app.core.db import get_all_clothing_items
from app.models.schemas import WardrobeGapAnalysisResponse
from app.services.gap_analyzer import perform_wardrobe_gap_analysis

router = APIRouter()

@router.get("/gap", response_model=WardrobeGapAnalysisResponse)
async def get_wardrobe_gap_analysis():
    """
    Performs automated Wardrobe Gap Analysis:
    - Calculates capsule versatility score.
    - Identifies missing high-ROI staples.
    - Provides local retail price guardrails (₹400–₹800 budget).
    - Unlocks outfit pairing multipliers.
    """
    items = get_all_clothing_items()
    return perform_wardrobe_gap_analysis(items)
