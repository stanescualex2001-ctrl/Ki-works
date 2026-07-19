import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Sparkles, Bot, Zap, Shield, PhoneCall, MessageCircle,
  Mail, CalendarDays, ShoppingBag, TrendingUp, Send, Check, Cpu,
  Workflow, Plug, Users, Layers, Play,
} from "lucide-react";

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
        <div className="absolute inset-[32%] rounded-full border border-white/10" />
        <div className="absolute inset-[32%] rounded-full">
          <span className="absolute bottom-0 left-1/3 h-2 w-2 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.8)]" />
        </div>
      </div>
      <div className="absolute inset-[40%] rounded-full bg-gradient-to-br from-cyan-400/70 via-white/20 to-violet-500/80 blur-[2px]" />
      <div className="absolute inset-[42%] rounded-full glass flex items-center justify-center">
        <Bot className="h-8 w-8 text-violet-300" />
      </div>

      {[
        { t: "Anruf angenommen", top: "6%", left: "4%", tone: "cyan" },
        { t: "Termin gebucht", top: "16%", right: "2%", tone: "violet" },
        { t: "WhatsApp beantwortet", bottom: "16%", left: "0%", tone: "violet" },
        { t: "Lead qualifiziert", bottom: "6%", right: "6%", tone: "cyan" },
      ].map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.18, duration: 0.6 }}
          className="absolute glass rounded-full px-3 py-1.5 text-[11px] text-white/85 flex items-center gap-1.5 whitespace-nowrap"
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

/* ---------- Role Bento ---------- */
const roles = [
  {
    id: "reception",
    name: "Kiwo Reception",
    tag: "Telefon & Empfang",
    desc: "Nimmt Anrufe an, filtert, leitet weiter oder gibt Auskunft – rund um die Uhr, ohne Wartemusik.",
    icon: PhoneCall,
    tone: "violet",
  },
  {
    id: "sales",
    name: "Kiwo Sales",
    tag: "Vertrieb & Leads",
    desc: "Qualifiziert Leads, beantwortet Erstfragen und übergibt heiße Kontakte direkt an Ihr Team.",
    icon: TrendingUp,
    tone: "cyan",
  },
  {
    id: "support",
    name: "Kiwo Support",
    tag: "Service · 24/7",
    desc: "Beantwortet FAQs über WhatsApp und Web-Chat – im Ton Ihrer Marke, mehrsprachig.",
    icon: MessageCircle,
    tone: "violet",
  },
  {
    id: "office",
    name: "Kiwo Office",
    tag: "E-Mail & Kalender",
    desc: "Sortiert E-Mails, koordiniert Termine und synchronisiert Kalender – ohne Ping-Pong.",
    icon: CalendarDays,
    tone: "cyan",
  },
  {
    id: "orders",
    name: "Kiwo Orders",
    tag: "Bestellungen & Reservierungen",
    desc: "Nimmt Bestellungen und Reservierungen entgegen, prüft Verfügbarkeit und bestätigt sofort.",
    icon: ShoppingBag,
    tone: "violet",
  },
];

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
  const Icon = role.icon;
  return (
    <GlowCard tone={role.tone} className={`p-6 h-full ${featured ? "md:p-8" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            role.tone === "cyan"
              ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
              : "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/20"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-mono text-white/50">
          {role.tag}
        </span>
      </div>
      <h3 className={`mt-4 font-semibold ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>
        {role.name}
      </h3>
      <p className={`mt-2 text-white/60 leading-relaxed ${featured ? "text-base" : "text-sm"}`}>
        {role.desc}
      </p>
      {role.id === "reception" && featured && <CallWave />}
      <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-white/70 group-hover:text-white transition">
        Rolle ansehen <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </GlowCard>
  );
}

/* ---------- Live Test Command Interface ---------- */

