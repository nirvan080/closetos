"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { WeatherWidget } from "@/components/WeatherWidget";
import { StylingStudio } from "@/components/StylingStudio";
import { AICoPilot } from "@/components/AICoPilot";
import { CombinationsStudio } from "@/components/CombinationsStudio";
import { AccessoriesVault } from "@/components/AccessoriesVault";
import { WardrobeDigitizer } from "@/components/WardrobeDigitizer";
import { WardrobeGallery } from "@/components/WardrobeGallery";
import { WardrobeGapDashboard } from "@/components/WardrobeGapDashboard";
import { StyleDNAProfile } from "@/components/StyleDNAProfile";
import { FaceSkinStudio } from "@/components/FaceSkinStudio";
import { SchemaModal } from "@/components/SchemaModal";
import { ShareModal } from "@/components/ShareModal";
import {
  ClothingItem,
  Outfit,
  WeatherCondition,
  GapAnalysisResponse,
  BodyTypeProfile
} from "@/types";
import { apiFetch } from "@/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("styling");
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [weather, setWeather] = useState<WeatherCondition>({
    temp_c: 13.8,
    feels_like_c: 12.5,
    condition: "Crisp Himalayan Breeze",
    humidity: 62,
    wind_speed_kmh: 12.0,
    rain_probability: 0.05,
    city: "Pithoragarh, Uttarakhand",
  });
  const [bodyProfile, setBodyProfile] = useState<BodyTypeProfile>({
    height_cm: 178.0,
    weight_kg: 72.0,
    body_type: "inverted_triangle",
    facial_shape: "oval",
    skin_undertone: "warm",
    build_type: "athletic",
  });
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResponse | null>(null);
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchItems();
    fetchWeather();
    fetchGapAnalysis();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await apiFetch("/api/v1/wardrobe/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
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
      }
    } catch (err) {
      console.error("Error fetching weather:", err);
    }
  };

  const fetchGapAnalysis = async () => {
    try {
      const res = await apiFetch("/api/v1/analysis/gap");
      if (res.ok) {
        const data = await res.json();
        setGapAnalysis(data);
      }
    } catch (err) {
      console.error("Error fetching gap analysis:", err);
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

  // Generate outfit on initial load once items are loaded
  useEffect(() => {
    if (items.length >= 2 && !outfit) {
      handleGenerateOutfit("coding", "silver", "korean_minimal");
    }
  }, [items]);

  const handleItemIngested = (newItem: ClothingItem) => {
    setItems((prev) => [newItem, ...prev]);
    fetchGapAnalysis();
    setActiveTab("vault");
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/wardrobe/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== itemId));
        fetchGapAnalysis();
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleBuildOutfitAround = (itemId: string) => {
    setActiveTab("styling");
    handleGenerateOutfit("coding", "silver", "korean_minimal");
  };

  const handleApplyOutfitFromAI = (appliedOutfit: Outfit) => {
    setOutfit(appliedOutfit);
    setActiveTab("styling");
  };

  const handleResetWardrobe = async () => {
    try {
      const res = await apiFetch("/api/v1/wardrobe/seed?force=true", { method: "POST" });
      if (res.ok) {
        await fetchItems();
        await fetchGapAnalysis();
        handleGenerateOutfit("coding", "silver", "korean_minimal");
      }
    } catch (err) {
      console.error("Error resetting wardrobe:", err);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    fetchWeather(presetId);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-40" />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weather={weather}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Main Container */}
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Weather Simulator (Show in Styling tab and as header widget) */}
        {activeTab === "styling" && (
          <WeatherWidget
            weather={weather}
            onUpdateWeather={setWeather}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {/* Tab Views */}
        {activeTab === "styling" && (
          <StylingStudio
            outfit={outfit}
            isLoading={isGeneratingOutfit}
            onGenerateOutfit={handleGenerateOutfit}
            weather={weather}
            bodyProfile={bodyProfile}
          />
        )}

        {activeTab === "ai-chat" && (
          <AICoPilot
            bodyProfile={bodyProfile}
            weather={weather}
            onApplyOutfit={handleApplyOutfitFromAI}
          />
        )}

        {activeTab === "face-skin" && (
          <FaceSkinStudio
            bodyProfile={bodyProfile}
            onUpdateBodyProfile={(updated) => {
              setBodyProfile(updated);
            }}
          />
        )}

        {activeTab === "combinations" && (
          <CombinationsStudio
            items={items}
            onApplyOutfit={handleApplyOutfitFromAI}
          />
        )}

        {activeTab === "accessories" && (
          <AccessoriesVault
            items={items}
            onBuildOutfitAround={handleBuildOutfitAround}
          />
        )}

        {activeTab === "digitizer" && (
          <WardrobeDigitizer
            onItemIngested={handleItemIngested}
            onNavigateToVault={() => setActiveTab("vault")}
          />
        )}

        {activeTab === "vault" && (
          <WardrobeGallery
            items={items}
            onDeleteItem={handleDeleteItem}
            onBuildOutfitAround={handleBuildOutfitAround}
          />
        )}

        {activeTab === "gap" && (
          <WardrobeGapDashboard
            analysis={gapAnalysis}
            isLoading={false}
            onRefresh={fetchGapAnalysis}
          />
        )}

        {activeTab === "dna" && (
          <StyleDNAProfile
            bodyProfile={bodyProfile}
            onUpdateBodyProfile={setBodyProfile}
            onResetWardrobe={handleResetWardrobe}
            onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-neutral-500 bg-black/40">
        <p>ClosetOS — AI Wardrobe Digitization & Proportion Reasoning Agent</p>
        <p className="text-[11px] text-neutral-600 mt-1">
          OpenCV Auto-White-Balance (Gray World) • Morphological Body & Face Alignment • 768-dim Vector Embeddings • Golden 1:2 Silhouette Ratio
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
