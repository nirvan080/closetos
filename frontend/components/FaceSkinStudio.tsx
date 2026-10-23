"use client";

import React, { useState, useRef, useEffect } from "react";
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
  RefreshCw,
  Ruler,
  Briefcase,
  Layers,
  History,
  ShieldCheck
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
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("Synced");
  const [showHistory, setShowHistory] = useState(false);

  // Scan History persistence
  const [scanHistory, setScanHistory] = useState<FaceAnalysisResult[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("closetos_face_history_v2");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save whenever profile changes
  const updateProfileAndAutoSave = (updater: (prev: BodyTypeProfile) => BodyTypeProfile) => {
    setProfile((prev) => {
      const updated = updater(prev);
      onUpdateBodyProfile(updated);
      setAutoSaveStatus("Auto-saved");
      setTimeout(() => setAutoSaveStatus("Synced"), 1500);
      return updated;
    });
  };

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
    { id: "oval", label: "Oval", ratio: "1:1.5", eyewear: "Wayfarer, Aviator", collar: "Universal drapes", desc: "Balanced symmetry." },
    { id: "round", label: "Round", ratio: "1:1", eyewear: "Rectangular, Geometric", collar: "Open Cuban collar", desc: "Soft curves. Elongate with sharp structural lines." },
    { id: "square", label: "Square", ratio: "1:1", eyewear: "Round wireframe, Oval", collar: "Ribbed crewneck", desc: "Strong angular jaw. Soften baseline with curves." },
    { id: "heart", label: "Heart", ratio: "1:1.3", eyewear: "Clubmaster, Browline", collar: "Camp collar", desc: "Wide forehead, tapered chin." },
    { id: "diamond", label: "Diamond", ratio: "1:1.4", eyewear: "Browline, Cat-eye", collar: "Relaxed polo", desc: "Dramatic high cheekbones." },
    { id: "oblong", label: "Oblong", ratio: "1:1.7", eyewear: "Oversized, Square", collar: "Wide spread collar", desc: "Extended vertical plane." },
  ];

  const undertones = [
    { id: "warm", label: "Warm", tint: "Golden / Peachy", metals: "Yellow Gold, Brass", palette: ["#B45309", "#D97706", "#78350F", "#F59E0B"] },
    { id: "cool", label: "Cool", tint: "Rosy / Slate Blue", metals: "Polished Silver, Steel", palette: ["#1E3A8A", "#2563EB", "#475569", "#E2E8F0"] },
    { id: "neutral", label: "Neutral", tint: "Balanced Blend", metals: "Brushed Titanium, Mixed", palette: ["#0F172A", "#334155", "#64748B", "#F8FAFC"] },
    { id: "olive", label: "Olive", tint: "Greenish Golden", metals: "Antique Bronze, Gold", palette: ["#3F6212", "#65A30D", "#713F12", "#A16207"] },
  ];

  const bodyShapes = [
    { id: "inverted_triangle", label: "Inverted Triangle", desc: "Broad shoulders, athletic chest, narrow waist. Drop 7-8.", suitTip: "Soft shoulders (Spalla Camicia) with structured double pleats to balance hips." },
    { id: "trapezoid", label: "Trapezoid", desc: "Naturally balanced athletic proportions. Universal fit.", suitTip: "Classic 2-button single breasted with moderate notch or peak lapel." },
    { id: "rectangle", label: "Rectangle", desc: "Shoulders and waist are same width. Straight athletic.", suitTip: "Structured roped shoulders with high-waisted pleats to create optical waist taper." },
    { id: "oval", label: "Oval", desc: "Fuller midsection with softer shoulder line.", suitTip: "Low button stance 2-button jacket with clean flat-front trousers to elongate torso." },
    { id: "triangle", label: "Triangle / Pear", desc: "Narrower shoulders with broader hips and waist.", suitTip: "Broad peak lapels and structured roped shoulder pads to broaden upper frame." },
  ];

  const suitLapels = [
    { id: "notch", label: "Notch Lapel (3.25\")", desc: "Everyday executive & versatile formal. Universally flattering." },
    { id: "peak", label: "Peak Lapel (3.75\")", desc: "Assertive power suit. Draws eyes upward, widening chest & shoulders." },
    { id: "shawl", label: "Shawl Collar", desc: "Continuous soft curved curve. Black-tie tuxedos & gala suiting." },
  ];

  const suitButtons = [
    { id: "2_button", label: "2-Button Single Breasted", desc: "Golden 1:2 stance. Fasten top button only for optimal waist suppression." },
    { id: "double_breasted", label: "6x2 Double Breasted", desc: "Structured architectural wrap with peak lapels. Imposing silhouette." },
    { id: "1_button", label: "1-Button Evening Stance", desc: "Deep V-neckline elongation for modern minimalist suiting." },
  ];

  const suitPleats = [
    { id: "single_reverse_pleat", label: "Single Reverse Pleat (High Rise)", desc: "Essential for 1:2 Golden Ratio. Drapes cleanly down center crease." },
    { id: "flat_front", label: "Flat Front (Mid Rise)", desc: "Clean contemporary minimalist line across the pelvic baseline." },
    { id: "double_pleat", label: "Double Forward Pleat", desc: "Vintage bespoke heritage with maximum hip & thigh comfort." },
  ];

  const suitBreaks = [
    { id: "no_break", label: "No Break (Cropped)", desc: "Hem rests just above shoe collar with zero folding. Elongates legs." },
    { id: "slight_break", label: "Slight Break (Modern Classic)", desc: "Subtle single dimple where trouser hem meets shoe vamp." },
    { id: "full_break", label: "Full Break (Draped)", desc: "Deep fold pooling over the shoe for vintage relaxed suiting." },
  ];

  const suitFabrics = [
    { id: "worsted_wool_super120", label: "Super 120s Worsted Wool (260 GSM)", desc: "Four-season crisp drape with natural memory and wrinkle resistance." },
    { id: "flannel_heavyweight", label: "Heavyweight Chalkstripe Flannel (380 GSM)", desc: "Brushed matte surface for Himalayan crisp autumn & winter warmth." },
    { id: "linen_silk", label: "Irish Linen & Silk Blend (200 GSM)", desc: "Breathable rich texture with effortless relaxed structure." },
  ];

  // Calculate Suiting Drop
  const chest = profile.chest_in || 40;
  const waist = profile.waist_in || 32;
  const drop = chest - waist;
  const dropLabel = drop >= 8 ? `Drop ${drop} (Athletic V-Taper)` : drop >= 6 ? `Drop ${drop} (Classic Regular)` : `Drop ${drop} (Relaxed Comfort)`;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = (event) => setUploadedPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/api/v1/styling/analyze-face", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: FaceAnalysisResult = await res.json();
      setScanResult(data);

      // Save to scan history
      const updatedHistory = [data, ...scanHistory.slice(0, 9)];
      setScanHistory(updatedHistory);
      if (typeof window !== "undefined") {
        localStorage.setItem("closetos_face_history_v2", JSON.stringify(updatedHistory));
      }

      // Auto-update profile
      updateProfileAndAutoSave((prev) => ({
        ...prev,
        facial_shape: data.face_shape,
        skin_undertone: data.skin_undertone,
        skin_hex: data.skin_hex_estimate,
        contrast_level: data.contrast_level,
        preferred_eyewear: data.eyewear_recommendations?.[0]?.frame_shape,
        preferred_neckline: data.neckline_recommendations?.[0]?.cut,
      }));
    } catch (err: any) {
      setErrorMsg("Image scan failed. You can adjust details manually below.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyHistoricalScan = (historical: FaceAnalysisResult) => {
    setScanResult(historical);
    updateProfileAndAutoSave((prev) => ({
      ...prev,
      facial_shape: historical.face_shape,
      skin_undertone: historical.skin_undertone,
      skin_hex: historical.skin_hex_estimate,
      contrast_level: historical.contrast_level,
      preferred_eyewear: historical.eyewear_recommendations?.[0]?.frame_shape,
      preferred_neckline: historical.neckline_recommendations?.[0]?.cut,
    }));
    setShowHistory(false);
  };

  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="h-8 w-8 rounded-xl bg-amber-400 flex items-center justify-center text-black font-black text-xs shadow-md">
              DNA
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Face, Skin & Suiting Architecture DNA
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{autoSaveStatus}</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Complete morphological blueprint covering facial bone structure, melanin chrominance, suiting cuts, lapel geometry, and 1:2 Golden Ratio tailoring.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {scanHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
            >
              <History className="h-3.5 w-3.5 text-neutral-400" />
              <span>Past Scans ({scanHistory.length})</span>
            </button>
          )}

          {onNavigateToDatabaseWithFilter && (
            <button
              onClick={() => onNavigateToDatabaseWithFilter(profile.skin_undertone)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all shadow-md active:scale-95"
            >
              <span>Filter Closet for {profile.skin_undertone}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SCAN HISTORY DRAWER */}
      {showHistory && (
        <div className="glass-card rounded-2xl p-4 border border-amber-400/30 bg-amber-500/[0.03] space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <History className="h-4 w-4 text-amber-400" />
              <span>Saved Face & Tone Scan History</span>
            </span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-[11px] text-neutral-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {scanHistory.map((scan, idx) => (
              <div
                key={idx}
                onClick={() => handleApplyHistoricalScan(scan)}
                className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-white/30 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white capitalize">{scan.face_shape} Face</span>
                  <span className="text-[10px] text-emerald-400 font-mono">{(scan.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-neutral-300">
                  <div className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: scan.skin_hex_estimate }} />
                  <span className="capitalize">{scan.skin_undertone} undertone</span>
                </div>
                <span className="text-[10px] text-amber-300 block pt-1">Tap to Restore This Scan</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1: AI Instant Scan & Diagnostic Display */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full md:w-56 h-56 shrink-0 rounded-2xl bg-black/60 border-2 border-dashed border-white/20 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-400/60 cursor-pointer transition-all"
          >
            {uploadedPreview ? (
              <>
                <img src={uploadedPreview} alt="Selfie Preview" className="w-full h-full object-cover rounded-2xl" />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-2 backdrop-blur-sm">
                    <RefreshCw className="h-6 w-6 text-amber-400 animate-spin" />
                    <span className="text-[11px] font-bold text-amber-300 tracking-wider">ANALYZING DNA...</span>
                  </div>
                )}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-semibold border border-white/20">
                  Retake Photo
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4 space-y-2.5">
                <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Snap or Upload Selfie</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Instant AI facial & undertone extraction</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[9px] text-neutral-300 font-semibold">
                  Auto-Detects Tone
                </span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileUpload} />
          </div>

          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Current Blueprint</span>
                {scanResult && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {(scanResult.confidence * 100).toFixed(0)}% AI Confidence
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white capitalize mt-0.5">
                {profile.facial_shape} Bone Structure • {profile.skin_undertone} Undertone • {profile.body_type.replace('_', ' ')} Body
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {scanResult ? scanResult.face_shape_analysis : "Every parameter updates in real time and automatically persists across all outfit calculations."}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Face Shape</span>
                <span className="font-bold text-white capitalize block">{profile.facial_shape}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Undertone</span>
                <span className="font-bold text-amber-300 capitalize block">{profile.skin_undertone}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Skin HEX</span>
                <div onClick={(e) => handleCopyHex(profile.skin_hex || "#CE9E79", e)} className="flex items-center space-x-1.5 cursor-pointer font-mono text-white font-semibold">
                  <div className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: profile.skin_hex || "#CE9E79" }} />
                  <span>{copiedHex === (profile.skin_hex || "#CE9E79") ? "COPIED" : profile.skin_hex || "#CE9E79"}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Suiting Drop</span>
                <span className="font-bold text-emerald-400 block">{dropLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Body Shape & Proportions */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ruler className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Body Type & Frame Proportions
            </h3>
          </div>
          <span className="text-xs text-neutral-400">
            Selected: <span className="font-bold text-white capitalize">{profile.body_type.replace('_', ' ')}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {bodyShapes.map((shape) => {
            const active = profile.body_type === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() => updateProfileAndAutoSave((prev) => ({ ...prev, body_type: shape.id }))}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  active
                    ? "bg-white text-black font-bold shadow-lg ring-2 ring-white/30 scale-[1.02]"
                    : "bg-white/[0.02] border-white/5 text-neutral-300 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold ${active ? "text-black" : "text-white"}`}>{shape.label}</p>
                  {active && <Check className="h-3.5 w-3.5 text-black" />}
                </div>
                <p className={`text-[11px] leading-tight ${active ? "text-neutral-800 font-medium" : "text-neutral-400"}`}>
                  {shape.desc}
                </p>
                <div className={`p-2 rounded-xl text-[10px] leading-snug mt-1 ${active ? "bg-black/10 text-neutral-900 font-semibold" : "bg-black/40 text-neutral-300"}`}>
                  {shape.suitTip}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Suiting & Tailoring Architecture Details */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Bespoke Suiting & Tailoring Specifications
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-300 font-semibold">Drop: Chest - Waist</span>
        </div>

        {/* Measurements Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Chest Width</span>
              <span className="text-white font-mono font-bold">{chest}&quot;</span>
            </div>
            <input
              type="range"
              min={32}
              max={54}
              value={chest}
              onChange={(e) => updateProfileAndAutoSave((prev) => ({ ...prev, chest_in: Number(e.target.value) }))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Waist Baseline</span>
              <span className="text-white font-mono font-bold">{waist}&quot;</span>
            </div>
            <input
              type="range"
              min={26}
              max={48}
              value={waist}
              onChange={(e) => updateProfileAndAutoSave((prev) => ({ ...prev, waist_in: Number(e.target.value) }))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Height</span>
              <span className="text-white font-mono font-bold">{profile.height_cm || 178} cm</span>
            </div>
            <input
              type="range"
              min={150}
              max={210}
              value={profile.height_cm || 178}
              onChange={(e) => updateProfileAndAutoSave((prev) => ({ ...prev, height_cm: Number(e.target.value) }))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Calculated Drop</span>
              <span className="text-emerald-400 font-mono font-bold">{dropLabel}</span>
            </div>
            <div className="h-6 flex items-center">
              <span className="text-[11px] text-neutral-400 font-medium">Auto-calibrating jacket taper</span>
            </div>
          </div>
        </div>

        {/* Lapel Geometry */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Lapel Architecture</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {suitLapels.map((lapel) => {
              const active = (profile.suit_lapel_style || "notch") === lapel.id;
              return (
                <div
                  key={lapel.id}
                  onClick={() => updateProfileAndAutoSave((prev) => ({ ...prev, suit_lapel_style: lapel.id }))}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                    active ? "bg-white/10 border-white/40 shadow-md ring-1 ring-white/20" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{lapel.label}</span>
                    {active && <Check className="h-3.5 w-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">{lapel.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Button Stance */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Jacket Stance & Closure</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {suitButtons.map((btn) => {
              const active = (profile.suit_button_stance || "2_button") === btn.id;
              return (
                <div
                  key={btn.id}
                  onClick={() => updateProfileAndAutoSave((prev) => ({ ...prev, suit_button_stance: btn.id }))}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                    active ? "bg-white/10 border-white/40 shadow-md ring-1 ring-white/20" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{btn.label}</span>
                    {active && <Check className="h-3.5 w-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">{btn.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trouser Pleats & Break */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Trouser Rise & Pleats (1:2 Ratio)</label>
            <div className="space-y-2">
              {suitPleats.map((pl) => {
                const active = (profile.suit_trouser_pleat || "single_reverse_pleat") === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => updateProfileAndAutoSave((prev) => ({ ...prev, suit_trouser_pleat: pl.id }))}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      active ? "bg-white/10 border-white/40" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{pl.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{pl.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Trouser Break at Shoe Vamp</label>
            <div className="space-y-2">
              {suitBreaks.map((brk) => {
                const active = (profile.suit_trouser_break || "no_break") === brk.id;
                return (
                  <div
                    key={brk.id}
                    onClick={() => updateProfileAndAutoSave((prev) => ({ ...prev, suit_trouser_break: brk.id }))}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      active ? "bg-white/10 border-white/40" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{brk.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{brk.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Suit Fabric Weight */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Suiting Fabric & Thermal GSM</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {suitFabrics.map((fab) => {
              const active = (profile.suit_fabric_pref || "worsted_wool_super120") === fab.id;
              return (
                <div
                  key={fab.id}
                  onClick={() => updateProfileAndAutoSave((prev) => ({ ...prev, suit_fabric_pref: fab.id }))}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                    active ? "bg-white/10 border-white/40 shadow-md ring-1 ring-white/20" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{fab.label}</span>
                    {active && <Check className="h-3.5 w-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">{fab.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: Face Structure Selector */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smile className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">3. Facial Bone Structure</h3>
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
                onClick={() => updateProfileAndAutoSave((prev) => ({ ...prev, facial_shape: shape.id, preferred_eyewear: shape.eyewear.split(",")[0].trim() }))}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  active ? "bg-white text-black font-bold shadow-lg ring-2 ring-white/30 scale-[1.02]" : "bg-white/[0.02] border-white/5 text-neutral-300 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${active ? "bg-black/15 text-black" : "bg-white/10 text-neutral-400"}`}>{shape.ratio}</span>
                  {active && <Check className="h-3.5 w-3.5 text-black" />}
                </div>
                <p className={`text-sm font-bold capitalize ${active ? "text-black" : "text-white"}`}>{shape.label}</p>
                <div className="mt-2 space-y-1 text-[10px]">
                  <p className={`truncate ${active ? "text-neutral-800" : "text-neutral-400"}`}><span className="font-semibold">Frames:</span> {shape.eyewear}</p>
                  <p className={`truncate ${active ? "text-neutral-800" : "text-neutral-400"}`}><span className="font-semibold">Collar:</span> {shape.collar}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: Melanin Tone & Undertone */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">4. Melanin Tone & Undertone</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-neutral-400">Custom HEX:</span>
            <input
              type="color"
              value={profile.skin_hex || "#CE9E79"}
              onChange={(e) => updateProfileAndAutoSave((prev) => ({ ...prev, skin_hex: e.target.value }))}
              className="h-6 w-6 rounded border-0 cursor-pointer bg-transparent"
              title="Pick exact skin color"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {undertones.map((ut) => {
            const active = profile.skin_undertone === ut.id;
            return (
              <div
                key={ut.id}
                onClick={() => updateProfileAndAutoSave((prev) => ({ ...prev, skin_undertone: ut.id }))}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  active ? "bg-white/10 border-white/40 shadow-md ring-1 ring-white/20" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{ut.label} Undertone</span>
                  {active && <Check className="h-4 w-4 text-amber-400" />}
                </div>
                <div className="text-[11px] space-y-1">
                  <p className="text-neutral-400"><span className="text-neutral-500">Tint:</span> {ut.tint}</p>
                  <p className="text-neutral-400"><span className="text-neutral-500">Metals:</span> {ut.metals}</p>
                </div>
                <div className="flex items-center space-x-1.5 pt-1">
                  {ut.palette.map((color, i) => (
                    <div key={i} className="h-4 flex-1 rounded-md border border-white/10 shadow-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 space-y-2">
          <span className="text-[11px] text-neutral-400 block font-medium">Quick presets:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {skinPresets.map((sp, idx) => {
              const isSelected = profile.skin_hex === sp.hex;
              return (
                <button
                  key={idx}
                  onClick={() => updateProfileAndAutoSave((prev) => ({ ...prev, skin_hex: sp.hex, skin_undertone: sp.undertone }))}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center space-y-1 transition-all ${
                    isSelected ? "bg-white/15 border-white shadow-md ring-1 ring-white" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="h-6 w-6 rounded-full border border-white/20 shadow" style={{ backgroundColor: sp.hex }} />
                  <span className="text-[10px] font-bold text-white truncate w-full">{sp.label}</span>
                  <span className="text-[9px] uppercase font-mono text-neutral-400">{sp.undertone}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
