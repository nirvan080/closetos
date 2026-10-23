export interface ClothingItem {
  id: string;
  user_id: string;
  image_original_url: string;
  image_cutout_url: string;
  category: "top" | "bottom" | "shoes" | "outerwear" | "accessory" | "watch" | "eyewear" | "bag" | string;
  sub_category: string;
  color_primary_hex: string;
  color_secondary_hex?: string;
  color_family: string;
  fabric_type?: string;
  fabric_weight?: string;
  pattern?: string;
  hardware_color?: string;
  thermal_rating: number;
  fit_type: string;
  embedding?: number[];
  metadata_json?: Record<string, any>;
  created_at: string;
}

export interface WeatherCondition {
  temp_c: number;
  feels_like_c: number;
  condition: string;
  humidity: number;
  wind_speed_kmh: number;
  rain_probability: number;
  city?: string;
}

export interface EyewearRecommendation {
  frame_shape: string;
  reason: string;
}

export interface NecklineRecommendation {
  cut: string;
  reason: string;
}

export interface RecommendedColor {
  name: string;
  hex: string;
}

export interface FaceAnalysisResult {
  face_shape: string;
  confidence: number;
  face_shape_analysis: string;
  skin_undertone: string;
  skin_hex_estimate: string;
  skin_depth: string;
  contrast_level: string;
  eyewear_recommendations: EyewearRecommendation[];
  neckline_recommendations: NecklineRecommendation[];
  recommended_color_palette: RecommendedColor[];
  recommended_metals: string[];
  micro_styling_advice: string;
}

export interface BodyTypeProfile {
  height_cm: number;
  weight_kg: number;
  body_type: string; // "inverted_triangle", "rectangle", "oval", "trapezoid", "triangle"
  facial_shape: string; // "oval", "round", "square", "heart", "diamond", "oblong"
  skin_undertone: string; // "warm", "cool", "neutral", "olive"
  skin_hex?: string;
  build_type: string; // "slim", "athletic", "muscular", "stocky", "relaxed"
  contrast_level?: string; // "high", "medium", "soft-low"
  preferred_silhouette?: string; // "boxy_cropped", "relaxed_korean", "baggy_streetwear", "tailored_slim"
  preferred_eyewear?: string;
  preferred_neckline?: string;
  chest_in?: number;
  waist_in?: number;
  // Tailored Suiting Specifics
  suit_lapel_style?: "notch" | "peak" | "shawl" | string;
  suit_button_stance?: "2_button" | "double_breasted" | "1_button" | string;
  suit_trouser_break?: "no_break" | "slight_break" | "full_break" | string;
  suit_trouser_pleat?: "single_reverse_pleat" | "flat_front" | "double_pleat" | string;
  suit_shoulder?: "natural_spalla" | "roped_structured" | "light_padding" | string;
  suit_fabric_pref?: "worsted_wool_super120" | "flannel_heavyweight" | "linen_silk" | string;
  suit_jacket_drop?: string; // "Drop 6", "Drop 7", "Drop 8"
}

export interface BackgroundTask {
  id: string;
  name: string;
  progress: number;
  status: "running" | "completed" | "error";
  error?: string;
}

export interface MicroStylingInstruction {
  action: string;
  reason: string;
  target_item: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  occasion: string;
  aesthetic_vibe?: string;
  weather_condition: WeatherCondition;
  items: ClothingItem[];
  item_ids: string[];
  silhouette_analysis: string;
  morphological_analysis?: string;
  hardware_harmony: string;
  layering_breakdown?: Record<string, string>;
  styling_notes: string;
  micro_styling: MicroStylingInstruction[];
  harmony_score: number;
  created_at: string;
}

export interface OutfitCombination {
  title: string;
  aesthetic: string;
  occasion: string;
  items: ClothingItem[];
  styling_notes: string;
  silhouette_analysis: string;
  hardware_harmony: string;
  micro_styling: MicroStylingInstruction[];
  harmony_score: number;
}

export interface PieceCombinationsResponse {
  focus_item: ClothingItem;
  total_combinations: number;
  combinations: OutfitCombination[];
}

export interface AIConsultationResponse {
  answer: string;
  suggested_outfit?: Outfit;
  style_rules_applied: string[];
  color_palette_advice: string;
  morphological_tip: string;
}

export interface IngestionResult {
  category: string;
  sub_category: string;
  color_primary_hex: string;
  color_secondary_hex?: string;
  color_family: string;
  color_palette: string[];
  fabric_type: string;
  fabric_weight: string;
  pattern: string;
  hardware_color: string;
  thermal_rating: number;
  fit_type: string;
  confidence: number;
  tags: string[];
  white_balance_applied: boolean;
  bg_removed: boolean;
  original_url: string;
  cutout_url: string;
}

export interface GapRecommendation {
  id: string;
  item_title: string;
  category: string;
  target_color_family: string;
  target_color_hex: string;
  fabric_spec: string;
  silhouette_fit: string;
  target_budget_inr: string;
  urgency_roi: string;
  rationale: string;
  unlocks_outfits_count: number;
  pair_with_item_names: string[];
  suggested_retail_search: string;
}

export interface GapAnalysisResponse {
  total_items: number;
  category_counts: Record<string, number>;
  thermal_distribution: Record<number, number>;
  hardware_breakdown: Record<string, number>;
  overall_capsule_score: number;
  recommendations: GapRecommendation[];
}
