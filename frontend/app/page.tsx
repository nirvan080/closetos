"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { WeatherWidget } from "@/components/WeatherWidget";
import { StylingStudio } from "@/components/StylingStudio";
import { ClosetDatabase } from "@/components/ClosetDatabase";
import { OutfitCanvas } from "@/components/OutfitCanvas";
import { OutfitPlannerAndPacker } from "@/components/OutfitPlannerAndPacker";
import { AICoPilot } from "@/components/AICoPilot";
import { FaceSkinStudio } from "@/components/FaceSkinStudio";
import { WardrobeDigitizer } from "@/components/WardrobeDigitizer";
import { SchemaModal } from "@/components/SchemaModal";
import { ShareModal } from "@/components/ShareModal";
import {
  ClothingItem,
  Outfit,
  WeatherCondition,
  BodyTypeProfile,
  IngestionResult
} from "@/types";
import { apiFetch } from "@/lib/api";
import { RefreshCw, Sparkles, CheckCircle2, ChevronUp, X } from "lucide-react";
import confetti from "canvas-confetti";

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

interface QueueTask {
  id: string;
  name: string;
  file?: File;
  url?: string;
  status: "pending" | "processing" | "completed" | "error";
  thumbnail?: string;
}

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

  // Global Non-Blocking Background Queue
  const [queueTasks, setQueueTasks] = useState<QueueTask[]>([]);
  const [isQueueActive, setIsQueueActive] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const isWorkerRunning = useRef(false);

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

  // NON-BLOCKING BACKGROUND WORKER
  const enqueueFilesForBackgroundDigitization = (files: File[]) => {
    const newTasks: QueueTask[] = files.map((file, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      name: file.name,
      file,
      status: "pending",
      thumbnail: URL.createObjectURL(file),
    }));

    setQueueTasks((prev) => [...prev, ...newTasks]);
    setToastNotification(`Queued ${files.length} piece(s) for background digitization!`);
    setTimeout(() => setToastNotification(null), 3000);
  };

  const enqueueUrlForBackgroundDigitization = (url: string) => {
    const newTask: QueueTask = {
      id: `task-url-${Date.now()}`,
      name: url.split("/").pop() || "Web Image",
      url,
      status: "pending",
      thumbnail: url,
    };
    setQueueTasks((prev) => [...prev, newTask]);
    setToastNotification("Queued web image for background digitization!");
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Process queue sequentially in the background without blocking the UI
  useEffect(() => {
    const processQueue = async () => {
      if (isWorkerRunning.current) return;
      const nextPending = queueTasks.find((t) => t.status === "pending");
      if (!nextPending) {
        if (queueTasks.length > 0 && queueTasks.every((t) => t.status === "completed" || t.status === "error")) {
          // Finished all
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          setToastNotification(`All ${queueTasks.length} garments successfully digitized & saved!`);
          setTimeout(() => {
            setQueueTasks([]);
            setToastNotification(null);
          }, 4500);
        }
        return;
      }

      isWorkerRunning.current = true;
      setIsQueueActive(true);

      // Mark as processing
      setQueueTasks((prev) =>
        prev.map((t) => (t.id === nextPending.id ? { ...t, status: "processing" } : t))
      );

      try {
        let ingestRes;
        if (nextPending.file) {
          const formData = new FormData();
          formData.append("file", nextPending.file);
          ingestRes = await apiFetch("/api/v1/wardrobe/ingest", {
            method: "POST",
            body: formData,
          });
        } else if (nextPending.url) {
          const formData = new FormData();
          formData.append("image_url", nextPending.url);
          ingestRes = await apiFetch("/api/v1/wardrobe/ingest-url", {
            method: "POST",
            body: formData,
          });
        }

        if (ingestRes && ingestRes.ok) {
          const data: IngestionResult = await ingestRes.json();

          // Auto-commit into database
          const payload = {
            category: data.category,
            sub_category: data.sub_category,
            color_primary_hex: data.color_primary_hex,
            color_secondary_hex: data.color_secondary_hex,
            color_family: data.color_family,
            fabric_type: data.fabric_type,
            fabric_weight: data.fabric_weight,
            pattern: data.pattern,
            hardware_color: data.hardware_color,
            thermal_rating: data.thermal_rating,
            fit_type: data.fit_type,
            image_original_url: data.original_url,
            image_cutout_url: data.cutout_url,
            embedding: [],
            metadata_json: {
              tags: data.tags,
              confidence: data.confidence,
              white_balance_applied: data.white_balance_applied,
              bg_removed: data.bg_removed,
            },
          };

          const saveRes = await apiFetch("/api/v1/wardrobe/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (saveRes.ok) {
            const savedItem: ClothingItem = await saveRes.json();
            setItems((prev) => {
              const updated = [savedItem, ...prev];
              if (typeof window !== "undefined") {
                localStorage.setItem("closetos_items_v2", JSON.stringify(updated));
              }
              return updated;
            });
          }

          setQueueTasks((prev) =>
            prev.map((t) => (t.id === nextPending.id ? { ...t, status: "completed" } : t))
          );
        } else {
          setQueueTasks((prev) =>
            prev.map((t) => (t.id === nextPending.id ? { ...t, status: "error" } : t))
          );
        }
      } catch (err) {
        console.error("Queue worker error:", err);
        setQueueTasks((prev) =>
          prev.map((t) => (t.id === nextPending.id ? { ...t, status: "error" } : t))
        );
      } finally {
        isWorkerRunning.current = false;
        setIsQueueActive(false);
      }
    };

    const timer = setTimeout(processQueue, 300);
    return () => clearTimeout(timer);
  }, [queueTasks]);

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

  const completedTasks = queueTasks.filter((t) => t.status === "completed").length;
  const backgroundSummary =
    queueTasks.length > 0
      ? `Digitizing ${completedTasks + 1}/${queueTasks.length} pieces in background`
      : null;

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black pb-24 lg:pb-0">
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
        backgroundStatus={backgroundSummary}
      />

      {/* FLOATING NON-BLOCKING BACKGROUND PROGRESS CAPSULE */}
      {queueTasks.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 max-w-sm w-[90%] sm:w-auto bg-neutral-900/95 backdrop-blur-xl border border-amber-400/50 p-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-fade-in">
          <div className="h-8 w-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold text-white truncate">
              Digitizing {completedTasks}/{queueTasks.length} in Background
            </p>
            <p className="text-[10px] text-neutral-400 truncate">
              Auto-saving cutouts while you use other tabs.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-300">
            {Math.round((completedTasks / queueTasks.length) * 100)}%
          </span>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-white text-black text-xs font-bold shadow-2xl flex items-center space-x-2 animate-bounce">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{toastNotification}</span>
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

        {/* 2. OUTFIT CANVAS TAB (Polyvore-style Freeform Collage) */}
        {activeTab === "canvas" && (
          <OutfitCanvas
            items={items}
            onSaveOutfit={(newOutfit) => {
              setOutfit(newOutfit);
              setActiveTab("styling");
            }}
            onNavigateToStylist={() => setActiveTab("styling")}
          />
        )}

        {/* 3. CLOSET DATABASE TAB */}
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

        {/* 4. PLAN & PACK TAB (Weekly Calendar & Trip Luggage Packer) */}
        {activeTab === "planner" && (
          <OutfitPlannerAndPacker
            items={items}
            outfit={outfit}
            weather={weather}
            onApplyOutfit={(newOutfit) => {
              setOutfit(newOutfit);
              setActiveTab("styling");
            }}
          />
        )}

        {/* 5. AI STYLIST HELPER & RECOMMENDER TAB */}
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

        {/* 6. FACE, SKIN & SUITING DNA STUDIO TAB */}
        {activeTab === "face-skin" && (
          <FaceSkinStudio
            bodyProfile={bodyProfile}
            onUpdateBodyProfile={handleUpdateBodyProfile}
            onNavigateToDatabaseWithFilter={handleFilterClosetForTone}
          />
        )}

        {/* 7. DIGITIZER (ADD PIECE WITH CAMERA, BATCH UPLOAD & WEB CLIP) TAB */}
        {activeTab === "digitizer" && (
          <WardrobeDigitizer
            onItemIngested={handleItemIngested}
            onNavigateToVault={() => setActiveTab("database")}
            onEnqueueFiles={enqueueFilesForBackgroundDigitization}
            onEnqueueUrl={enqueueUrlForBackgroundDigitization}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-5 text-center text-xs text-neutral-500 bg-black/40 hidden lg:block">
        <p>ClosetOS — AI Wardrobe Architecture & Proportion Reasoning Engine</p>
        <p className="text-[11px] text-neutral-600 mt-1">
          Polyvore Collage Canvas • Weekly Outfit Planner • Trip Luggage Packer • OpenCV Auto-White-Balance • 1:2 Golden Ratio
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
