import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, createTranslator, localizedPath } from "../i18n/index.jsx";

const DISMISS_KEY = "kiworks-lang-banner-dismissed";

// Nur auf der deutschen Startseite gemountet. Rein client-seitig (useEffect,
// läuft nie im SSR-Prerender-Output) — schlägt bei erkannter
// nicht-deutscher Browsersprache (aktuell EN oder RO) die passende
// übersetzte Seite vor, statt automatisch dorthin umzuleiten (ein
// JS-Redirect würde aus SEO-Sicht wie eine Weiterleitung weg von der
// deutschen URL wirken und ihr schaden). Banner-Text kommt bewusst aus dem
// Wörterbuch der VORGESCHLAGENEN Sprache (nicht der aktuellen Seite), damit
// der Besucher ihn in seiner eigenen Sprache liest.
export function LanguageSuggestionBanner({ page = "home" }) {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      return; // localStorage evtl. blockiert — dann kein Banner
    }
    const navLocale = (navigator.language || "").toLowerCase().slice(0, 2);
    const match = SUPPORTED_LOCALES.find((l) => l !== DEFAULT_LOCALE && l === navLocale);
    if (match) setTarget(match);
  }, []);

  if (!target) return null;

  const t = createTranslator(target);
  const href = localizedPath(page, target);
  if (!href) return null;

  const dismiss = () => {
    setTarget(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignorieren */
    }
  };

  return (
    <div className="relative z-10 border-b border-cyan-400/20 bg-cyan-400/10 dark:bg-cyan-400/5">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-5 py-2 text-xs text-foreground/75 sm:px-6">
        <span>{t("languageBanner.text")}</span>
        <a href={href} className="font-semibold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200 transition">
          {t("languageBanner.cta")} →
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("languageBanner.dismissAriaLabel")}
          className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-foreground/40 hover:text-foreground/70 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
