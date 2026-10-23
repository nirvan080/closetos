/**
 * ClosetOS Universal API Client
 * Seamlessly handles:
 * 1. Web browser (Vite proxy relative path: "")
 * 2. Capacitor Native Android app (connecting over mobile internet 4G/5G/Wi-Fi to cloud backend)
 * 3. User-customizable Cloud Backend URL (e.g. Render, Railway, Fly.io, or Cloudflare tunnel)
 */

export const DEFAULT_CLOUD_API = "https://closetos-xo77.onrender.com";

export const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") return DEFAULT_CLOUD_API;

  const savedUrl = localStorage.getItem("closetos_backend_url");
  if (savedUrl) return savedUrl;

  // If developing locally on port 3000 with Vite proxy, use relative path
  if (window.location.port === "3000") {
    return "";
  }

  // Everywhere else (Native Android Capacitor, mobile phone, production): use cloud backend
  return DEFAULT_CLOUD_API;
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
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const targetUrl = endpoint.startsWith("http") ? endpoint : `${baseUrl}${cleanEndpoint}`;
  return fetch(targetUrl, options);
};

export const formatImageUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const baseUrl = getApiBaseUrl() || DEFAULT_CLOUD_API;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
