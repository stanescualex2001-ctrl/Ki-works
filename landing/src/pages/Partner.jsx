import {
  Layers, ShoppingBag, TrendingUp, Mail, Check, ArrowRight, Shield,
  LayoutDashboard, Sparkles, Zap, ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { PageShell } from "../components/PageShell.jsx";
import { OrbBuddy } from "../components/OrbBuddy.jsx";

const whiteLabelPoints = [
  {
    icon: Layers,
    title: "Ihr Branding, nicht unseres",
    desc: "Ihre Endkunden sehen Ihr Logo, Ihre Farben, Ihren Namen. Kiwo läuft im Hintergrund als Technik-Plattform.",
  },
  {
    icon: ShoppingBag,
    title: "Sie bleiben der Ansprechpartner",
    desc: "Der Kundenkontakt bleibt bei Ihnen — wir liefern die Technik, nicht den direkten Draht zu Ihren Kunden.",
  },
  {
    icon: Shield,
    title: "Kein Entwicklungsaufwand",
    desc: "Keine eigene KI-Entwicklung, kein Vapi-/Anthropic-Setup, kein Support für die Kerntechnik — das übernehmen wir.",
  },
  {
    icon: LayoutDashboard,
    title: "Volle Funktionalität",
    desc: "Telefon, Web-Chat, Reservierungen/Bestellungen, eigenes Kunden-Dashboard — alles, was Kiwo auch bei Direktkunden bietet.",
  },
];

const whyPoints = [
  "Zusätzlicher, wiederkehrender Umsatz ohne eigenes Entwicklungsrisiko",
  "Cross-/Upsell bei Ihren bestehenden Kunden — Sie kennen deren Bedarf bereits",
  "Abo-Umsatz statt Einmal-Projektgeschäft — planbarer als klassische Webprojekte",
  "Schnelle Einführung pro Kunde, kein monatelanges Entwicklungsprojekt",
];

const faqItems = [
  {
    q: "Wie schnell können wir starten?",
    a: "Die technische Einrichtung pro Agentur (eigene Domain, eigenes Branding, eigener Assistentenname) ist in Tagen erledigt, nicht Monaten — sobald Ihre Domain per DNS auf unseren Server zeigt, ist der Rest ein kurzer, standardisierter Ablauf. Kein monatelanges Entwicklungsprojekt wie bei einer Eigenentwicklung.",
  },
  {
    q: "Sehen unsere Kunden irgendwo \"ki-works\" oder \"Kiwo\"?",
    a: "Nein. Eigene Domain, eigenes Logo/Farben/Produktname und ein von Ihnen gewählter Assistentenname — für Ihre Kunden ist ki-works als Technik-Lieferant unsichtbar.",
  },
  {
    q: "Behalten wir den Kundenkontakt?",
    a: "Ja, durchgehend. Sie legen Ihre Kunden selbst an und verwalten sie selbst im eigenen Login — wir liefern nur die Technik im Hintergrund, keinen direkten Draht zu Ihren Endkunden.",
  },
  {
    q: "Was kostet das?",
    a: "Gestaffelte Partnerkonditionen je nach Anzahl Ihrer Endkunden — die Details besprechen wir im persönlichen Gespräch, passend zu Ihrer Kundenstruktur. Kein starres Preisblatt.",
  },
  {
    q: "Ist das DSGVO-konform?",
    a: "EU-Hosting und TLS-verschlüsselte Übertragung, strikte Datentrennung zwischen den Kunden verschiedener Agenturen. Details für Ihre eigene Prüfung besprechen wir gerne im Gespräch.",
  },
  {
    q: "Müssen wir selbst etwas entwickeln oder warten?",
    a: "Nein. Kein eigenes Vapi-/Anthropic-Setup, keine eigene Server-Infrastruktur, kein Support für die Kerntechnik — das läuft komplett bei uns.",
  },
];

const steps = [
  { n: "1", title: "Kontakt aufnehmen", desc: "Kurzes Gespräch — wir zeigen Ihnen Kiwo live, Sie schildern Ihre Kundenstruktur." },
  { n: "2", title: "Partnerkonditionen klären", desc: "Gestaffelte Konditionen je nach Kundenzahl, individuell besprochen — kein starres Preisblatt." },
  { n: "3", title: "Sie vermitteln, wir liefern", desc: "Sie sprechen Ihre Kunden an, wir richten Technik + Branding pro Kunde ein." },
];

function DemoPreviewCard() {
  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-bold text-[#0A0F1D]">
            IA
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground/90">Ihre Agentur — powered by Kiwo</div>
            <div className="text-[11px] text-foreground/45">Beispiel-Vorschau, fiktive Firma</div>
          </div>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
          fiktiv
        </span>
      </div>
      <div className="mt-4 rounded-xl border border-foreground/10 bg-foreground/[0.03] p-4">
        <div className="text-xs text-foreground/45">Kunde</div>
        <div className="mt-0.5 text-sm font-medium text-foreground/90">„Gasthaus Sonnenblick" (Beispiel)</div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-cyan-600 dark:text-cyan-300">47</div>
            <div className="text-[10px] text-foreground/45">Anrufe / 7 Tage</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-violet-600 dark:text-violet-300">12</div>
            <div className="text-[10px] text-foreground/45">Reservierungen</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">0</div>
            <div className="text-[10px] text-foreground/45">Verpasste Anrufe</div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-foreground/50">
        So könnte das Dashboard aussehen, das Ihre Kunden unter Ihrem eigenen
        Namen nutzen — die Zahlen sind ein Beispiel, keine echten Kundendaten.
      </p>
    </div>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="mt-6 space-y-3">
      {faqItems.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className="glass overflow-hidden rounded-2xl">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 p-5 text-left"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-foreground/90">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-foreground/45 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-foreground/60">{item.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Partner() {
  return (
    <PageShell page="legal">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 md:py-24">
        {/* Hero */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-cyan-600 dark:text-cyan-300">
              <Sparkles className="h-3 w-3" /> FÜR AGENTUREN
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
              Kiwo als Ihr eigenes KI-Produkt.
              <br />
              <span className="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">
                White-Label, ohne Entwicklungsaufwand.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/65 md:text-base">
              Sie betreuen bereits Kunden, die Website, Shop oder Marketing
              brauchen. Mit Kiwo als White-Label-Partnerprogramm bieten Sie
              zusätzlich einen digitalen KI-Mitarbeiter an — unter Ihrem
              eigenen Namen, ohne dass Sie ihn selbst entwickeln müssen.
            </p>
          </div>
          <div className="shrink-0">
            <OrbBuddy size={110} />
          </div>
        </div>

        {/* Was ist Kiwo */}
        <div className="glass mt-10 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold">Kurz zu Kiwo</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/65">
            Kiwo ist ein digitaler KI-Mitarbeiter für Telefon und Web-Chat:
            nimmt Anrufe entgegen, beantwortet Fragen, nimmt Reservierungen
            und Bestellungen auf — rund um die Uhr, auch außerhalb der
            Öffnungszeiten. Läuft produktiv auf{" "}
            <a href="https://ki-works.eu" className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200 transition">
              ki-works.eu
            </a>{" "}
            und wird dort auch privat weiterentwickelt.
          </p>
        </div>

        {/* White-Label Punkte */}
        <h2 className="mt-14 text-xl font-semibold">Was White-Label für Sie bedeutet</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {whiteLabelPoints.map((p) => (
            <div key={p.title} className="glass rounded-2xl p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-600 ring-1 ring-cyan-400/20 dark:text-cyan-300">
                <p.icon className="h-5 w-5" />
              </span>
              <div className="mt-3 text-sm font-semibold text-foreground/90">{p.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-foreground/55">{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Time-to-Market */}
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5 sm:flex-row sm:items-center md:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-600 ring-1 ring-cyan-400/25 dark:text-cyan-300">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground/90">Tage statt Monate</div>
            <div className="mt-0.5 text-xs leading-relaxed text-foreground/60">
              Eine eigene KI-Mitarbeiter-Lösung selbst zu entwickeln dauert typischerweise
              Monate. Die technische Einrichtung als Kiwo-Partner (eigene Domain, eigenes
              Branding) ist in Tagen erledigt — sobald Ihre Domain per DNS auf uns zeigt.
            </div>
          </div>
        </div>

        {/* Warum attraktiv */}
        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Warum sich das für Sie lohnt</h2>
            <ul className="mt-5 space-y-3">
              {whyPoints.map((w) => (
                <li key={w} className="flex items-start gap-2.5 text-sm text-foreground/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <DemoPreviewCard />
        </div>

        {/* So funktioniert's */}
        <h2 className="mt-14 text-xl font-semibold">So funktioniert's</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="glass rounded-2xl p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-bold text-[#0A0F1D]">
                {s.n}
              </div>
              <div className="mt-3 text-sm font-semibold text-foreground/90">{s.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-foreground/55">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Konditionen-Hinweis (bewusst ohne Zahlen) */}
        <div className="glass mt-14 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-semibold">Partnerkonditionen</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/65">
            Wir arbeiten mit gestaffelten Partnerkonditionen je nach Anzahl
            Ihrer Endkunden — die Details besprechen wir im persönlichen
            Gespräch, passend zu Ihrer Kundenstruktur.
          </p>
        </div>

        {/* FAQ */}
        <h2 className="mt-14 text-xl font-semibold">Häufige Fragen</h2>
        <FaqAccordion />

        {/* CTA */}
        <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <div className="text-base font-semibold text-foreground/90">Interesse an einem Gespräch?</div>
            <div className="mt-1 text-sm text-foreground/55">Unverbindlich, kein Verkaufsdruck.</div>
          </div>
          <a
            href="mailto:info@ki-works.eu?subject=Kiwo%20White-Label%20Partnerschaft"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
          >
            <Mail className="h-4 w-4" /> info@ki-works.eu <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </PageShell>
  );
}
