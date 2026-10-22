"use client";

import React, { useState, useRef } from "react";
import confetti from "canvas-confetti";
import {
  UploadCloud,
  Camera,
  CheckCircle,
  Sparkles,
  Sliders,
  Palette,
  Eye,
  RefreshCw,
  Tag,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { IngestionResult, ClothingItem } from "@/types";
import { apiFetch } from "@/lib/api";

interface WardrobeDigitizerProps {
  onItemIngested: (newItem: ClothingItem) => void;
  onNavigateToVault: () => void;
}

export const WardrobeDigitizer: React.FC<WardrobeDigitizerProps> = ({
  onItemIngested,
  onNavigateToVault,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewLocalUrl, setPreviewLocalUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<IngestionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for editable fields after ingestion
  const [category, setCategory] = useState("top");
  const [subCategory, setSubCategory] = useState("boxy_hoodie");
  const [fitType, setFitType] = useState("boxy");
  const [fabricType, setFabricType] = useState("cotton_fleece");
  const [fabricWeight, setFabricWeight] = useState("heavyweight_350gsm");
  const [hardwareColor, setHardwareColor] = useState("silver");
  const [thermalRating, setThermalRating] = useState(3);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewLocalUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setErrorMsg(null);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await apiFetch("/api/v1/wardrobe/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Ingestion failed: ${res.statusText}`);
      }

      const data: IngestionResult = await res.json();
      setAnalysisResult(data);

      // Populate editable fields
      setCategory(data.category);
      setSubCategory(data.sub_category);
      setFitType(data.fit_type);
      setFabricType(data.fabric_type);
      setFabricWeight(data.fabric_weight);
      setHardwareColor(data.hardware_color);
      setThermalRating(data.thermal_rating);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process garment.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitGarment = async () => {
    if (!analysisResult) return;
    setIsSaving(true);

    const payload = {
      category,
      sub_category: subCategory,
      color_primary_hex: analysisResult.color_primary_hex,
      color_secondary_hex: analysisResult.color_secondary_hex,
      color_family: analysisResult.color_family,
      fabric_type: fabricType,
      fabric_weight: fabricWeight,
      pattern: analysisResult.pattern,
      hardware_color: hardwareColor,
      thermal_rating: thermalRating,
      fit_type: fitType,
      image_original_url: analysisResult.original_url,
      image_cutout_url: analysisResult.cutout_url,
      metadata_json: {
        palette: analysisResult.color_palette,
        tags: analysisResult.tags,
        white_balance_applied: analysisResult.white_balance_applied,
      },
    };

    try {
      const res = await apiFetch("/api/v1/wardrobe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save garment to database.");

      const savedItem: ClothingItem = await res.json();
      onItemIngested(savedItem);

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ffffff", "#d4af37", "#6b8e23", "#a0aec0"],
      });

      // Reset
      setSelectedFile(null);
      setPreviewLocalUrl(null);
      setAnalysisResult(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Error saving item.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Automated Wardrobe Digitizer
        </h2>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto">
          Upload any mobile garment photo. Our pipeline applies Gray World Auto-White-Balance to neutralize indoor lighting casts, isolates transparent alpha PNGs, extracts HEX swatches, and infers fabric weights.
        </p>
      </div>

      {/* Upload Zone */}
      {!analysisResult && (
        <div className="glass-card rounded-2xl p-8 border-2 border-dashed border-white/10 hover:border-white/20 transition-all text-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {previewLocalUrl ? (
            <div className="space-y-4">
              <div className="relative mx-auto h-64 w-64 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                <img
                  src={previewLocalUrl}
                  alt="Selected Preview"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Choose Different Photo
                </button>
                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-6 py-2 text-xs font-bold rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Executing Computer Vision Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Run CV Auto-Balance & Cutout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer py-10 space-y-3"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 text-neutral-300">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Drop garment image here, or <span className="text-neutral-400 underline">browse files</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Supports JPEG, PNG, WEBP, HEIC from smartphone cameras
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center justify-center space-x-2 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Analysis & Post-Ingestion Result Studio */}
      {analysisResult && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-8 animate-fade-in">
          {/* Comparison Row */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center space-x-2">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span>Pipeline Stage 1 & 2: White Balance Correction & Alpha Extraction</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* White balanced */}
              <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-2">
                <span className="text-[11px] font-semibold text-neutral-400">
                  Gray World Auto-White-Balanced (Yellow Cast Neutralized)
                </span>
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-900/50 flex items-center justify-center">
                  <img
                    src={analysisResult.original_url}
                    alt="AWB Corrected"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Cutout */}
              <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400">
                    Transparent Alpha-Channel Cutout
                  </span>
                  <span className="text-[10px] text-neutral-500">Checkerboard transparent back</span>
                </div>
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-[radial-gradient(#252836_1px,transparent_1px)] [background-size:12px_12px] bg-neutral-950 flex items-center justify-center">
                  <img
                    src={analysisResult.cutout_url}
                    alt="Isolated Cutout"
                    className="h-full w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Extracted Color Palette Swatches */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                <Palette className="h-3.5 w-3.5" />
                <span>Extracted Dominant Palette (K-Means Clustering)</span>
              </h4>
              <span className="text-xs font-mono font-semibold text-white uppercase bg-white/10 px-2 py-0.5 rounded">
                Family: {analysisResult.color_family.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {analysisResult.color_palette.map((hex, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 rounded-lg bg-black/50 border border-white/10 px-2.5 py-1.5"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shadow"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-xs font-mono text-neutral-300 uppercase">{hex}</span>
                  {i === 0 && (
                    <span className="text-[9px] font-bold text-amber-400 uppercase bg-amber-400/10 px-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Editable Metadata Form */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Stage 3: Confirm Inferred Metadata & Silhouette Attributes</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Category */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg bg-neutral-900 border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-white"
                >
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="shoes">Shoes</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="watch">Watch</option>
                  <option value="accessory">Accessory</option>
                </select>
              </div>

              {/* Sub-Category */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Sub-Category</label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full rounded-lg bg-neutral-900 border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              {/* Silhouette Cut */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Silhouette Cut / Fit</label>
                <select
                  value={fitType}
                  onChange={(e) => setFitType(e.target.value)}
                  className="w-full rounded-lg bg-neutral-900 border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-white"
                >
                  <option value="boxy">Boxy</option>
                  <option value="baggy">Baggy</option>
                  <option value="korean-pleated">Korean Pleated</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="regular">Regular</option>
                  <option value="oversized">Oversized</option>
                </select>
              </div>

              {/* Fabric Type */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Fabric Texture</label>
                <input
                  type="text"
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  className="w-full rounded-lg bg-neutral-900 border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              {/* Fabric Weight */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Fabric Weight / GSM</label>
                <select
                  value={fabricWeight}
                  onChange={(e) => setFabricWeight(e.target.value)}
                  className="w-full rounded-lg bg-neutral-900 border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-white"
                >
                  <option value="heavyweight_350gsm">Heavyweight (350+ GSM)</option>
                  <option value="midweight">Midweight (220-280 GSM)</option>
                  <option value="lightweight">Lightweight (&lt; 200 GSM)</option>
                </select>
              </div>

              {/* Hardware Metal Color */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Hardware Metal Tone</label>
                <select
                  value={hardwareColor}
                  onChange={(e) => setHardwareColor(e.target.value)}
                  className="w-full rounded-lg bg-neutral-900 border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-white"
                >
                  <option value="none">None / Concealed</option>
                  <option value="silver">Silver / Steel</option>
                  <option value="gold">Gold / Brass</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setAnalysisResult(null)}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Cancel & Discard
            </button>
            <button
              onClick={handleCommitGarment}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 active:scale-95 transition-all shadow-md"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Computing Vector Embedding...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-black" />
                  <span>Commit to Digital Closet</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
