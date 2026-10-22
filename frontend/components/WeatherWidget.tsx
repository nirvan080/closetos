"use client";

import React, { useState } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets, Compass, Thermometer } from "lucide-react";
import { WeatherCondition } from "@/types";

interface WeatherWidgetProps {
  weather: WeatherCondition;
  onUpdateWeather: (newWeather: WeatherCondition) => void;
  onSelectPreset: (presetId: string) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  onUpdateWeather,
  onSelectPreset,
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);

  const presets = [
    { id: "chilly", label: "Chilly 14°C", icon: "❄️", desc: "Winter/Early Morning" },
    { id: "coding", label: "Cozy AC 20°C", icon: "💻", desc: "Indoor / Studio Work" },
    { id: "summer", label: "Summer 31°C", icon: "☀️", desc: "Humid / Warm Outdoors" },
    { id: "rainy", label: "Rainy 21°C", icon: "🌧️", desc: "Monsoon & High Humidity" },
    { id: "evening", label: "Evening 17°C", icon: "🍃", desc: "Cool Breeze / Night Out" },
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateWeather({
      ...weather,
      temp_c: val,
      feels_like_c: Math.round((val - 0.7) * 10) / 10,
      condition: val < 16 ? "Chilly" : val > 26 ? "Warm / Sunny" : "Pleasant",
    });
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Main weather stat */}
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 text-2xl">
            {weather.temp_c < 16 ? "❄️" : weather.temp_c > 26 ? "☀️" : "🍃"}
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {weather.temp_c}°C
              </span>
              <span className="text-xs text-neutral-400">
                Feels {weather.feels_like_c}°C
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-sm font-medium text-neutral-200">{weather.condition}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-xs text-neutral-400">{weather.city || "Bengaluru"}</span>
            </div>
          </div>
        </div>

        {/* Secondary atmospheric stats */}
        <div className="grid grid-cols-3 gap-3 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-5 text-xs">
          <div className="flex items-center space-x-1.5 text-neutral-400">
            <Droplets className="h-3.5 w-3.5 text-blue-400" />
            <div>
              <p className="text-[10px] uppercase text-neutral-500 font-semibold">Humidity</p>
              <p className="font-medium text-neutral-200">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-neutral-400">
            <Wind className="h-3.5 w-3.5 text-teal-400" />
            <div>
              <p className="text-[10px] uppercase text-neutral-500 font-semibold">Wind</p>
              <p className="font-medium text-neutral-200">{weather.wind_speed_kmh} km/h</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-neutral-400">
            <CloudRain className="h-3.5 w-3.5 text-indigo-400" />
            <div>
              <p className="text-[10px] uppercase text-neutral-500 font-semibold">Rain</p>
              <p className="font-medium text-neutral-200">{Math.round(weather.rain_probability * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset simulation selector */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Test Outfit Under Conditions
          </span>
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <Thermometer className="h-3 w-3" />
            <span>{isCustomizing ? "Close Dial" : "Custom Temp"}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const isMatch = Math.abs(weather.temp_c - (p.id === "chilly" ? 14 : p.id === "coding" ? 20 : p.id === "summer" ? 31.5 : p.id === "rainy" ? 21 : 17.5)) < 1.0;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p.id)}
                className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs transition-all ${
                  isMatch
                    ? "bg-white/20 text-white font-medium border border-white/30"
                    : "bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08] hover:text-neutral-200 border border-white/5"
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom slider if toggled */}
        {isCustomizing && (
          <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center space-x-3">
            <span className="text-xs text-neutral-400">5°C</span>
            <input
              type="range"
              min="5"
              max="38"
              step="0.5"
              value={weather.temp_c}
              onChange={handleSliderChange}
              className="w-full accent-white h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs text-neutral-400">38°C</span>
            <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              {weather.temp_c}°C
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
