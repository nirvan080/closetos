import io
import math
from typing import Tuple, List, Optional, Dict, Any
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import cv2

COLOR_FAMILIES = {
    "pitch_black": (20, 20, 20),
    "charcoal_grey": (60, 64, 67),
    "slate_grey": (115, 125, 132),
    "off_white": (240, 238, 233),
    "cream_beige": (225, 214, 192),
    "mocha_brown": (92, 64, 51),
    "olive_green": (85, 107, 47),
    "forest_green": (34, 76, 56),
    "sage_green": (158, 172, 149),
    "navy_blue": (28, 40, 65),
    "royal_blue": (37, 99, 235),
    "sky_blue": (147, 197, 253),
    "burgundy": (128, 0, 32),
    "rust_orange": (183, 65, 14),
    "khaki_tan": (195, 176, 145),
}

def auto_white_balance(img_pil: Image.Image) -> Image.Image:
    """
    Implements the Gray World Algorithm to neutralize indoor yellow/warm lighting casts.
    Under the Gray World assumption, the average reflected color in a scene is achromatic (gray).
    """
    img_rgb = img_pil.convert("RGB")
    np_img = np.array(img_rgb, dtype=np.float32)

    # Calculate average channel intensities
    avg_r = np.mean(np_img[:, :, 0])
    avg_g = np.mean(np_img[:, :, 1])
    avg_b = np.mean(np_img[:, :, 2])

    avg_gray = (avg_r + avg_g + avg_b) / 3.0

    if avg_r > 1.0 and avg_g > 1.0 and avg_b > 1.0:
        gain_r = avg_gray / avg_r
        gain_g = avg_gray / avg_g
        gain_b = avg_gray / avg_b

        # Apply gains with soft bounding to prevent blowout
        np_img[:, :, 0] = np.clip(np_img[:, :, 0] * gain_r, 0, 255)
        np_img[:, :, 1] = np.clip(np_img[:, :, 1] * gain_g, 0, 255)
        np_img[:, :, 2] = np.clip(np_img[:, :, 2] * gain_b, 0, 255)

    return Image.fromarray(np_img.astype(np.uint8))

def exif_normalize(img_pil: Image.Image) -> Image.Image:
    """
    Corrects mobile camera EXIF orientation rotations automatically.
    """
    try:
        return ImageOps.exif_transpose(img_pil)
    except Exception:
        return img_pil

def remove_background(img_pil: Image.Image) -> Image.Image:
    """
    Isolates garment foreground to produce clean alpha-channel cutout (RGBA PNG).
    Includes an intelligent edge-preserving GrabCut and morphological contour extraction.
    """
    # Try rembg if available
    try:
        import rembg
        return rembg.remove(img_pil)
    except Exception:
        pass

    # High-quality GrabCut / Foreground Saliency Fallback
    img_rgb = img_pil.convert("RGB")
    w, h = img_rgb.size
    
    # Downscale for fast segmentation if large
    scale = min(1.0, 800.0 / max(w, h))
    proc_w = int(w * scale)
    proc_h = int(h * scale)
    small = img_rgb.resize((proc_w, proc_h), Image.Resampling.BILINEAR)
    
    cv_img = cv2.cvtColor(np.array(small), cv2.COLOR_RGB2BGR)
    
    # Define bounding box with a 5% margin from edges
    margin_x = max(5, int(proc_w * 0.05))
    margin_y = max(5, int(proc_h * 0.05))
    rect = (margin_x, margin_y, proc_w - 2 * margin_x, proc_h - 2 * margin_y)
    
    mask = np.zeros(cv_img.shape[:2], np.uint8)
    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)
    
    try:
        cv2.grabCut(cv_img, mask, rect, bgdModel, fgdModel, 3, cv2.GC_INIT_WITH_RECT)
        bin_mask = np.where((mask == 2) | (mask == 0), 0, 255).astype('uint8')
        
        # Smooth mask with morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        bin_mask = cv2.morphologyEx(bin_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        bin_mask = cv2.GaussianBlur(bin_mask, (7, 7), 0)
    except Exception:
        # Fallback to lightness/saliency thresholding
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        _, bin_mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        bin_mask = cv2.morphologyEx(bin_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Resize mask back to original resolution
    full_mask = Image.fromarray(bin_mask).resize((w, h), Image.Resampling.BILINEAR)
    
    # Compose RGBA image
    rgba = img_rgb.convert("RGBA")
    rgba.putalpha(full_mask)
    return rgba

def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}"

def hex_to_rgb(hex_code: str) -> Tuple[int, int, int]:
    h = hex_code.lstrip("#")
    if len(h) == 3:
        h = "".join([c*2 for c in h])
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)

def find_nearest_color_family(rgb: Tuple[int, int, int]) -> str:
    best_family = "charcoal_grey"
    min_dist = float("inf")
    for fam, fam_rgb in COLOR_FAMILIES.items():
        # Weighted Euclidean distance (human perception: R: 0.3, G: 0.59, B: 0.11)
        dr = (rgb[0] - fam_rgb[0]) * 0.30
        dg = (rgb[1] - fam_rgb[1]) * 0.59
        db = (rgb[2] - fam_rgb[2]) * 0.11
        dist = dr*dr + dg*dg + db*db
        if dist < min_dist:
            min_dist = dist
            best_family = fam
    return best_family

