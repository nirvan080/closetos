# CLOSETOS — AI WARDROBE DIGITIZATION & STYLING AGENT

> **Intelligent, cross-platform personal styling platform and archival wardrobe digitization engine.** Built with **FastAPI (Python 3.11)** and **Next.js / React (Tailwind CSS, Lucide Icons, Glassmorphism)** with **768-dimensional vector embeddings**, **Gray World Auto-White-Balance**, **Morphological Proportion Theory**, and **AI Stylist Consultation**.

---

## 🌟 ARCHITECTURAL HIGHLIGHTS

1. **💬 Interactive AI Stylist Co-Pilot (`POST /api/v1/styling/consult`)**:
   - Real-time conversational fashion consultation conditioned on your digital wardrobe inventory, body build, facial shape, and current weather.
   - Powered by **Google Gemini 1.5/2.0 Flash** with a comprehensive haute-couture rule engine fallback.
   - Provides specific micro-styling tips, color palette advice, and 1-click loading of recommended ensembles into the Styling Canvas.

2. **🔀 Piece Combinations Studio ("Style It 3 Ways") (`GET /api/v1/styling/combinations/{id}`)**:
   - Multiplies closet versatility by taking ANY piece and generating 3 distinct outfits:
     * **Look 1: Korean Minimalist Smart**
     * **Look 2: Relaxed Boxy Streetwear**
     * **Look 3: Quiet Luxury Evening**
   - Displays all 3 looks side-by-side with isolated cutouts, harmony scores, and micro-styling notes.

3. **💍 Dedicated Accessories & Hardware Vault**:
   - Dedicated category for Timepieces, Eyewear, Carry Bags, and Jewelry.
   - Pre-seeded with **Silver Diver Watch**, **Vintage Gold Tank Watch**, **Retro Tortoise Sunglasses**, **Matte Black Crossbody Bag**, and **Silver Cuban Link Chain**.
   - Enforces strict hardware metal synchronization (matching watch metal with zipper pulls, buckles, and jewelry).

4. **🧬 Morphological Body & Facial Shape Recommendation Engine**:
   - **Body Silhouette Types**:
     * *Inverted Triangle*: Balances broad shoulders with wide-leg Korean pleats or baggy cargo denim.
     * *Rectangle / Athletic*: Utilizes 1-inch cropped boxy tops to create a visual waistline (Golden 1:2 ratio).
     * *Oval / Fuller Torso*: Employs unzipped chore jackets and dropped shoulders for vertical slimming sightlines.
     * *Trapezoid / Runway*: Naturally balanced proportion handling.
     * *Triangle / Pear*: Structures upper torso volume to balance hips.
   - **Facial Shape & Eyewear / Neckline Harmony**:
     * *Oval*: Compatible with all necklines and classic acetate frames.
     * *Round*: Elongated with open camp collars and geometric/square eyewear.
     * *Square*: Softened with crewneck fleece and rounded wireframes.
     * *Heart*: Balanced with wide collars and clubmasters.
     * *Diamond*: Browline frames and relaxed collars.
   - **Height, Weight & BMI Conditioning**:
     * Stature-specific hem adjustments (e.g., <172cm inward hem folds to elongate leg length).
   - **Skin Undertones**:
     * *Warm*: Olive, Mocha, Terracotta Rust, Khaki, and Gold hardware.
     * *Cool*: Charcoal, Navy, Royal Blue, Pitch Black, and Silver hardware.
     * *Neutral*: Sage Green, Cream Beige, and Mixed metals.

5. **🎨 Expanded Color Palette & Aesthetic Styles**:
   - Seeded with 14 designer pieces in rich colors: **Sage Green**, **Terracotta Rust**, **Royal Cobalt Blue**, **Cream Cable Knit**, **Charcoal Grey**, **Olive Green**, and **Pitch Black**.
   - Aesthetic vibe selectors:
     * 🇰🇷 **Korean Minimalist**
     * ⛰️ **Gorpcore Utility**
     * 🛹 **Modern Streetwear**
     * 🍸 **Quiet Luxury / Old Money**
     * 🇺🇸 **Vintage Americana Workwear**

6. **Automated Computer Vision & Ingestion Pipeline (`POST /api/v1/wardrobe/ingest`)**:
   - **Gray World Auto-White-Balance**: Neutralizes indoor yellow lighting casts.
   - **EXIF Normalization**: Corrects camera orientation rotations automatically.
   - **Alpha-Channel Foreground Cutout**: Generates clean transparent PNGs.
   - **K-Means Color Clustering**: Extracts `#HEX` swatches and color families.
   - **768-Dim Vector Embeddings**: Enables visual and textual similarity search.

---

## 🚀 ACCESSING THE APPLICATION

### 💻 On Your PC / Mac:
👉 **[http://localhost:3000](http://localhost:3000)** (or `http://127.0.0.1:3000`)

### 📱 On Your Mobile Phone (iPhone / Android):
👉 **`http://192.168.29.207:3000`** *(Connect to the same Wi-Fi)*

> **Mobile App Tip**: On Safari or Chrome on your phone, tap **Share** (or the three dots menu) -> **"Add to Home Screen"** to install ClosetOS as a full-screen native PWA with camera support!
