import { LayoutDashboard, Play, Pencil, Bell, Euro, ArrowRight, ArrowLeft, UtensilsCrossed } from "lucide-react";
import { PageShell } from "../components/PageShell.jsx";
import { useI18n, localizedPath } from "../i18n/index.jsx";

const STATUS_STYLE = {
  confirmed: "bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
  pickedUp: "bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
  saved: "bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
  requested: "bg-amber-400/15 text-amber-600 dark:text-amber-300",
  new: "bg-amber-400/15 text-amber-600 dark:text-amber-300",
  preparing: "bg-violet-400/15 text-violet-600 dark:text-violet-300",
  cancelled: "bg-rose-400/10 text-rose-600 dark:text-rose-300",
};

function StatusPill({ status, children }) {
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_STYLE[status] || ""}`}>
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title, desc }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-mono tracking-wide text-cyan-600/90 dark:text-cyan-300/90">{eyebrow}</span>
      <h2 className="text-2xl font-semibold md:text-[26px]">{title}</h2>
      {desc && <p className="max-w-xl text-sm text-foreground/60 leading-relaxed">{desc}</p>}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-foreground/10 bg-background/60 ${className}`}>{children}</div>
  );
}

function StatTile({ label, value, hint, hintTone = "" }) {
  return (
    <div className="flex-1 min-w-[170px] rounded-xl border border-foreground/10 bg-foreground/[0.025] px-4 py-4">
      <div className="text-xs text-foreground/50">{label}</div>
      <div className="mt-1.5 font-mono text-2xl font-medium">{value}</div>
      {hint && <div className={`mt-1 text-[11px] ${hintTone || "text-foreground/45"}`}>{hint}</div>}
    </div>
  );
}

