import {
  Layers, ShoppingBag, TrendingUp, Mail, Check, ArrowRight, Shield,
  LayoutDashboard, Sparkles, Zap, ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { PageShell } from "../components/PageShell.jsx";
import { OrbBuddy } from "../components/OrbBuddy.jsx";
import { useI18n } from "../i18n/index.jsx";

const POINT_ICONS = [Layers, ShoppingBag, Shield, LayoutDashboard];

function DemoPreviewCard({ demo }) {
  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-bold text-[#0A0F1D]">
            IA
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground/90">{demo.badgeTitle}</div>
            <div className="text-[11px] text-foreground/45">{demo.badgeSubtitle}</div>
          </div>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
          {demo.fictiveLabel}
        </span>
      </div>
      <div className="mt-4 rounded-xl border border-foreground/10 bg-foreground/[0.03] p-4">
        <div className="text-xs text-foreground/45">{demo.customerLabel}</div>
        <div className="mt-0.5 text-sm font-medium text-foreground/90">{demo.customerName}</div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-cyan-600 dark:text-cyan-300">{demo.stat1Value}</div>
            <div className="text-[10px] text-foreground/45">{demo.stat1Label}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-violet-600 dark:text-violet-300">{demo.stat2Value}</div>
            <div className="text-[10px] text-foreground/45">{demo.stat2Label}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">{demo.stat3Value}</div>
            <div className="text-[10px] text-foreground/45">{demo.stat3Label}</div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-foreground/50">{demo.footnote}</p>
    </div>
  );
}

function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="mt-6 space-y-3">
      {items.map((item, i) => {
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
  const { t } = useI18n();
  const p = t("partner");

  return (
    <PageShell page="partner">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 md:py-24">
        {/* Hero */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-cyan-600 dark:text-cyan-300">
              <Sparkles className="h-3 w-3" /> {p.eyebrow}
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
              {p.heroTitle1}
              <br />
              <span className="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">
                {p.heroTitle2}
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/65 md:text-base">
              {p.heroDesc}
            </p>
          </div>
          <div className="shrink-0">
            <OrbBuddy size={110} />
          </div>
        </div>

        {/* Was ist Kiwo */}
        <div className="glass mt-10 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-semibold">{p.introTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/65">
            {p.introDescBefore}{" "}
            <a href="https://ki-works.eu" className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200 transition">
              {p.introDescLink}
            </a>{" "}
            {p.introDescAfter}
          </p>
        </div>

        {/* White-Label Punkte */}
        <h2 className="mt-14 text-xl font-semibold">{p.whiteLabelHeading}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {p.whiteLabelPoints.map((point, i) => {
            const Icon = POINT_ICONS[i] || Layers;
            return (
              <div key={point.title} className="glass rounded-2xl p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-600 ring-1 ring-cyan-400/20 dark:text-cyan-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="mt-3 text-sm font-semibold text-foreground/90">{point.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-foreground/55">{point.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Time-to-Market */}
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5 sm:flex-row sm:items-center md:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-600 ring-1 ring-cyan-400/25 dark:text-cyan-300">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground/90">{p.ttmTitle}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-foreground/60">{p.ttmDesc}</div>
          </div>
        </div>

        {/* Warum attraktiv */}
        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">{p.whyHeading}</h2>
            <ul className="mt-5 space-y-3">
              {p.whyPoints.map((w) => (
                <li key={w} className="flex items-start gap-2.5 text-sm text-foreground/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <DemoPreviewCard demo={p.demoCard} />
        </div>

        {/* So funktioniert's */}
        <h2 className="mt-14 text-xl font-semibold">{p.stepsHeading}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {p.steps.map((s) => (
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
            <h2 className="text-lg font-semibold">{p.conditionsTitle}</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground/65">{p.conditionsDesc}</p>
        </div>

        {/* FAQ */}
        <h2 className="mt-14 text-xl font-semibold">{p.faqHeading}</h2>
        <FaqAccordion items={p.faqItems} />

        {/* CTA */}
        <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <div className="text-base font-semibold text-foreground/90">{p.ctaTitle}</div>
            <div className="mt-1 text-sm text-foreground/55">{p.ctaDesc}</div>
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
