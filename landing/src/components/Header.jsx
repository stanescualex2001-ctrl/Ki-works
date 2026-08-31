import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu, X, ChevronDown, PhoneCall, TrendingUp, MessageCircle, ShoppingBag,
  CalendarDays, UserSearch, Receipt, Compass, Landmark,
  UtensilsCrossed, Hotel, Wrench, Stethoscope, Scissors, Car, Building2,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle.jsx";
import { LanguageToggle } from "./LanguageToggle.jsx";
import { useI18n, localizedPath } from "../i18n/index.jsx";

/* ---------- Role Bento (shared: mega-menu + Rollen-Sektion auf der Startseite) ---------- */
// name/tag/desc kommen aus den i18n-Wörterbüchern (roles.*/roleTag.*/roleDesc.*
// je Rollen-ID) — hier nur die sprachneutralen Metadaten (Icon, Farbe,
// Kategorie, Status).
export const roles = [
  { id: "reception", icon: PhoneCall, tone: "violet", category: "kundenkontakt", status: "live" },
  { id: "sales", icon: TrendingUp, tone: "cyan", category: "kundenkontakt", status: "soon" },
  { id: "support", icon: MessageCircle, tone: "violet", category: "kundenkontakt", status: "live" },
  { id: "orders", icon: ShoppingBag, tone: "violet", category: "kundenkontakt", status: "live" },
  { id: "office", icon: CalendarDays, tone: "cyan", category: "intern", status: "soon" },
  { id: "recruiting", icon: UserSearch, tone: "cyan", category: "intern", status: "soon" },
  { id: "collection", icon: Receipt, tone: "violet", category: "intern", status: "soon" },
  { id: "onboarding", icon: Compass, tone: "cyan", category: "intern", status: "soon" },
  { id: "finance", icon: Landmark, tone: "violet", category: "intern", status: "soon" },
];

/* ---------- Industries (Mega-Menü "Branchen") ---------- */
export const industries = [
  { id: "restaurants", icon: UtensilsCrossed, anchor: "#live", status: "live" },
  { id: "hotels", icon: Hotel, status: "soon" },
  { id: "handwerker", icon: Wrench, status: "soon" },
  { id: "arztpraxen", icon: Stethoscope, status: "soon" },
  { id: "friseure", icon: Scissors, status: "soon" },
  { id: "autowerkstaetten", icon: Car, status: "soon" },
  { id: "immobilien", icon: Building2, status: "soon" },
];

