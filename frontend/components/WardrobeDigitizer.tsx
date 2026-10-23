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
  AlertCircle,
  Layers,
  ArrowRight,
  Check,
  Plus,
  Link,
  Globe
} from "lucide-react";
import { IngestionResult, ClothingItem } from "@/types";
import { apiFetch } from "@/lib/api";

interface WardrobeDigitizerProps {
  onItemIngested: (newItem: ClothingItem) => void;
  onNavigateToVault: () => void;
  onStartBackgroundTask?: (name: string) => void;
  onEnqueueFiles?: (files: File[]) => void;
  onEnqueueUrl?: (url: string) => void;
}

export const WardrobeDigitizer: React.FC<WardrobeDigitizerProps> = ({
  onItemIngested,
  onNavigateToVault,
  onStartBackgroundTask,
  onEnqueueFiles,
  onEnqueueUrl,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [webUrl, setWebUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentName: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<IngestionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form states for editable fields after single ingestion
  const [category, setCategory] = useState("top");
  const [subCategory, setSubCategory] = useState("boxy_hoodie");
  const [fitType, setFitType] = useState("boxy");
  const [fabricType, setFabricType] = useState("cotton_fleece");
  const [fabricWeight, setFabricWeight] = useState("heavyweight_350gsm");
  const [hardwareColor, setHardwareColor] = useState("silver");
  const [thermalRating, setThermalRating] = useState(3);

  const handleFilesSelected = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList);
    setSelectedFiles(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
    setAnalysisResult(null);
    setErrorMsg(null);
    setSuccessCount(0);
  };

  // Dispatch to background queue so the user is NEVER blocked
  const handleQueueInBackground = () => {
    if (selectedFiles.length > 0 && onEnqueueFiles) {
      onEnqueueFiles(selectedFiles);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setSelectedFiles([]);
      setPreviewUrls([]);
      return;
    }
    // Fallback to local background processing
    handleProcessBatch();
  };

  const handleClipFromWeb = async () => {
    if (!webUrl.trim()) return;
    if (onEnqueueUrl) {
      onEnqueueUrl(webUrl.trim());
      setWebUrl("");
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("image_url", webUrl.trim());
      const res = await apiFetch("/api/v1/wardrobe/ingest-url", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Could not clip garment from URL");
      const data: IngestionResult = await res.json();
      setAnalysisResult(data);
      setCategory(data.category);
      setSubCategory(data.sub_category);
      setWebUrl("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to clip from web.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Process a single garment
  const handleProcessSingleImage = async () => {
    if (selectedFiles.length === 0) return;
    const file = selectedFiles[0];
    setIsProcessing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch("/api/v1/wardrobe/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Ingestion failed with status ${res.status}`);

      const data: IngestionResult = await res.json();
      setAnalysisResult(data);

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

  // Process multiple garments in batch background queue
  const handleProcessBatch = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);
    let completed = 0;

    if (onStartBackgroundTask) {
      onStartBackgroundTask(`Digitizing ${selectedFiles.length} garments in background`);
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setBatchProgress({
        current: i + 1,
        total: selectedFiles.length,
        currentName: file.name,
      });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await apiFetch("/api/v1/wardrobe/ingest", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data: IngestionResult = await res.json();

          const payload = {
            category: data.category,
            sub_category: data.sub_category,
            color_primary_hex: data.color_primary_hex,
            color_secondary_hex: data.color_secondary_hex,
            color_family: data.color_family,
            fabric_type: data.fabric_type,
            fabric_weight: data.fabric_weight,
            pattern: data.pattern,
            hardware_color: data.hardware_color,
            thermal_rating: data.thermal_rating,
            fit_type: data.fit_type,
            image_original_url: data.original_url,
            image_cutout_url: data.cutout_url,
            embedding: [],
            metadata_json: {
              tags: data.tags,
              confidence: data.confidence,
              white_balance_applied: data.white_balance_applied,
              bg_removed: data.bg_removed,
            },
          };

          const saveRes = await apiFetch("/api/v1/wardrobe/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (saveRes.ok) {
            const savedItem: ClothingItem = await saveRes.json();
            onItemIngested(savedItem);
            completed++;
          }
        }
      } catch (err) {
        console.error(`Error processing batch file ${file.name}:`, err);
      }
    }

    setIsProcessing(false);
    setBatchProgress(null);
    setSuccessCount(completed);

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const handleCommitSingleGarment = async () => {
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
      embedding: [],
      metadata_json: {
        tags: analysisResult.tags,
        confidence: analysisResult.confidence,
        white_balance_applied: analysisResult.white_balance_applied,
        bg_removed: analysisResult.bg_removed,
      },
    };

    try {
      const res = await apiFetch("/api/v1/wardrobe/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save item.");

      const newItem: ClothingItem = await res.json();
      onItemIngested(newItem);

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setAnalysisResult(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Error saving item.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Hidden native inputs */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="h-8 w-8 rounded-xl bg-amber-400 flex items-center justify-center text-black font-black text-xs shadow-md">
              ADD
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Wardrobe Digitizer & Multi-Piece Scanner
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Snap clothing with camera, upload multiple batch photos, or clip directly from web. Runs non-blocking background cutout & auto-white-balance.
          </p>
        </div>

        <button
          onClick={onNavigateToVault}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors self-start sm:self-auto"
        >
          <span>View Database</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successCount > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2 text-xs text-emerald-300 font-semibold">
            <CheckCircle className="h-4 w-4" />
            <span>Successfully digitized & archived {successCount} piece(s) into your Closet Database!</span>
          </div>
          <button
            onClick={onNavigateToVault}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400"
          >
            Open Database
          </button>
        </div>
      )}

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3 WAYS TO DIGITIZE (When no single item is being reviewed) */}
      {!analysisResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Camera Snap Button */}
            <div
              onClick={() => cameraInputRef.current?.click()}
              className="glass-card rounded-3xl p-6 border border-white/10 hover:border-amber-400/50 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-3 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Camera className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Snap Piece With Camera</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Direct phone camera capture with automatic perspective leveling
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-bold">
                1-Tap Camera
              </span>
            </div>

            {/* 2. Multi-Upload Button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="glass-card rounded-3xl p-6 border border-white/10 hover:border-white/30 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-3 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Select Single or Multiple Pieces</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Pick 1, 5, or 10 garment photos from gallery for background ingestion
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-[10px] font-bold">
                Batch Upload
              </span>
            </div>
          </div>

          {/* 3. Clip From Web (Inspired by Fits App) */}
          <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
              <Globe className="h-4 w-4 text-sky-400" />
              <span>Clip from Web (Fits Feature)</span>
            </div>
            <p className="text-xs text-neutral-400">
              Paste any clothing image link from Zara, Uniqlo, H&M, or Pinterest to isolate cutouts without downloading to your camera roll.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="url"
                placeholder="Paste image URL (e.g. https://...garment.jpg)..."
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
              />
              <button
                onClick={handleClipFromWeb}
                disabled={isProcessing || !webUrl.trim()}
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 disabled:opacity-40 transition-all shadow"
              >
                Clip to Closet
              </button>
            </div>
          </div>

          {/* PREVIEW OF SELECTED FILES & NON-BLOCKING BACKGROUND DISPATCH */}
          {selectedFiles.length > 0 && (
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedFiles.length} Garment Photo(s) Selected
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Process in background so you can freely browse outfits while computer vision runs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setPreviewUrls([]);
                  }}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Clear Selection
                </button>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl bg-black/60 border border-white/10 overflow-hidden"
                  >
                    <img src={url} alt={`Garment ${idx}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={handleQueueInBackground}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-black" />
                  <span>Process in Background & Continue</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SINGLE ITEM REVIEW & EDIT CARD */}
      {analysisResult && (
        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 rounded-2xl bg-black/60 border border-white/10 p-3 flex items-center justify-center shrink-0">
              <img
                src={analysisResult.cutout_url}
                alt="Cutout Preview"
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
                  Cutout Isolated
                </span>
                <span className="text-xs text-neutral-400">
                  Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <h3 className="text-lg font-bold text-white capitalize">
                {subCategory.replace(/_/g, " ")}
              </h3>

              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-neutral-400">Primary:</span>
                  <div
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: analysisResult.color_primary_hex }}
                  />
                  <span className="font-mono text-white font-bold">
                    {analysisResult.color_primary_hex}
                  </span>
                </div>

                {analysisResult.color_secondary_hex && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-neutral-400">Secondary:</span>
                    <div
                      className="h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: analysisResult.color_secondary_hex }}
                    />
                    <span className="font-mono text-white font-bold">
                      {analysisResult.color_secondary_hex}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white capitalize"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="outerwear">Outerwear</option>
                <option value="footwear">Footwear</option>
                <option value="accessory">Accessory</option>
                <option value="watch">Watch</option>
                <option value="eyewear">Eyewear</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-medium">Silhouette Fit</label>
              <select
                value={fitType}
                onChange={(e) => setFitType(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white capitalize"
              >
                <option value="boxy">Boxy Cropped (1:2)</option>
                <option value="relaxed">Relaxed Draped</option>
                <option value="baggy">Baggy Wide</option>
                <option value="tailored">Tailored Slim</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-medium">Fabric Type</label>
              <input
                type="text"
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-medium">Fabric Weight / GSM</label>
              <input
                type="text"
                value={fabricWeight}
                onChange={(e) => setFabricWeight(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              onClick={() => setAnalysisResult(null)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCommitSingleGarment}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Confirm & Save to Closet"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
