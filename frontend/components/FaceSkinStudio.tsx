"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Sparkles,
  Smile,
  Palette,
  Check,
  Glasses,
  Shirt,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { BodyTypeProfile, FaceAnalysisResult } from "@/types";
import { apiFetch } from "@/lib/api";

interface FaceSkinStudioProps {
  bodyProfile: BodyTypeProfile;
  onUpdateBodyProfile: (profile: BodyTypeProfile) => void;
  onNavigateToDatabaseWithFilter?: (undertone: string) => void;
}

export const FaceSkinStudio: React.FC<FaceSkinStudioProps> = ({
  bodyProfile,
  onUpdateBodyProfile,
  onNavigateToDatabaseWithFilter,
}) => {
  const [profile, setProfile] = useState<BodyTypeProfile>(bodyProfile);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FaceAnalysisResult | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Curated skin tone swatches for 1-tap selection
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
      eyewear: "Wayfarer, Aviator",
      collar: "Universal drapes",
      desc: "Balanced symmetry. Most versatile structure.",
    },
    {
      id: "round",
      label: "Round",
      ratio: "1:1",
      eyewear: "Rectangular, Geometric",
      collar: "Open Cuban collar",
      desc: "Soft curves. Elongate with sharp structural lines.",
    },
    {
      id: "square",
      label: "Square",
      ratio: "1:1",
      eyewear: "Round wireframe, Oval",
      collar: "Ribbed crewneck",
      desc: "Strong angular jaw. Soften baseline with curved silhouettes.",
    },
    {
      id: "heart",
      label: "Heart",
      ratio: "1:1.3",
      eyewear: "Clubmaster, Browline",
      collar: "Camp collar",
      desc: "Wide forehead, pointed chin. Balances lower face width.",
    },
    {
      id: "diamond",
      label: "Diamond",
      ratio: "1:1.4",
      eyewear: "Browline, Cat-eye",
      collar: "Relaxed polo",
      desc: "Dramatic high cheekbones. Complements soft drapes.",
    },
    {
      id: "oblong",
      label: "Oblong",
      ratio: "1:1.7",
      eyewear: "Oversized, Square",
      collar: "Wide spread collar",
      desc: "Extended vertical plane. Breaks length with horizontal breadth.",
    },
  ];

  const undertones = [
    {
      id: "warm",
      label: "Warm",
      tint: "Golden / Peachy",
      metals: "Yellow Gold, Brass",
      palette: ["#B45309", "#D97706", "#78350F", "#F59E0B"],
      badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
    {
      id: "cool",
      label: "Cool",
      tint: "Rosy / Slate Blue",
      metals: "Polished Silver, Steel",
      palette: ["#1E3A8A", "#2563EB", "#475569", "#E2E8F0"],
      badge: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    },
    {
      id: "neutral",
      label: "Neutral",
      tint: "Balanced Blend",
      metals: "Brushed Titanium, Mixed",
      palette: ["#0F172A", "#334155", "#64748B", "#F8FAFC"],
      badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    },
    {
      id: "olive",
      label: "Olive",
      tint: "Greenish Golden",
      metals: "Antique Bronze, Gold",
      palette: ["#3F6212", "#65A30D", "#713F12", "#A16207"],
      badge: "border-lime-500/30 bg-lime-500/10 text-lime-300",
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
      setErrorMsg("Image scan failed. You can adjust your face shape and tone manually below.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleSave = () => {
    onUpdateBodyProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="h-8 w-8 rounded-xl bg-amber-400 flex items-center justify-center text-black font-black text-xs shadow-md">
              DNA
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Face Structure & Tone DNA
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-neutral-300">
              ESSENTIAL METRICS
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Analyze facial bone ratio and melanin undertone to instantly align flattering eyewear, collars, and color harmony.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onNavigateToDatabaseWithFilter && (
            <button
              onClick={() => onNavigateToDatabaseWithFilter(profile.skin_undertone)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
            >
              <span>Filter Closet for {profile.skin_undertone}</span>
              <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
            </button>
          )}

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-md active:scale-95"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Saved & Synchronized!</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-black" />
                <span>Save DNA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: AI Instant Scan + Overview Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Selfie Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full md:w-56 h-56 shrink-0 rounded-2xl bg-black/60 border-2 border-dashed border-white/20 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-400/60 cursor-pointer transition-all"
          >
            {uploadedPreview ? (
              <>
                <img
                  src={uploadedPreview}
                  alt="Selfie Preview"
                  className="w-full h-full object-cover rounded-2xl"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-2 backdrop-blur-sm">
                    <RefreshCw className="h-6 w-6 text-amber-400 animate-spin" />
                    <span className="text-[11px] font-bold text-amber-300 tracking-wider">
                      EXTRACTING DNA...
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-semibold border border-white/20">
                  Retake
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4 space-y-2.5">
                <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Snap or Upload Selfie</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    1-tap AI facial proportion analysis
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[9px] text-neutral-300 font-semibold">
                  Auto-Detect
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

          {/* Diagnostic Metrics Display */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Current Profile Configuration
                </span>
                {scanResult && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {(scanResult.confidence * 100).toFixed(0)}% AI Confidence
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white capitalize mt-0.5">
                {profile.facial_shape} Structure • {profile.skin_undertone} Undertone
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {scanResult
                  ? scanResult.face_shape_analysis
                  : "Tap on any face structure or skin undertone card below to tune your wardrobe recommendations."}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Face Shape
                </span>
                <span className="font-bold text-white capitalize block">
                  {profile.facial_shape}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Undertone
                </span>
                <span className="font-bold text-amber-300 capitalize block">
                  {profile.skin_undertone}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Skin HEX
                </span>
                <div
                  onClick={(e) => handleCopyHex(profile.skin_hex || "#CE9E79", e)}
                  className="flex items-center space-x-1.5 cursor-pointer font-mono text-white font-semibold"
                >
                  <div
                    className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: profile.skin_hex || "#CE9E79" }}
                  />
                  <span>
                    {copiedHex === (profile.skin_hex || "#CE9E79")
                      ? "COPIED"
                      : profile.skin_hex || "#CE9E79"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Eyewear Frame
                </span>
                <span className="font-bold text-neutral-200 capitalize truncate block">
                  {profile.preferred_eyewear || "Wayfarer"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Face Structure Selector (6 Minimal Cards) */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smile className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Select Face Structure
            </h3>
          </div>
          <span className="text-xs text-neutral-400">
            Selected: <span className="font-bold text-white capitalize">{profile.facial_shape}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {faceShapes.map((shape) => {
            const active = profile.facial_shape === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() =>
                  setProfile({
                    ...profile,
                    facial_shape: shape.id,
                    preferred_eyewear: shape.eyewear.split(",")[0].trim(),
                  })
                }
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  active
                    ? "bg-white text-black font-bold shadow-lg ring-2 ring-white/30 scale-[1.02]"
                    : "bg-white/[0.02] border-white/5 text-neutral-300 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    active ? "bg-black/15 text-black" : "bg-white/10 text-neutral-400"
                  }`}>
                    {shape.ratio}
                  </span>
                  {active && <Check className="h-3.5 w-3.5 text-black" />}
                </div>

                <p className={`text-sm font-bold capitalize ${active ? "text-black" : "text-white"}`}>
                  {shape.label}
                </p>

                <div className="mt-2 space-y-1 text-[10px]">
                  <p className={`truncate ${active ? "text-neutral-800" : "text-neutral-400"}`}>
                    <span className="font-semibold">Frames:</span> {shape.eyewear}
                  </p>
                  <p className={`truncate ${active ? "text-neutral-800" : "text-neutral-400"}`}>
                    <span className="font-semibold">Collar:</span> {shape.collar}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Melanin Tone & Undertone (Simplified Matrix) */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Melanin Tone & Undertone
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-neutral-400">Custom Picker:</span>
            <input
              type="color"
              value={profile.skin_hex || "#CE9E79"}
              onChange={(e) => setProfile({ ...profile, skin_hex: e.target.value })}
              className="h-6 w-6 rounded border-0 cursor-pointer bg-transparent"
              title="Pick exact skin color"
            />
          </div>
        </div>

        {/* 4 Undertone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {undertones.map((ut) => {
            const active = profile.skin_undertone === ut.id;
            return (
              <div
                key={ut.id}
                onClick={() => setProfile({ ...profile, skin_undertone: ut.id })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  active
                    ? "bg-white/10 border-white/40 shadow-md ring-1 ring-white/20"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {ut.label} Undertone
                  </span>
                  {active && <Check className="h-4 w-4 text-amber-400" />}
                </div>

                <div className="text-[11px] space-y-1">
                  <p className="text-neutral-400">
                    <span className="text-neutral-500">Tint:</span> {ut.tint}
                  </p>
                  <p className="text-neutral-400">
                    <span className="text-neutral-500">Metals:</span> {ut.metals}
                  </p>
                </div>

                {/* Color Swatch Preview */}
                <div className="flex items-center space-x-1.5 pt-1">
                  {ut.palette.map((color, i) => (
                    <div
                      key={i}
                      className="h-4 flex-1 rounded-md border border-white/10 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 7 Quick Melanin Swatches */}
        <div className="pt-2 space-y-2">
          <span className="text-[11px] text-neutral-400 block font-medium">
            Tap a quick melanin preset:
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
                  className={`p-2 rounded-xl border flex flex-col items-center text-center space-y-1 transition-all ${
                    isSelected
                      ? "bg-white/15 border-white shadow-md ring-1 ring-white"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                  }`}
                >
                  <div
                    className="h-6 w-6 rounded-full border border-white/20 shadow"
                    style={{ backgroundColor: sp.hex }}
                  />
                  <span className="text-[10px] font-bold text-white truncate w-full">
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
      </div>
    </div>
  );
};
