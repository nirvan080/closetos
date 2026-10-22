"use client";

import React, { useState } from "react";
import { X, Copy, Check, Database, Shield } from "lucide-react";

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_DDL = `-- ClosetOS PostgreSQL + Supabase Schema with pgvector
-- Run directly in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    body_measurements JSONB DEFAULT '{"waist_in": 31, "outseam_in": 40, "chest_in": 38, "height_cm": 178}',
    preferred_fits VARCHAR[] DEFAULT ARRAY['baggy', 'relaxed', 'korean-pleated', 'boxy'],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clothing Items Table with 768-dim embeddings
CREATE TABLE IF NOT EXISTS clothing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_original_url TEXT NOT NULL,
    image_cutout_url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- "top", "bottom", "shoes", "outerwear", "accessory", "watch"
    sub_category VARCHAR(100) NOT NULL, -- "boxy_hoodie", "korean_pleated_trouser", etc.
    color_primary_hex VARCHAR(7) NOT NULL,
    color_secondary_hex VARCHAR(7),
    color_family VARCHAR(50) NOT NULL, -- "olive_green", "charcoal_grey", "mocha_brown", etc.
    fabric_type VARCHAR(100),
    fabric_weight VARCHAR(50), -- "heavyweight_350gsm", "midweight", "lightweight"
    pattern VARCHAR(50),
    hardware_color VARCHAR(50), -- "gold", "silver", "none"
    thermal_rating INT DEFAULT 2, -- 1 (Summer) to 5 (Heavy Winter)
    fit_type VARCHAR(50), -- "baggy", "loose", "regular", "boxy", "korean-pleated"
    embedding VECTOR(768),
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Outfits Table
CREATE TABLE IF NOT EXISTS outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_ids UUID[] NOT NULL,
    occasion VARCHAR(50) NOT NULL, -- "tuition", "coding", "market", "formal", "home"
    weather_condition JSONB, -- {"temp_c": 14, "condition": "Chilly"}
    styling_notes TEXT,
    silhouette_analysis TEXT,
    hardware_harmony TEXT,
    micro_styling JSONB,
    harmony_score FLOAT, -- 0.0 to 1.0
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fast Vector Search Index
CREATE INDEX IF NOT EXISTS clothing_embedding_idx 
ON clothing_items 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
`;

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-card rounded-3xl max-w-3xl w-full border border-white/15 p-6 sm:p-8 space-y-5 relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <Database className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Supabase / PostgreSQL Schema (pgvector)
              </h3>
              <p className="text-xs text-neutral-400">
                Production-ready DDL matching Section 3 of the ClosetOS Mission Brief
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Code Block */}
        <div className="relative flex-1 min-h-[300px] overflow-hidden rounded-xl border border-white/10 bg-black/70">
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 text-xs font-semibold backdrop-blur transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied SQL!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
          <pre className="h-full overflow-y-auto p-4 text-xs font-mono text-neutral-300 leading-relaxed">
            <code>{SUPABASE_DDL}</code>
          </pre>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-neutral-400">
          <span className="flex items-center space-x-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>Includes 768-dim IVFFlat Cosine Distance Index</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
