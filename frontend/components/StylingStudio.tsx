"use client";

import React, { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Watch,
  ShieldCheck,
  Compass,
  ArrowRight,
  Bookmark,
  Share2,
  Ruler,
  Layers as LayersIcon
} from "lucide-react";
import { Outfit, WeatherCondition, ClothingItem, MicroStylingInstruction, BodyTypeProfile } from "@/types";

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
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const occasions = [
    { id: "coding", label: "Desk Work / Coding", icon: "💻", cue: "Boxy & ergonomic drape" },
    { id: "tuition", label: "Tuition / University", icon: "🎓", cue: "Korean pleated smart-casual" },
    { id: "market", label: "Market / Casual Outing", icon: "☕", cue: "Baggy streetwear drape" },
    { id: "date_night", label: "Date Night / Dinner", icon: "💖", cue: "Refined quiet luxury" },
    { id: "formal", label: "Formal / Evening", icon: "🍸", cue: "Monochrome & steel harmony" },
    { id: "airport", label: "Airport / Travel", icon: "✈️", cue: "Breathable heavy layering" },
    { id: "home", label: "Home Lounge", icon: "🛋️", cue: "Fleece comfort" },
  ];

  const aesthetics = [
    { id: "korean_minimal", label: "Korean Minimalist", icon: "🇰🇷", cue: "Fluid drapes & pleats" },
    { id: "streetwear", label: "Modern Streetwear", icon: "🛹", cue: "350 GSM boxy crops & deep stacks" },
    { id: "quiet_luxury", label: "Quiet Luxury", icon: "🍸", cue: "Monochrome & gold/leather refinement" },
    { id: "gorpcore", label: "Gorpcore Utility", icon: "⛰️", cue: "Tactical cargo & weather shells" },
    { id: "vintage_americana", label: "Vintage Workwear", icon: "🇺🇸", cue: "Canvas chore jackets & denim" },
  ];

  const handleGenerate = () => {
    setCompletedSteps({});
    onGenerateOutfit(selectedOccasion, selectedHardware, selectedVibe);
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSaveLookbook = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Occasion & Controls Panel */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>Contextual Styling Engine</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Conditioned on current {weather.temp_c}°C weather, your {bodyProfile.body_type.replace('_', ' ')} build, and Golden 1:2 silhouette proportions.
            </p>
          </div>

          {/* Metal hardware harmony toggle */}
          <div className="flex items-center space-x-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/5 self-start md:self-auto">
            <span className="text-[11px] font-medium text-neutral-400 px-2 flex items-center space-x-1">
              <Watch className="h-3 w-3" />
              <span>Metal Sync:</span>
            </span>
            {["silver", "gold"].map((hw) => (
              <button
                key={hw}
                onClick={() => setSelectedHardware(hw)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  selectedHardware === hw
                    ? hw === "silver"
                      ? "bg-slate-300 text-black shadow-sm"
                      : "bg-amber-400 text-black shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {hw}
              </button>
            ))}
          </div>
        </div>

        {/* Aesthetic Vibes Selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
            Select Style Aesthetic Vibe
          </label>
          <div className="flex flex-wrap gap-2">
            {aesthetics.map((a) => {
              const isSelected = selectedVibe === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedVibe(a.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-white/[0.03] border-white/5 text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200"
                  }`}
                >
                  <span>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Occasion Selector Buttons */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
            Select Occasion / Activity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {occasions.map((occ) => {
              const isSelected = selectedOccasion === occ.id;
              return (
                <button
                  key={occ.id}
                  onClick={() => setSelectedOccasion(occ.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white/10 border-white/30 text-white shadow-md ring-1 ring-white/20"
                      : "bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200"
                  }`}
                >
                  <span className="text-xl mb-1">{occ.icon}</span>
                  <span className="text-xs font-semibold text-neutral-200 leading-tight">
                    {occ.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trigger Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-white/5"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Harmonizing Proportion Physics...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-black" />
                <span>Generate Proportion-Engine Outfit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Outfit Canvas */}
      {outfit && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Harmony Bar */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold flex items-center space-x-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{Math.round(outfit.harmony_score * 100)}% Harmony Confidence</span>
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs font-medium text-neutral-300 capitalize">{outfit.occasion} Edition</span>
              </div>
              <p className="text-sm text-neutral-200 font-medium">
                {outfit.styling_notes}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleSaveLookbook}
                className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-white/10 transition-colors"
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>{savedSuccess ? "Saved to Book!" : "Save Fit"}</span>
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Shuffle Pieces</span>
              </button>
            </div>
          </div>

          {/* Morphological Body & Facial Shape Recommendation Callout */}
          {outfit.morphological_analysis && (
            <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/[0.03] space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Ruler className="h-4 w-4" />
                <span>Personal Morphological & Facial Shape Alignment</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {outfit.morphological_analysis}
              </p>
            </div>
          )}

          {/* Architectural Theory Cards (Silhouette & Hardware) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-4 border border-white/10 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <Compass className="h-3.5 w-3.5" />
                <span>Silhouette & Proportion Theory</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {outfit.silhouette_analysis}
              </p>
            </div>

            <div className="glass-card rounded-xl p-4 border border-white/10 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Watch className="h-3.5 w-3.5" />
                <span>Hardware & Metal Synchronization</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {outfit.hardware_harmony}
              </p>
            </div>
          </div>

          {/* Layering Breakdown Card */}
          {outfit.layering_breakdown && (
            <div className="glass-card rounded-xl p-4 border border-white/10 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
                <LayersIcon className="h-3.5 w-3.5 text-blue-400" />
                <span>Architectural Layering System</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1 text-xs">
                {Object.entries(outfit.layering_breakdown).map(([layer, desc]) => (
                  <div key={layer} className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">{layer}</span>
                    <span className="text-xs font-semibold text-white truncate block">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Item Visual Canvas Grid */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              Curated Garment & Accessory Ensemble ({outfit.items.length} Elements)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {outfit.items.map((item) => (
                <div
                  key={item.id}
                  className="glass-card glass-card-hover rounded-2xl p-3 border border-white/10 flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span
                        className="h-3 w-3 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: item.color_primary_hex }}
                        title={item.color_family}
                      />
                      {item.hardware_color && item.hardware_color !== "none" && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            item.hardware_color === "gold"
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                              : "bg-slate-300/20 text-slate-200 border border-slate-300/30"
                          }`}
                        >
                          {item.hardware_color}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative aspect-square w-full rounded-xl bg-black/40 p-2 flex items-center justify-center overflow-hidden border border-white/5 my-1">
                    <img
                      src={item.image_cutout_url}
                      alt={item.sub_category}
                      className="h-full w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="mt-2 space-y-1">
                    <h4 className="text-xs font-bold text-white capitalize leading-tight truncate">
                      {item.sub_category.replace(/_/g, " ")}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span className="capitalize">{item.fit_type}</span>
                      <span>{item.fabric_weight?.replace(/_/g, " ") || "Midweight"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Micro-Styling Execution Instructions */}
          {outfit.micro_styling && outfit.micro_styling.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Micro-Styling Execution Instructions</span>
                    <span className="text-xs font-normal text-neutral-400">("How to Wear It")</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Minute cuff, hem, and tuck adjustments that elevate standard pieces into high-fashion silhouettes.
                  </p>
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  {Object.values(completedSteps).filter(Boolean).length}/{outfit.micro_styling.length} executed
                </span>
              </div>

              <div className="space-y-2.5">
                {outfit.micro_styling.map((inst, idx) => {
                  const isDone = !!completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start space-x-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isDone
                          ? "bg-emerald-500/[0.06] border-emerald-500/20 text-neutral-300"
                          : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] text-white"
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 h-4 w-4 shrink-0 rounded flex items-center justify-center border transition-colors ${
                          isDone
                            ? "bg-emerald-500 border-emerald-400 text-black"
                            : "border-white/20 bg-white/5"
                        }`}
                      >
                        {isDone && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                      </button>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold ${isDone ? "line-through text-neutral-400" : "text-white"}`}>
                            {inst.action}
                          </span>
                          <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-semibold uppercase text-neutral-400">
                            {inst.target_item}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-normal">
                          {inst.reason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
