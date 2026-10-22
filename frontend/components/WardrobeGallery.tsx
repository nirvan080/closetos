"use client";

import React, { useState } from "react";
import {
  Layers,
  Search,
  Filter,
  Trash2,
  Sparkles,
  Watch,
  X,
  Compass,
  ArrowRight
} from "lucide-react";
import { ClothingItem } from "@/types";

interface WardrobeGalleryProps {
  items: ClothingItem[];
  onDeleteItem: (id: string) => void;
  onBuildOutfitAround: (itemId: string) => void;
}

export const WardrobeGallery: React.FC<WardrobeGalleryProps> = ({
  items,
  onDeleteItem,
  onBuildOutfitAround,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFit, setSelectedFit] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState<ClothingItem | null>(null);
  const [similarItems, setSimilarItems] = useState<ClothingItem[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const categories = [
    { id: "all", label: "All Vault" },
    { id: "top", label: "Tops" },
    { id: "bottom", label: "Bottoms" },
    { id: "shoes", label: "Shoes" },
    { id: "outerwear", label: "Outerwear" },
    { id: "watch", label: "Watches" },
  ];

  const fits = ["all", "boxy", "baggy", "korean-pleated", "relaxed", "regular"];

  const filteredItems = items.filter((item) => {
    const matchCat = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory;
    const matchFit = selectedFit === "all" || (item.fit_type || "").toLowerCase().includes(selectedFit);
    const matchQuery =
      searchQuery === "" ||
      item.sub_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color_family.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fabric_type || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchFit && matchQuery;
  });

  const handleOpenDetail = async (item: ClothingItem) => {
    setActiveItem(item);
    setLoadingSimilar(true);
    try {
      const res = await fetch(`/api/v1/wardrobe/similar/${item.id}`);
      if (res.ok) {
        const data = await res.json();
        setSimilarItems(data);
      }
    } catch {
      setSimilarItems([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-neutral-300" />
            <span>Digital Closet Vault</span>
            <span className="text-xs font-normal text-neutral-500">({items.length} Archived Pieces)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Indexed with 768-dimensional multimodal embeddings for visual and textual search.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search sub-category, color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === c.id
                  ? "bg-white text-black shadow-sm font-semibold"
                  : "bg-white/[0.03] text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 border border-white/5"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Fit Filter pills */}
        <div className="flex items-center space-x-2 overflow-x-auto text-[11px] pt-1 text-neutral-400">
          <span className="text-neutral-500 uppercase font-semibold text-[10px]">Silhouette:</span>
          {fits.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFit(f)}
              className={`capitalize px-2 py-0.5 rounded ${
                selectedFit === f ? "text-white font-bold bg-white/10" : "hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Garment Grid */}
      {filteredItems.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-neutral-400 space-y-2 border border-white/10">
          <Layers className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
          <p className="text-sm font-medium text-white">No items match your filter criteria.</p>
          <p className="text-xs">Adjust filters or digitize new items in the Wardrobe Digitizer tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenDetail(item)}
              className="glass-card glass-card-hover rounded-2xl p-3 border border-white/10 flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
                <div className="flex items-center space-x-1.5">
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

              {/* Cutout Graphic */}
              <div className="relative aspect-square w-full rounded-xl bg-black/40 p-2.5 flex items-center justify-center overflow-hidden border border-white/5 my-1">
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
                  <span className="text-neutral-500 font-mono">
                    T:{item.thermal_rating}/5
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card rounded-3xl max-w-2xl w-full border border-white/15 p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute right-5 top-5 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left: Cutout image */}
              <div className="aspect-square rounded-2xl bg-black/60 border border-white/10 p-4 flex items-center justify-center relative">
                <img
                  src={activeItem.image_cutout_url}
                  alt={activeItem.sub_category}
                  className="h-full w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Right: Rich Metadata */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 bg-white/10 px-2 py-0.5 rounded">
                      {activeItem.category}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      Thermal Rating: {activeItem.thermal_rating}/5
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white capitalize mt-1">
                    {activeItem.sub_category.replace(/_/g, " ")}
                  </h3>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Silhouette Fit</span>
                      <span className="font-semibold text-white capitalize">{activeItem.fit_type}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Fabric Texture</span>
                      <span className="font-semibold text-white capitalize">{activeItem.fabric_type || "Cotton Fleece"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Fabric Weight</span>
                      <span className="font-semibold text-white">{activeItem.fabric_weight?.replace(/_/g, " ") || "350 GSM"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Color Family</span>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="h-3 w-3 rounded-full border border-white/20"
                          style={{ backgroundColor: activeItem.color_primary_hex }}
                        />
                        <span className="font-semibold text-white capitalize">{activeItem.color_family.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-neutral-400">Hardware Tone</span>
                      <span className="font-semibold text-white capitalize">{activeItem.hardware_color || "None"}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => {
                      onBuildOutfitAround(activeItem.id);
                      setActiveItem(null);
                    }}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-white text-black font-bold text-xs py-2.5 hover:bg-neutral-200 transition-colors shadow"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Build Outfit Around This Piece</span>
                  </button>
                  <button
                    onClick={() => {
                      onDeleteItem(activeItem.id);
                      setActiveItem(null);
                    }}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 font-medium text-xs py-2 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Archive / Delete from Closet</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Similar Items (Vector Embedding Search) */}
            {similarItems.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                  <Compass className="h-3.5 w-3.5 text-amber-400" />
                  <span>Semantically / Visually Similar Wardrobe Items (pgvector)</span>
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {similarItems.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => handleOpenDetail(sim)}
                      className="p-2 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:border-white/30 transition-all text-center"
                    >
                      <div className="aspect-square w-full rounded bg-neutral-900/50 p-1 flex items-center justify-center mb-1">
                        <img
                          src={sim.image_cutout_url}
                          alt={sim.sub_category}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-white truncate capitalize">
                        {sim.sub_category.replace(/_/g, " ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