const commands = [
  {
    id: "call",
    role: "Kiwo Reception",
    label: "Nimm einen Anruf an",
    tone: "violet",
    icon: PhoneCall,
    steps: [
      "Eingehender Anruf von +49 30 ...",
      "Kiwo antwortet: \"Guten Tag, hier ist Kiwo für ki-works.eu…\"",
      "Anliegen erkannt: Rückrufbitte, Priorität mittel.",
      "Ticket #A-2481 erstellt und im CRM protokolliert.",
      "Erledigt in 11 Sek. ✓",
    ],
  },
  {
    id: "calendar",
    role: "Kiwo Office",
    label: "Trage einen Termin ein",
    tone: "cyan",
    icon: CalendarDays,
    steps: [
      "E-Mail \"Terminvorschlag Do 14:00\" erkannt.",
      "Kalender geprüft: Slot Do 14:00–14:45 frei.",
      "Einladung an Kunde und Kollegin gesendet.",
      "Erinnerung 24h vorher automatisch geplant.",
      "Erledigt in 6 Sek. ✓",
    ],
  },
  {
    id: "whatsapp",
    role: "Kiwo Support",
    label: "Beantworte eine WhatsApp",
    tone: "violet",
    icon: MessageCircle,
    steps: [
      "Neue WhatsApp: \"Ist heute noch geöffnet?\"",
      "Öffnungszeiten aus Knowledge Base geladen.",
      "Antwort formuliert im Ton Ihrer Marke.",
      "Antwort gesendet · Empfangsbestätigung ✓",
      "Erledigt in 3 Sek. ✓",
    ],
  },
];