/* ---------- Brand mark: Orbit K (ring + K-monogram, orbiting channel dots) ---------- */
function OrbitKLogo({ size = 34 }) {
  const uid = useId().replace(/:/g, "");
  const dots = [
    { offset: 0, color: "#67E8F9", r: 5.4, w: 3, op: 0.6, blink: "1;0.15;1", begin: 0 },
    { offset: 120, color: "#A5B4FC", r: 4.2, w: 2.6, op: 0.55, blink: "0.2;1;0.2", begin: 0.667 },
    { offset: 240, color: "#F3F6FB", r: 3.4, w: 2.2, op: 0.5, blink: "0.15;1;0.15", begin: 1.333 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 150 150" aria-hidden="true">
      <defs>
        <linearGradient id={`ok-ring-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22D3EE" /><stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id={`ok-k-${uid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#06B6D4" /><stop offset="1" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <circle cx="75" cy="75" r="52" fill="none" stroke={`url(#ok-ring-${uid})`} strokeWidth="2.5" opacity="0.35" />
      <path d="M64 52 L64 98 M64 75 L86 52 M72 75 L86 98" fill="none" stroke={`url(#ok-k-${uid})`}
            strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      {dots.map((d) => (
        <g key={d.offset} transform={`rotate(${d.offset} 75 75)`}>
          <animateTransform attributeName="transform" type="rotate" from={`${d.offset} 75 75`}
                             to={`${d.offset + 360} 75 75`} dur="8s" repeatCount="indefinite" />
          <path d="M 52.2 28.26 A 52 52 0 0 1 75 23" fill="none" stroke={d.color}
                strokeWidth={d.w} strokeLinecap="round" opacity={d.op} />
          <circle cx="75" cy="23" r={d.r} fill={d.color}>
            <animate attributeName="opacity" values={d.blink} dur="2s" begin={`${d.begin}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Solutions menu content (shared: desktop dropdown + mobile accordion) ---------- */
function StatusMenuLink({ icon: Icon, name, href, status, iconTone, onNavigate }) {
  const { t } = useI18n();
  if (status === "live") {
    return (
      <a
        href={href}
        onClick={onNavigate}
        className="flex items-center justify-between gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground/75 transition hover:bg-foreground/5 hover:text-foreground"
      >
        <span className="flex items-center gap-2.5">
          <Icon className={`h-4 w-4 shrink-0 ${iconTone}`} />
          {name}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" /> {t("nav.statusLive")}
        </span>
      </a>
    );
  }
  return (
    <span className="flex cursor-default items-center justify-between gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground/35">
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0 text-foreground/25" />
        {name}
      </span>
      <span className="text-[10px] font-mono text-foreground/25">{t("nav.statusSoon")}</span>
    </span>
  );
}

function SolutionsMenuContent({ onNavigate, stacked = false, homeHref }) {
  const { t } = useI18n();
  const kundenkontakt = roles.filter((r) => r.category === "kundenkontakt");
  const intern = roles.filter((r) => r.category === "intern");
  return (
    <div className={`grid gap-6 ${stacked ? "" : "sm:grid-cols-2"}`}>
      <div className="flex flex-col gap-5">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wide text-foreground/40">
            {t("nav.categoryCustomer")}
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {kundenkontakt.map((r) => (
              <StatusMenuLink
                key={r.id}
                icon={r.icon}
                name={t(`roles.${r.id}`)}
                href={`${homeHref}#roles`}
                status={r.status}
                iconTone="text-cyan-600 dark:text-cyan-300"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wide text-foreground/40">
            {t("nav.categoryInternal")}
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {intern.map((r) => (
              <StatusMenuLink
                key={r.id}
                icon={r.icon}
                name={t(`roles.${r.id}`)}
                href={`${homeHref}#roles`}
                status={r.status}
                iconTone="text-cyan-600 dark:text-cyan-300"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wide text-foreground/40">
          {t("nav.categoryIndustries")}
        </div>
        <div className="mt-3 flex flex-col gap-1">
          {industries.map((ind) => (
            <StatusMenuLink
              key={ind.id}
              icon={ind.icon}
              name={t(`industries.${ind.id}`)}
              href={`${homeHref}${ind.anchor || "#roles"}`}
              status={ind.status}
              iconTone="text-violet-600 dark:text-violet-300"
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Header (Nav) — geteilt zwischen Startseite, Kontakt, Impressum, Datenschutz ---------- */
// page: "home" | "kontakt" | "legal" — bestimmt, wohin Logo/Nav-Anker/
// Kontakt-Link je nach aktueller Sprache zeigen (siehe i18n/index.jsx
// localizedPath) und ob der Sprachumschalter eine Zielseite hat.
export function Header({ page = "home" }) {
  const { locale, t } = useI18n();
  const homeHref = localizedPath("home", locale);
  const kontaktHref = localizedPath("kontakt", locale);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const solutionsRef = useRef(null);
  const logoTitleRef = useRef(null);
  const logoSubtitleRef = useRef(null);

  // Subtitle "PLATFORM" per Letter-Spacing auf dieselbe Breite wie "KI-Works"
  // darüber strecken (Länge variiert je Sprache: PLATFORM vs. PLATFORMĂ).
  useEffect(() => {
    const title = logoTitleRef.current;
    const subtitle = logoSubtitleRef.current;
    if (!title || !subtitle) return;
    subtitle.style.letterSpacing = "normal";
    const targetWidth = title.getBoundingClientRect().width;
    const naturalWidth = subtitle.getBoundingClientRect().width;
    const chars = subtitle.textContent?.length || 0;
    if (chars > 1 && targetWidth > naturalWidth) {
      subtitle.style.letterSpacing = `${((targetWidth - naturalWidth) / chars).toFixed(2)}px`;
    }
  }, [locale]);

  useEffect(() => {
    function handleClick(e) {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target)) {
        setSolutionsOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") {
        setSolutionsOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="relative z-20">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-6 min-[1440px]:flex min-[1440px]:justify-between">
        <a href={homeHref} className="flex min-w-0 items-center gap-2.5 min-[1440px]:shrink-0">
          <span className="relative flex h-[54px] w-[54px] shrink-0 items-center justify-center">
            <OrbitKLogo size={54} />
          </span>
          <div className="hidden min-w-0 leading-tight sm:block">
            <div className="truncate text-sm font-semibold tracking-tight">
              <span ref={logoTitleRef}>KI-Works</span>
            </div>
            <div className="truncate text-[10px] font-mono text-foreground/40">
              <span ref={logoSubtitleRef}>{t("nav.logoSubtitle")}</span>
            </div>
          </div>
        </a>
        <nav className="hidden min-[1440px]:flex flex-wrap items-center gap-6 text-sm text-foreground/60">
          <div ref={solutionsRef} className="relative">
            <button
              type="button"
              onClick={() => setSolutionsOpen((v) => !v)}
              aria-expanded={solutionsOpen}
              className="flex items-center gap-1 hover:text-foreground transition"
            >
              {t("nav.solutions")}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${solutionsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {solutionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="glass absolute left-1/2 top-full z-30 mt-3 w-[520px] -translate-x-1/2 rounded-2xl p-5 shadow-2xl"
                >
                  <SolutionsMenuContent onNavigate={() => setSolutionsOpen(false)} homeHref={homeHref} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a href={`${homeHref}#live`} className="hover:text-foreground transition">{t("nav.liveTest")}</a>
          <a href={`${homeHref}#dashboard`} className="hover:text-foreground transition">{t("nav.dashboard")}</a>
          <a href={`${homeHref}#platform`} className="hover:text-foreground transition">{t("nav.platform")}</a>
          <a href={`${homeHref}#preise`} className="hover:text-foreground transition">{t("nav.pricing")}</a>
          <a href={`${homeHref}#onboarding`} className="hover:text-foreground transition">{t("nav.onboarding")}</a>
          <a href={kontaktHref} className="hover:text-foreground transition">{t("nav.contact")}</a>
          <a href={`${homeHref}#reseller`} className="hover:text-foreground transition">{t("nav.forAgencies")}</a>
        </nav>
        <div className="justify-self-end flex items-center gap-2.5">
          <LanguageToggle page={page} />
          <ThemeToggle />
          <a
            href={`/dashboard/?lang=${locale}`}
            className="inline-flex rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-3 py-2 text-xs font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform whitespace-nowrap"
          >
            {t("nav.customerLogin")}
          </a>
          <a
            href={`${homeHref}#live`}
            className="hidden rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-4 py-2 text-xs font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform whitespace-nowrap sm:inline-flex"
          >
            {t("nav.tryKiwo")}
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={t("nav.menuAriaLabel")}
            className="ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-foreground/80 transition hover:border-foreground/30 hover:text-foreground min-[1440px]:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="glass overflow-hidden border-t border-foreground/10 min-[1440px]:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-5 text-sm sm:px-6">
              <button
                type="button"
                onClick={() => setMobileSolutionsOpen((v) => !v)}
                aria-expanded={mobileSolutionsOpen}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 text-foreground/80 transition hover:text-foreground"
              >
                {t("nav.solutions")}
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileSolutionsOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileSolutionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pb-2 pl-2"
                  >
                    <SolutionsMenuContent
                      stacked
                      homeHref={homeHref}
                      onNavigate={() => {
                        setMobileOpen(false);
                        setMobileSolutionsOpen(false);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <a
                href={`${homeHref}#live`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-foreground/80 transition hover:text-foreground"
              >
                {t("nav.liveTest")}
              </a>
              <a
                href={`${homeHref}#dashboard`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-foreground/80 transition hover:text-foreground"
              >
                {t("nav.dashboard")}
              </a>
              <a
                href={`${homeHref}#platform`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-foreground/80 transition hover:text-foreground"
              >
                {t("nav.platform")}
              </a>
              <a
                href={`${homeHref}#preise`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-foreground/80 transition hover:text-foreground"
              >
                {t("nav.pricing")}
              </a>
              <a
                href={`${homeHref}#onboarding`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-foreground/80 transition hover:text-foreground"
              >
                {t("nav.onboarding")}
              </a>
              <a
                href={kontaktHref}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-foreground/80 transition hover:text-foreground"
              >
                {t("nav.contact")}
              </a>
              <a
                href={`${homeHref}#reseller`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-foreground/80 transition hover:text-foreground"
              >
                {t("nav.forAgencies")}
              </a>
              <a
                href={`/dashboard/?lang=${locale}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-foreground/80 transition hover:text-foreground"
              >
                {t("nav.customerLogin")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
