import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Sparkles, Bot, Zap, Shield, PhoneCall, MessageCircle,
  Mail, CalendarDays, TrendingUp, Check, Cpu,
  Workflow, Plug, Layers, Play, Pause, Bell, LayoutDashboard,
  ShoppingBag,
} from "lucide-react";
import { Header, roles } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { LanguageSuggestionBanner } from "./components/LanguageSuggestionBanner.jsx";
import { CookieBanner } from "./components/CookieBanner.jsx";
import { OrbBuddy } from "./components/OrbBuddy.jsx";
import { ChatWidget } from "./components/ChatWidget.jsx";
import { useI18n, DEFAULT_LOCALE } from "./i18n/index.jsx";

/* ============================================================
   Design tokens (semantic):
   - CYAN (#06B6D4) = KI-Works platform accent
   - VIOLET (#6366F1) = Kiwo (agent) accent
   ============================================================ */

/* ---------- GlowCard ---------- */
function GlowCard({ children, className = "", tone = "cyan" }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={`glass group relative overflow-hidden rounded-2xl hover-glow ${
        tone === "cyan" ? "hover-glow-cyan" : "hover-glow-violet"
      } ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at var(--mx) var(--my), ${
            tone === "cyan" ? "rgba(6,182,212,0.18)" : "rgba(99,102,241,0.20)"
          }, transparent 60%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ---------- Hero Orb ---------- */
function KiwoOrb() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.35),transparent_60%)] blur-2xl float-blob" />
      <div
        className="absolute inset-12 rounded-full bg-[radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.4),transparent_60%)] blur-2xl float-blob"
        style={{ animationDelay: "-6s" }}
      />
      <div className="absolute inset-0 orbit-spin-slow">
        <div className="absolute inset-[8%] rounded-full border border-cyan-400/25" />
        <div className="absolute inset-[8%] rounded-full">
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.9)]" />
        </div>
      </div>
      <div className="absolute inset-0 orbit-spin-rev">
        <div className="absolute inset-[20%] rounded-full border border-violet-400/25" />
        <div className="absolute inset-[20%] rounded-full">
          <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-violet-400 shadow-[0_0_20px_rgba(99,102,241,0.9)]" />
        </div>
      </div>
      <div className="absolute inset-0 orbit-spin-slow" style={{ animationDuration: "60s" }}>
        <div className="absolute inset-[32%] rounded-full border border-foreground/10" />
        <div className="absolute inset-[32%] rounded-full">
          <span className="absolute bottom-0 left-1/3 h-2 w-2 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.8)]" />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: 150, height: 150 }}>
          <OrbBuddy size={150} />
          <div
            className="glass absolute rounded-2xl rounded-bl-sm px-3 py-1.5 text-xs font-medium text-foreground/90 whitespace-nowrap shadow-lg"
            style={{ left: "68%", top: "14%" }}
          >
            {t("heroOrb.speechBubble")}
          </div>
        </div>
      </div>

      {[
        { label: t("heroOrb.badgeCall"), top: "6%", left: "4%", tone: "cyan" },
        { label: t("heroOrb.badgeAppointment"), top: "16%", right: "2%", tone: "violet" },
        { label: t("heroOrb.badgeWhatsapp"), bottom: "16%", left: "0%", tone: "violet" },
        { label: t("heroOrb.badgeLead"), bottom: "6%", right: "6%", tone: "cyan" },
      ].map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.18, duration: 0.6 }}
          className="absolute glass rounded-full px-3 py-1.5 text-[11px] text-foreground/85 flex items-center gap-1.5 whitespace-nowrap"
          style={c}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full pulse-dot ${
              c.tone === "cyan" ? "bg-cyan-400" : "bg-violet-400"
            }`}
          />
          {c.t}
        </motion.div>
      ))}
    </div>
  );
}

