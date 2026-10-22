"use client";

import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Wifi,
  Send,
  MessageCircle,
  Smartphone,
  ExternalLink,
  QrCode,
  Download
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lanIp: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, lanIp }) => {
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedLan, setCopiedLan] = useState(false);

  if (!isOpen) return null;

  const publicUrl = "https://gifts-fork-managed-leslie.trycloudflare.com";
  const localtunnelUrl = "https://closetos-pithoragarh.loca.lt";
  const lanUrl = `http://${lanIp}:3000`;
  const shareText = "Check out ClosetOS — AI-Powered Wardrobe Digitization & Personal Styling Agent from Pithoragarh, Uttarakhand!";

  const handleCopyPublic = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedPublic(true);
    setTimeout(() => setCopiedPublic(false), 2000);
  };

  const handleCopyLan = () => {
    navigator.clipboard.writeText(lanUrl);
    setCopiedLan(true);
    setTimeout(() => setCopiedLan(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ClosetOS",
          text: shareText,
          url: publicUrl,
        });
      } catch (err) {
        console.log("Share dismissed");
      }
    } else {
      handleCopyPublic();
    }
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText}\n\n👉 Open Web App: ${publicUrl}\n📲 Download Android APK: ${publicUrl}/closetos.apk`
    )}`;
    window.open(url, "_blank");
  };

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      publicUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  // QR Code URL via QR Server API pointing directly to the live app
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    publicUrl
  )}&bgcolor=12-13-1a&color=ffffff&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-card rounded-3xl max-w-xl w-full border border-white/15 p-6 sm:p-8 space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Share ClosetOS & Download APK
              </h3>
              <p className="text-xs text-neutral-400">
                Direct Android APK & Live Cloudflare Access
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

        {/* Share Options */}
        <div className="space-y-4">
          {/* Native Android APK Download Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-purple-500/15 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <Smartphone className="h-3.5 w-3.5 text-amber-400" />
                <span>Android Native APK (1-Click Install)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">
                1.4 MB • Release APK
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Fully compiled Android package (<code className="text-amber-300 font-mono">closetos.apk</code>). Download and tap to install directly on your Android phone with zero browser barriers!
            </p>
            <a
              href="/closetos.apk"
              download="closetos.apk"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs hover:from-amber-300 hover:to-amber-400 transition-all shadow-md active:scale-[0.98]"
            >
              <Download className="h-4 w-4 text-black" />
              <span>Download closetos.apk (Direct Download)</span>
            </a>
          </div>

          {/* 1. Public HTTPS Link (Friends anywhere in the world) */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 uppercase tracking-wider">
                <Globe className="h-3.5 w-3.5" />
                <span>Worldwide Link (No Password Required)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                Cloudflare Global
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-black/60 p-2.5 rounded-xl border border-white/10">
              <span className="text-xs font-mono text-neutral-200 truncate flex-1 select-all">
                {publicUrl}
              </span>
              <button
                onClick={handleCopyPublic}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow shrink-0"
              >
                {copiedPublic ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-neutral-400">
              💡 <em>First-time prompt notice:</em> If localtunnel asks your friend for a Tunnel Password, they just enter:{" "}
              <strong className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">{tunnelPassword}</strong>.
            </p>
          </div>

          {/* 2. Instant Social Share Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-semibold">
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareTelegram}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Telegram</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-2 p-3 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all"
            >
              <Smartphone className="h-4 w-4" />
              <span>Mobile Share Sheet</span>
            </button>
          </div>

          {/* 3. Scan QR Code In Person */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="h-32 w-32 shrink-0 rounded-xl bg-[#12131a] p-2 border border-white/15 flex items-center justify-center overflow-hidden shadow-lg">
              <img
                src={qrCodeUrl}
                alt="Scan ClosetOS QR Code"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-white flex items-center justify-center sm:justify-start space-x-1.5">
                <QrCode className="h-3.5 w-3.5 text-amber-400" />
                <span>Scan With Phone Camera</span>
              </span>
              <p className="text-[11px] text-neutral-400 leading-normal">
                If your friends are hanging out with you, have them open their phone camera and point it at this QR code to open ClosetOS instantly!
              </p>
            </div>
          </div>

          {/* 4. Same Wi-Fi Network Link */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-neutral-300">
              <Wifi className="h-3.5 w-3.5 text-blue-400" />
              <span>Same Wi-Fi Network Link:</span>
              <span className="font-mono text-white">{lanUrl}</span>
            </div>
            <button
              onClick={handleCopyLan}
              className="text-neutral-400 hover:text-white text-[11px] font-semibold transition-colors"
            >
              {copiedLan ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
