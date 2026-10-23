"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  Compass,
  Watch,
  Ruler,
  Layers as LayersIcon,
  Copy,
  Check,
  Bookmark,
  ChevronRight,
  Flame,
  Shirt,
  Wind
} from "lucide-react";
import { Outfit, WeatherCondition, BodyTypeProfile } from "@/types";
import { GarmentVisualizer } from "./GarmentVisualizer";

interface StylingStudioProps {
  outfit: Outfit | null;
  isLoading: boolean;
  onGenerateOutfit: (occasion: string, preferredHardware?: string, aestheticVibe?: string) => void;
  weather: WeatherCondition;
  bodyProfile: BodyTypeProfile;
}

export const StylingStudio: React.FC<StylingStudioProps> = ({
  outfit,
  isLoading,
  onGenerateOutfit,
  weather,
  bodyProfile,
}) => {
  const [selectedOccasion, setSelectedOccasion] = useState<string>("coding");
  const [selectedVibe, setSelectedVibe] = useState<string>("korean_minimal");
  const [selectedHardware, setSelectedHardware] = useState<string>("silver");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);

  const loadingTips = [
    "Calculating 1:2 Golden Silhouette Ratio (Boxy top + Wide-leg drape)...",
    "Synchronizing watch case metal with jacket zipper pull...",
    "Calibrating thermal rating for Pithoragarh Himalayan climate...",
    "Harmonizing color temperature with your skin undertone...",
    "Validating 60-30-10 color rule across top, bottom, and footwear...",
  ];

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const occasions = [
    { id: "coding", label: "Desk Work / Coding", icon: "💻" },
    { id: "tuition", label: "Tuition / College", icon: "🎓" },
    { id: "market", label: "Cafe & Streetwear", icon: "☕" },
    { id: "date_night", label: "Evening & Date", icon: "🍸" },
    { id: "casual", label: "Casual / Gym", icon: "🏃" },
  ];

  const aesthetics = [
    { id: "korean_minimal", label: "Korean Minimal", icon: "🇰🇷" },
    { id: "streetwear", label: "Baggy Streetwear", icon: "🛹" },
    { id: "quiet_luxury", label: "Quiet Luxury", icon: "💎" },
    { id: "gorpcore", label: "Gorpcore Utility", icon: "⛰️" },
  ];

  const handleGenerate = () => {
    onGenerateOutfit(selectedOccasion, selectedHardware, selectedVibe);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Context & Style Controls Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-extrabold text-xs shadow-md">
                AI
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Contextual Styling Engine
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Harmonizes clothing silhouette, hardware metals, and colors based on Pithoragarh climate & personal DNA.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition-all shadow-lg active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Sparkles className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Styling Ensemble..." : "Generate New Fit"}</span>
          </button>
        </div>

        {/* Occasion Selection Pills */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Select Occasion / Activity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {occasions.map((occ) => {
              const active = selectedOccasion === occ.id;
              return (
                <button
                  key={occ.id}
                  onClick={() => setSelectedOccasion(occ.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-2.5 ${
                    active
                      ? "bg-white text-black border-white shadow-md font-bold"
                      : "bg-white/[0.02] border-white/5 text-neutral-300 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-lg">{occ.icon}</span>
                  <span className="text-xs font-semibold truncate">{occ.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aesthetic Vibe & Hardware Metal Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Style Aesthetic
            </label>
            <div className="flex flex-wrap gap-2">
              {aesthetics.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedVibe(a.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    selectedVibe === a.id
                      ? "bg-white text-black border-white font-bold"
                      : "bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  <span>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Hardware Metal Harmony
            </label>
            <div className="flex items-center space-x-2">
              {["silver", "gold"].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedHardware(m)}
                  className={`px-4 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    selectedHardware === m
                      ? "bg-white text-black border-white font-bold"
                      : "bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  {m === "gold" ? "🟡 Yellow Gold" : "⚪ Polished Steel / Silver"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE LOADING EXPERIENCE */}
      {isLoading && (
        <div className="glass-card rounded-3xl p-8 border border-amber-400/30 bg-amber-500/[0.02] flex flex-col items-center justify-center text-center space-y-4 animate-fade-in py-12">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <Sparkles className="h-6 w-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white tracking-wide">
              SYNTHESIZING PROPORTIONS & COLOR SYNERGY
            </h3>
            <p className="text-xs text-amber-300 font-medium animate-pulse min-h-[20px]">
              {loadingTips[loadingTipIndex]}
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] text-neutral-500 font-mono">
            <span>Thermal Index: {weather.temp_c}°C</span>
            <span>•</span>
            <span>Morphology: {bodyProfile.body_type}</span>
          </div>
        </div>
      )}

      {/* 3. OUTFIT RESULTS CANVAS */}
      {outfit && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Fit Briefing Header */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                  {outfit.occasion} Edition • {selectedVibe.replace(/_/g, " ")}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-bold text-[10px]">
                  {Math.round(outfit.harmony_score * 100)}% Harmony Match
                </span>
              </div>
              <p className="text-sm font-bold text-white leading-relaxed">
                {outfit.styling_notes}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2000);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors"
              >
                <Bookmark className="h-3.5 w-3.5 text-neutral-400" />
                <span>{savedSuccess ? "Saved Fit!" : "Save Look"}</span>
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 text-neutral-400" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>

          {/* Micro-Styling Execution Instructions Card */}
          <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-500/[0.03] space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Micro-Styling Execution Protocol ("How to Wear It")</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-neutral-300">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-amber-300 font-bold block">1. Upper Silhouette Hem</span>
                <p className="text-neutral-200">Fold bottom hem inward 1 inch to emphasize cropped boxy cut and elongate legs.</p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-amber-300 font-bold block">2. Wrist & Hardware Exposure</span>
                <p className="text-neutral-200">Roll sleeve back twice on watch wrist to expose the timepiece.</p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] text-amber-300 font-bold block">3. Hemline & Footwear Stack</span>
                <p className="text-neutral-200">Let trousers pool naturally with single break over sneaker tongue.</p>
              </div>
            </div>
          </div>

          {/* Curated Ensemble Visual Cards (Guaranteed 100% visible with GarmentVisualizer) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Curated Garments ({outfit.items.length} Elements)
              </h3>
              <span className="text-[10px] font-mono text-neutral-500">
                Tap color code to copy HEX
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {outfit.items.map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-3 border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between group"
                >
                  {/* Category & Hardware Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    {item.hardware_color && item.hardware_color !== "none" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-amber-400/10 text-amber-300 border border-amber-400/20">
                        {item.hardware_color}
                      </span>
                    )}
                  </div>

                  {/* Guaranteed 100% Visible Cutout & Vector Silhouette */}
                  <div className="relative aspect-square w-full rounded-xl bg-black/50 p-2 flex items-center justify-center border border-white/5 my-1">
                    <GarmentVisualizer
                      category={item.category}
                      subCategory={item.sub_category}
                      primaryHex={item.color_primary_hex}
                      secondaryHex={item.color_secondary_hex}
                      imageUrl={item.image_cutout_url}
                      hardwareColor={item.hardware_color}
                    />
                  </div>

                  {/* Bottom Specs with Enhanced Color Code */}
                  <div className="mt-2 space-y-1.5">
                    <h4 className="text-xs font-bold text-white capitalize truncate">
                      {item.sub_category.replace(/_/g, " ")}
                    </h4>

                    {/* 1-tap Copy HEX Code */}
                    <div
                      onClick={() => handleCopyHex(item.color_primary_hex)}
                      className="flex items-center justify-between px-2 py-1 rounded-lg bg-black/60 border border-white/10 hover:border-white/30 cursor-pointer transition-colors"
                      title="Tap to copy HEX"
                    >
                      <div className="flex items-center space-x-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: item.color_primary_hex }}
                        />
                        <span className="font-mono text-[10px] text-neutral-200">
                          {copiedHex === item.color_primary_hex ? "COPIED!" : item.color_primary_hex}
                        </span>
                      </div>
                      <Copy className="h-2.5 w-2.5 text-neutral-500" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
                      <span className="capitalize">{item.fit_type}</span>
                      <span className="font-mono text-neutral-400">T:{item.thermal_rating}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theory Breakdown Matrix (Proportion + Metal + Climate) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase text-[10px]">
                <Compass className="h-3.5 w-3.5" />
                <span>Silhouette Architecture</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                {outfit.silhouette_analysis}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-300 font-bold uppercase text-[10px]">
                <Watch className="h-3.5 w-3.5" />
                <span>Metal Synchronization</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                {outfit.hardware_harmony}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase text-[10px]">
                <Ruler className="h-3.5 w-3.5" />
                <span>Body Type Alignment</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                {outfit.morphological_analysis || "Proportions tailored for your athletic posture and height profile."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
