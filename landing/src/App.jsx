import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Sparkles, Bot, Zap, Shield, PhoneCall, MessageCircle,
  Mail, CalendarDays, TrendingUp, Check, Cpu,
  Workflow, Plug, Users, Layers, Play, Pause, Bell, LayoutDashboard,
  ShoppingBag,
} from "lucide-react";
import { Header, roles } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";

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
        <div className="absolute inset-[32%] rounded-full border border-foreground/10" />
        <div className="absolute inset-[32%] rounded-full">
          <span className="absolute bottom-0 left-1/3 h-2 w-2 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.8)]" />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <OrbBuddy size={150} />
        <div
          className="glass absolute rounded-2xl rounded-bl-sm px-3 py-1.5 text-xs font-medium text-foreground/90 whitespace-nowrap shadow-lg"
          style={{ left: "62%", top: "20%" }}
        >
          Hi, ich bin Kiwo
        </div>
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

/* ---------- Kiwo character: Orb Buddy ---------- */
function OrbBuddy({ size = 44 }) {
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef(null);
  const [look, setLook] = useState({ lean: 0, eyeX: 0, eyeY: 0 });

  useEffect(() => {
    let raf = null;
    function handlePointerMove(e) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const el = rootRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const strength = Math.min(dist / 250, 1);
        setLook({
          lean: (dx / dist) * 18 * strength,
          eyeX: (dx / dist) * 4 * strength,
          eyeY: (dy / dist) * 4 * strength,
        });
      });
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg ref={rootRef} width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" className="orb-float">
      <defs>
        <radialGradient id={`ob-glow-${uid}`} cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#22D3EE" stopOpacity="0.55" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ob-body-${uid}`} cx="34%" cy="28%" r="80%">
          <stop offset="0" stopColor="#A5F3FC" />
          <stop offset="0.4" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#7C3AED" />
        </radialGradient>
        <radialGradient id={`ob-shine-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id={`ob-blurA-${uid}`}><feGaussianBlur stdDeviation="10" /></filter>
        <filter id={`ob-blurB-${uid}`}><feGaussianBlur stdDeviation="3.2" /></filter>
        <filter id={`ob-blurC-${uid}`}><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      <ellipse cx="100" cy="172" rx="32" ry="7" fill="#000" opacity="0.28" filter={`url(#ob-blurC-${uid})`} />
      <circle cx="100" cy="112" r="66" fill={`url(#ob-glow-${uid})`} filter={`url(#ob-blurA-${uid})`} />
      <g transform={`rotate(${look.lean.toFixed(2)} 100 112)`}>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-6 100 60;6 100 60;-6 100 60"
                             dur="3.5s" repeatCount="indefinite" />
          <line x1="100" y1="60" x2="100" y2="45" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="40" r="9" fill="#67E8F9" opacity="0.45" filter={`url(#ob-blurB-${uid})`} />
          <circle cx="100" cy="40" r="4.4" fill="#ECFEFF" />
        </g>
        <circle cx="100" cy="112" r="46" fill={`url(#ob-body-${uid})`} />
        <ellipse cx="83" cy="92" rx="20" ry="14" fill={`url(#ob-shine-${uid})`} opacity="0.8"
                 filter={`url(#ob-blurB-${uid})`} transform="rotate(-18 83 92)" />
        <path d="M124 132 A46 46 0 0 1 96 157" fill="none" stroke="#4C1D95" strokeWidth="10"
              strokeLinecap="round" opacity="0.18" filter={`url(#ob-blurB-${uid})`} />
        <g transform={`translate(${look.eyeX.toFixed(2)} ${look.eyeY.toFixed(2)})`}>
          <animate attributeName="opacity" values="1;1;0.1;1;1" keyTimes="0;0.46;0.5;0.54;1"
                   dur="4.2s" repeatCount="indefinite" />
          <circle cx="86" cy="110" r="5.6" fill="#0B1220" />
          <circle cx="114" cy="110" r="5.6" fill="#0B1220" />
          <circle cx="88" cy="107.5" r="1.6" fill="#fff" />
          <circle cx="116" cy="107.5" r="1.6" fill="#fff" />
        </g>
        <path d="M87 126 Q100 136 113 126" fill="none" stroke="#0B1220" strokeWidth="4.2" strokeLinecap="round" />
      </g>
    </svg>
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
          {soon ? "bald verfügbar" : role.tag}
        </span>
      </div>
      <h3 className={`mt-4 font-semibold ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>
        {role.name}
      </h3>
      <p className={`mt-2 text-foreground/60 leading-relaxed ${featured ? "text-base" : "text-sm"}`}>
        {role.desc}
      </p>
      {role.id === "reception" && featured && <CallWave />}
      {!soon && (
        <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 group-hover:text-foreground transition">
          Rolle ansehen <ArrowRight className="h-3.5 w-3.5" />
        </div>
      )}
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
                ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 ring-1 ring-cyan-400/20"
                : "bg-violet-400/10 text-violet-600 dark:text-violet-300 ring-1 ring-violet-400/20"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
              agent
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

/* ---------- Demo-Gespräche (gesprochene Beispiel-Dialoge, keine echten Anrufe) ---------- */
const demoCalls = [
  {
    id: "reservierung",
    title: "Tischreservierung",
    subtitle: "Beispiel-Gespräch",
    src: "/demo-audio/reservierung.mp3",
    tone: "violet",
  },
  {
    id: "bestellung",
    title: "Bestellung zur Abholung",
    subtitle: "Beispiel-Gespräch",
    src: "/demo-audio/bestellung.mp3",
    tone: "cyan",
  },
  {
    id: "oeffnungszeiten",
    title: "Öffnungszeiten & Reservierung",
    subtitle: "Beispiel-Gespräch",
    src: "/demo-audio/oeffnungszeiten.mp3",
    tone: "violet",
  },
];

function fmtTime(s) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function DemoCallCard({ call }) {
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
        src={call.src}
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
          aria-label={playing ? "Pause" : "Abspielen"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
            call.tone === "cyan"
              ? "bg-cyan-400/15 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-400/25"
              : "bg-violet-400/15 text-violet-600 dark:text-violet-300 hover:bg-violet-400/25"
          }`}
        >
          {playing ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 translate-x-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{call.title}</div>
          <div className="text-[11px] font-mono text-foreground/40">{call.subtitle}</div>
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
      <div className="flex items-center gap-2 text-xs font-mono text-violet-600/90 dark:text-violet-300/90">
        <TrendingUp className="h-3.5 w-3.5" /> ROI-RECHNER
      </div>
      <h3 className="mt-2 text-2xl md:text-3xl font-semibold">
        Was <span className="text-gradient">spart Kiwo</span> Ihnen?
      </h3>
      <p className="mt-2 text-sm text-foreground/60">
        Wie viele Stunden wiederkehrender Arbeit fallen pro Woche an?
      </p>
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/60 font-mono">5h</span>
          <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-mono text-cyan-600 dark:text-cyan-300">
            {hours} Std / Woche
          </span>
          <span className="text-foreground/60 font-mono">40h</span>
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
          <div className="text-xs text-cyan-600 dark:text-cyan-300 font-mono">Ersparnis / Monat</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {monthly.savedEuros.toLocaleString("de-DE")} €
          </div>
        </div>
        <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4">
          <div className="text-xs text-violet-600 dark:text-violet-300 font-mono">Zeit / Monat</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">
            {monthly.savedHours} Std
          </div>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-foreground/40">
        Basis: ⌀ {hourlyCost} €/Stunde Vollkosten (Gehalt, Lohnnebenkosten & Overhead).
      </p>
    </GlowCard>
  );
}

/* ---------- Preise ---------- */
const pricingFeatures = [
  "Alle freigeschalteten Kiwo-Rollen inklusive",
  "Dashboard: Reservierungen, Bestellungen & Anrufe",
  "E-Mail-Benachrichtigungen bei Neuem",
  "EU-Hosting & DSGVO-konform",
];
const pricingTiers = [
  { name: "Solo", minutes: 300, price: 69, savedHours: 6, savedEuros: 270, tone: "violet" },
  { name: "Team", minutes: 1000, price: 199, savedHours: 22, savedEuros: 910, tone: "cyan", featured: true },
  { name: "Scale", minutes: 2500, price: 399, savedHours: 54, savedEuros: 2275, tone: "violet" },
];

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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22),transparent_60%)] blur-3xl" />

      <Header />

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
              <span className="text-emerald-600 dark:text-emerald-300">Plattform online</span>
              <span className="text-foreground/30">|</span>
              <span className="text-foreground/60">v1.0 · EU</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-[2.4rem] leading-[1.05] font-semibold sm:text-5xl md:text-6xl"
            >
              <span className="text-gradient">KI-Works</span> – Die Plattform für{" "}
              <span className="text-foreground">digitale KI-Mitarbeiter</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 max-w-xl text-base md:text-lg text-foreground/65 leading-relaxed"
            >
              Lernen Sie <span className="text-violet-600 dark:text-violet-300 font-medium">Kiwo</span> kennen –
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
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
              >
                <Play className="h-3.5 w-3.5" /> Plattform-Demo
              </a>
            </motion.div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-foreground/50 font-mono">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> DSGVO · EU-Hosting
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" /> 12+ Integrationen
              </span>
              <span className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                {roles.filter((r) => r.status === "live").length} Rollen live ·{" "}
                {roles.filter((r) => r.status !== "live").length} bald
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
                // rollen_ökosystem
              </div>
              <h2 className="mt-2 text-3xl md:text-4xl font-semibold">
                Ein Kiwo. <span className="text-gradient">Viele Rollen.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm text-foreground/55">
              Jede Rolle ist spezialisiert – gemeinsam decken sie den Alltag Ihres Teams ab.
              Rollen ohne "bald verfügbar" sind schon heute einsatzbereit.
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
              <Zap className="h-3.5 w-3.5" /> LIVE-EINSATZ
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
              Testen Sie <span className="text-gradient">Kiwo</span>.
            </h2>
            <p className="mt-3 text-foreground/60 max-w-xl mx-auto text-sm md:text-base">
              Wählen Sie einen Befehl – Kiwo führt die Aufgabe live im Terminal aus.
            </p>
          </div>
          <div className="mt-8">
            <LiveTest />
          </div>

          <div className="mt-16 text-center">
            <div className="text-xs font-mono text-violet-600/90 dark:text-violet-300/90 inline-flex items-center gap-2">
              <PhoneCall className="h-3.5 w-3.5" /> ZUM ANHÖREN
            </div>
            <h3 className="mt-3 text-2xl md:text-3xl font-semibold">
              Beispiel-Gespräche mit <span className="text-gradient">Kiwo</span>.
            </h3>
            <p className="mt-3 text-foreground/60 max-w-xl mx-auto text-sm md:text-base">
              Gesprochene Beispiel-Dialoge, keine echten Gästeanrufe.
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
                <LayoutDashboard className="h-3.5 w-3.5" /> KUNDEN-DASHBOARD
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                Alles auf <span className="text-gradient">einen Blick</span>.
              </h2>
              <p className="mt-4 text-foreground/65 leading-relaxed">
                Reservierungen, Bestellungen und Anrufe laufen zentral in Ihrem eigenen
                Dashboard zusammen – kein Zettel, kein Durcheinander zwischen Telefon,
                WhatsApp und E-Mail.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-foreground/75">
                {[
                  "Alle Reservierungen, Bestellungen und Anrufe zentral an einem Ort",
                  "Benachrichtigung bei neuen Anrufen, Reservierungen und Bestellungen",
                  "Wochenkalender und Detailansicht auf einen Blick",
                  "Anruf-Zusammenfassungen und Aufnahmen direkt nachhören",
                  "Speisekarte, Öffnungszeiten und FAQ jederzeit selbst anpassen",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-400/15 text-violet-600 dark:text-violet-300">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/dashboard/"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200 transition"
              >
                Dashboard ansehen <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <GlowCard tone="violet" className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-foreground/50">// kiwo.dashboard</div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/15 px-2.5 py-0.5 text-[10px] font-mono text-violet-600 dark:text-violet-300">
                  <Bell className="h-3 w-3" /> 3 neu
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { icon: PhoneCall, tone: "cyan", label: "Neuer Anruf", meta: "vor 2 Min." },
                  { icon: ShoppingBag, tone: "violet", label: "Bestellung · 2× Pizza Margherita", meta: "vor 12 Min." },
                  { icon: CalendarDays, tone: "cyan", label: "Reservierung · 4 Pers., Fr 19:00", meta: "vor 34 Min." },
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
                <div className="text-xs text-cyan-600 dark:text-cyan-300 font-mono">Von Kiwo übernommen · dieser Monat</div>
                <div className="mt-1.5 text-2xl font-semibold tabular-nums">≈ 14 Std. · 588 €</div>
                <div className="mt-1.5 text-[11px] text-foreground/40">
                  Basis: ⌀ 42 €/Stunde Vollkosten (Gehalt, Lohnnebenkosten & Overhead)
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
                <Layers className="h-3.5 w-3.5" /> KI-WORKS PLATTFORM
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                Kiwo läuft auf der <span className="text-gradient">KI-Works Plattform</span>.
              </h2>
              <p className="mt-4 text-foreground/65 leading-relaxed">
                Sicher, DSGVO-konform und in der EU gehostet. Kiwo verbindet sich nahtlos mit
                Ihren bestehenden Tools – WhatsApp, Telefonanlagen, Outlook, Google Calendar
                und Ihrem CRM.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-foreground/75">
                {[
                  "EU-Hosting & Ende-zu-Ende Verschlüsselung",
                  "Feingranulare Rechte pro System",
                  "Audit-Logs für jede Aktion von Kiwo",
                  "SSO & rollenbasierter Zugriff",
                ].map((f) => (
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
                <div className="text-xs font-mono text-foreground/50">// integrations.stream</div>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-300">
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
                <Workflow className="h-3.5 w-3.5" /> ONBOARDING
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                In <span className="text-gradient">3 Schritten</span> zum KI-Mitarbeiter.
              </h2>
              <p className="mt-3 text-foreground/60 text-sm md:text-base">
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
                          <span className="font-mono text-2xl font-semibold text-foreground/20">
                            {s.n}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{s.title}</div>
                            <p className="mt-1 text-sm text-foreground/60">{s.desc}</p>
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
              <Sparkles className="h-3.5 w-3.5" /> PREISE
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
              Ein Kiwo, <span className="text-gradient">alle Rollen inklusive</span>.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-foreground/60">
              Sie zahlen nach Gesprächsvolumen, nicht danach, welche Rollen aktiv sind.
              Der erste Monat ist kostenlos.
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
                    Meistgewählt
                  </span>
                )}
                <div className={`${tier.featured ? "mt-3" : ""} text-lg font-semibold`}>{tier.name}</div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tabular-nums">{tier.price} €</span>
                  <span className="text-sm text-foreground/45">/ Monat</span>
                </div>
                <div className="mt-1.5 text-sm text-foreground/55">
                  {tier.minutes.toLocaleString("de-DE")} Gesprächsminuten/Monat
                </div>

                <ul className="mt-6 space-y-2.5 text-sm text-foreground/75">
                  {pricingFeatures.map((f) => (
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
                  ≈ {tier.savedHours} Std. Personalzeit gespart / Monat
                  <br />
                  <span className="text-foreground/40">≈ {tier.savedEuros.toLocaleString("de-DE")} € Wert (⌀ 42 €/Std.)</span>
                </div>

                <a
                  href="/kontakt.html"
                  className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
                >
                  Jetzt kostenlos testen <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </GlowCard>
            ))}
          </div>
          <p className="mt-6 text-center text-[11px] text-foreground/35">
            Alle Preise zzgl. USt. Mehr Minuten benötigt oder individuelles Paket gewünscht?{" "}
            <a href="/kontakt.html" className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200 transition">
              Sprechen Sie uns an
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
              Bereit für Ihren{" "}
              <span className="text-gradient">digitalen Mitarbeiter</span>?
            </h2>
            <p className="mt-3 text-foreground/60 max-w-xl mx-auto">
              Starten Sie mit einem kostenlosen Piloten – Rolle wählen, Kanäle verknüpfen,
              Kiwo übernimmt.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/kontakt.html"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
              >
                <Mail className="h-3.5 w-3.5" /> Demo anfragen
              </a>
            </div>
          </GlowCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}