def extract_dominant_colors(img_rgba: Image.Image, k: int = 5) -> Tuple[str, Optional[str], str, List[str]]:
    """
    Extracts foreground non-transparent pixels and runs vectorized K-Means clustering.
    Returns: (primary_hex, secondary_hex, color_family, full_palette_hex_list)
    """
    np_rgba = np.array(img_rgba)
    if np_rgba.shape[2] == 4:
        alpha = np_rgba[:, :, 3]
        fg_pixels = np_rgba[alpha > 50][:, :3]
    else:
        fg_pixels = np_rgba[:, :, :3].reshape(-1, 3)

    if len(fg_pixels) < 100:
        return ("#1c1c1e", "#3a3a3c", "charcoal_grey", ["#1c1c1e", "#3a3a3c"])

    # Sample up to 5000 pixels for fast K-Means
    if len(fg_pixels) > 5000:
        indices = np.random.choice(len(fg_pixels), 5000, replace=False)
        fg_pixels = fg_pixels[indices]

    fg_pixels = fg_pixels.astype(np.float32)

    # Initialize k centroids with random sample
    np.random.seed(42)
    init_indices = np.random.choice(len(fg_pixels), k, replace=False)
    centroids = fg_pixels[init_indices]

    # Run 8 iterations of K-Means
    for _ in range(8):
        # Distances: (N, K)
        dists = np.linalg.norm(fg_pixels[:, None, :] - centroids[None, :, :], axis=2)
        labels = np.argmin(dists, axis=1)

        new_centroids = []
        for i in range(k):
            members = fg_pixels[labels == i]
            if len(members) > 0:
                new_centroids.append(members.mean(axis=0))
            else:
                new_centroids.append(centroids[i])
        centroids = np.array(new_centroids)

    # Count points per centroid
    counts = np.bincount(labels, minlength=k)
    sorted_order = np.argsort(-counts)

    palette = []
    for idx in sorted_order:
        c = centroids[idx].astype(int)
        palette.append(rgb_to_hex(int(c[0]), int(c[1]), int(c[2])))

    primary_hex = palette[0]
    secondary_hex = palette[1] if len(palette) > 1 else None

    prim_rgb = hex_to_rgb(primary_hex)
    color_family = find_nearest_color_family(prim_rgb)

    return primary_hex, secondary_hex, color_family, palette

def detect_hardware_tone(img_rgba: Image.Image) -> str:
    """
    Detects metallic hardware presence (zippers, buckles, watch case):
    Categorizes into 'gold', 'silver', or 'none'.
    """
    np_rgba = np.array(img_rgba)
    if np_rgba.shape[2] != 4:
        return "none"

    alpha = np_rgba[:, :, 3]
    rgb = np_rgba[:, :, :3]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)

    # Mask foreground
    fg = alpha > 80
    if not np.any(fg):
        return "none"

    h = hsv[:, :, 0][fg]
    s = hsv[:, :, 1][fg]
    v = hsv[:, :, 2][fg]

    # Gold detection: Hue between 15 and 45, moderate saturation, high brightness
    gold_pixels = np.sum((h >= 15) & (h <= 45) & (s >= 80) & (s <= 220) & (v >= 150))

    # Silver/Chrome detection: Very low saturation (metallic greys), high brightness specular highlight
    silver_pixels = np.sum((s <= 35) & (v >= 190))

    total_fg = len(h)
    gold_ratio = gold_pixels / total_fg
    silver_ratio = silver_pixels / total_fg

    if gold_ratio > 0.015:
        return "gold"
    elif silver_ratio > 0.025:
        return "silver"
    return "none"

def generate_multimodal_embedding(metadata: Dict[str, Any], palette: List[str]) -> List[float]:
    """
    Generates a deterministic 768-dimensional normalized embedding vector encoding
    category, silhouette, fabric, thermal rating, hardware, and color profile.
    """
    vec = np.zeros(768, dtype=np.float32)

    # 1. Category one-hot (dim 0-19)
    categories = ["top", "bottom", "shoes", "outerwear", "accessory", "watch"]
    cat = metadata.get("category", "top")
    if cat in categories:
        vec[categories.index(cat)] = 1.0

    # 2. Fit type (dim 20-39)
    fits = ["baggy", "loose", "regular", "boxy", "relaxed", "korean-pleated"]
    fit = metadata.get("fit_type", "regular")
    if fit in fits:
        vec[20 + fits.index(fit)] = 1.0

    # 3. Thermal rating normalized (dim 40)
    thermal = float(metadata.get("thermal_rating", 2))
    vec[40] = thermal / 5.0

    # 4. Hardware color (dim 41-43)
    hw = metadata.get("hardware_color", "none")
    if hw == "gold":
        vec[41] = 1.0
    elif hw == "silver":
        vec[42] = 1.0
    else:
        vec[43] = 1.0

    # 5. Color representation in dim 50-150
    for idx, hex_code in enumerate(palette[:5]):
        try:
            r, g, b = hex_to_rgb(hex_code)
            offset = 50 + idx * 10
            vec[offset] = r / 255.0
            vec[offset + 1] = g / 255.0
            vec[offset + 2] = b / 255.0
        except Exception:
            pass

    # 6. Textual semantics hash projected to 200-767
    text_sig = f"{cat} {fit} {metadata.get('sub_category', '')} {metadata.get('fabric_type', '')} {metadata.get('fabric_weight', '')} {metadata.get('color_family', '')}"
    for i, ch in enumerate(text_sig):
        slot = 200 + ((ord(ch) * 37 + i * 17) % 560)
        vec[slot] += (ord(ch) % 10) / 10.0

    # Normalize to unit length
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm

    return vec.tolist()