function CallWave() {
  return (
    <div className="mt-4 flex h-10 items-end gap-1">
      {Array.from({ length: 22 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-cyan-500/40 to-violet-400"
          animate={{ scaleY: [0.3, 1, 0.5, 0.9, 0.4] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut",
          }}
          style={{ height: "100%", transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

function RoleCard({ role, featured = false }) {
  const { t } = useI18n();
  const Icon = role.icon;
  const soon = role.status === "soon";
  return (
    <GlowCard tone={role.tone} className={`p-6 h-full ${featured ? "md:p-8" : ""} ${soon ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            role.tone === "cyan"
              ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 ring-1 ring-cyan-400/20"
              : "bg-violet-400/10 text-violet-600 dark:text-violet-300 ring-1 ring-violet-400/20"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-mono ${
            soon ? "bg-amber-400/10 text-amber-600 dark:text-amber-300" : "bg-foreground/5 text-foreground/50"
          }`}
        >
          {soon ? t("roleCard.soon") : t(`roleTag.${role.id}`)}
        </span>
      </div>
      <h3 className={`mt-4 font-semibold ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>
        {t(`roles.${role.id}`)}
      </h3>
      <p className={`mt-2 text-foreground/60 leading-relaxed ${featured ? "text-base" : "text-sm"}`}>
        {t(`roleDesc.${role.id}`)}
      </p>
      {role.id === "reception" && featured && <CallWave />}
      {!soon && (
        <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 group-hover:text-foreground transition">
          {t("roleCard.viewRole")} <ArrowRight className="h-3.5 w-3.5" />
        </div>
      )}
    </GlowCard>
  );
}

/* ---------- Live Test Command Interface ---------- */

const commandMeta = [
  { id: "call", tone: "violet", icon: PhoneCall },
  { id: "calendar", tone: "cyan", icon: CalendarDays },
  { id: "whatsapp", tone: "violet", icon: MessageCircle },
];

function LiveTest() {
  const { t } = useI18n();
  const commands = useMemo(
    () =>
      commandMeta.map((c) => ({
        ...c,
        role: t(`liveTest.commands.${c.id}.role`),
        label: t(`liveTest.commands.${c.id}.label`),
        steps: t(`liveTest.commands.${c.id}.steps`),
      })),
    [t],
  );
  const [active, setActive] = useState(commands[0]);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!running) return;
    if (step >= active.steps.length) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [running, step, active]);

  function run(cmd) {
    setActive(cmd);
    setStep(0);
    setRunning(true);
    setRunId((r) => r + 1);
  }

  const Icon = active.icon;
  const done = !running && step >= active.steps.length;

  return (
    <GlowCard tone={active.tone} className="p-5 sm:p-7">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              active.tone === "cyan"
                ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 ring-1 ring-cyan-400/20"
                : "bg-violet-400/10 text-violet-600 dark:text-violet-300 ring-1 ring-violet-400/20"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
              {t("liveTest.agentLabel")}
            </div>
            <div className="truncate text-sm font-semibold">{active.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              running ? "bg-cyan-400 pulse-dot" : done ? "bg-emerald-400" : "bg-foreground/30"
            }`}
          />
          <span className={running ? "text-cyan-600 dark:text-cyan-300" : done ? "text-emerald-600 dark:text-emerald-300" : "text-foreground/50"}>
            {running ? t("liveTest.stateWorking") : done ? t("liveTest.stateDone") : t("liveTest.stateReady")}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {commands.map((c) => {
          const Ci = c.icon;
          const isActive = c.id === active.id;
          return (
            <button
              key={c.id}
              onClick={() => run(c)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-all ${
                isActive
                  ? c.tone === "cyan"
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200"
                    : "border-violet-400/40 bg-violet-400/10 text-violet-700 dark:text-violet-200"
                  : "border-foreground/10 bg-foreground/[0.03] text-foreground/70 hover:text-foreground"
              }`}
            >
              <Ci className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-foreground/50">{c.role}:</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Terminal-Mock bleibt bewusst immer dunkel (wie ein Code-Editor), unabhängig vom Seiten-Theme */}
      <div className="mt-5 rounded-xl border border-white/5 bg-[#0B1220] p-4 font-mono text-[13px] min-h-[220px]">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
          <span className="h-2 w-2 rounded-full bg-red-400/70" />
          <span className="h-2 w-2 rounded-full bg-amber-400/70" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
          <span className="ml-2">kiwo.terminal</span>
        </div>
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {active.steps.slice(0, step).map((s, i) => (
              <motion.div
                key={`${runId}-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2 text-white/85"
              >
                <span className="text-cyan-400">›</span>
                <span>{s}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {running && (
            <div className="flex items-center gap-2 text-white/50">
              <span className="text-violet-400">›</span>
              <span>{t("liveTest.workingLine")}</span>
              <span className="flex gap-1">
                <span className="h-1 w-1 rounded-full bg-violet-400 typing-dot" />
                <span
                  className="h-1 w-1 rounded-full bg-violet-400 typing-dot"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="h-1 w-1 rounded-full bg-violet-400 typing-dot"
                  style={{ animationDelay: "0.3s" }}
                />
              </span>
            </div>
          )}
          {!running && step === 0 && (
            <div className="text-white/40">
              {t("liveTest.placeholder")}
            </div>
          )}
        </div>
      </div>
    </GlowCard>
  );
}

/* ---------- Demo-Gespräche (gesprochene Beispiel-Dialoge, keine echten Anrufe) ----------
   Deutsche Dateien ohne Sprach-Suffix (Original), EN/RO als eigene
   Aufnahmen mit -en/-ro-Suffix — DemoCallCard wählt die passende Datei
   je nach aktueller Locale. */
const demoCalls = [
  { id: "reservierung", tone: "violet" },
  { id: "bestellung", tone: "cyan" },
  { id: "oeffnungszeiten", tone: "violet" },
];

function fmtTime(s) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function DemoCallCard({ call }) {
  const { t, locale } = useI18n();
  const src = `/demo-audio/${call.id}${locale === DEFAULT_LOCALE ? "" : `-${locale}`}.mp3`;
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play();
  };

  const pct = duration ? Math.min(100, (current / duration) * 100) : 0;

  return (
    <GlowCard tone={call.tone} className="p-5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? t("demo.pause") : t("demo.play")}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
            call.tone === "cyan"
              ? "bg-cyan-400/15 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-400/25"
              : "bg-violet-400/15 text-violet-600 dark:text-violet-300 hover:bg-violet-400/25"
          }`}
        >
          {playing ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 translate-x-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{t(`demo.calls.${call.id}`)}</div>
          <div className="text-[11px] font-mono text-foreground/40">{t("demo.subtitleTag")}</div>
        </div>
        <div className="shrink-0 font-mono text-[11px] text-foreground/40 tabular-nums">
          {fmtTime(current)} / {fmtTime(duration)}
        </div>
      </div>
      <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className={`h-full rounded-full ${call.tone === "cyan" ? "bg-cyan-400" : "bg-violet-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </GlowCard>
  );
}

/* ---------- Integrations carousel ---------- */

const integrations = [
  "WhatsApp Business",
  "Microsoft Teams",
  "Slack",
  "Outlook",
  "Google Calendar",
  "HubSpot",
  "Salesforce",
  "SAP",
  "Sipgate",
  "3CX",
  "Zapier",
  "DATEV",
];

function IntegrationsMarquee() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
      <div className="flex marquee gap-3 w-max">
        {[...integrations, ...integrations].map((t, i) => (
          <div
            key={i}
            className="glass rounded-full px-4 py-2.5 text-sm text-foreground/85 whitespace-nowrap flex items-center gap-2"
          >
            <Plug className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- ROI ---------- */
const LOCALE_INTL = { de: "de-DE", en: "en-US", ro: "ro-RO" };

function ROICalc() {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const [hours, setHours] = useState(15);
  const hourlyCost = 21;
  const monthly = useMemo(() => {
    const savedHours = hours * 4.33;
    return {
      savedHours: Math.round(savedHours),
      savedEuros: Math.round(savedHours * hourlyCost),
    };
  }, [hours]);
  return (
    <GlowCard tone="violet" className="p-6 md:p-8">
      <div className="flex items-center gap-2 text-xs font-mono text-violet-600/90 dark:text-violet-300/90">
        <TrendingUp className="h-3.5 w-3.5" /> {t("roi.eyebrow")}
      </div>
      <h3 className="mt-2 text-2xl md:text-3xl font-semibold">
        {t("roi.headingPrefix")} <span className="text-gradient">{t("roi.headingHighlight")}</span> {t("roi.headingSuffix")}
      </h3>
      <p className="mt-2 text-sm text-foreground/60">
        {t("roi.subtitle")}
      </p>
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/60 font-mono">{t("roi.min")}</span>
          <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-mono text-cyan-600 dark:text-cyan-300">
            {hours} {t("roi.unit")}
          </span>
          <span className="text-foreground/60 font-mono">{t("roi.max")}</span>
        </div>
        <input
          type="range"
          min={5}
          max={40}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="mt-3 w-full accent-violet-400"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <div className="text-xs text-cyan-600 dark:text-cyan-300 font-mono">{t("roi.savingsLabel")}</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {monthly.savedEuros.toLocaleString(intlLocale)} €
          </div>
        </div>
        <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4">
          <div className="text-xs text-violet-600 dark:text-violet-300 font-mono">{t("roi.timeLabel")}</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {monthly.savedHours} {t("roi.hoursUnit")}
          </div>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-foreground/40">
        {t("roi.basis", { cost: hourlyCost })}
      </p>
    </GlowCard>
  );
}

/* ---------- Preise ---------- */
const pricingTiers = [
  { name: "Solo", minutes: 600, price: 99, savedHours: 13, savedEuros: 273, tone: "violet" },
  { name: "Team", minutes: 1500, price: 249, savedHours: 33, savedEuros: 693, tone: "cyan", featured: true },
  { name: "Scale", minutes: 3500, price: 499, savedHours: 76, savedEuros: 1596, tone: "violet" },
];

/* ---------- Onboarding ---------- */
const stepMeta = [
  { n: "01", key: "step1", icon: Mail },
  { n: "02", key: "step2", icon: Plug },
  { n: "03", key: "step3", icon: Sparkles },
];

/* ---------- Page ---------- */
export default function App() {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22),transparent_60%)] blur-3xl" />

      <Header page="home" />
      {locale === DEFAULT_LOCALE && <LanguageSuggestionBanner page="home" />}

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-8 pb-20 sm:px-6 md:grid-cols-2 md:pt-14 md:pb-28">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 rounded-full glass px-3.5 py-1.5 text-xs font-mono"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-emerald-600 dark:text-emerald-300">{t("hero.badgeStatus")}</span>
              <span className="text-foreground/30">|</span>
              <span className="text-foreground/60">{t("hero.badgeVersion")}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-[2.4rem] leading-[1.05] font-semibold sm:text-5xl md:text-6xl"
            >
              <span className="text-gradient">{t("hero.titleBrand")}</span> {t("hero.titleRest")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 max-w-xl text-base md:text-lg text-foreground/65 leading-relaxed"
            >
              {t("hero.subtitlePrefix")} <span className="text-violet-600 dark:text-violet-300 font-medium">{t("hero.subtitleName")}</span>{" "}
              {t("hero.subtitleSuffix")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="#roles"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
              >
                {t("hero.ctaPrimary")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#live"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
              >
                <Play className="h-3.5 w-3.5" /> {t("hero.ctaSecondary")}
              </a>
            </motion.div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-foreground/50 font-mono">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> {t("hero.statGdpr")}
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" /> {t("hero.statIntegrations")}
              </span>
              <span className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                {t("hero.statRoles", {
                  live: roles.filter((r) => r.status === "live").length,
                  soon: roles.filter((r) => r.status !== "live").length,
                })}
              </span>
            </div>
          </div>

          <div className="relative">
            <KiwoOrb />
          </div>
        </div>
      </section>

      {/* Roles Bento */}
      <section id="roles" className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <div className="text-xs font-mono text-violet-600/90 dark:text-violet-300/90 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
                {t("rolesSection.eyebrow")}
              </div>
              <h2 className="mt-2 text-3xl md:text-4xl font-semibold">
                {t("rolesSection.headingPrefix")} <span className="text-gradient">{t("rolesSection.headingHighlight")}</span>
              </h2>
            </div>
            <p className="max-w-md text-sm text-foreground/55">
              {t("rolesSection.subtitle")}
            </p>
          </div>

          {/* Asymmetric bento */}
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <div className="md:col-span-2 md:row-span-1">
              <RoleCard role={roles[0]} featured />
            </div>
            {roles.slice(1).map((r) => (
              <div key={r.id}>
                <RoleCard role={r} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live test */}
      <section id="live" className="relative z-10">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 md:py-24">
          <div className="text-center">
            <div className="text-xs font-mono text-cyan-600/90 dark:text-cyan-300/90 inline-flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" /> {t("liveTest.eyebrow")}
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
              {t("liveTest.headingPrefix")} <span className="text-gradient">{t("liveTest.headingHighlight")}</span>
            </h2>
            <p className="mt-3 text-foreground/60 max-w-xl mx-auto text-sm md:text-base">
              {t("liveTest.subtitle")}
            </p>
          </div>
          <div className="mt-8">
            <LiveTest />
          </div>

          <div className="mt-16 text-center">
            <div className="text-xs font-mono text-violet-600/90 dark:text-violet-300/90 inline-flex items-center gap-2">
              <PhoneCall className="h-3.5 w-3.5" /> {t("demo.eyebrow")}
            </div>
            <h3 className="mt-3 text-2xl md:text-3xl font-semibold">
              {t("demo.headingPrefix")} <span className="text-gradient">{t("demo.headingHighlight")}</span>
            </h3>
            <p className="mt-3 text-foreground/60 max-w-xl mx-auto text-sm md:text-base">
              {t("demo.subtitle")}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {demoCalls.map((call) => (
              <DemoCallCard key={call.id} call={call} />
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section id="dashboard" className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-mono text-violet-600/90 dark:text-violet-300/90 flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" /> {t("dashboardSection.eyebrow")}
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                {t("dashboardSection.headingPrefix")} <span className="text-gradient">{t("dashboardSection.headingHighlight")}</span>
              </h2>
              <p className="mt-4 text-foreground/65 leading-relaxed">
                {t("dashboardSection.desc")}
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-foreground/75">
                {t("dashboardSection.features").map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-400/15 text-violet-600 dark:text-violet-300">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={`/dashboard/?lang=${locale}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200 transition"
              >
                {t("dashboardSection.linkText")} <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <GlowCard tone="violet" className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-foreground/50">{t("dashboardSection.mockLabel")}</div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/15 px-2.5 py-0.5 text-[10px] font-mono text-violet-600 dark:text-violet-300">
                  <Bell className="h-3 w-3" /> {t("dashboardSection.newBadge")}
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { icon: PhoneCall, tone: "cyan", label: t("dashboardSection.rowCall"), meta: t("dashboardSection.metaCall") },
                  { icon: ShoppingBag, tone: "violet", label: t("dashboardSection.rowOrder"), meta: t("dashboardSection.metaOrder") },
                  { icon: CalendarDays, tone: "cyan", label: t("dashboardSection.rowReservation"), meta: t("dashboardSection.metaReservation") },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        row.tone === "cyan"
                          ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300"
                          : "bg-violet-400/10 text-violet-600 dark:text-violet-300"
                      }`}
                    >
                      <row.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground/85">{row.label}</span>
                    <span className="shrink-0 text-[11px] font-mono text-foreground/40">{row.meta}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                <div className="text-xs text-cyan-600 dark:text-cyan-300 font-mono">{t("dashboardSection.savedLabel")}</div>
                <div className="mt-1.5 text-2xl font-semibold tabular-nums">{t("dashboardSection.savedValue")}</div>
                <div className="mt-1.5 text-[11px] text-foreground/40">
                  {t("dashboardSection.savedBasis")}
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* Platform / Integrations */}
      <section id="platform" className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-mono text-cyan-600/90 dark:text-cyan-300/90 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" /> {t("platformSection.eyebrow")}
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                {t("platformSection.headingPrefix")} <span className="text-gradient">{t("platformSection.headingHighlight")}</span>
              </h2>
              <p className="mt-4 text-foreground/65 leading-relaxed">
                {t("platformSection.desc")}
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-foreground/75">
                {t("platformSection.features").map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-600 dark:text-cyan-300">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <GlowCard tone="cyan" className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-foreground/50">{t("platformSection.mockLabel")}</div>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-300">
                  {t("platformSection.onlineBadge")}
                </span>
              </div>
              <div className="mt-4">
                <IntegrationsMarquee />
              </div>
              <div className="mt-4">
                <IntegrationsMarquee />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { k: "99.98%", v: t("platformSection.statUptime") },
                  { k: "< 400ms", v: t("platformSection.statResponse") },
                  { k: "EU", v: t("platformSection.statData") },
                ].map((s) => (
                  <div
                    key={s.v}
                    className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3"
                  >
                    <div className="text-lg font-semibold tabular-nums text-foreground">
                      {s.k}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* ROI + Onboarding */}
      <section id="onboarding" className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-start">
            <ROICalc />
            <div>
              <div className="text-xs font-mono text-violet-600/90 dark:text-violet-300/90 flex items-center gap-2">
                <Workflow className="h-3.5 w-3.5" /> {t("onboardingSection.eyebrow")}
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                {t("onboardingSection.headingPrefix")} <span className="text-gradient">{t("onboardingSection.headingHighlight")}</span>
              </h2>
              <p className="mt-3 text-foreground/60 text-sm md:text-base">
                {t("onboardingSection.subtitle")}
              </p>
              <div className="mt-6 space-y-3">
                {stepMeta.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.n}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <GlowCard tone={i === 1 ? "cyan" : "violet"} className="p-5">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
                          <span className="font-mono text-2xl font-semibold text-foreground/20">
                            {s.n}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{t(`onboardingSection.steps.${s.key}.title`)}</div>
                            <p className="mt-1 text-sm text-foreground/60">{t(`onboardingSection.steps.${s.key}.desc`)}</p>
                          </div>
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              i === 1
                                ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 ring-1 ring-cyan-400/20"
                                : "bg-violet-400/10 text-violet-600 dark:text-violet-300 ring-1 ring-violet-400/20"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                        </div>
                      </GlowCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preise */}
      <section id="preise" className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-600/90 dark:text-cyan-300/90">
              <Sparkles className="h-3.5 w-3.5" /> {t("pricing.eyebrow")}
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
              {t("pricing.headingPrefix")} <span className="text-gradient">{t("pricing.headingHighlight")}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-foreground/60">
              {t("pricing.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <GlowCard
                key={tier.name}
                tone={tier.tone}
                className={`p-6 md:p-8 ${tier.featured ? "md:-translate-y-2 ring-1 ring-cyan-400/30" : ""}`}
              >
                {tier.featured && (
                  <span className="inline-flex rounded-full bg-cyan-400/15 px-3 py-1 text-[10px] font-mono uppercase tracking-wide text-cyan-600 dark:text-cyan-300">
                    {t("pricing.featured")}
                  </span>
                )}
                <div className={`${tier.featured ? "mt-3" : ""} text-lg font-semibold`}>{tier.name}</div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tabular-nums">{tier.price} €</span>
                  <span className="text-sm text-foreground/45">{t("pricing.perMonth")}</span>
                </div>
                <div className="mt-1.5 text-sm text-foreground/55">
                  {t("pricing.minutesPerMonth", { n: tier.minutes.toLocaleString(intlLocale) })}
                </div>

                <ul className="mt-6 space-y-2.5 text-sm text-foreground/75">
                  {t("pricing.features").map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                          tier.tone === "cyan" ? "bg-cyan-400/15 text-cyan-600 dark:text-cyan-300" : "bg-violet-400/15 text-violet-600 dark:text-violet-300"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3.5 text-xs text-foreground/55">
                  {t("pricing.savedPersonnel", { h: tier.savedHours })}
                  <br />
                  <span className="text-foreground/40">{t("pricing.savedValue", { e: tier.savedEuros.toLocaleString(intlLocale) })}</span>
                </div>

                <a
                  href="/kontakt.html"
                  className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
                >
                  {t("pricing.cta")} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </GlowCard>
            ))}
          </div>
          <p className="mt-6 text-center text-[11px] text-foreground/35">
            {t("pricing.footnote")}{" "}
            <a href="/kontakt.html" className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200 transition">
              {t("pricing.footnoteCta")}
            </a>
            .
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10">
        <div className="mx-auto max-w-5xl px-5 pb-20 sm:px-6 md:pb-28">
          <GlowCard tone="cyan" className="p-8 md:p-12 text-center">
            <div className="flex justify-center">
              <OrbBuddy size={72} />
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold">
              {t("ctaSection.headingPrefix")}{" "}
              <span className="text-gradient">{t("ctaSection.headingHighlight")}</span>
            </h2>
            <p className="mt-3 text-foreground/60 max-w-xl mx-auto">
              {t("ctaSection.subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/kontakt.html"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
              >
                <Mail className="h-3.5 w-3.5" /> {t("ctaSection.button")}
              </a>
            </div>
          </GlowCard>
        </div>
      </section>

      <Footer page="home" />
      <CookieBanner />
      <ChatWidget />
    </div>
  );
}
