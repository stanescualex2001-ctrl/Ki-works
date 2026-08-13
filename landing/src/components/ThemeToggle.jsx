import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { getStoredTheme, applyTheme } from "../theme.js";

export function ThemeToggle({ className = "inline-flex" }) {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Zu Light Mode wechseln" : "Zu Dark Mode wechseln"}
      title={theme === "dark" ? "Light Mode" : "Dark Mode"}
      className={`${className} h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 transition hover:border-foreground/30 hover:text-foreground`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
