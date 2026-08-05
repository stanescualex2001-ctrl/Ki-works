import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu, X, ChevronDown, PhoneCall, TrendingUp, MessageCircle, ShoppingBag,
  CalendarDays, UserSearch, Receipt, Compass, Landmark,
  UtensilsCrossed, Hotel, Wrench, Stethoscope, Scissors, Car, Building2,
} from "lucide-react";

/* ---------- Role Bento (shared: mega-menu + Rollen-Sektion auf der Startseite) ---------- */
export const roles = [
  {
    id: "reception",
    name: "Kiwo Reception",
    tag: "Telefon & Empfang",
    desc: "Nimmt Anrufe an, filtert, leitet weiter oder gibt Auskunft – rund um die Uhr, ohne Wartemusik.",
    icon: PhoneCall,
    tone: "violet",
    category: "kundenkontakt",
    status: "live",
  },
  {
    id: "sales",
    name: "Kiwo Sales",
    tag: "Vertrieb & Leads",
    desc: "Qualifiziert Leads, beantwortet Erstfragen und übergibt heiße Kontakte direkt an Ihr Team.",
    icon: TrendingUp,
    tone: "cyan",
    category: "kundenkontakt",
    status: "live",
  },
  {
    id: "support",
    name: "Kiwo Support",
    tag: "Service · 24/7",
    desc: "Beantwortet FAQs über WhatsApp und Web-Chat – im Ton Ihrer Marke, mehrsprachig.",
    icon: MessageCircle,
    tone: "violet",
    category: "kundenkontakt",
    status: "live",
  },
  {
    id: "orders",
    name: "Kiwo Orders",
    tag: "Bestellungen & Reservierungen",
    desc: "Nimmt Bestellungen und Reservierungen entgegen, prüft Verfügbarkeit und bestätigt sofort.",
    icon: ShoppingBag,
    tone: "violet",
    category: "kundenkontakt",
    status: "live",
  },
  {
    id: "office",
    name: "Kiwo Office",
    tag: "E-Mail & Kalender",
    desc: "Sortiert E-Mails, koordiniert Termine und synchronisiert Kalender – ohne Ping-Pong.",
    icon: CalendarDays,
    tone: "cyan",
    category: "intern",
    status: "live",
  },
  {
    id: "recruiting",
    name: "Kiwo Recruiting",
    tag: "Bewerber-Erstqualifizierung",
    desc: "Führt Erstgespräche mit Bewerbern, prüft Verfügbarkeiten und bucht Termine im Kalender Ihres HR-Teams.",
    icon: UserSearch,
    tone: "cyan",
    category: "intern",
    status: "soon",
  },
  {
    id: "collection",
    name: "Kiwo Collection",
    tag: "Zahlungserinnerung",
    desc: "Erinnert freundlich an offene Rechnungen, statt wie ein Inkassobüro aufzutreten.",
    icon: Receipt,
    tone: "violet",
    category: "intern",
    status: "soon",
  },
  {
    id: "onboarding",
    name: "Kiwo Onboarding",
    tag: "Kunden- & Mitarbeiter-Einführung",
    desc: "Begleitet neue Kunden oder Mitarbeitende in den ersten 30 Tagen und beantwortet Startfragen.",
    icon: Compass,
    tone: "cyan",
    category: "intern",
    status: "soon",
  },
  {
    id: "finance",
    name: "Kiwo Finance",
    tag: "Belege & Rechnungen",
    desc: "Liest Belege und Rechnungen aus und übergibt die Daten an Ihre Buchhaltung.",
    icon: Landmark,
    tone: "violet",
    category: "intern",
    status: "soon",
  },
];

/* ---------- Industries (Mega-Menü "Branchen") ---------- */
export const industries = [
  { name: "Restaurants", icon: UtensilsCrossed, href: "/#live", status: "live" },
  { name: "Hotels", icon: Hotel, status: "soon" },
  { name: "Handwerker", icon: Wrench, status: "soon" },
  { name: "Arztpraxen", icon: Stethoscope, status: "soon" },
  { name: "Friseure & Salons", icon: Scissors, status: "soon" },
  { name: "Autowerkstätten", icon: Car, status: "soon" },
  { name: "Immobilien", icon: Building2, status: "soon" },
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
  if (status === "live") {
    return (
      <a
        href={href}
        onClick={onNavigate}
        className="flex items-center justify-between gap-2.5 rounded-lg px-2 py-2 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
      >
        <span className="flex items-center gap-2.5">
          <Icon className={`h-4 w-4 shrink-0 ${iconTone}`} />
          {name}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" /> live
        </span>
      </a>
    );
  }
  return (
    <span className="flex cursor-default items-center justify-between gap-2.5 rounded-lg px-2 py-2 text-sm text-white/35">
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0 text-white/25" />
        {name}
      </span>
      <span className="text-[10px] font-mono text-white/25">bald</span>
    </span>
  );
}

