"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { WeatherWidget } from "@/components/WeatherWidget";
import { StylingStudio } from "@/components/StylingStudio";
import { ClosetDatabase } from "@/components/ClosetDatabase";
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
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("styling");

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
    setActiveTab("database");
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await apiFetch(`/api/v1/wardrobe/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => {
          const updated = prev.filter((it) => it.id !== itemId);
          if (typeof window !== "undefined") {
            localStorage.setItem("closetos_items_v2", JSON.stringify(updated));
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Error deleting item:", err);
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

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black pb-16 md:pb-0">
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
      />

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
            onBuildOutfitAround={handleBuildOutfitAround}
            onApplyOutfitFromMultiSelect={handleApplyOutfitFromDatabase}
            skinUndertoneFilter={skinUndertoneFilter}
          />
        )}

        {/* 3. FACE & SKIN DNA STUDIO TAB */}
        {activeTab === "face-skin" && (
          <FaceSkinStudio
            bodyProfile={bodyProfile}
            onUpdateBodyProfile={handleUpdateBodyProfile}
            onNavigateToDatabaseWithFilter={handleFilterClosetForTone}
          />
        )}

        {/* 4. DIGITIZER (ADD PIECE) TAB */}
        {activeTab === "digitizer" && (
          <WardrobeDigitizer
            onItemIngested={handleItemIngested}
            onNavigateToVault={() => setActiveTab("database")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-5 text-center text-xs text-neutral-500 bg-black/40 hidden md:block">
        <p>ClosetOS — AI Wardrobe Architecture & Proportion Reasoning Engine</p>
        <p className="text-[11px] text-neutral-600 mt-1">
          OpenCV Auto-White-Balance • Morphological Facial Alignment • Vector Embeddings • Golden 1:2 Silhouette Ratio
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
