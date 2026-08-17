import { useEffect, useRef, useState } from "react";
import { useI18n, localizedPath, SUPPORTED_LOCALES } from "../i18n/index.jsx";

const FLAG = { de: "🇩🇪", en: "🇬🇧", ro: "🇷🇴" };
const NATIVE_NAME = { de: "Deutsch", en: "English", ro: "Română" };

// Dropdown statt einfachem Zwei-Wege-Toggle, da >2 Sprachen unterstützt
// werden (DE/EN/RO). Alle Sprach-Links werden immer ins HTML gerendert
// (nur per CSS "hidden" ausgeblendet, nicht bedingt weggelassen) — bleiben
// dadurch auch im SSR-Prerender-Output für Crawler vorhanden. "page" kommt
// immer explizit von der jeweiligen Seite (nie aus window.location) —
// läuft auch beim SSR-Prerender in Node, wo es kein window gibt.
export function LanguageToggle({ page = "home", className = "inline-flex" }) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const others = SUPPORTED_LOCALES.filter((l) => l !== locale)
    .map((l) => ({ locale: l, href: localizedPath(page, l) }))
    .filter((l) => l.href);

  if (!others.length) return null; // Impressum/Datenschutz: keine andere Sprachversion vorhanden

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("languageToggle.ariaLabel")}
        title={t("languageToggle.ariaLabel")}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-base transition hover:border-foreground/30"
      >
        <span aria-hidden="true">{FLAG[locale]}</span>
      </button>
      <div
        className={`absolute right-0 top-full z-30 mt-2 min-w-[9rem] rounded-xl border border-foreground/10 bg-background p-1.5 shadow-xl ${open ? "" : "hidden"}`}
      >
        {others.map((o) => (
          <a
            key={o.locale}
            href={o.href}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground/75 transition hover:bg-foreground/5 hover:text-foreground"
          >
            <span aria-hidden="true">{FLAG[o.locale]}</span>
            {NATIVE_NAME[o.locale]}
          </a>
        ))}
      </div>
    </div>
  );
}
