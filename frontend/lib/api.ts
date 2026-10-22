/**
 * ClosetOS Universal API Client
 * Seamlessly handles:
 * 1. Web browser (Vite proxy relative path: "")
 * 2. Capacitor Native Android app (connecting over mobile internet 4G/5G/Wi-Fi to cloud backend)
 * 3. User-customizable Cloud Backend URL (e.g. Render, Railway, Fly.io, or Cloudflare tunnel)
 */

export const DEFAULT_CLOUD_API = "https://wrapping-whale-deliver-pump.trycloudflare.com";

export const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") return "";

  // Check if running inside Capacitor Android native container
  const isCapacitor =
    (window as any).Capacitor !== undefined ||
    window.location.protocol === "capacitor:" ||
    (window.location.hostname === "localhost" && window.location.port === "");

  const savedUrl = localStorage.getItem("closetos_backend_url");

  if (isCapacitor) {
    return savedUrl || DEFAULT_CLOUD_API;
  }

  // In web browser, if a custom cloud backend is explicitly set, use it; otherwise use Vite proxy
  return savedUrl || "";
};

export const setApiBaseUrl = (url: string) => {
  if (typeof window !== "undefined") {
    const cleanUrl = url.trim().replace(/\/+$/, "");
    if (cleanUrl) {
      localStorage.setItem("closetos_backend_url", cleanUrl);
    } else {
      localStorage.removeItem("closetos_backend_url");
    }
  }
};

export const apiFetch = (endpoint: string, options?: RequestInit): Promise<Response> => {
  const baseUrl = getApiBaseUrl();
  const targetUrl = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
  return fetch(targetUrl, options);
};

export const formatImageUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
};
