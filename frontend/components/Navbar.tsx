"use client";

import React from "react";
import {
  Sparkles,
  Layers,
  Smile,
  PlusCircle,
  CloudSun,
  Share2,
  MessageSquare,
  RefreshCw,
  Palette,
  Calendar as CalendarIcon
} from "lucide-react";
import { WeatherCondition } from "@/types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  weather?: WeatherCondition | null;
  onOpenSchemaModal: () => void;
  onOpenShareModal: () => void;
  backgroundStatus?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  weather,
  onOpenSchemaModal,
  onOpenShareModal,
  backgroundStatus,
}) => {
  const tabs = [
    { id: "styling", label: "Stylist", icon: Sparkles },
    { id: "canvas", label: "Canvas", icon: Palette },
    { id: "database", label: "Database", icon: Layers },
    { id: "planner", label: "Plan & Pack", icon: CalendarIcon },
    { id: "ai-chat", label: "AI Helper", icon: MessageSquare },
    { id: "face-skin", label: "Face & Suit", icon: Smile },
    { id: "digitizer", label: "Add Piece", icon: PlusCircle },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090a0f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("styling")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-sm tracking-wider shadow-lg">
              CO
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-white text-base">
                  CLOSET<span className="text-amber-400">OS</span>
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase text-neutral-300">
                  AI ENGINE
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">
                Pithoragarh, Uttarakhand
              </p>
            </div>
          </div>

          {/* Desktop Nav Pills */}
          <nav className="hidden lg:flex items-center space-x-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-black shadow-md scale-[1.02]"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-black" : "text-neutral-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Status Widget */}
          <div className="flex items-center space-x-2.5">
            {backgroundStatus && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold animate-pulse">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span className="truncate max-w-[140px] hidden sm:inline">{backgroundStatus}</span>
              </div>
            )}

            {weather && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                <CloudSun className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="font-bold text-white">{Math.round(weather.temp_c)}°C</span>
                <span className="hidden sm:inline text-[11px] text-neutral-400 truncate max-w-[100px]">
                  {weather.city?.split(",")[0] || "Pithoragarh"}
                </span>
              </div>
            )}

            <button
              onClick={onOpenShareModal}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
              title="Share app with friends"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Smooth Horizontal Scroll for 7 Features) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090a0f]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-between overflow-x-auto scrollbar-none shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl shrink-0 transition-all ${
                isActive ? "text-white font-bold" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-white text-black shadow-md" : "text-neutral-400"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-[9px] mt-0.5 whitespace-nowrap ${isActive ? "text-white font-bold" : "text-neutral-500"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
