import { useEffect, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { getConsent, setConsent } from "../lib/cookieConsent.js";

// Ausgelöst vom "Cookie-Einstellungen"-Link im Footer, um den Banner erneut
// zu öffnen (Zustimmung muss jederzeit änderbar sein) — Footer und Banner
// sind an unterschiedlichen Stellen gemountet (App.jsx direkt vs. über
// PageShell), ein globales Event ist hier einfacher als Context/Prop-Drilling
// durch beide Einhänge-Pfade.
export const REOPEN_COOKIE_BANNER_EVENT = "kiworks-open-cookie-banner";

// Rein client-seitig (useEffect, läuft nie im SSR-Prerender-Output) —
// gleiches Muster wie LanguageSuggestionBanner. Zeigt sich, solange noch
// keine Wahl gespeichert ist, oder wenn über das Footer-Event erneut
// geöffnet.
export function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
    function reopen() {
      setVisible(true);
    }
    window.addEventListener(REOPEN_COOKIE_BANNER_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_COOKIE_BANNER_EVENT, reopen);
  }, []);

  if (!visible) return null;

  const choose = (choice) => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background/95 backdrop-blur-lg shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-foreground/70 leading-relaxed">
          {t("cookieBanner.text")}{" "}
          <a href="/datenschutz.html" className="font-medium text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200 transition">
            {t("cookieBanner.link")}
          </a>
        </p>
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="rounded-full border border-foreground/15 px-4 py-2 text-xs font-medium text-foreground/75 transition hover:border-foreground/30 hover:text-foreground"
          >
            {t("cookieBanner.essentialOnly")}
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-4 py-2 text-xs font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
          >
            {t("cookieBanner.acceptAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
