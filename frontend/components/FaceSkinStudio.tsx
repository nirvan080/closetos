"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  Smile,
  Palette,
  Check,
  Glasses,
  Shirt,
  ShieldCheck,
  Layers,
  Sliders,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { BodyTypeProfile, FaceAnalysisResult } from "@/types";
import { apiFetch } from "@/lib/api";

interface FaceSkinStudioProps {
  bodyProfile: BodyTypeProfile;
  onUpdateBodyProfile: (profile: BodyTypeProfile) => void;
}

export const FaceSkinStudio: React.FC<FaceSkinStudioProps> = ({
  bodyProfile,
  onUpdateBodyProfile,
}) => {
  const [profile, setProfile] = useState<BodyTypeProfile>(bodyProfile);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FaceAnalysisResult | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-configured skin tone swatches for 1-click manual customization
  const skinPresets = [
    { label: "Fair Porcelain", hex: "#FCE2C4", undertone: "cool" },
    { label: "Light Golden", hex: "#F0D1AD", undertone: "warm" },
    { label: "Warm Sand", hex: "#E5B887", undertone: "warm" },
    { label: "Honey Tan", hex: "#D59B63", undertone: "warm" },
    { label: "Olive Bronze", hex: "#BD8550", undertone: "olive" },
    { label: "Rich Chestnut", hex: "#8D5524", undertone: "neutral" },
    { label: "Deep Espresso", hex: "#4F3323", undertone: "warm" },
  ];

  const faceShapes = [
    {
      id: "oval",
      label: "Oval",
      ratio: "1:1.5",
      icon: "🥚",
      desc: "Balanced symmetry. Suits geometric wayfarers, aviators, and all necklines.",
    },
    {
      id: "round",
      label: "Round",
      ratio: "1:1",
      icon: "⭕",
      desc: "Soft curves. Elongate with open Cuban collars and sharp rectangular frames.",
    },
    {
      id: "square",
      label: "Square",
      ratio: "1:1",
      icon: "⏹️",
      desc: "Strong angular jaw. Soften baseline with 1.25\" ribbed crewnecks & curved frames.",
    },
    {
      id: "heart",
      label: "Heart",
      ratio: "1:1.3",
      icon: "🔻",
      desc: "Broader forehead, tapered chin. Complements open camp collars & clubmaster eyewear.",
    },
    {
      id: "diamond",
      label: "Diamond",
      ratio: "1:1.4",
      icon: "💎",
      desc: "High dramatic cheekbones. Complements browline frames and relaxed collar drapes.",
    },
    {
      id: "oblong",
      label: "Oblong / Long",
      ratio: "1:1.7",
      icon: "▯",
      desc: "Vertical length. Adds width with wide horizontal collars and oversized frames.",
    },
  ];

  const undertones = [
    {
      id: "warm",
      label: "Warm Undertone",
      desc: "Golden/peachy flush. Best with earth tones, terracotta, mocha, and gold metals.",
      metal: "Yellow Gold & Vintage Brass",
      badgeColor: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    },
    {
      id: "cool",
      label: "Cool Undertone",
      desc: "Rosy/blueish tint. Best with slate navy, charcoal, crisp white, and silver metals.",
      metal: "Silver & Polished Steel",
      badgeColor: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    },
    {
      id: "neutral",
      label: "Neutral Undertone",
      desc: "Balanced balance between warm and cool. Extremely versatile with mixed metals.",
      metal: "Mixed Metals & Brushed Titanium",
      badgeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    },
    {
      id: "olive",
      label: "Olive Undertone",
      desc: "Subtle greenish/golden depth. Complements sage, burnt orange, and bronze metals.",
      metal: "Matte Bronze & Antique Gold",
      badgeColor: "border-lime-500/40 bg-lime-500/10 text-lime-300",
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/api/v1/styling/analyze-face", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Scanning service returned HTTP ${res.status}`);
      }

      const data: FaceAnalysisResult = await res.json();
      setScanResult(data);

      // Auto-populate profile with recognized attributes while preserving user customization
      setProfile((prev) => ({
        ...prev,
        facial_shape: data.face_shape,
        skin_undertone: data.skin_undertone,
        skin_hex: data.skin_hex_estimate,
        contrast_level: data.contrast_level,
        preferred_eyewear: data.eyewear_recommendations?.[0]?.frame_shape,
        preferred_neckline: data.neckline_recommendations?.[0]?.cut,
      }));
    } catch (err: any) {
      console.error("Face scan error:", err);
      setErrorMsg("Failed to analyze image. Falling back to manual styling controls.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyChanges = () => {
    onUpdateBodyProfile(profile);
    setApplySuccess(true);
    setTimeout(() => setApplySuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold text-xs shadow-md">
              FS
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Face Space & Skin Tone DNA Studio
            </h2>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
              AI SCANNER + FULL FREEDOM
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Snap or upload a selfie for AI facial proportion & undertone extraction, or manually customize your bone structure and color harmony rules with full freedom.
          </p>
        </div>

        <button
          onClick={handleApplyChanges}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-md active:scale-95 shrink-0"
        >
          {applySuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Applied to ClosetOS!</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-black" />
              <span>Apply to Style DNA</span>
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: AI Camera / Selfie Scanner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Selfie Upload / Scanner Box */}
          <div className="w-full md:w-64 h-64 shrink-0 rounded-2xl bg-black/60 border-2 border-dashed border-white/20 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-400/60 transition-all">
            {uploadedPreview ? (
              <>
                <img
                  src={uploadedPreview}
                  alt="Selfie Preview"
                  className="w-full h-full object-cover rounded-2xl"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-3 backdrop-blur-sm">
                    <div className="h-10 w-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-amber-300 tracking-wider animate-pulse">
                      ANALYZING BONE & MELANIN...
                    </span>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20 hover:bg-black transition-all"
                >
                  Change Photo
                </button>
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 text-center cursor-pointer space-y-3"
              >
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Upload or Snap Selfie</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Tap to use camera or select portrait
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] text-neutral-300 font-medium">
                  Instant AI Extraction
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* AI Scan Overview or Instructions */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Step 1: Facial Proportion Recognition
                </span>
                {scanResult && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {(scanResult.confidence * 100).toFixed(0)}% Confidence
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {scanResult
                  ? `Detected: ${scanResult.face_shape.toUpperCase()} Face • ${scanResult.skin_undertone.toUpperCase()} Undertone`
                  : "Automatic Bone Structure & Skin Undertone Detection"}
              </h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {scanResult
                  ? scanResult.face_shape_analysis
                  : "Upload a front-facing selfie portrait. The vision model analyzes facial symmetry, jawline curvature, cheekbone width, and extracts your precise skin chrominance (ITA) angle to recommend flattering eyewear and necklines."}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Diagnostic Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Face Shape
                </span>
                <span className="font-bold text-white capitalize">
                  {profile.facial_shape}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Skin Undertone
                </span>
                <span className="font-bold text-amber-300 capitalize">
                  {profile.skin_undertone}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Skin Hex Code
                </span>
                <div className="flex items-center space-x-1.5 font-mono text-white font-semibold">
                  <div
                    className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: profile.skin_hex || "#CE9E79" }}
                  />
                  <span>{profile.skin_hex || "#CE9E79"}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Contrast Level
                </span>
                <span className="font-bold text-neutral-200 capitalize">
                  {profile.contrast_level || "Medium"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel (Shows when scanned) */}
        {scanResult && (
          <div className="pt-6 border-t border-white/10 space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Bespoke Facial Harmony Recommendations</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Eyewear */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center space-x-2 text-neutral-300 font-bold">
                  <Glasses className="h-4 w-4 text-sky-400" />
                  <span>Flattering Eyewear Frames</span>
                </div>
                <div className="space-y-1.5">
                  {scanResult.eyewear_recommendations.map((ew, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="font-bold text-white block">{ew.frame_shape}</span>
                      <span className="text-[11px] text-neutral-400">{ew.reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Necklines */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center space-x-2 text-neutral-300 font-bold">
                  <Shirt className="h-4 w-4 text-emerald-400" />
                  <span>Flattering Neckline & Collar Cuts</span>
                </div>
                <div className="space-y-1.5">
                  {scanResult.neckline_recommendations.map((nl, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="font-bold text-white block">{nl.cut}</span>
                      <span className="text-[11px] text-neutral-400">{nl.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Palette Swatches */}
            {scanResult.recommended_color_palette && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-neutral-300 block">
                  Harmonious Skin-Enhancing Palette:
                </span>
                <div className="flex flex-wrap gap-2">
                  {scanResult.recommended_color_palette.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div
                        className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-xs text-white font-medium">{col.name}</span>
                      <span className="text-[10px] font-mono text-neutral-400">{col.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Complete User Freedom & Manual Overrides */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Full Styling Freedom & Manual Customization
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Don't feel constrained by AI scans! You have complete freedom to choose and test any bone geometry, skin tone swatch, or contrast aesthetic.
          </p>
        </div>

        {/* 1. Face Shape Freedom */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center space-x-1.5">
              <Smile className="h-4 w-4 text-amber-400" />
              <span>Select or Override Facial Shape</span>
            </label>
            <span className="text-[11px] text-neutral-400">
              Active: <span className="font-bold text-white capitalize">{profile.facial_shape}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {faceShapes.map((shape) => {
              const active = profile.facial_shape === shape.id;
              return (
                <button
                  key={shape.id}
                  onClick={() => setProfile({ ...profile, facial_shape: shape.id })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    active
                      ? "bg-white text-black font-bold shadow-lg ring-2 ring-white/30 scale-[1.02]"
                      : "bg-white/[0.03] border-white/10 text-neutral-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{shape.icon}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        active ? "bg-black/20 text-black" : "bg-white/10 text-neutral-400"
                      }`}
                    >
                      {shape.ratio}
                    </span>
                  </div>
                  <p className={`text-xs font-bold ${active ? "text-black" : "text-white"}`}>
                    {shape.label}
                  </p>
                  <p
                    className={`text-[10px] mt-1 leading-tight line-clamp-3 ${
                      active ? "text-neutral-800" : "text-neutral-400"
                    }`}
                  >
                    {shape.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Skin Tone & Color Palette Freedom */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center space-x-1.5">
              <Palette className="h-4 w-4 text-emerald-400" />
              <span>Skin Tone Swatch & Color Chrominance</span>
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-neutral-400">Custom HEX:</span>
              <input
                type="color"
                value={profile.skin_hex || "#CE9E79"}
                onChange={(e) => setProfile({ ...profile, skin_hex: e.target.value })}
                className="h-6 w-6 rounded border-0 cursor-pointer bg-transparent"
                title="Pick exact skin color"
              />
              <span className="font-mono text-xs text-white font-bold">
                {profile.skin_hex || "#CE9E79"}
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[11px] text-neutral-400 block font-medium">
              Click any melanin preset to auto-set tone and undertone:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {skinPresets.map((sp, idx) => {
                const isSelected = profile.skin_hex === sp.hex;
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      setProfile({
                        ...profile,
                        skin_hex: sp.hex,
                        skin_undertone: sp.undertone,
                      })
                    }
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center space-y-1.5 transition-all ${
                      isSelected
                        ? "bg-white/15 border-white shadow-md ring-1 ring-white"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className="h-7 w-7 rounded-full border border-white/20 shadow"
                      style={{ backgroundColor: sp.hex }}
                    />
                    <span className="text-[11px] font-bold text-white truncate w-full">
                      {sp.label}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-neutral-400">
                      {sp.undertone}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Undertone Selection */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] text-neutral-400 block font-medium">
              Or manually select your undertone category:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {undertones.map((ut) => {
                const active = profile.skin_undertone === ut.id;
                return (
                  <div
                    key={ut.id}
                    onClick={() => setProfile({ ...profile, skin_undertone: ut.id })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                      active
                        ? "bg-white/10 border-white/40 shadow-md ring-1 ring-white/20"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{ut.label}</span>
                      {active && <Check className="h-4 w-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-normal">{ut.desc}</p>
                    <div className="pt-1">
                      <span className="text-[10px] font-mono text-neutral-300 block">
                        Best Metal: <span className="text-white font-semibold">{ut.metal}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Aesthetic Freedom: Silhouette & Contrast */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
            Aesthetic Freedom & Silhouette Preference
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Preferred Silhouette */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 font-medium">Preferred Cut & Silhouette</label>
              <select
                value={profile.preferred_silhouette || "boxy_cropped"}
                onChange={(e) => setProfile({ ...profile, preferred_silhouette: e.target.value })}
                className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white font-medium capitalize"
              >
                <option value="boxy_cropped">1" Cropped Boxy Top (1:2 Ratio)</option>
                <option value="relaxed_korean">Relaxed Korean Pleated & Draped</option>
                <option value="baggy_streetwear">Baggy Pooling Hems (Streetwear)</option>
                <option value="tailored_slim">Tailored Clean Line (Minimalist)</option>
              </select>
            </div>

            {/* Contrast Level */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 font-medium">Contrast Preference</label>
              <select
                value={profile.contrast_level || "medium"}
                onChange={(e) => setProfile({ ...profile, contrast_level: e.target.value })}
                className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white font-medium capitalize"
              >
                <option value="high">High Contrast (Bold Light/Dark)</option>
                <option value="medium">Medium Balanced</option>
                <option value="soft-low">Soft / Low Contrast (Tonal)</option>
              </select>
            </div>

            {/* Preferred Neckline */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 font-medium">Preferred Neckline</label>
              <select
                value={profile.preferred_neckline || "Open Cuban Collar"}
                onChange={(e) => setProfile({ ...profile, preferred_neckline: e.target.value })}
                className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white font-medium"
              >
                <option value="Open Cuban Collar">Open Cuban / Camp Collar</option>
                <option value="1.25 Ribbed Crewneck">1.25" Ribbed Boxy Crewneck</option>
                <option value="Structured V-Neck">Structured V-Neck</option>
                <option value="Rollneck / Turtleneck">Rollneck / Turtleneck</option>
              </select>
            </div>

            {/* Preferred Eyewear */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 font-medium">Preferred Eyewear</label>
              <select
                value={profile.preferred_eyewear || "Geometric Wayfarer"}
                onChange={(e) => setProfile({ ...profile, preferred_eyewear: e.target.value })}
                className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white font-medium"
              >
                <option value="Geometric Wayfarer">Geometric Wayfarer (Angular)</option>
                <option value="Wireframe Aviator">Wireframe Aviator (Classic)</option>
                <option value="Clubmaster / Browline">Clubmaster / Browline</option>
                <option value="Curved Wireframe">Round / Curved Wireframe</option>
                <option value="Bold Hexagonal">Bold Hexagonal (Modern)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Apply and Save Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleApplyChanges}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition-all shadow-xl active:scale-95"
          >
            {applySuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Saved & Synchronized With ClosetOS!</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-black" />
                <span>Save & Apply Style DNA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
