import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useI18n } from "../i18n/index.jsx";
import { OrbBuddy } from "./OrbBuddy.jsx";
import { COOKIE_BANNER_VISIBILITY_EVENT } from "./CookieBanner.jsx";

// Pilot: nur ki-works.eu selbst (same-origin, keine restaurantId nötig —
// der Server nutzt seinen hinterlegten Standard-Betrieb, siehe
// backend/src/server.js POST /api/public/webchat). Gesprächsverlauf lebt
// bewusst nur im Speicher dieser Komponente (kein localStorage) — reine
// Chat-Funktion, kein Tracking, siehe Datenschutzerklärung Abschnitt 8.
export function ChatWidget() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    function onBannerVisibility(e) {
      setBannerVisible(!!e.detail?.visible);
    }
    window.addEventListener(COOKIE_BANNER_VISIBILITY_EVENT, onBannerVisibility);
    return () => window.removeEventListener(COOKIE_BANNER_VISIBILITY_EVENT, onBannerVisibility);
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/public/webchat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bubble weicht dem unten sitzenden Cookie-Banner aus, statt sich zu
  // überlappen — gleiches Event-Signal, das der Banner beim Öffnen sendet.
  const bubbleBottomClass = bannerVisible ? "bottom-24 sm:bottom-28" : "bottom-5 sm:bottom-6";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("chatWidget.openLabel")}
        className={`fixed right-5 sm:right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 glow-cyan shadow-xl transition-[bottom] duration-300 hover:scale-105 ${bubbleBottomClass}`}
      >
        <MessageCircle className="h-6 w-6 text-[#0A0F1D]" />
      </button>
    );
  }

  return (
    <div
      className={`fixed right-5 sm:right-6 z-30 flex h-[min(32rem,70vh)] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-2xl transition-[bottom] duration-300 ${bubbleBottomClass}`}
    >
      <div className="flex items-center gap-2.5 border-b border-foreground/10 bg-foreground/[0.03] px-4 py-3">
        <OrbBuddy size={28} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{t("chatWidget.title")}</div>
          <div className="truncate text-[11px] text-foreground/50">{t("chatWidget.subtitle")}</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("chatWidget.closeLabel")}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-foreground/40 hover:text-foreground/70 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {!messages.length && (
          <p className="text-sm text-foreground/50">{t("chatWidget.greeting")}</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-auto rounded-br-sm bg-gradient-to-br from-cyan-400 to-violet-500 text-[#0A0F1D]"
                : "rounded-bl-sm bg-foreground/5 text-foreground/85"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-foreground/5 px-3.5 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 typing-dot" />
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 typing-dot" style={{ animationDelay: "0.15s" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 typing-dot" style={{ animationDelay: "0.3s" }} />
          </div>
        )}
        {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-foreground/10 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chatWidget.placeholder")}
          lang={locale}
          className="min-w-0 flex-1 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3.5 py-2 text-sm text-foreground placeholder-foreground/30 outline-none transition focus:border-cyan-400/40"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label={t("chatWidget.sendLabel")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-[#0A0F1D] transition disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
