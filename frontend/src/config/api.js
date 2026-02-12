const normalizeUrl = (value = "") => value.trim().replace(/\/+$/, "");
const envApiUrl = normalizeUrl(import.meta.env.VITE_API_URL || "");

if (!envApiUrl && !import.meta.env.DEV) {
  // Keep this visible in browser console for faster production debugging.
  console.error("VITE_API_URL is missing in production build.");
}

export const API_BASE_URL =
  envApiUrl || (import.meta.env.DEV ? "http://localhost:5000" : "");
