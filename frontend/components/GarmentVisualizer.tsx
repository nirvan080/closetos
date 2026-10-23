"use client";

import React, { useState } from "react";
import { formatImageUrl } from "@/lib/api";

interface GarmentVisualizerProps {
  category: string;
  subCategory: string;
  primaryHex: string;
  secondaryHex?: string;
  imageUrl?: string;
  hardwareColor?: string;
  className?: string;
}

export const GarmentVisualizer: React.FC<GarmentVisualizerProps> = ({
  category,
  subCategory,
  primaryHex = "#1c1917",
  secondaryHex = "#3f3f46",
  imageUrl,
  hardwareColor = "none",
  className = "w-full h-full",
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const cleanImageUrl = imageUrl ? formatImageUrl(imageUrl) : "";
  const cat = (category || "").toLowerCase();
  const sub = (subCategory || "").toLowerCase();

  // If cutout image is available and hasn't failed, render it with smooth fallback
  const renderVectorFallback = () => {
    if (cat === "top" || sub.includes("hoodie") || sub.includes("tee") || sub.includes("shirt")) {
      const isHoodie = sub.includes("hoodie");
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full p-2 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          <defs>
            <linearGradient id={`topGrad-${primaryHex}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={primaryHex} />
              <stop offset="100%" stopColor={secondaryHex || primaryHex} />
            </linearGradient>
          </defs>
          {/* Main Torso */}
          <path
            d="M 50 50 L 80 40 L 120 40 L 150 50 L 170 85 L 145 95 L 135 75 L 135 165 L 65 165 L 65 75 L 55 95 L 30 85 Z"
            fill={`url(#topGrad-${primaryHex})`}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Collar / Hood */}
          {isHoodie ? (
            <path
              d="M 75 42 Q 100 15 125 42 Q 100 55 75 42 Z"
              fill={secondaryHex || "#27272a"}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
            />
          ) : (
            <path
              d="M 75 42 Q 100 62 125 42"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
            />
          )}
          {/* Pocket for hoodie */}
          {isHoodie && (
            <path
              d="M 72 120 L 128 120 L 132 150 L 68 150 Z"
              fill="rgba(0,0,0,0.2)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1.5"
            />
          )}
          {/* Hem line */}
          <line x1="65" y1="160" x2="135" y2="160" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
        </svg>
      );
    }

    if (cat === "bottom" || sub.includes("pant") || sub.includes("trouser") || sub.includes("cargo") || sub.includes("short")) {
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full p-2 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          <defs>
            <linearGradient id={`botGrad-${primaryHex}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={primaryHex} />
              <stop offset="100%" stopColor={secondaryHex || primaryHex} />
            </linearGradient>
          </defs>
          {/* Waistband */}
          <rect x="60" y="35" width="80" height="15" rx="3" fill={secondaryHex || primaryHex} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          {/* Trouser Legs */}
          <path
            d="M 60 50 L 52 170 L 92 170 L 100 85 L 108 170 L 148 170 L 140 50 Z"
            fill={`url(#botGrad-${primaryHex})`}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Pleat details */}
          <line x1="78" y1="52" x2="72" y2="160" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="122" y1="52" x2="128" y2="160" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 2" />
        </svg>
      );
    }

    if (cat === "shoes" || sub.includes("shoe") || sub.includes("sneaker") || sub.includes("boot") || sub.includes("loafer")) {
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full p-2 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          {/* Sneaker Upper */}
          <path
            d="M 35 125 C 40 100 55 90 85 85 C 105 85 125 110 155 115 C 168 118 172 135 165 142 L 35 142 Z"
            fill={primaryHex}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          {/* Laces area */}
          <path d="M 80 88 L 105 112" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 90 85 L 115 109" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sole */}
          <rect x="30" y="142" width="140" height="16" rx="5" fill={secondaryHex || "#f4f4f5"} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        </svg>
      );
    }

    if (cat === "outerwear" || sub.includes("jacket") || sub.includes("coat") || sub.includes("bomber")) {
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full p-2 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          {/* Bomber / Jacket */}
          <path
            d="M 55 55 L 85 45 L 115 45 L 145 55 L 175 95 L 150 108 L 138 85 L 138 160 L 62 160 L 62 85 L 50 108 L 25 95 Z"
            fill={primaryHex}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
          />
          {/* Zipper */}
          <line
            x1="100"
            y1="45"
            x2="100"
            y2="160"
            stroke={hardwareColor === "gold" ? "#fbbf24" : "#e2e8f0"}
            strokeWidth="2.5"
          />
          {/* Ribbed collar & Hem */}
          <rect x="62" y="155" width="76" height="8" rx="2" fill={secondaryHex || "#18181b"} />
        </svg>
      );
    }

    if (cat === "watch" || sub.includes("watch")) {
      const isGold = hardwareColor === "gold" || sub.includes("gold");
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full p-2 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          {/* Strap */}
          <rect x="85" y="20" width="30" height="160" rx="6" fill={secondaryHex || "#27272a"} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {/* Watch Case */}
          <circle cx="100" cy="100" r="38" fill={isGold ? "#f59e0b" : "#94a3b8"} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          {/* Dial Face */}
          <circle cx="100" cy="100" r="30" fill={primaryHex || "#09090b"} />
          {/* Hands */}
          <line x1="100" y1="100" x2="100" y2="82" stroke={isGold ? "#fbbf24" : "#f1f5f9"} strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="100" x2="114" y2="100" stroke={isGold ? "#fbbf24" : "#f1f5f9"} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="100" cy="100" r="2.5" fill={isGold ? "#fbbf24" : "#ffffff"} />
        </svg>
      );
    }

    // Generic Accessory (Eyewear, Bag, Cap)
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full p-2 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
        <rect x="40" y="70" width="45" height="35" rx="8" fill={primaryHex} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <rect x="115" y="70" width="45" height="35" rx="8" fill={primaryHex} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <line x1="85" y1="82" x2="115" y2="82" stroke={hardwareColor === "gold" ? "#fbbf24" : "#cbd5e1"} strokeWidth="3" />
        <line x1="40" y1="80" x2="25" y2="88" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <line x1="160" y1="80" x2="175" y2="88" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {/* 1. Instant Vector Graphic Silhouette (Always Visible Immediately with 0 Latency) */}
      <div className={`w-full h-full flex items-center justify-center transition-opacity duration-300 ${imageLoaded && !imageFailed ? "opacity-0 absolute inset-0" : "opacity-100"}`}>
        {renderVectorFallback()}
      </div>

      {/* 2. Photo / Cutout Image Layer (Fades in when loaded) */}
      {cleanImageUrl && !imageFailed && (
        <img
          src={cleanImageUrl}
          alt={subCategory}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageFailed(true);
            setImageLoaded(false);
          }}
          className={`w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
        />
      )}
    </div>
  );
};
