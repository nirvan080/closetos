from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class BodyMeasurements(BaseModel):
    waist_in: Optional[float] = 31.0
    outseam_in: Optional[float] = 40.0
    chest_in: Optional[float] = 38.0
    height_cm: Optional[float] = 178.0

class BodyTypeProfile(BaseModel):
    height_cm: float = 178.0
    weight_kg: float = 72.0
    body_type: str = "inverted_triangle"  # "inverted_triangle", "rectangle", "oval", "trapezoid", "triangle"
    facial_shape: str = "oval"  # "oval", "round", "square", "heart", "diamond"
    skin_undertone: str = "warm"  # "warm", "cool", "neutral"
    build_type: str = "athletic"  # "slim", "athletic", "muscular", "stocky", "relaxed"

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str = "curator@closetos.local"
    body_measurements: BodyMeasurements = Field(default_factory=BodyMeasurements)
    body_profile: BodyTypeProfile = Field(default_factory=BodyTypeProfile)
    preferred_fits: List[str] = ["baggy", "relaxed", "korean-pleated", "boxy"]
    created_at: Optional[str] = None

class ClothingItemBase(BaseModel):
    category: str  # "top", "bottom", "shoes", "outerwear", "accessory", "watch", "eyewear", "bag"
    sub_category: str  # e.g., "boxy_hoodie", "korean_pleated_trouser", "cargo_pants"
    color_primary_hex: str
    color_secondary_hex: Optional[str] = None
    color_family: str  # "olive_green", "charcoal_grey", "mocha_brown", "off_white", "pitch_black", "sage_green", "terracotta_rust", "royal_blue", etc.
    fabric_type: Optional[str] = "cotton_fleece"
    fabric_weight: Optional[str] = "heavyweight_350gsm"
    pattern: Optional[str] = "solid"
    hardware_color: Optional[str] = "none"  # "gold", "silver", "none"
    thermal_rating: int = 2  # 1 to 5
    fit_type: str = "boxy"  # "baggy", "loose", "regular", "boxy", "relaxed", "korean-pleated"
    metadata_json: Optional[Dict[str, Any]] = None

class ClothingItemCreate(ClothingItemBase):
    image_original_url: str
    image_cutout_url: str
    embedding: Optional[List[float]] = None

class ClothingItemResponse(ClothingItemBase):
    id: str
    user_id: str
    image_original_url: str
    image_cutout_url: str
    embedding: Optional[List[float]] = None
    created_at: str

class IngestionAnalysisResult(BaseModel):
    category: str
    sub_category: str
    color_primary_hex: str
    color_secondary_hex: Optional[str] = None
    color_family: str
    color_palette: List[str] = []
    fabric_type: str
    fabric_weight: str
    pattern: str
    hardware_color: str
    thermal_rating: int
    fit_type: str
    confidence: float = 0.95
    tags: List[str] = []
    white_balance_applied: bool = True
    bg_removed: bool = True
    original_url: str
    cutout_url: str

class WeatherCondition(BaseModel):
    temp_c: float = 20.0
    feels_like_c: float = 19.5
    condition: str = "Clear"  # e.g., "Sunny", "Chilly", "Rainy", "Overcast", "Cold"
    humidity: int = 55
    wind_speed_kmh: float = 12.0
    rain_probability: float = 0.1
    city: Optional[str] = "Bengaluru"

class GenerateOutfitRequest(BaseModel):
    occasion: str = "coding"  # "tuition", "coding", "market", "formal", "home", "date_night", "airport"
    aesthetic_vibe: Optional[str] = "korean_minimal"  # "korean_minimal", "gorpcore", "streetwear", "quiet_luxury", "vintage_americana"
    weather: Optional[WeatherCondition] = None
    body_profile: Optional[BodyTypeProfile] = None
    preferred_hardware: Optional[str] = None  # "silver", "gold", "any"
    focus_item_id: Optional[str] = None
    forced_fit: Optional[str] = None

class MicroStylingInstruction(BaseModel):
    action: str  # e.g., "Fold bottom hem inward 1 inch"
    reason: str  # e.g., "Creates a boxy, cropped drape without exposing skin"
    target_item: str  # "top", "bottom", "watch", "shoes", "accessory"

class OutfitResponse(BaseModel):
    id: str
    user_id: str
    occasion: str
    aesthetic_vibe: Optional[str] = "korean_minimal"
    weather_condition: WeatherCondition
    items: List[ClothingItemResponse]
    item_ids: List[str]
    silhouette_analysis: str
    morphological_analysis: Optional[str] = None
    hardware_harmony: str
    layering_breakdown: Optional[Dict[str, str]] = None
    styling_notes: str
    micro_styling: List[MicroStylingInstruction]
    harmony_score: float  # 0.0 to 1.0
    created_at: str

class OutfitCombination(BaseModel):
    title: str  # "Look 1: Editorial Korean Minimalist"
    aesthetic: str
    occasion: str
    items: List[ClothingItemResponse]
    styling_notes: str
    silhouette_analysis: str
    hardware_harmony: str
    micro_styling: List[MicroStylingInstruction]
    harmony_score: float

class PieceCombinationsResponse(BaseModel):
    focus_item: ClothingItemResponse
    total_combinations: int
    combinations: List[OutfitCombination]

class AIConsultationRequest(BaseModel):
    query: str
    occasion: Optional[str] = "coding"
    aesthetic_vibe: Optional[str] = "korean_minimal"
    body_profile: Optional[BodyTypeProfile] = None
    weather: Optional[WeatherCondition] = None

class AIConsultationResponse(BaseModel):
    answer: str
    suggested_outfit: Optional[OutfitResponse] = None
    style_rules_applied: List[str] = []
    color_palette_advice: str
    morphological_tip: str

class WardrobeGapRecommendation(BaseModel):
    id: str
    item_title: str
    category: str
    target_color_family: str
    target_color_hex: str
    fabric_spec: str
    silhouette_fit: str
    target_budget_inr: str  # e.g. "₹499 – ₹799"
    urgency_roi: str  # "High ROI", "Medium ROI", "Essential Staple"
    rationale: str
    unlocks_outfits_count: int
    pair_with_item_names: List[str]
    suggested_retail_search: str

class WardrobeGapAnalysisResponse(BaseModel):
    total_items: int
    category_counts: Dict[str, int]
    thermal_distribution: Dict[int, int]
    hardware_breakdown: Dict[str, int]
    overall_capsule_score: float  # 0 to 100
    recommendations: List[WardrobeGapRecommendation]

class FaceAnalysisResponse(BaseModel):
    face_shape: str
    confidence: float
    face_shape_analysis: str
    skin_undertone: str
    skin_hex_estimate: str
    skin_depth: str
    contrast_level: str
    eyewear_recommendations: List[Dict[str, str]]
    neckline_recommendations: List[Dict[str, str]]
    recommended_color_palette: List[Dict[str, str]]
    recommended_metals: List[str]
    micro_styling_advice: str