export default function Funktionen() {
  const { t, locale } = useI18n();
  const dashboardHref = `${localizedPath("home", locale)}#dashboard`;
  const promises = t("dashboardSection.trustPoints");
  const promiseIcons = [Play, Pencil, Bell, Euro];

  const overview = t("funktionenPage.overview");
  const reservations = t("funktionenPage.reservations");
  const orders = t("funktionenPage.orders");
  const menu = t("funktionenPage.menu");
  const calls = t("funktionenPage.calls");
  const notifications = t("funktionenPage.notifications");
  const auditLog = t("funktionenPage.auditLog");
  const rolesInfo = t("funktionenPage.roles");
  const cta = t("funktionenPage.cta");
  const status = t("funktionenPage.status");

  return (
    <PageShell page="funktionen">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 md:py-24">
        {/* Hero */}
        <div className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 text-xs font-mono tracking-wide text-cyan-600/90 dark:text-cyan-300/90">
            <LayoutDashboard className="h-3.5 w-3.5" /> {t("funktionenPage.eyebrow")}
          </span>
          <h1 className="max-w-2xl text-3xl font-semibold md:text-[44px] md:leading-[1.15]">
            {t("funktionenPage.title")}
          </h1>
          <p className="max-w-xl text-sm text-foreground/65 leading-relaxed md:text-base">
            {t("funktionenPage.intro")}
          </p>
        </div>

        {/* Vier Versprechen */}
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-foreground/70">{t("funktionenPage.promisesHeading")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map((point, i) => {
              const Icon = promiseIcons[i % promiseIcons.length];
              return (
                <Card key={point.title} className="p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-600 dark:text-cyan-300">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="mt-2.5 text-[13px] font-semibold leading-snug">{point.title}</div>
                  <div className="mt-1 text-xs text-foreground/55 leading-relaxed">{point.desc}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Übersicht */}
        <section className="mt-16 flex flex-col gap-5">
          <SectionHeading eyebrow={overview.eyebrow} title={overview.title} desc={overview.desc} />
          <Card className="p-6">
            <div className="flex flex-wrap gap-3">
              <StatTile label={overview.callsToday} value="24" hint={`+6 ${overview.callsTrend}`} hintTone="text-emerald-600 dark:text-emerald-300" />
              <StatTile label={overview.openReservations} value="7" hint={overview.openReservationsHint} />
              <StatTile label={overview.ordersInProgress} value="3" hint={`1 ${overview.ordersInProgressHint}`} hintTone="text-amber-600 dark:text-amber-300" />
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="flex-1 min-w-[220px] rounded-xl border border-foreground/10 bg-foreground/[0.025] px-4 py-4">
                <div className="text-xs text-foreground/50">{overview.timeSaved}</div>
                <div className="mt-1.5 font-mono text-xl font-medium text-cyan-600 dark:text-cyan-300">≈ 5,2 Std.</div>
                <div className="mt-1 text-[11px] text-foreground/45 leading-relaxed">{overview.timeSavedHint}</div>
              </div>
              <div className="flex-1 min-w-[220px] rounded-xl border border-foreground/10 bg-foreground/[0.025] px-4 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-foreground/50">{overview.minutesUsed}</span>
                  <span className="font-mono text-xs text-foreground/50">847 / 1500</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/10">
                  <div className="h-full w-[56%] rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
                </div>
                <div className="mt-2 text-[11px] text-foreground/45">{overview.minutesUsedHint}</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Reservierungen */}
        <section className="mt-14 flex flex-col gap-5">
          <SectionHeading eyebrow={reservations.eyebrow} title={reservations.title} desc={reservations.desc} />
          <Card>
            {reservations.items.map((item, i) => (
              <div
                key={item.name}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${i > 0 ? "border-t border-foreground/10" : ""}`}
              >
                <div className="min-w-0">
                  <div className={`text-sm font-medium ${item.status === "cancelled" ? "text-foreground/45 line-through" : ""}`}>
                    {item.name}
                  </div>
                  <div className="mt-0.5 text-xs text-foreground/50">{item.detail}</div>
                </div>
                <StatusPill status={item.status}>{status[item.status]}</StatusPill>
              </div>
            ))}
          </Card>
        </section>

        {/* Bestellungen */}
        <section className="mt-14 flex flex-col gap-5">
          <SectionHeading eyebrow={orders.eyebrow} title={orders.title} desc={orders.desc} />
          <Card>
            {orders.items.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${i > 0 ? "border-t border-foreground/10" : ""}`}
              >
                <div className="min-w-0">
                  <div className="font-mono text-[11px] text-foreground/40">{item.id}</div>
                  <div className={`mt-0.5 text-sm ${item.status === "pickedUp" ? "text-foreground/55" : "font-medium"}`}>{item.item}</div>
                  <div className="mt-0.5 text-xs text-foreground/50">{item.detail}</div>
                </div>
                <StatusPill status={item.status}>{status[item.status]}</StatusPill>
              </div>
            ))}
          </Card>
        </section>

        {/* Speisekarte & Öffnungszeiten */}
        <section className="mt-14 flex flex-col gap-5">
          <SectionHeading eyebrow={menu.eyebrow} title={menu.title} desc={menu.desc} />
          <Card className="grid gap-8 p-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/45">
                <UtensilsCrossed className="h-3.5 w-3.5" /> {menu.hoursLabel}
              </span>
              {menu.hours.map(([day, hours]) => (
                <div key={day} className="flex justify-between border-t border-foreground/10 py-2 text-sm first:border-t-0">
                  <span>{day}</span>
                  <span className="font-mono text-foreground/55">{hours}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground/45">{menu.faqLabel}</span>
              {menu.faq.map(([q, a]) => (
                <div key={q} className="border-t border-foreground/10 py-2 text-sm first:border-t-0">
                  {q} → <span className="text-foreground/60">{a}</span>
                </div>
              ))}
              <div className="mt-1.5 flex items-center gap-2">
                <StatusPill status="saved">✓ {status.saved}</StatusPill>
                <span className="text-xs text-foreground/50">{menu.savedHint}</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Anrufe */}
        <section className="mt-14 flex flex-col gap-5">
          <SectionHeading eyebrow={calls.eyebrow} title={calls.title} desc={calls.desc} />
          <Card>
            {calls.items.map((item, i) => (
              <div
                key={item.number}
                className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-foreground/10" : ""}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03] text-cyan-600 dark:text-cyan-300">
                  <Play className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[13px]">{item.number}</div>
                  <div className="mt-0.5 text-xs text-foreground/55">{item.detail}</div>
                </div>
                <span className="shrink-0 font-mono text-xs text-foreground/45">{item.duration}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* Benachrichtigungen */}
        <section className="mt-14 flex flex-col gap-5">
          <SectionHeading eyebrow={notifications.eyebrow} title={notifications.title} desc={notifications.desc} />
          <Card className="max-w-md p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/[0.03] text-violet-600 dark:text-violet-300">
                <Bell className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{notifications.exampleTitle}</div>
                <div className="mt-0.5 text-xs text-foreground/55">{notifications.exampleDetail}</div>
                <div className="mt-1 font-mono text-[11px] text-foreground/40">{notifications.exampleTime}</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Protokoll */}
        <section className="mt-14 flex flex-col gap-5">
          <SectionHeading eyebrow={auditLog.eyebrow} title={auditLog.title} desc={auditLog.desc} />
          <Card>
            {auditLog.items.map((item, i) => (
              <div
                key={item.time}
                className={`flex gap-4 px-5 py-3 text-xs text-foreground/55 ${i > 0 ? "border-t border-foreground/10" : ""}`}
              >
                <span className="w-28 shrink-0 font-mono text-foreground/40">{item.time}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* Rollen */}
        <section className="mt-14 flex flex-col gap-5">
          <SectionHeading eyebrow={rolesInfo.eyebrow} title={rolesInfo.title} desc={rolesInfo.desc} />
          <div className="flex flex-wrap gap-2.5">
            {rolesInfo.live.map((name) => (
              <span key={name} className="rounded-full bg-emerald-400/10 px-4 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-300">
                {name}
              </span>
            ))}
            {rolesInfo.planned.map((name) => (
              <span
                key={name}
                className="rounded-full border border-dashed border-foreground/15 px-4 py-1.5 text-xs text-foreground/45"
              >
                {name} · {rolesInfo.plannedLabel}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 flex flex-col gap-5 border-t border-foreground/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-semibold">{cta.title}</div>
            <div className="mt-1 text-sm text-foreground/55">{cta.desc}</div>
          </div>
          <a
            href={dashboardHref}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform"
          >
            {cta.button} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </section>

        <a
          href={dashboardHref}
          className="mt-10 inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("funktionenPage.backToOverview")}
        </a>
      </div>
    </PageShell>
  );
}
