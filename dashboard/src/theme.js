const KEY = "kiworks-theme-dashboard";

export function getStoredTheme() {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  try {
    localStorage.setItem(KEY, isDark ? "dark" : "light");
  } catch {
    /* localStorage kann in manchen Kontexten blockiert sein, dann bleibt es bei der Session-Wahl */
  }
}
