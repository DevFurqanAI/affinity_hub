export const THEME_STORAGE_KEY = "affinity-hub-theme";

export const THEME_OPTIONS = ["light", "dark", "system"];

export function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getStoredTheme() {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return THEME_OPTIONS.includes(storedTheme) ? storedTheme : "system";
}

export function applyResolvedTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function resolveTheme(theme) {
  return theme === "system" ? getSystemTheme() : theme;
}

export function initializeTheme() {
  const theme = getStoredTheme();
  applyResolvedTheme(resolveTheme(theme));
}
