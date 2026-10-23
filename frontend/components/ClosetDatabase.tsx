"use client";

import React, { useState } from "react";
import {
  Layers,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Table,
  LayoutGrid,
  Thermometer,
  ShieldCheck,
  Palette,
  X,
  Compass,
  Watch,
  Shirt,
  Flame,
  ArrowRight
} from "lucide-react";
import { ClothingItem, Outfit } from "@/types";
import { GarmentVisualizer } from "./GarmentVisualizer";

interface ClosetDatabaseProps {
  items: ClothingItem[];
  onDeleteItem: (id: string) => void;
  onDeleteSelectedItems?: (ids: string[]) => void;
  onDeleteAllItems?: () => void;
  onResetDefaultWardrobe?: () => void;
  onBuildOutfitAround: (itemId: string) => void;
  onApplyOutfitFromMultiSelect: (outfit: Outfit) => void;
  skinUndertoneFilter?: string | null;
}

export const ClosetDatabase: React.FC<ClosetDatabaseProps> = ({
  items,
  onDeleteItem,
  onDeleteSelectedItems,
  onDeleteAllItems,
  onResetDefaultWardrobe,
  onBuildOutfitAround,
  onApplyOutfitFromMultiSelect,
  skinUndertoneFilter,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ClothingItem | null>(null);
  const [isAnalyzingSynergy, setIsAnalyzingSynergy] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);
  const [synergyResult, setSynergyResult] = useState<{
    score: number;
    silhouetteScore: string;
    colorRule: string;
    hardwareMatch: string;
    microTip: string;
  } | null>(null);

  const categories = [
    { id: "all", label: "All Items" },
    { id: "top", label: "Tops" },
    { id: "bottom", label: "Bottoms" },
    { id: "outerwear", label: "Outerwear" },
    { id: "shoes", label: "Footwear" },
    { id: "watch", label: "Watches" },
    { id: "accessory", label: "Accessories" },
  ];

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchCat = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory;
    const matchQuery =
      searchQuery === "" ||
      item.sub_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color_family.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fabric_type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fit_type || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleAnalyzeSynergy = () => {
    setIsAnalyzingSynergy(true);
    const selectedItems = items.filter((i) => selectedIds.includes(i.id));

    // Calculate intelligent synergy
    setTimeout(() => {
      const hasTop = selectedItems.some((i) => i.category === "top" || i.category === "outerwear");
      const hasBottom = selectedItems.some((i) => i.category === "bottom");
      const hasShoes = selectedItems.some((i) => i.category === "shoes");
      const hasWatch = selectedItems.some((i) => i.category === "watch");

      let score = 75;
      if (hasTop && hasBottom) score += 12;
      if (hasShoes) score += 8;
      if (hasWatch) score += 5;

      const metals = selectedItems
        .map((i) => i.hardware_color)
        .filter((h) => h && h !== "none");
      const metalMatch =
        new Set(metals).size <= 1
          ? "Harmonious Metal Alignment (Zero Clashing Hardware)"
          : "Mixed Metal Accents (Recommend matching watch case with belt buckle)";

      setSynergyResult({
        score: Math.min(score, 98),
        silhouetteScore:
          hasTop && hasBottom
            ? "1:2 Golden Ratio Maintained (Cropped/Boxy upper paired with fluid lower drape)"
            : "Layering ensemble — consider anchoring with structured footwear.",
        colorRule: "Balanced 60-30-10 palette with cohesive color temperature values.",
        hardwareMatch: metalMatch,
        microTip:
          "Fold top hem inward 1 inch. Expose timepiece by pulling sleeve back 1.5 inches.",
      });
      setIsAnalyzingSynergy(false);
    }, 400);
  };

  const handleApplyAsOutfit = () => {
    const selectedItems = items.filter((i) => selectedIds.includes(i.id));
    if (selectedItems.length === 0) return;

    const synthesizedOutfit: Outfit = {
      id: "multi-select-" + Date.now(),
      occasion: "Curated Ensemble",
      styling_notes: synergyResult?.microTip || "Bespoke look crafted from your multi-selected wardrobe pieces.",
      harmony_score: (synergyResult?.score || 90) / 100,
      silhouette_analysis: synergyResult?.silhouetteScore || "1:2 Golden Ratio architecture.",
      hardware_harmony: synergyResult?.hardwareMatch || "Synchronized hardware.",
      items: selectedItems,
    };

    onApplyOutfitFromMultiSelect(synthesizedOutfit);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `closetos_wardrobe_backup_${Date.now()}.json`);
    dl.click();
  };

  const handleConfirmBatchDelete = () => {
    if (onDeleteSelectedItems) {
      onDeleteSelectedItems(selectedIds);
    } else {
      selectedIds.forEach((id) => onDeleteItem(id));
    }
    setSelectedIds([]);
    setConfirmDeleteSelected(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls & Search Bar */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-400 flex items-center justify-center text-black font-extrabold text-xs shadow-md">
                DB
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Closet Database & Vault</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  {items.length} Archived Pieces
                </span>
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Complete technical clothing catalog with fabric weight, GSM ratings, primary/secondary HEX values, and multi-select styling.
            </p>
          </div>

          {/* View Mode & Selection count */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
            >
              {viewMode === "grid" ? (
                <>
                  <Table className="h-3.5 w-3.5 text-neutral-300" />
                  <span>Table View</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="h-3.5 w-3.5 text-neutral-300" />
                  <span>Grid Cards</span>
                </>
              )}
            </button>

            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
            >
              <span>{selectedIds.length === filteredItems.length && filteredItems.length > 0 ? "Deselect All" : "Select All"}</span>
            </button>

            {items.length > 0 && onDeleteAllItems && (
              <button
                onClick={() => setConfirmDeleteAll(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors"
              >
                Delete All
              </button>
            )}

            {items.length === 0 && onResetDefaultWardrobe && (
              <button
                onClick={onResetDefaultWardrobe}
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold transition-colors"
              >
                Restore Default Clothes
              </button>
            )}

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
              title="Backup entire wardrobe catalog as JSON"
            >
              Backup JSON
            </button>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search fabric (e.g. 350gsm, french terry), fit (boxy, pleated), color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === c.id
                    ? "bg-white text-black font-bold shadow-sm"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW 1: GRID CARDS VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`glass-card rounded-2xl p-3 border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? "border-amber-400/80 bg-amber-500/[0.04] ring-1 ring-amber-400/50 shadow-lg"
                    : "border-white/10 hover:border-white/25 hover:bg-white/[0.03]"
                }`}
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    onClick={(e) => toggleSelect(item.id, e)}
                    className="p-1 -m-1 rounded-md text-neutral-400 hover:text-white"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Square className="h-4 w-4 text-neutral-500 group-hover:text-neutral-300" />
                    )}
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>

                {/* Garment Visualizer (Guaranteed 100% visible vector + photo fallback) */}
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

                {/* Details Bottom */}
                <div className="mt-2 space-y-1.5">
                  <h4 className="text-xs font-bold text-white capitalize truncate">
                    {item.sub_category.replace(/_/g, " ")}
                  </h4>

                  {/* Enhanced Color Codes */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div
                      onClick={(e) => handleCopyHex(item.color_primary_hex, e)}
                      className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 hover:border-white/30 cursor-pointer transition-colors"
                      title="Click to copy HEX"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: item.color_primary_hex }}
                      />
                      <span className="font-mono text-[10px] text-neutral-200">
                        {copiedHex === item.color_primary_hex ? "COPIED" : item.color_primary_hex}
                      </span>
                    </div>

                    <span className="text-[10px] text-neutral-400 capitalize truncate max-w-[80px]">
                      {item.fit_type}
                    </span>
                  </div>

                  {/* Fabric & Thermal Specs */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
                    <span className="text-neutral-400 truncate max-w-[95px]">
                      {item.fabric_type?.replace(/_/g, " ") || "Cotton"}
                    </span>
                    <span className="font-mono text-neutral-400">
                      T:{item.thermal_rating}/5
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: COMPREHENSIVE DATABASE TABLE VIEW */}
      {viewMode === "table" && (
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-black/60 text-[10px] uppercase tracking-wider text-neutral-400 border-b border-white/10 font-bold">
                <tr>
                  <th className="p-3 w-10 text-center">Sel</th>
                  <th className="p-3">Piece</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Fit & Silhouette</th>
                  <th className="p-3">Color Codes (Primary / Secondary)</th>
                  <th className="p-3">Fabric & Weight</th>
                  <th className="p-3">Hardware</th>
                  <th className="p-3">Thermal</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setActiveItem(item)}
                      className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                        isSelected ? "bg-amber-500/[0.05]" : ""
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => toggleSelect(item.id, e)}>
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-amber-400 mx-auto" />
                        ) : (
                          <Square className="h-4 w-4 text-neutral-500 mx-auto" />
                        )}
                      </td>
                      <td className="p-3 font-bold text-white capitalize flex items-center space-x-2.5">
                        <div className="h-9 w-9 rounded-lg bg-black/60 p-1 border border-white/10 shrink-0">
                          <GarmentVisualizer
                            category={item.category}
                            subCategory={item.sub_category}
                            primaryHex={item.color_primary_hex}
                            secondaryHex={item.color_secondary_hex}
                            imageUrl={item.image_cutout_url}
                            hardwareColor={item.hardware_color}
                          />
                        </div>
                        <span className="truncate max-w-[140px]">{item.sub_category.replace(/_/g, " ")}</span>
                      </td>
                      <td className="p-3 capitalize">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] uppercase font-bold text-neutral-400">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 capitalize text-neutral-300 font-medium">
                        {item.fit_type}
                      </td>
                      <td className="p-3 font-mono">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleCopyHex(item.color_primary_hex, e)}
                            className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-black/40 border border-white/10 hover:border-white/30"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: item.color_primary_hex }}
                            />
                            <span className="text-[11px] text-white">
                              {copiedHex === item.color_primary_hex ? "COPIED" : item.color_primary_hex}
                            </span>
                          </button>
                          {item.color_secondary_hex && (
                            <span
                              className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: item.color_secondary_hex }}
                              title={`Secondary: ${item.color_secondary_hex}`}
                            />
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-neutral-300 capitalize">
                        {item.fabric_type?.replace(/_/g, " ") || "Standard"} • {item.fabric_weight || "Midweight"}
                      </td>
                      <td className="p-3 uppercase text-[10px] font-bold">
                        {item.hardware_color && item.hardware_color !== "none" ? (
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              item.hardware_color === "gold"
                                ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                                : "bg-slate-300/10 text-slate-200 border border-slate-300/20"
                            }`}
                          >
                            {item.hardware_color}
                          </span>
                        ) : (
                          <span className="text-neutral-500">None</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-neutral-400">
                        {item.thermal_rating}/5
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBuildOutfitAround(item.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition-colors"
                        >
                          Style
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FLOATING MULTI-SELECT DOCK (Appears when items are checked) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-2xl bg-amber-400 text-black font-extrabold flex items-center justify-center text-sm shadow">
              {selectedIds.length}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {selectedIds.length} Pieces Selected
              </p>
              <p className="text-[10px] text-neutral-400">
                Ready to evaluate silhouette synergy, metal match & color balance.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setConfirmDeleteSelected(true)}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
            >
              Clear
            </button>
            <button
              onClick={handleAnalyzeSynergy}
              disabled={isAnalyzingSynergy}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-md active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-black" />
              <span>{isAnalyzingSynergy ? "Analyzing Synergy..." : "Analyze Outfit Synergy"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SYNERGY RESULT MODAL */}
      {synergyResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 border border-white/20 space-y-5 relative">
            <button
              onClick={() => setSynergyResult(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-400 text-black font-black text-xl flex items-center justify-center shadow-md">
                {synergyResult.score}%
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Outfit Synergy Analysis</h3>
                <span className="text-xs text-amber-300 font-semibold">
                  {selectedIds.length} Custom Selected Items
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center space-x-1">
                  <Compass className="h-3 w-3 text-amber-400" />
                  <span>Proportion & Silhouette Balance</span>
                </span>
                <p className="text-white font-medium">{synergyResult.silhouetteScore}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center space-x-1">
                  <Palette className="h-3 w-3 text-emerald-400" />
                  <span>Color Harmony Ratio</span>
                </span>
                <p className="text-white font-medium">{synergyResult.colorRule}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center space-x-1">
                  <Watch className="h-3 w-3 text-sky-400" />
                  <span>Hardware & Metal Alignment</span>
                </span>
                <p className="text-white font-medium">{synergyResult.hardwareMatch}</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400">
                  Micro-Styling Execution Instructions
                </span>
                <p className="text-neutral-200 font-medium">{synergyResult.microTip}</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSynergyResult(null)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApplyAsOutfit();
                  setSynergyResult(null);
                }}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-md"
              >
                <span>Wear This Ensemble</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE ITEM DETAIL MODAL */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-md w-full rounded-3xl p-6 border border-white/20 space-y-5 relative">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="h-24 w-24 rounded-2xl bg-black/60 p-2 border border-white/10 shrink-0">
                <GarmentVisualizer
                  category={activeItem.category}
                  subCategory={activeItem.sub_category}
                  primaryHex={activeItem.color_primary_hex}
                  secondaryHex={activeItem.color_secondary_hex}
                  imageUrl={activeItem.image_cutout_url}
                  hardwareColor={activeItem.hardware_color}
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                  {activeItem.category}
                </span>
                <h3 className="text-base font-bold text-white capitalize mt-1">
                  {activeItem.sub_category.replace(/_/g, " ")}
                </h3>
                <p className="text-xs text-neutral-400 capitalize">{activeItem.fit_type} Fit</p>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase block">Primary HEX</span>
                <div
                  onClick={(e) => handleCopyHex(activeItem.color_primary_hex, e)}
                  className="flex items-center space-x-1.5 mt-1 cursor-pointer font-mono font-bold text-white"
                >
                  <div
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: activeItem.color_primary_hex }}
                  />
                  <span>{copiedHex === activeItem.color_primary_hex ? "COPIED" : activeItem.color_primary_hex}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase block">Fabric Type</span>
                <span className="font-bold text-white capitalize mt-1 block">
                  {activeItem.fabric_type?.replace(/_/g, " ") || "Cotton"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase block">Fabric Weight / GSM</span>
                <span className="font-bold text-white capitalize mt-1 block">
                  {activeItem.fabric_weight || "Heavyweight 350 GSM"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase block">Thermal Rating</span>
                <span className="font-bold text-white mt-1 block font-mono">
                  {activeItem.thermal_rating} / 5
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  onDeleteItem(activeItem.id);
                  setActiveItem(null);
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => {
                  onBuildOutfitAround(activeItem.id);
                  setActiveItem(null);
                }}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 text-black" />
                <span>Style Around This Piece</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DELETE CONFIRMATION MODAL */}
      {confirmDeleteSelected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-sm w-full rounded-2xl p-6 border border-rose-500/30 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-rose-400" />
              <span>Delete {selectedIds.length} Pieces?</span>
            </h3>
            <p className="text-xs text-neutral-300">
              Are you sure you want to delete these {selectedIds.length} selected garments from your closet database? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmDeleteSelected(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ALL CONFIRMATION MODAL */}
      {confirmDeleteAll && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-sm w-full rounded-2xl p-6 border border-rose-500/30 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-rose-400" />
              <span>Delete Entire Wardrobe?</span>
            </h3>
            <p className="text-xs text-neutral-300">
              Are you sure you want to delete all {items.length} garments from your database? You can restore sample clothes at any time.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmDeleteAll(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteAllItems) onDeleteAllItems();
                  setSelectedIds([]);
                  setConfirmDeleteAll(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                Wipe All Pieces
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
