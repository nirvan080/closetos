"use client";

import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Layers,
  Move,
  Trash2,
  Download,
  Plus,
  Check,
  Maximize2,
  Minimize2,
  ArrowUp,
  ArrowDown,
  Tag,
  Shuffle
} from "lucide-react";
import { ClothingItem, Outfit } from "@/types";
import { GarmentVisualizer } from "./GarmentVisualizer";

interface CanvasItem {
  instanceId: string;
  item: ClothingItem;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

interface OutfitCanvasProps {
  items: ClothingItem[];
  onSaveOutfit: (outfit: Outfit) => void;
  onNavigateToStylist: () => void;
}

export const OutfitCanvas: React.FC<OutfitCanvasProps> = ({
  items,
  onSaveOutfit,
  onNavigateToStylist,
}) => {
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([
    // Pre-populate with first top, bottom, shoes if available
    ...(items.filter((i) => i.category === "top").slice(0, 1).map((item, idx) => ({
      instanceId: `item-${Date.now()}-${idx}`,
      item,
      x: 35,
      y: 15,
      scale: 1.1,
      zIndex: 2,
    }))),
    ...(items.filter((i) => i.category === "bottom").slice(0, 1).map((item, idx) => ({
      instanceId: `item-${Date.now()}-bot-${idx}`,
      item,
      x: 35,
      y: 50,
      scale: 1.0,
      zIndex: 1,
    }))),
  ]);

  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [activeBoardStyle, setActiveBoardStyle] = useState<"noir" | "concrete" | "oatmeal" | "whiteboard">("noir");
  const [canvasStickers, setCanvasStickers] = useState<string[]>(["1:2 Golden Ratio", "Korean Minimal"]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [saveToast, setSaveToast] = useState(false);

  const boardBackgrounds = {
    noir: "bg-[#090a0f] border-white/10",
    concrete: "bg-neutral-900 border-neutral-700",
    oatmeal: "bg-[#171615] border-amber-950/40",
    whiteboard: "bg-neutral-100 text-black border-neutral-300",
  };

  const stickerOptions = [
    "1:2 Golden Ratio",
    "Korean Minimal",
    "Himalayan Layering",
    "Date Night",
    "Streetwear Drape",
    "Power Suiting",
    "Monochrome",
  ];

  const handleAddItemToCanvas = (item: ClothingItem) => {
    const newItem: CanvasItem = {
      instanceId: `item-${Date.now()}-${Math.random()}`,
      item,
      x: 25 + Math.random() * 30,
      y: 20 + Math.random() * 30,
      scale: 1.0,
      zIndex: canvasItems.length + 1,
    };
    setCanvasItems((prev) => [...prev, newItem]);
    setSelectedInstanceId(newItem.instanceId);
  };

  const handleRemoveItem = (instanceId: string) => {
    setCanvasItems((prev) => prev.filter((i) => i.instanceId !== instanceId));
    if (selectedInstanceId === instanceId) setSelectedInstanceId(null);
  };

  const handleScale = (delta: number) => {
    if (!selectedInstanceId) return;
    setCanvasItems((prev) =>
      prev.map((i) => {
        if (i.instanceId === selectedInstanceId) {
          const newScale = Math.max(0.5, Math.min(2.0, i.scale + delta));
          return { ...i, scale: newScale };
        }
        return i;
      })
    );
  };

  const handleZIndex = (dir: "up" | "down") => {
    if (!selectedInstanceId) return;
    setCanvasItems((prev) =>
      prev.map((i) => {
        if (i.instanceId === selectedInstanceId) {
          return { ...i, zIndex: dir === "up" ? i.zIndex + 2 : Math.max(0, i.zIndex - 2) };
        }
        return i;
      })
    );
  };

  const handleRandomizeCollage = () => {
    setCanvasItems((prev) =>
      prev.map((i, idx) => ({
        ...i,
        x: 15 + (idx % 3) * 28 + (Math.random() * 8 - 4),
        y: 10 + Math.floor(idx / 3) * 35 + (Math.random() * 8 - 4),
        scale: 0.9 + Math.random() * 0.3,
      }))
    );
  };

  const toggleSticker = (sticker: string) => {
    setCanvasStickers((prev) =>
      prev.includes(sticker) ? prev.filter((s) => s !== sticker) : [...prev, sticker]
    );
  };

  const handleSaveCollageOutfit = () => {
    if (canvasItems.length === 0) return;
    const itemsList = canvasItems.map((ci) => ci.item);
    const top = itemsList.find((i) => i.category === "top" || i.category === "outerwear");
    const bottom = itemsList.find((i) => i.category === "bottom");
    const shoes = itemsList.find((i) => i.category === "footwear");
    const accessories = itemsList.filter((i) => i.category === "accessory" || i.category === "watch");

    const newOutfit: Outfit = {
      id: `canvas-${Date.now()}`,
      user_id: "default-user",
      occasion: canvasStickers[0] || "Custom Collage",
      aesthetic_vibe: "freeform_canvas",
      weather_condition: {
        temp_c: 13.8,
        feels_like_c: 12.5,
        condition: "Himalayan Studio",
        humidity: 62,
        wind_speed_kmh: 12,
        rain_probability: 0.05,
      },
      items: itemsList,
      item_ids: itemsList.map((i) => i.id),
      silhouette_analysis: "Custom freeform collage styled on Polyvore canvas.",
      hardware_harmony: "Curated with synchronized aesthetics.",
      styling_notes: `Bespoke combination composed on the freeform canvas with ${canvasStickers.join(", ")}.`,
      micro_styling: [
        {
          action: "Layer as arranged on the moodboard canvas",
          reason: "Preserves user-defined optical hierarchy",
          target_item: top ? top.sub_category : "Top",
        },
      ],
      harmony_score: 96,
      created_at: new Date().toISOString(),
    };

    onSaveOutfit(newOutfit);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const filteredDrawerItems =
    selectedCategoryFilter === "all"
      ? items
      : items.filter((i) => i.category.toLowerCase() === selectedCategoryFilter.toLowerCase());

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-500 to-amber-400 flex items-center justify-center text-black font-black text-xs shadow-md">
              PV
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Freeform Outfit Canvas Studio
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-neutral-300">
              POLYVORE COLLAGE
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Drag, resize, layer and compose magazine-style collages with your transparent cutout garments.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRandomizeCollage}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-colors"
            title="Auto-arrange layout"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            onClick={handleSaveCollageOutfit}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-md active:scale-95"
          >
            {saveToast ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Saved as Outfit!</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-black" />
                <span>Save This Collage</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CANVAS CONTROLS BAR */}
      <div className="glass-card rounded-2xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Board Background Themes */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-neutral-400">Board Backdrop:</span>
          {(["noir", "concrete", "oatmeal", "whiteboard"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveBoardStyle(mode)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                activeBoardStyle === mode
                  ? "bg-white text-black font-bold shadow"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Selected Item Floating Controls */}
        {selectedInstanceId && (
          <div className="flex items-center space-x-1.5 bg-white/10 px-2.5 py-1 rounded-xl">
            <span className="text-[11px] text-neutral-300 font-semibold mr-1">Piece Controls:</span>
            <button
              onClick={() => handleScale(0.15)}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
              title="Scale Up"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleScale(-0.15)}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
              title="Scale Down"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleZIndex("up")}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
              title="Bring Forward"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleZIndex("down")}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
              title="Send Backward"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleRemoveItem(selectedInstanceId)}
              className="p-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 ml-1"
              title="Remove from Canvas"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* MAIN CANVAS BOARD */}
      <div
        className={`relative w-full h-[460px] sm:h-[540px] rounded-3xl border shadow-2xl overflow-hidden transition-all ${boardBackgrounds[activeBoardStyle]}`}
        onClick={() => setSelectedInstanceId(null)}
      >
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

        {/* Floating Aesthetic Stickers */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
          {canvasStickers.map((sticker, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase shadow-lg"
            >
              ✦ {sticker}
            </span>
          ))}
        </div>

        {/* Empty state hint */}
        {canvasItems.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
            <Layers className="h-10 w-10 opacity-40" />
            <p className="text-sm font-semibold">Your Collage Canvas is Empty</p>
            <p className="text-xs">Tap any garment in the drawer below to place it onto your board.</p>
          </div>
        )}

        {/* Garments on the Canvas */}
        {canvasItems.map((ci) => {
          const isSelected = selectedInstanceId === ci.instanceId;
          return (
            <div
              key={ci.instanceId}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInstanceId(ci.instanceId);
              }}
              style={{
                position: "absolute",
                left: `${ci.x}%`,
                top: `${ci.y}%`,
                transform: `scale(${ci.scale})`,
                zIndex: ci.zIndex,
                cursor: "grab",
              }}
              className={`transition-shadow p-2 select-none group ${
                isSelected
                  ? "ring-2 ring-amber-400/80 rounded-2xl bg-white/[0.04] shadow-2xl cursor-grabbing"
                  : "hover:scale-[1.03]"
              }`}
            >
              <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                <GarmentVisualizer
                  category={ci.item.category}
                  subCategory={ci.item.sub_category}
                  primaryHex={ci.item.color_primary_hex}
                  secondaryHex={ci.item.color_secondary_hex}
                  imageUrl={ci.item.image_cutout_url}
                  hardwareColor={ci.item.hardware_color}
                />
              </div>

              {isSelected && (
                <div className="absolute -top-3 -right-3 flex items-center space-x-1 bg-black/80 rounded-full px-2 py-0.5 border border-white/20 text-[9px] font-mono text-white">
                  <span>{(ci.scale * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STICKER TAG CHIPS SELECTOR */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
          <Tag className="h-3.5 w-3.5 text-amber-400" />
          <span>Add Moodboard Aesthetic Stickers</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {stickerOptions.map((st) => {
            const active = canvasStickers.includes(st);
            return (
              <button
                key={st}
                onClick={() => toggleSticker(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-amber-400 text-black font-bold shadow"
                    : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {active ? `✓ ${st}` : `+ ${st}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* WARDROBE DRAWER AT BOTTOM */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Tap to Drop Garment Onto Canvas</h3>
            <p className="text-xs text-neutral-400">
              Tap any archived piece from your closet to place it onto the active styling collage.
            </p>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto text-xs">
            {["all", "top", "bottom", "outerwear", "footwear", "accessory"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                  selectedCategoryFilter === cat
                    ? "bg-white text-black font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Scrollable Pieces */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
          {filteredDrawerItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAddItemToCanvas(item)}
              className="w-24 shrink-0 p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.08] cursor-pointer transition-all flex flex-col items-center text-center space-y-1.5 group"
            >
              <div className="w-16 h-16 flex items-center justify-center">
                <GarmentVisualizer
                  category={item.category}
                  subCategory={item.sub_category}
                  primaryHex={item.color_primary_hex}
                  secondaryHex={item.color_secondary_hex}
                  imageUrl={item.image_cutout_url}
                  hardwareColor={item.hardware_color}
                />
              </div>
              <span className="text-[10px] text-white font-bold truncate w-full capitalize">
                {item.sub_category.replace(/_/g, " ")}
              </span>
              <span className="text-[9px] text-amber-400 flex items-center space-x-0.5">
                <Plus className="h-2.5 w-2.5" />
                <span>Add</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
