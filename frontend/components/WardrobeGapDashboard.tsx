"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Layers
} from "lucide-react";
import { GapAnalysisResponse } from "@/types";

interface WardrobeGapDashboardProps {
  analysis: GapAnalysisResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const WardrobeGapDashboard: React.FC<WardrobeGapDashboardProps> = ({
  analysis,
  isLoading,
  onRefresh,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySearch = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!analysis) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center text-neutral-400 border border-white/10">
        <BarChart3 className="h-8 w-8 mx-auto text-neutral-600 mb-2 animate-pulse" />
        <p className="text-sm">Auditing wardrobe versatility and computing gap analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Capsule Score */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Capsule Versatility Score
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white">
                {Math.round(analysis.overall_capsule_score)}
              </span>
              <span className="text-sm font-semibold text-neutral-500">/ 100</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${analysis.overall_capsule_score}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              High cohesion across Korean drape and modern boxy streetwear staples.
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Category Balance Breakdown
          </span>
          <div className="space-y-1.5 text-xs">
            {Object.entries(analysis.category_counts).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-neutral-400 capitalize">{cat}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-white/60 h-full rounded-full"
                      style={{ width: `${Math.min(100, count * 25)}%` }}
                    />
                  </div>
                  <span className="font-mono text-neutral-200 text-[11px] w-4 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware & Thermal Profile */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Hardware Metal Synchronization
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-400/10 border border-slate-400/20 text-center">
                <p className="text-[10px] text-slate-300 font-semibold uppercase">Silver / Steel</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {analysis.hardware_breakdown["silver"] || 0}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-center">
                <p className="text-[10px] text-amber-300 font-semibold uppercase">Gold / Brass</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {analysis.hardware_breakdown["gold"] || 0}
                </p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400">
            Silver hardware dominates your closet. Keep future accessories anchored in cool metallic tones.
          </p>
        </div>
      </div>

      {/* Recommended Purchases with Budget Guardrails */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>High-ROI Purchase Recommendations</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Targeted staple additions that multiply existing outfit combinations with strict retail budget guardrails (₹400–₹800).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {rec.urgency_roi}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                      {rec.category}
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                    Budget: {rec.target_budget_inr}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {rec.item_title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-neutral-400 mt-1">
                    <div className="flex items-center space-x-1">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: rec.target_color_hex }}
                      />
                      <span className="capitalize">{rec.target_color_family.replace(/_/g, " ")}</span>
                    </div>
                    <span>•</span>
                    <span>{rec.silhouette_fit}</span>
                  </div>
                </div>

                {/* Specification & Rationale */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
                  <p className="text-neutral-300">
                    <strong className="text-white font-semibold">Fabric Spec: </strong>
                    {rec.fabric_spec}
                  </p>
                  <p className="text-neutral-400 leading-normal">
                    <strong className="text-white font-semibold">Strategic Impact: </strong>
                    {rec.rationale}
                  </p>
                </div>

                {/* Unlocks outfit pairings */}
                <div className="flex items-center space-x-1.5 text-[11px] text-neutral-300">
                  <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>
                    Unlocks <strong className="text-white">{rec.unlocks_outfits_count}+ new outfits</strong> with your existing:{" "}
                    {rec.pair_with_item_names.join(", ")}
                  </span>
                </div>
              </div>

              {/* Retail Search copy button */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-neutral-400 text-[11px] truncate max-w-[220px]">
                  Search: {rec.suggested_retail_search}
                </span>
                <button
                  onClick={() => handleCopySearch(rec.id, rec.suggested_retail_search)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white font-medium text-xs hover:bg-white/20 transition-colors"
                >
                  {copiedId === rec.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied Query!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Search Query</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
