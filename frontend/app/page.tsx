"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { WeatherWidget } from "@/components/WeatherWidget";
import { StylingStudio } from "@/components/StylingStudio";
import { ClosetDatabase } from "@/components/ClosetDatabase";
import { AICoPilot } from "@/components/AICoPilot";
import { FaceSkinStudio } from "@/components/FaceSkinStudio";
import { WardrobeDigitizer } from "@/components/WardrobeDigitizer";
import { SchemaModal } from "@/components/SchemaModal";
import { ShareModal } from "@/components/ShareModal";
import {
  ClothingItem,
  Outfit,
  WeatherCondition,
  BodyTypeProfile
} from "@/types";
import { apiFetch } from "@/lib/api";
import { RefreshCw, Sparkles } from "lucide-react";

const DEFAULT_WEATHER: WeatherCondition = {
  temp_c: 13.8,
  feels_like_c: 12.5,
  condition: "Crisp Himalayan Breeze",
  humidity: 62,
  wind_speed_kmh: 12.0,
  rain_probability: 0.05,
  city: "Pithoragarh, Uttarakhand",
};

const DEFAULT_BODY_PROFILE: BodyTypeProfile = {
  height_cm: 178.0,
  weight_kg: 72.0,
  body_type: "inverted_triangle",
  facial_shape: "oval",
  skin_undertone: "warm",
  skin_hex: "#D59B63",
  build_type: "athletic",
  preferred_silhouette: "boxy_cropped",
  chest_in: 40,
  waist_in: 32,
  suit_lapel_style: "notch",
  suit_button_stance: "2_button",
  suit_trouser_pleat: "single_reverse_pleat",
  suit_trouser_break: "no_break",
  suit_fabric_pref: "worsted_wool_super120",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("styling");
  const [backgroundStatus, setBackgroundStatus] = useState<string | null>(null);

  // Zero-Latency LocalStorage Caching for instant 0ms mobile launch
  const [items, setItems] = useState<ClothingItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("closetos_items_v2");
        if (cached) return JSON.parse(cached);
      } catch (e) {
        console.warn("Could not read cached items", e);
      }
    }
    return [];
  });

  const [weather, setWeather] = useState<WeatherCondition>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("closetos_weather_v2");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return DEFAULT_WEATHER;
  });

  const [bodyProfile, setBodyProfile] = useState<BodyTypeProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("closetos_profile_v2");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return DEFAULT_BODY_PROFILE;
  });

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [skinUndertoneFilter, setSkinUndertoneFilter] = useState<string | null>(null);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Background fetch to refresh data without blocking UI
  useEffect(() => {
    fetchItems();
    fetchWeather();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await apiFetch("/api/v1/wardrobe/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("closetos_items_v2", JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const fetchWeather = async (preset?: string) => {
    try {
      const url = preset
        ? `/api/v1/weather/current?preset=${preset}`
        : "/api/v1/weather/current";
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("closetos_weather_v2", JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Error fetching weather:", err);
    }
  };

  const handleUpdateBodyProfile = (updated: BodyTypeProfile) => {
    setBodyProfile(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("closetos_profile_v2", JSON.stringify(updated));
    }
  };

  const handleGenerateOutfit = async (
    occasion: string,
    preferredHardware?: string,
    aestheticVibe?: string
  ) => {
    setIsGeneratingOutfit(true);
    try {
      const res = await apiFetch("/api/v1/styling/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          aesthetic_vibe: aestheticVibe || "korean_minimal",
          weather,
          body_profile: bodyProfile,
          preferred_hardware: preferredHardware,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOutfit(data);
      }
    } catch (err) {
      console.error("Error generating outfit:", err);
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  // Generate outfit on initial load once items are loaded (or if cached)
  useEffect(() => {
    if (items.length >= 2 && !outfit) {
      handleGenerateOutfit("coding", "silver", "korean_minimal");
    }
  }, [items]);

  const handleItemIngested = (newItem: ClothingItem) => {
    setItems((prev) => {
      const updated = [newItem, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("closetos_items_v2", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setItems((prev) => {
        const updated = prev.filter((it) => it.id !== itemId);
        if (typeof window !== "undefined") {
          localStorage.setItem("closetos_items_v2", JSON.stringify(updated));
        }
        return updated;
      });
      apiFetch(`/api/v1/wardrobe/items/${itemId}`, { method: "DELETE" }).catch(console.error);
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleDeleteSelectedItems = async (ids: string[]) => {
    try {
      setItems((prev) => {
        const updated = prev.filter((it) => !ids.includes(it.id));
        if (typeof window !== "undefined") {
          localStorage.setItem("closetos_items_v2", JSON.stringify(updated));
        }
        return updated;
      });
      for (const id of ids) {
        apiFetch(`/api/v1/wardrobe/items/${id}`, { method: "DELETE" }).catch(console.error);
      }
    } catch (err) {
      console.error("Error in batch delete:", err);
    }
  };

  const handleDeleteAllItems = async () => {
    try {
      const allIds = items.map((it) => it.id);
      setItems([]);
      if (typeof window !== "undefined") {
        localStorage.setItem("closetos_items_v2", JSON.stringify([]));
      }
      for (const id of allIds) {
        apiFetch(`/api/v1/wardrobe/items/${id}`, { method: "DELETE" }).catch(console.error);
      }
    } catch (err) {
      console.error("Error deleting all items:", err);
    }
  };

  const handleResetDefaultWardrobe = async () => {
    try {
      const res = await apiFetch("/api/v1/wardrobe/seed?force=true", { method: "POST" });
      if (res.ok) {
        await fetchItems();
        handleGenerateOutfit("coding", "silver", "korean_minimal");
      }
    } catch (err) {
      console.error("Error resetting wardrobe:", err);
    }
  };

  const handleBuildOutfitAround = (itemId: string) => {
    setActiveTab("styling");
    handleGenerateOutfit("coding", "silver", "korean_minimal");
  };

  const handleApplyOutfitFromDatabase = (synthesizedOutfit: Outfit) => {
    setOutfit(synthesizedOutfit);
    setActiveTab("styling");
  };

  const handleFilterClosetForTone = (undertone: string) => {
    setSkinUndertoneFilter(undertone);
    setActiveTab("database");
  };

  const handleStartBackgroundTask = (taskName: string) => {
    setBackgroundStatus(taskName);
    setTimeout(() => {
      setBackgroundStatus(null);
    }, 10000);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black pb-20 md:pb-0">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.10),rgba(255,255,255,0))]" />
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-30" />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weather={weather}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        backgroundStatus={backgroundStatus}
      />

      {/* Mobile Floating Background Task Indicator */}
      {backgroundStatus && (
        <div className="sm:hidden fixed top-20 right-4 z-40 px-3 py-1.5 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center space-x-1.5 shadow-xl animate-bounce">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span className="truncate max-w-[200px]">{backgroundStatus}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Weather Simulator (Show in Styling tab) */}
        {activeTab === "styling" && (
          <WeatherWidget
            weather={weather}
            onUpdateWeather={setWeather}
            onSelectPreset={(presetId) => fetchWeather(presetId)}
          />
        )}

        {/* 1. STYLIST TAB */}
        {activeTab === "styling" && (
          <StylingStudio
            outfit={outfit}
            isLoading={isGeneratingOutfit}
            onGenerateOutfit={handleGenerateOutfit}
            weather={weather}
            bodyProfile={bodyProfile}
          />
        )}

        {/* 2. CLOSET DATABASE & MULTI-SELECT BUILDER TAB */}
        {activeTab === "database" && (
          <ClosetDatabase
            items={items}
            onDeleteItem={handleDeleteItem}
            onDeleteSelectedItems={handleDeleteSelectedItems}
            onDeleteAllItems={handleDeleteAllItems}
            onResetDefaultWardrobe={handleResetDefaultWardrobe}
            onBuildOutfitAround={handleBuildOutfitAround}
            onApplyOutfitFromMultiSelect={handleApplyOutfitFromDatabase}
            skinUndertoneFilter={skinUndertoneFilter}
          />
        )}

        {/* 3. AI STYLIST HELPER & RECOMMENDER TAB */}
        {activeTab === "ai-chat" && (
          <AICoPilot
            bodyProfile={bodyProfile}
            weather={weather}
            onApplyOutfit={(newOutfit) => {
              setOutfit(newOutfit);
              setActiveTab("styling");
            }}
          />
        )}

        {/* 4. FACE, SKIN & SUITING DNA STUDIO TAB */}
        {activeTab === "face-skin" && (
          <FaceSkinStudio
            bodyProfile={bodyProfile}
            onUpdateBodyProfile={handleUpdateBodyProfile}
            onNavigateToDatabaseWithFilter={handleFilterClosetForTone}
          />
        )}

        {/* 5. DIGITIZER (ADD PIECE WITH CAMERA & BATCH UPLOAD) TAB */}
        {activeTab === "digitizer" && (
          <WardrobeDigitizer
            onItemIngested={handleItemIngested}
            onNavigateToVault={() => setActiveTab("database")}
            onStartBackgroundTask={handleStartBackgroundTask}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-5 text-center text-xs text-neutral-500 bg-black/40 hidden md:block">
        <p>ClosetOS — AI Wardrobe Architecture & Proportion Reasoning Engine</p>
        <p className="text-[11px] text-neutral-600 mt-1">
          OpenCV Auto-White-Balance • Morphological Facial Alignment • Suiting Drop & 1:2 Golden Ratio
        </p>
      </footer>

      {/* Supabase Schema Modal */}
      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

      {/* Share with Friends Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lanIp="192.168.29.207"
      />
    </div>
  );
}
