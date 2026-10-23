"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Luggage,
  Sparkles,
  Check,
  Plus,
  Trash2,
  CloudSun,
  Shirt,
  Compass,
  CheckCircle2,
  Flame,
  ArrowRight
} from "lucide-react";
import { ClothingItem, Outfit, WeatherCondition } from "@/types";
import { GarmentVisualizer } from "./GarmentVisualizer";

interface OutfitPlannerAndPackerProps {
  items: ClothingItem[];
  outfit: Outfit | null;
  weather: WeatherCondition;
  onApplyOutfit: (outfit: Outfit) => void;
}

interface CalendarDay {
  dayName: string;
  dateStr: string;
  weatherTemp: number;
  condition: string;
  assignedOutfitName?: string;
  assignedOutfitItems?: ClothingItem[];
  isToday?: boolean;
}

interface PackingItem {
  id: string;
  item: ClothingItem;
  isPacked: boolean;
  notes?: string;
}

export const OutfitPlannerAndPacker: React.FC<OutfitPlannerAndPackerProps> = ({
  items,
  outfit,
  weather,
  onApplyOutfit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"calendar" | "packer" | "analytics">("calendar");

  // Weekly Calendar state
  const [calendarSchedule, setCalendarSchedule] = useState<CalendarDay[]>([
    { dayName: "Monday", dateStr: "Oct 27", weatherTemp: 14, condition: "Crisp Breeze", isToday: true, assignedOutfitName: "Korean Minimal Boxy Fit" },
    { dayName: "Tuesday", dateStr: "Oct 28", weatherTemp: 13, condition: "Clear Sky", assignedOutfitName: "Earth Tone Terracotta Knit" },
    { dayName: "Wednesday", dateStr: "Oct 29", weatherTemp: 12, condition: "Himalayan Mist", assignedOutfitName: "Charcoal Workwear Layer" },
    { dayName: "Thursday", dateStr: "Oct 30", weatherTemp: 15, condition: "Sunny Highs" },
    { dayName: "Friday", dateStr: "Oct 31", weatherTemp: 14, condition: "Date Night Chill", assignedOutfitName: "Monochrome Tailored Look" },
    { dayName: "Saturday", dateStr: "Nov 01", weatherTemp: 11, condition: "Alpine Trek" },
    { dayName: "Sunday", dateStr: "Nov 02", weatherTemp: 13, condition: "Relaxed Cafe" },
  ]);

  // Trip Packing state
  const [tripDestination, setTripDestination] = useState("3-Day Trip to Delhi / Nainital");
  const [tripDays, setTripDays] = useState(3);
  const [tripWeather, setTripWeather] = useState<"cold" | "moderate" | "warm">("cold");
  const [packingList, setPackingList] = useState<PackingItem[]>([]);

  // Wear Count tracker
  const [wearCounts, setWearCounts] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("closetos_wear_counts_v2");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Generate optimal packing list based on trip duration and weather
  const generateTripPackingList = () => {
    const neededTops = Math.min(items.filter((i) => i.category === "top").length, tripDays);
    const neededBottoms = Math.min(items.filter((i) => i.category === "bottom").length, Math.ceil(tripDays / 2));
    const neededOuterwear = tripWeather === "cold" ? 1 : 0;
    const neededShoes = Math.min(items.filter((i) => i.category === "footwear").length, 2);

    const selectedTops = items.filter((i) => i.category === "top").slice(0, neededTops);
    const selectedBottoms = items.filter((i) => i.category === "bottom").slice(0, neededBottoms);
    const selectedOuter = items.filter((i) => i.category === "outerwear").slice(0, neededOuterwear);
    const selectedShoes = items.filter((i) => i.category === "footwear").slice(0, neededShoes);

    const packed: PackingItem[] = [
      ...selectedTops.map((it) => ({ id: `pack-${it.id}`, item: it, isPacked: false, notes: "Versatile Top" })),
      ...selectedBottoms.map((it) => ({ id: `pack-${it.id}`, item: it, isPacked: false, notes: "High-waisted Bottom" })),
      ...selectedOuter.map((it) => ({ id: `pack-${it.id}`, item: it, isPacked: false, notes: "Thermal Outerwear" })),
      ...selectedShoes.map((it) => ({ id: `pack-${it.id}`, item: it, isPacked: false, notes: "Comfort Walking Shoes" })),
    ];

    setPackingList(packed);
    showToast(`Generated ${packed.length} essential pieces for your ${tripDays}-day journey!`);
  };

  useEffect(() => {
    if (items.length > 0 && packingList.length === 0) {
      generateTripPackingList();
    }
  }, [items]);

  const togglePacked = (id: string) => {
    setPackingList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPacked: !p.isPacked } : p))
    );
  };

  const handleLogWear = (itemId: string) => {
    const updated = { ...wearCounts, [itemId]: (wearCounts[itemId] || 0) + 1 };
    setWearCounts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("closetos_wear_counts_v2", JSON.stringify(updated));
    }
    showToast("Recorded outfit wear in your wardrobe log!");
  };

  const packedCount = packingList.filter((p) => p.isPacked).length;
  const packedPercent = packingList.length > 0 ? Math.round((packedCount / packingList.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-black font-black text-xs shadow-md">
              PL
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Outfit Calendar & Trip Packing Vault
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-neutral-300">
              PLAN AHEAD
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Schedule your fits across the week, plan luggage for upcoming journeys, and track cost-per-wear analytics.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center space-x-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab("calendar")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeSubTab === "calendar" ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"
            }`}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => setActiveSubTab("packer")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeSubTab === "packer" ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"
            }`}
          >
            Trip Packer ({packedPercent}%)
          </button>
          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeSubTab === "analytics" ? "bg-white text-black shadow" : "text-neutral-400 hover:text-white"
            }`}
          >
            Wear Tracking
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. WEEKLY OUTFIT CALENDAR */}
      {activeSubTab === "calendar" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {calendarSchedule.map((day, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  day.isToday
                    ? "bg-amber-500/[0.08] border-amber-400/60 ring-1 ring-amber-400/30"
                    : "glass-card border-white/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{day.dayName}</span>
                    {day.isToday && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black uppercase">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400">{day.dateStr}</span>

                  <div className="flex items-center space-x-1.5 mt-2 text-xs text-neutral-300">
                    <CloudSun className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>{day.weatherTemp}°C</span>
                    <span className="text-[10px] text-neutral-400 truncate">({day.condition})</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-neutral-400 block">
                    Assigned Fit
                  </span>
                  {day.assignedOutfitName ? (
                    <p className="text-xs text-white font-bold leading-tight line-clamp-2">
                      {day.assignedOutfitName}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500 italic">No fit scheduled</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (outfit && day.isToday) {
                      outfit.items.forEach((i) => handleLogWear(i.id));
                    } else {
                      showToast(`Assigned today's ensemble to ${day.dayName}!`);
                    }
                  }}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    day.isToday
                      ? "bg-amber-400 text-black hover:bg-amber-300 shadow"
                      : "bg-white/5 text-neutral-300 hover:bg-white/15"
                  }`}
                >
                  {day.isToday ? "Log Worn Today" : "Assign Current Fit"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TRIP PACKING ASSISTANT */}
      {activeSubTab === "packer" && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Luggage className="h-4 w-4 text-amber-400" />
                  <span>Luggage & Suitcase Packing Assistant</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Algorithmic capsule packing ensures 100% outfit synergy with zero luggage over-weight.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-neutral-300 font-bold">
                  {packedCount} of {packingList.length} packed
                </span>
                <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all"
                    style={{ width: `${packedPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Trip Config Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400">Destination Name</label>
                <input
                  type="text"
                  value={tripDestination}
                  onChange={(e) => setTripDestination(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400">Duration (Days)</label>
                <select
                  value={tripDays}
                  onChange={(e) => setTripDays(Number(e.target.value))}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white"
                >
                  <option value={2}>2 Days (Weekend Escape)</option>
                  <option value={3}>3 Days (City Mini-Break)</option>
                  <option value={5}>5 Days (Week Expedition)</option>
                  <option value={7}>7 Days (Full Holiday)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400">Destination Climate</label>
                <select
                  value={tripWeather}
                  onChange={(e) => setTripWeather(e.target.value as any)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-white capitalize"
                >
                  <option value="cold">Crisp / Alpine (Requires Outerwear)</option>
                  <option value="moderate">Moderate / Autumn (Layered)</option>
                  <option value="warm">Sunny / Tropical (Lightweight)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={generateTripPackingList}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow"
              >
                <Sparkles className="h-3.5 w-3.5 text-black" />
                <span>Re-Calculate Optimal Luggage</span>
              </button>
            </div>
          </div>

          {/* Packing Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {packingList.map((pack) => (
              <div
                key={pack.id}
                onClick={() => togglePacked(pack.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  pack.isPacked
                    ? "bg-emerald-500/[0.08] border-emerald-500/40 opacity-75"
                    : "glass-card border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0">
                    <GarmentVisualizer
                      category={pack.item.category}
                      subCategory={pack.item.sub_category}
                      primaryHex={pack.item.color_primary_hex}
                      secondaryHex={pack.item.color_secondary_hex}
                      imageUrl={pack.item.image_cutout_url}
                      hardwareColor={pack.item.hardware_color}
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white capitalize">
                      {pack.item.sub_category.replace(/_/g, " ")}
                    </h4>
                    <p className="text-[10px] text-neutral-400 capitalize">{pack.notes}</p>
                  </div>
                </div>

                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all ${
                    pack.isPacked
                      ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                      : "border-white/20 bg-white/5"
                  }`}
                >
                  {pack.isPacked && <Check className="h-3.5 w-3.5" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WARDROBE WEAR ANALYTICS */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Wardrobe Utilization & Wear Tracker</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Identifies your core staples vs. under-utilized pieces to maximize cost-per-wear ROI.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase block">Total Pieces</span>
                <span className="text-base font-bold text-white mt-1 block">{items.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase block">Active Wear Logs</span>
                <span className="text-base font-bold text-amber-400 mt-1 block">
                  {Object.values(wearCounts).reduce((a, b) => a + b, 0)} Wears
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase block">Wardrobe Health</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">94% Cohesion</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase block">1:2 Ratio Balance</span>
                <span className="text-base font-bold text-sky-400 mt-1 block">Optimal</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.map((item) => {
              const count = wearCounts[item.id] || 0;
              return (
                <div key={item.id} className="glass-card rounded-2xl p-3 border border-white/10 space-y-2 text-center">
                  <div className="h-20 w-20 mx-auto flex items-center justify-center">
                    <GarmentVisualizer
                      category={item.category}
                      subCategory={item.sub_category}
                      primaryHex={item.color_primary_hex}
                      secondaryHex={item.color_secondary_hex}
                      imageUrl={item.image_cutout_url}
                      hardwareColor={item.hardware_color}
                    />
                  </div>
                  <h4 className="text-xs font-bold text-white capitalize truncate">{item.sub_category.replace(/_/g, " ")}</h4>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-amber-300 font-bold">
                      {count} {count === 1 ? "Wear" : "Wears"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleLogWear(item.id)}
                    className="w-full py-1 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 text-[10px] font-semibold transition-colors"
                  >
                    + Log Wear
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
