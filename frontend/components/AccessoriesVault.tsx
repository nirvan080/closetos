"use client";

import React, { useState } from "react";
import {
  Watch,
  Glasses,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight
} from "lucide-react";
import { ClothingItem } from "@/types";

interface AccessoriesVaultProps {
  items: ClothingItem[];
  onBuildOutfitAround: (itemId: string) => void;
}

export const AccessoriesVault: React.FC<AccessoriesVaultProps> = ({
  items,
  onBuildOutfitAround,
}) => {
  const [filterType, setFilterType] = useState<string>("all");

  const accessoryItems = items.filter((it) =>
    ["watch", "eyewear", "bag", "accessory"].includes(it.category.toLowerCase())
  );

  const filtered = accessoryItems.filter((it) => {
    if (filterType === "all") return true;
    return it.category.toLowerCase() === filterType;
  });

  const filterTabs = [
    { id: "all", label: "All Hardware & Accs", icon: Sparkles },
    { id: "watch", label: "Timepieces", icon: Watch },
    { id: "eyewear", label: "Eyewear", icon: Glasses },
    { id: "bag", label: "Bags & Carry", icon: ShoppingBag },
    { id: "accessory", label: "Jewelry", icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Watch className="h-5 w-5 text-amber-400" />
            <span>Hardware, Timepieces & Accessories Vault</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Jewelry, watch metals, eyewear geometry, and leather carry items engineered for proportion and hardware synchronization.
          </p>
        </div>

        {/* Metal Balance Stat */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-slate-300/10 border border-slate-300/20 px-3 py-1.5 rounded-xl text-slate-200 font-semibold">
            Silver Metal: {items.filter(i => i.hardware_color === "silver").length}
          </div>
          <div className="bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl text-amber-300 font-semibold">
            Gold Metal: {items.filter(i => i.hardware_color === "gold").length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((t) => {
          const Icon = t.icon;
          const active = filterType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-white text-black shadow-md"
                  : "bg-white/[0.04] text-neutral-400 hover:text-white border border-white/5"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hardware Rules Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="glass-card rounded-xl p-4 border border-white/10 space-y-1">
          <span className="font-bold text-slate-300 uppercase text-[10px] tracking-wider block">
            Silver Hardware Rule
          </span>
          <p className="text-neutral-400 leading-normal">
            Stainless steel diver watches pair best with brushed nickel zipper pulls, cool monochrome tops, and Cuban chains.
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10 space-y-1">
          <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider block">
            Gold Hardware Rule
          </span>
          <p className="text-neutral-400 leading-normal">
            Vintage gold tank timepieces elevate quiet luxury looks, earth tones (Mocha, Terracotta), and brass belt buckles.
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10 space-y-1">
          <span className="font-bold text-emerald-300 uppercase text-[10px] tracking-wider block">
            Eyewear Frame Rule
          </span>
          <p className="text-neutral-400 leading-normal">
            Geometric tortoise frames visually structure round face shapes; wireframes soften square jawlines.
          </p>
        </div>
      </div>

      {/* Accessories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="glass-card glass-card-hover rounded-2xl p-4 border border-white/10 flex flex-col justify-between group space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-white/10 px-2 py-0.5 rounded">
                {item.category}
              </span>
              {item.hardware_color && item.hardware_color !== "none" && (
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                    item.hardware_color === "gold"
                      ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                      : "bg-slate-300/20 text-slate-200 border-slate-300/30"
                  }`}
                >
                  {item.hardware_color} Tone
                </span>
              )}
            </div>

            {/* Cutout */}
            <div className="aspect-square w-full rounded-xl bg-black/50 p-3 flex items-center justify-center overflow-hidden border border-white/5">
              <img
                src={item.image_cutout_url}
                alt={item.sub_category}
                className="h-full w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div>
              <h4 className="text-xs font-bold text-white capitalize truncate">
                {item.sub_category.replace(/_/g, " ")}
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 capitalize">
                {item.fabric_type?.replace(/_/g, " ") || "Accessories"}
              </p>
            </div>

            <button
              onClick={() => onBuildOutfitAround(item.id)}
              className="w-full flex items-center justify-center space-x-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black font-bold text-xs py-2 transition-all shadow-sm"
            >
              <Sparkles className="h-3 w-3" />
              <span>Style With This</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
