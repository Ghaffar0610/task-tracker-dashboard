export const applyTheme = (theme) => {
  if (typeof document === "undefined") return;

  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);
  document.body.classList.toggle("theme-dark", Boolean(shouldUseDark));
};

