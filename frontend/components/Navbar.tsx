"use client";

import React from "react";
import {
  Sparkles,
  Camera,
  Layers,
  BarChart3,
  Sliders,
  Database,
  CloudSun,
  MessageSquare,
  Watch,
  Shuffle,
  Share2,
  Download,
  Smile
} from "lucide-react";
import { WeatherCondition } from "@/types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  weather?: WeatherCondition | null;
  onOpenSchemaModal: () => void;
  onOpenShareModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  weather,
  onOpenSchemaModal,
  onOpenShareModal,
}) => {
  const tabs = [
    { id: "styling", label: "Styling Studio", icon: Sparkles },
    { id: "ai-chat", label: "AI Stylist", icon: MessageSquare },
    { id: "face-skin", label: "Face Space", icon: Smile },
    { id: "combinations", label: "Combinations", icon: Shuffle },
    { id: "accessories", label: "Accessories", icon: Watch },
    { id: "digitizer", label: "Digitizer", icon: Camera },
    { id: "vault", label: "Closet Vault", icon: Layers },
    { id: "gap", label: "Gap Analysis", icon: BarChart3 },
    { id: "dna", label: "Body DNA", icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#090a0f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-400 text-black font-black text-sm tracking-wider shadow-md">
            CO
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-lg">CLOSET<span className="text-neutral-400">OS</span></span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-neutral-300">
                PROPORTION ENGINE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">AI Wardrobe Digitization & Silhouette Harmonizer</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 rounded-xl bg-white/[0.04] p-1 border border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-black shadow-sm font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-black" : "text-neutral-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right utility items */}
        <div className="flex items-center space-x-2.5">
          {weather && (
            <div className="hidden sm:flex items-center space-x-1.5 rounded-full bg-white/[0.05] border border-white/10 px-3 py-1 text-xs text-neutral-300">
              <CloudSun className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-white">{weather.temp_c}°C</span>
              <span className="text-neutral-400 font-normal">| {weather.condition}</span>
            </div>
          )}

          <button
            onClick={onOpenSchemaModal}
            className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
            title="View Supabase PostgreSQL Schema"
          >
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Supabase DDL</span>
          </button>

          <button
            onClick={onOpenShareModal}
            className="flex items-center space-x-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-200 transition-colors hover:bg-purple-500/20 hover:text-white"
            title="Share ClosetOS with Friends"
          >
            <Share2 className="h-3.5 w-3.5 text-purple-400" />
            <span>Share</span>
          </button>

          <a
            href="/closetos.apk"
            download="closetos.apk"
            className="flex items-center space-x-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/25 hover:text-white"
            title="Download Native Android APK (1.4 MB)"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Get APK</span>
            <span className="sm:hidden">APK</span>
          </a>
        </div>
      </div>

      {/* Mobile/Tablet Horizontal Scroll Navigation bar */}
      <div className="flex lg:hidden border-t border-white/5 px-2 py-1.5 overflow-x-auto space-x-1 bg-black/50 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs shrink-0 transition-all ${
                isActive
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
