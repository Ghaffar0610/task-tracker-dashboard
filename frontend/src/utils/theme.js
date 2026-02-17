const THEME_STORAGE_KEY = "tt-preauth-theme";

export const applyTheme = (theme) => {
  if (typeof document === "undefined") return;

  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", Boolean(shouldUseDark));
  saveTheme(theme);
};

export const getStoredTheme = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(THEME_STORAGE_KEY);
};

export const saveTheme = (theme) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};