function LiveTest() {
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
                ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
                : "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/20"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
              agent
            </div>
            <div className="truncate text-sm font-semibold">{active.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              running ? "bg-cyan-400 pulse-dot" : done ? "bg-emerald-400" : "bg-white/30"
            }`}
          />
          <span className={running ? "text-cyan-300" : done ? "text-emerald-300" : "text-white/50"}>
            {running ? "arbeitet…" : done ? "erledigt" : "bereit"}
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
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                    : "border-violet-400/40 bg-violet-400/10 text-violet-200"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:text-white"
              }`}
            >
              <Ci className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-white/50">{c.role}:</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-white/5 bg-black/30 p-4 font-mono text-[13px] min-h-[220px]">
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
              <span>Kiwo arbeitet</span>
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
              › Wähle einen Befehl oben, um Kiwo live zu testen.
            </div>
          )}
        </div>
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
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0A0F1D] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0A0F1D] to-transparent z-10" />
      <div className="flex marquee gap-3 w-max">
        {[...integrations, ...integrations].map((t, i) => (
          <div
            key={i}
            className="glass rounded-full px-4 py-2.5 text-sm text-white/85 whitespace-nowrap flex items-center gap-2"
          >
            <Plug className="h-3.5 w-3.5 text-cyan-400" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- ROI ---------- */
function ROICalc() {
  const [hours, setHours] = useState(15);
  const hourlyCost = 42;
  const monthly = useMemo(() => {
    const savedHours = hours * 4.33;
    return {
      savedHours: Math.round(savedHours),
      savedEuros: Math.round(savedHours * hourlyCost),
    };
  }, [hours]);
  return (
    <GlowCard tone="violet" className="p-6 md:p-8">
      <div className="flex items-center gap-2 text-xs font-mono text-violet-300/90">
        <TrendingUp className="h-3.5 w-3.5" /> ROI-RECHNER
      </div>
      <h3 className="mt-2 text-2xl md:text-3xl font-semibold">
        Was <span className="text-gradient">spart Kiwo</span> Ihnen?
      </h3>
      <p className="mt-2 text-sm text-white/60">
        Wie viele Stunden wiederkehrender Arbeit fallen pro Woche an?
      </p>
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60 font-mono">5h</span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-mono text-cyan-300">
            {hours} Std / Woche
          </span>
          <span className="text-white/60 font-mono">40h</span>
        </div>
        <input
          type="range"
          min={5}
          max={40}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="mt-3 w-full accent-violet-400"
          style={{ colorScheme: "dark" }}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <div className="text-xs text-cyan-300 font-mono">Ersparnis / Monat</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {monthly.savedEuros.toLocaleString("de-DE")} €
          </div>
        </div>
        <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4">
          <div className="text-xs text-violet-300 font-mono">Zeit / Monat</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {monthly.savedHours} Std
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

/* ---------- Onboarding ---------- */
const steps = [
  {
    n: "01",
    title: "Rolle wählen",
    desc: "Reception, Sales, Support, Office oder Orders – oder eine Kombination.",
    icon: Users,
  },
  {
    n: "02",
    title: "Kanäle verknüpfen",
    desc: "Telefonanlage, WhatsApp, E-Mail, Kalender & CRM sicher verbinden.",
    icon: Plug,
  },
  {
    n: "03",
    title: "Kiwo arbeitet für Sie",
    desc: "Ab Tag 1 produktiv – Sie prüfen nur noch die Ergebnisse.",
    icon: Sparkles,
  },
];

/* ---------- Page ---------- */
export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0F1D] text-white">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22),transparent_60%)] blur-3xl" />

      {/* Nav */}
      <header className="relative z-20">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-6 md:flex md:justify-between">
          <a href="#" className="flex min-w-0 items-center gap-2.5">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-[#0A0F1D]">
              <Layers className="h-4.5 w-4.5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-dot" />
            </span>
            <div className="leading-tight min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">KI-Works</div>
              <div className="truncate text-[10px] font-mono text-white/40">platform · agent kiwo</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#roles" className="hover:text-white transition">Rollen</a>
            <a href="#live" className="hover:text-white transition">Live testen</a>
            <a href="#platform" className="hover:text-white transition">Plattform</a>
            <a href="#onboarding" className="hover:text-white transition">Onboarding</a>
          </nav>
          <a
            href="#live"
            className="justify-self-end rounded-full glass px-4 py-2 text-xs font-medium text-white hover-glow hover-glow-cyan whitespace-nowrap"
          >
            Kiwo testen
          </a>
        </div>
      </header>

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
              <span className="text-emerald-300">Plattform online</span>
              <span className="text-white/30">|</span>
              <span className="text-white/60">v1.0 · EU</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-[2.4rem] leading-[1.05] font-semibold sm:text-5xl md:text-6xl"
            >
              <span className="text-gradient">KI-Works</span> – Die Plattform für{" "}
              <span className="text-white">digitale KI-Mitarbeiter</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 max-w-xl text-base md:text-lg text-white/65 leading-relaxed"
            >
              Lernen Sie <span className="text-violet-300 font-medium">Kiwo</span> kennen –
              Ihren digitalen Mitarbeiter für Telefon, WhatsApp, E-Mail und Terminverwaltung.
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
                Kiwo kennenlernen
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#live"
                className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm text-white/85 border border-white/15 hover-glow hover-glow-cyan"
              >
                <Play className="h-3.5 w-3.5" /> Plattform-Demo
              </a>
            </motion.div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/50 font-mono">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-cyan-400" /> DSGVO · EU-Hosting
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-violet-400" /> 12+ Integrationen
              </span>
              <span className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-cyan-400" /> 5 Rollen
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
              <div className="text-xs font-mono text-violet-300/90 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 pulse-dot" />
                // rollen_ökosystem
              </div>
              <h2 className="mt-2 text-3xl md:text-4xl font-semibold">
                Ein Kiwo. <span className="text-gradient">Fünf Rollen.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm text-white/55">
              Jede Rolle ist spezialisiert – gemeinsam decken sie den Alltag Ihres Teams ab.
            </p>
          </div>

          {/* Asymmetric bento */}
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <div className="md:col-span-2 md:row-span-1">
              <RoleCard role={roles[0]} featured />
            </div>
            <div>
              <RoleCard role={roles[1]} />
            </div>
            <div>
              <RoleCard role={roles[2]} />
            </div>
            <div>
              <RoleCard role={roles[3]} />
            </div>
            <div>
              <RoleCard role={roles[4]} />
            </div>
          </div>
        </div>
      </section>

      {/* Live test */}
      <section id="live" className="relative z-10">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 md:py-24">
          <div className="text-center">
            <div className="text-xs font-mono text-cyan-300/90 inline-flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" /> LIVE-EINSATZ
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
              Testen Sie <span className="text-gradient">Kiwo</span>.
            </h2>
            <p className="mt-3 text-white/60 max-w-xl mx-auto text-sm md:text-base">
              Wählen Sie einen Befehl – Kiwo führt die Aufgabe live im Terminal aus.
            </p>
          </div>
          <div className="mt-8">
            <LiveTest />
          </div>
        </div>
      </section>

      {/* Platform / Integrations */}
      <section id="platform" className="relative z-10">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-mono text-cyan-300/90 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5" /> KI-WORKS PLATTFORM
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                Kiwo läuft auf der <span className="text-gradient">KI-Works Plattform</span>.
              </h2>
              <p className="mt-4 text-white/65 leading-relaxed">
                Sicher, DSGVO-konform und in der EU gehostet. Kiwo verbindet sich nahtlos mit
                Ihren bestehenden Tools – WhatsApp, Telefonanlagen, Outlook, Google Calendar
                und Ihrem CRM.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-white/75">
                {[
                  "EU-Hosting & Ende-zu-Ende Verschlüsselung",
                  "Feingranulare Rechte pro System",
                  "Audit-Logs für jede Aktion von Kiwo",
                  "SSO & rollenbasierter Zugriff",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <GlowCard tone="cyan" className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-white/50">// integrations.stream</div>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  online
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
                  { k: "99.98%", v: "Uptime" },
                  { k: "< 400ms", v: "Antwortzeit" },
                  { k: "EU", v: "Datenhaltung" },
                ].map((s) => (
                  <div
                    key={s.v}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="text-lg font-semibold tabular-nums text-white">
                      {s.k}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
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
              <div className="text-xs font-mono text-violet-300/90 flex items-center gap-2">
                <Workflow className="h-3.5 w-3.5" /> ONBOARDING
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                In <span className="text-gradient">3 Schritten</span> zum KI-Mitarbeiter.
              </h2>
              <p className="mt-3 text-white/60 text-sm md:text-base">
                Oft in unter einer Woche produktiv – ohne IT-Projekt.
              </p>
              <div className="mt-6 space-y-3">
                {steps.map((s, i) => {
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
                          <span className="font-mono text-2xl font-semibold text-white/20">
                            {s.n}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{s.title}</div>
                            <p className="mt-1 text-sm text-white/60">{s.desc}</p>
                          </div>
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              i === 1
                                ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
                                : "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/20"
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

      {/* Final CTA */}
      <section className="relative z-10">
        <div className="mx-auto max-w-5xl px-5 pb-20 sm:px-6 md:pb-28">
          <GlowCard tone="cyan" className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Bereit für Ihren{" "}
              <span className="text-gradient">digitalen Mitarbeiter</span>?
            </h2>
            <p className="mt-3 text-white/60 max-w-xl mx-auto">
              Starten Sie mit einem kostenlosen Piloten – Rolle wählen, Kanäle verknüpfen,
              Kiwo übernimmt.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="#live"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
              >
                Kiwo kennenlernen <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="mailto:info@ki-works.eu"
                className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm text-white/85 border border-white/15 hover-glow hover-glow-violet"
              >
                <Mail className="h-3.5 w-3.5" /> Demo anfragen
              </a>
            </div>
          </GlowCard>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-white/40 font-mono sm:px-6">
          <div className="truncate">© {new Date().getFullYear()} KI-Works · agent kiwo v1.0</div>
          <div className="flex items-center gap-4">
            <a href="/impressum.html" className="hover:text-white/70 transition">Impressum</a>
            <a href="/datenschutz.html" className="hover:text-white/70 transition">Datenschutz</a>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
