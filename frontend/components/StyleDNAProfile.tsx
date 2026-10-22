"use client";

import React, { useState } from "react";
import {
  Sliders,
  User,
  Ruler,
  Key,
  Database,
  Save,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Smile,
  Palette,
  Globe,
  Wifi,
  Smartphone,
  ExternalLink
} from "lucide-react";
import { BodyTypeProfile } from "@/types";
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_CLOUD_API } from "@/lib/api";

interface StyleDNAProfileProps {
  bodyProfile: BodyTypeProfile;
  onUpdateBodyProfile: (profile: BodyTypeProfile) => void;
  onResetWardrobe: () => void;
  onOpenSchemaModal: () => void;
}

export const StyleDNAProfile: React.FC<StyleDNAProfileProps> = ({
  bodyProfile,
  onUpdateBodyProfile,
  onResetWardrobe,
  onOpenSchemaModal,
}) => {
  const [profile, setProfile] = useState<BodyTypeProfile>(bodyProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [weatherKey, setWeatherKey] = useState("");
  const [cloudUrl, setCloudUrl] = useState(getApiBaseUrl() || DEFAULT_CLOUD_API);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const testConnection = async () => {
    setConnectionStatus("testing");
    try {
      const target = cloudUrl ? `${cloudUrl.replace(/\/+$/, "")}/health` : "/health";
      const res = await fetch(target);
      if (res.ok) {
        setConnectionStatus("success");
      } else {
        setConnectionStatus("error");
      }
    } catch {
      setConnectionStatus("error");
    }
  };

  const bodyTypes = [
    {
      id: "inverted_triangle",
      label: "Inverted Triangle",
      icon: "🔻",
      desc: "Broad shoulders, narrow waist. Best with wide-leg trousers."
    },
    {
      id: "rectangle",
      label: "Rectangle / Athletic",
      icon: "▯",
      desc: "Linear build. Best with 1-inch cropped boxy tops to create a waist."
    },
    {
      id: "oval",
      label: "Oval / Fuller Torso",
      icon: "⭕",
      desc: "Fuller midsection. Best with unzipped vertical layering & dropped shoulders."
    },
    {
      id: "trapezoid",
      label: "Trapezoid / Runway",
      icon: "🔺",
      desc: "Naturally balanced. Highly versatile across all proportions."
    },
    {
      id: "triangle",
      label: "Triangle / Pear",
      icon: "▲",
      desc: "Wider hips. Best with structured boxy jackets & dark straight trousers."
    }
  ];

  const facialShapes = [
    { id: "oval", label: "Oval", desc: "Suits all necklines, aviators, and wayfarer frames." },
    { id: "round", label: "Round", desc: "Elongate with open camp collars & geometric square eyewear." },
    { id: "square", label: "Square", desc: "Soften sharp jawline with crewnecks & rounded wireframes." },
    { id: "heart", label: "Heart", desc: "Balance pointed chin with wide collars & clubmasters." },
    { id: "diamond", label: "Diamond", desc: "Accentuate high cheekbones with relaxed collars & browline frames." }
  ];

  const undertones = [
    {
      id: "warm",
      label: "Warm Undertone",
      colors: ["#4a5338", "#5c4033", "#c25b3d", "#d4af37"],
      metal: "Gold / Brass & Earth Tones"
    },
    {
      id: "cool",
      label: "Cool Undertone",
      colors: ["#383b40", "#2563eb", "#1b1e24", "#c8d1d9"],
      metal: "Silver / Steel & Monochrome"
    },
    {
      id: "neutral",
      label: "Neutral Undertone",
      colors: ["#9eac95", "#f3efe6", "#8c7b64", "#ede8df"],
      metal: "Mixed Metals & Soft Neutrals"
    }
  ];

  const handleSave = () => {
    setApiBaseUrl(cloudUrl);
    onUpdateBodyProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = async () => {
    if (confirm("Reset digital closet with expanded 14-piece designer capsule wardrobe?")) {
      setIsResetting(true);
      await onResetWardrobe();
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Sliders className="h-5 w-5 text-neutral-300" />
          <span>Style DNA, Body Morphology & Facial Proportions</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Configures your body geometry, facial shape, skin undertone, and aesthetic preferences to generate bespoke proportion recommendations.
        </p>
      </div>

      {/* Height, Weight & Build */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <Ruler className="h-4 w-4 text-amber-400" />
          <span>Physical Stature & Weight</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Height (cm)</label>
            <input
              type="number"
              value={profile.height_cm}
              onChange={(e) => setProfile({ ...profile, height_cm: Number(e.target.value) })}
              className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Weight (kg)</label>
            <input
              type="number"
              value={profile.weight_kg}
              onChange={(e) => setProfile({ ...profile, weight_kg: Number(e.target.value) })}
              className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Build Type</label>
            <select
              value={profile.build_type}
              onChange={(e) => setProfile({ ...profile, build_type: e.target.value })}
              className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white capitalize"
            >
              <option value="athletic">Athletic / V-Taper</option>
              <option value="lean">Lean / Slim</option>
              <option value="muscular">Muscular / Broad</option>
              <option value="stocky">Stocky / Solid</option>
              <option value="relaxed">Relaxed Frame</option>
            </select>
          </div>
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Estimated BMI</label>
            <div className="w-full rounded-xl bg-neutral-900/60 border border-white/5 px-3 py-2 text-neutral-300 font-mono">
              {(profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)} (Normal)
            </div>
          </div>
        </div>
      </div>

      {/* Body Silhouette Type */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block">
          Body Silhouette Morphology
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bodyTypes.map((bt) => {
            const active = profile.body_type === bt.id;
            return (
              <div
                key={bt.id}
                onClick={() => setProfile({ ...profile, body_type: bt.id })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  active
                    ? "bg-white/10 border-white/30 text-white shadow-md ring-1 ring-white/20"
                    : "bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{bt.icon}</span>
                  <span className="text-xs font-bold text-white">{bt.label}</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
                  {bt.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facial Shape & Eyewear Alignment */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <Smile className="h-4 w-4 text-emerald-400" />
          <span>Facial Shape & Neckline/Eyewear Alignment</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {facialShapes.map((fs) => {
            const active = profile.facial_shape === fs.id;
            return (
              <div
                key={fs.id}
                onClick={() => setProfile({ ...profile, facial_shape: fs.id })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  active
                    ? "bg-white/10 border-white/30 text-white shadow-md ring-1 ring-white/20"
                    : "bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/[0.05]"
                }`}
              >
                <p className="text-xs font-bold text-white capitalize">{fs.label}</p>
                <p className="text-[10px] text-neutral-400 mt-1 leading-tight line-clamp-3">
                  {fs.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skin Undertone & Color Palette */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <Palette className="h-4 w-4 text-amber-400" />
          <span>Skin Undertone & Color Palette Alignment</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {undertones.map((ut) => {
            const active = profile.skin_undertone === ut.id;
            return (
              <div
                key={ut.id}
                onClick={() => setProfile({ ...profile, skin_undertone: ut.id })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  active
                    ? "bg-white/10 border-white/30 text-white shadow-md ring-1 ring-white/20"
                    : "bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{ut.label}</span>
                  <span className="text-[10px] text-neutral-400">{ut.metal}</span>
                </div>
                <div className="flex space-x-1.5">
                  {ut.colors.map((c, i) => (
                    <span
                      key={i}
                      className="h-4 w-6 rounded-md border border-white/15"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Integrations */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <Key className="h-4 w-4 text-emerald-400" />
          <span>API Integrations (Optional Override)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Google Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white font-mono placeholder-neutral-600"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">OpenWeatherMap API Key</label>
            <input
              type="password"
              placeholder="owm_api_key..."
              value={weatherKey}
              onChange={(e) => setWeatherKey(e.target.value)}
              className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white font-mono placeholder-neutral-600"
            />
          </div>
        </div>
      </div>

      {/* Cloud Mobile Connection & 24/7 Always Active Setup */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
            <Globe className="h-4 w-4 text-sky-400" />
            <span>Mobile 4G/5G Internet & Cloud Backend Connectivity</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
            Native App Sync
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          When using ClosetOS on your Android phone, the native app connects to this cloud backend over mobile internet (4G / 5G / Wi-Fi) with zero dependence on your laptop!
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-neutral-400 mb-1 text-xs font-medium">
              Cloud Backend API URL (24/7 Server)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="https://closetos-api.onrender.com or cloudflare URL"
                value={cloudUrl}
                onChange={(e) => setCloudUrl(e.target.value)}
                className="flex-1 rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-white font-mono text-xs placeholder-neutral-600"
              />
              <button
                onClick={testConnection}
                disabled={connectionStatus === "testing"}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all shrink-0 flex items-center justify-center space-x-1.5"
              >
                {connectionStatus === "testing" ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wifi className="h-3.5 w-3.5 text-sky-400" />
                )}
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {connectionStatus === "success" && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Cloud connection successful! Your mobile phone will fetch styling details 24/7 over 4G/5G.</span>
            </div>
          )}

          {connectionStatus === "error" && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-300">
              <RefreshCw className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Could not reach backend health check at this URL. Ensure the URL is online.</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 text-xs hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`} />
          <span>Re-seed 14 Designer Pieces</span>
        </button>

        <button
          onClick={handleSave}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-md"
        >
          {savedSuccess ? (
            <>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Morphological DNA Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Style & Body DNA</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