function SolutionsMenuContent({ onNavigate, stacked = false }) {
  const kundenkontakt = roles.filter((r) => r.category === "kundenkontakt");
  const intern = roles.filter((r) => r.category === "intern");
  return (
    <div className={`grid gap-6 ${stacked ? "" : "sm:grid-cols-2"}`}>
      <div className="flex flex-col gap-5">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wide text-white/40">
            Kundenkontakt
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {kundenkontakt.map((r) => (
              <StatusMenuLink
                key={r.id}
                icon={r.icon}
                name={r.name}
                href="/#roles"
                status={r.status}
                iconTone="text-cyan-300"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wide text-white/40">
            Interne Prozesse
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {intern.map((r) => (
              <StatusMenuLink
                key={r.id}
                icon={r.icon}
                name={r.name}
                href="/#roles"
                status={r.status}
                iconTone="text-cyan-300"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wide text-white/40">
          Branchen
        </div>
        <div className="mt-3 flex flex-col gap-1">
          {industries.map((ind) => (
            <StatusMenuLink
              key={ind.name}
              icon={ind.icon}
              name={ind.name}
              href={ind.href || "/#roles"}
              status={ind.status}
              iconTone="text-violet-300"
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Header (Nav) — geteilt zwischen Startseite, Impressum, Datenschutz ---------- */
export function Header() {
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const solutionsRef = useRef(null);

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
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-6 md:flex md:justify-between">
        <a href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <OrbitKLogo size={36} />
          </span>
          <div className="leading-tight min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">KI-Works</div>
            <div className="truncate text-[10px] font-mono text-white/40">
              <span className="sm:hidden">agent kiwo</span>
              <span className="hidden sm:inline">platform · agent kiwo</span>
            </div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <div ref={solutionsRef} className="relative">
            <button
              type="button"
              onClick={() => setSolutionsOpen((v) => !v)}
              aria-expanded={solutionsOpen}
              className="flex items-center gap-1 hover:text-white transition"
            >
              Lösungen
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
                  <SolutionsMenuContent onNavigate={() => setSolutionsOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a href="/#live" className="hover:text-white transition">Live testen</a>
          <a href="/#platform" className="hover:text-white transition">Plattform</a>
          <a href="/#preise" className="hover:text-white transition">Preise</a>
          <a href="/#onboarding" className="hover:text-white transition">Onboarding</a>
          <a href="/kontakt.html" className="hover:text-white transition">Kontakt</a>
        </nav>
        <div className="justify-self-end flex items-center gap-2.5">
          <a
            href="/dashboard/"
            className="inline-flex rounded-full border border-white/15 px-3 py-2 text-xs font-medium text-white/80 hover:text-white hover:border-white/30 transition whitespace-nowrap"
          >
            <span className="sm:hidden">Login</span>
            <span className="hidden sm:inline">Kunden-Login</span>
          </a>
          <a
            href="/#live"
            className="rounded-full glass px-4 py-2 text-xs font-medium text-white hover-glow hover-glow-cyan whitespace-nowrap"
          >
            Kiwo testen
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Menü"
            className="ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/30 hover:text-white md:hidden"
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
            className="glass overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-5 text-sm sm:px-6">
              <button
                type="button"
                onClick={() => setMobileSolutionsOpen((v) => !v)}
                aria-expanded={mobileSolutionsOpen}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 text-white/80 transition hover:text-white"
              >
                Lösungen
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
                      onNavigate={() => {
                        setMobileOpen(false);
                        setMobileSolutionsOpen(false);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <a
                href="/#live"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-white/80 transition hover:text-white"
              >
                Live testen
              </a>
              <a
                href="/#platform"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-white/80 transition hover:text-white"
              >
                Plattform
              </a>
              <a
                href="/#preise"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-white/80 transition hover:text-white"
              >
                Preise
              </a>
              <a
                href="/#onboarding"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-white/80 transition hover:text-white"
              >
                Onboarding
              </a>
              <a
                href="/kontakt.html"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-2.5 text-white/80 transition hover:text-white"
              >
                Kontakt
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
