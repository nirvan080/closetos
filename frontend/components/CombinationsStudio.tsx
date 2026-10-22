"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Compass,
  CheckCircle2
} from "lucide-react";
import { ClothingItem, PieceCombinationsResponse, OutfitCombination, Outfit } from "@/types";

interface CombinationsStudioProps {
  items: ClothingItem[];
  onApplyOutfit: (outfit: Outfit) => void;
}

export const CombinationsStudio: React.FC<CombinationsStudioProps> = ({
  items,
  onApplyOutfit,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [combinationsData, setCombinationsData] = useState<PieceCombinationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default to first item
  useEffect(() => {
    if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
      fetchCombinations(items[0].id);
    }
  }, [items]);

  const fetchCombinations = async (itemId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/styling/combinations/${itemId}`);
      if (res.ok) {
        const data: PieceCombinationsResponse = await res.json();
        setCombinationsData(data);
      }
    } catch (err) {
      console.error("Error fetching combinations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPiece = (itemId: string) => {
    setSelectedItemId(itemId);
    fetchCombinations(itemId);
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Layers className="h-5 w-5 text-amber-400" />
          <span>Piece Combinations Studio ("Style It 3 Ways")</span>
        </h2>
        <p className="text-xs text-neutral-400">
          Pick any garment from your digital wardrobe. Our engine proves its versatility by generating 3 distinct, high-harmony looks across different aesthetics.
        </p>
      </div>

      {/* Garment Selector Carousel / Horizontal list */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
          Select Piece to Multiply:
        </span>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {items.map((it) => {
            const isSelected = it.id === selectedItemId;
            return (
              <div
                key={it.id}
                onClick={() => handleSelectPiece(it.id)}
                className={`flex items-center space-x-3 p-2.5 rounded-2xl border cursor-pointer shrink-0 transition-all ${
                  isSelected
                    ? "bg-white/15 border-white/40 ring-1 ring-white/30 text-white shadow-lg"
                    : "bg-white/[0.03] border-white/5 text-neutral-400 hover:bg-white/[0.08]"
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-black/50 p-1 flex items-center justify-center border border-white/10">
                  <img
                    src={it.image_cutout_url}
                    alt={it.sub_category}
                    className="h-full w-full object-contain filter drop-shadow"
                  />
                </div>
                <div className="pr-2">
                  <p className="text-xs font-bold capitalize text-white truncate max-w-[120px]">
                    {it.sub_category.replace(/_/g, " ")}
                  </p>
                  <p className="text-[10px] text-neutral-400 capitalize">
                    {it.category} • {it.color_family.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="glass-card rounded-2xl p-12 text-center text-neutral-400 border border-white/10 space-y-2">
          <RefreshCw className="h-8 w-8 mx-auto animate-spin text-amber-400" />
          <p className="text-sm font-medium text-white">Synthesizing 3 distinct aesthetic ensembles...</p>
        </div>
      )}

      {/* 3 Looks Side-by-Side Display */}
      {!isLoading && combinationsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {combinationsData.combinations.map((combo, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-5 hover:border-white/20 transition-all"
            >
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {combo.aesthetic}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{Math.round(combo.harmony_score * 100)}% Harmony</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {combo.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-normal">
                  {combo.styling_notes}
                </p>
              </div>

              {/* Items in this ensemble */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Ensemble Pieces ({combo.items.length}):
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {combo.items.map((it) => (
                    <div
                      key={it.id}
                      className={`p-1.5 rounded-xl bg-black/40 border flex flex-col items-center justify-center text-center ${
                        it.id === selectedItemId
                          ? "border-amber-400/60 ring-1 ring-amber-400/30"
                          : "border-white/10"
                      }`}
                      title={it.sub_category}
                    >
                      <div className="h-12 w-12 flex items-center justify-center">
                        <img
                          src={it.image_cutout_url}
                          alt={it.sub_category}
                          className="h-full w-full object-contain filter drop-shadow"
                        />
                      </div>
                      <span className="text-[9px] font-medium text-neutral-300 truncate w-full mt-1">
                        {it.sub_category.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Micro-Styling Execution preview */}
              {combo.micro_styling && combo.micro_styling.length > 0 && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1">
                    <Compass className="h-3 w-3 text-amber-400" />
                    <span>Key Micro-Styling Move</span>
                  </span>
                  <p className="text-[11px] text-neutral-300">
                    <strong>{combo.micro_styling[0].action}:</strong> {combo.micro_styling[0].reason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
