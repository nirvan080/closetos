"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Send,
  User,
  Bot,
  ShieldCheck,
  Palette,
  Ruler,
  ArrowRight,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { AIConsultationResponse, BodyTypeProfile, WeatherCondition, Outfit } from "@/types";
import { apiFetch } from "@/lib/api";

interface AICoPilotProps {
  bodyProfile: BodyTypeProfile;
  weather: WeatherCondition;
  onApplyOutfit: (outfit: Outfit) => void;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  response?: AIConsultationResponse;
  timestamp: string;
}

export const AICoPilot: React.FC<AICoPilotProps> = ({
  bodyProfile,
  weather,
  onApplyOutfit,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Hello! I'm your AI Wardrobe Archivist & Personal Stylist. Conditioned on your ${bodyProfile.body_type.replace('_', ' ')} build, ${bodyProfile.facial_shape} face shape, and current ${weather.temp_c}°C weather, ask me anything about styling, color harmony, or specific piece pairings!`,
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQueries = [
    "How do I style olive pleated trousers for a date night?",
    "Can I pair my silver watch with brass/gold hardware?",
    "What silhouette suits my Inverted Triangle build best?",
    "Suggest a Korean minimal outfit for chilly 14°C weather.",
    "How to style a boxy hoodie with wide-leg bottoms?"
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputText;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: q,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await apiFetch("/api/v1/styling/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          occasion: "coding",
          aesthetic_vibe: "korean_minimal",
          body_profile: bodyProfile,
          weather: weather,
        }),
      });

      if (res.ok) {
        const data: AIConsultationResponse = await res.json();
        const aiMsg: ChatMessage = {
          sender: "ai",
          text: data.answer,
          response: data,
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error("AI Stylist consultation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-white/10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span>AI Stylist Co-Pilot & Haute-Couture Consultation</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Conditioned on your {bodyProfile.body_type.replace('_', ' ')} frame, {bodyProfile.facial_shape} face shape, and {weather.temp_c}°C weather.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-neutral-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Multimodal Reasoning Active</span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 flex items-center space-x-1.5">
          <Lightbulb className="h-3 w-3 text-amber-400" />
          <span>Try Asking Your Stylist</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs rounded-xl bg-white/[0.03] border border-white/5 px-3 py-1.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.map((msg, idx) => {
          const isAI = msg.sender === "ai";
          return (
            <div
              key={idx}
              className={`flex items-start space-x-3.5 ${
                isAI ? "justify-start" : "justify-end"
              }`}
            >
              {isAI && (
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shrink-0 font-black text-xs shadow-md">
                  AI
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isAI
                    ? "bg-white/[0.05] border border-white/10 text-neutral-200"
                    : "bg-white text-black font-medium shadow-md"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Rich Stylist Attachment Cards */}
                {msg.response && (
                  <div className="space-y-3 pt-2 border-t border-white/10 text-neutral-300">
                    {/* Morphological Tip */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center space-x-1.5 text-amber-300 font-bold uppercase tracking-wider text-[10px]">
                        <Ruler className="h-3 w-3" />
                        <span>Morphological Body & Face Rule</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-normal">
                        {msg.response.morphological_tip}
                      </p>
                    </div>

                    {/* Color Palette Advice */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center space-x-1.5 text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                        <Palette className="h-3 w-3" />
                        <span>Skin Undertone & Color Harmony</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-normal">
                        {msg.response.color_palette_advice}
                      </p>
                    </div>

                    {/* Style Rules Applied */}
                    {msg.response.style_rules_applied && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.response.style_rules_applied.map((rule, rIdx) => (
                          <span
                            key={rIdx}
                            className="bg-white/10 text-white text-[10px] font-medium px-2 py-0.5 rounded-md"
                          >
                            ✓ {rule}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggested Outfit Preview with 1-click apply */}
                    {msg.response.suggested_outfit && (
                      <div className="p-3 rounded-xl bg-black/60 border border-white/15 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                            Curated Matching Outfit ({msg.response.suggested_outfit.items.length} Items)
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                            {Math.round(msg.response.suggested_outfit.harmony_score * 100)}% Harmony
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 overflow-x-auto py-1">
                          {msg.response.suggested_outfit.items.map((it) => (
                            <div
                              key={it.id}
                              className="h-16 w-16 shrink-0 rounded-lg bg-neutral-900 border border-white/10 p-1 flex items-center justify-center relative group"
                              title={it.sub_category}
                            >
                              <img
                                src={it.image_cutout_url}
                                alt={it.sub_category}
                                className="h-full w-full object-contain filter drop-shadow"
                              />
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => onApplyOutfit(msg.response!.suggested_outfit!)}
                          className="w-full flex items-center justify-center space-x-1.5 rounded-lg bg-white text-black font-bold text-xs py-2 hover:bg-neutral-200 transition-colors shadow"
                        >
                          <span>Load Into Styling Studio Canvas</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-3 text-neutral-400 text-xs">
            <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
            <span>Analyzing wardrobe state, weather, and morphological rules...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="glass-card rounded-2xl p-2.5 border border-white/10 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask your AI stylist anything (e.g. 'How do I wear boxy hoodies with Korean pleats?')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputText.trim()}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 disabled:opacity-40 transition-all shadow"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
};
