const envApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL =
  envApiUrl || (import.meta.env.DEV ? "http://localhost:5000" : "");
