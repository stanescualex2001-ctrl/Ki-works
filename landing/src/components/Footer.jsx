import { useI18n, localizedPath } from "../i18n/index.jsx";

export function Footer({ page = "home" }) {
  const { locale, t } = useI18n();
  const kontaktHref = localizedPath("kontakt", locale);
  return (
    <footer className="relative z-10 border-t border-foreground/5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-foreground/40 font-mono sm:px-6">
        <div className="truncate">© {new Date().getFullYear()} KI-Works · {t("footer.tagline")}</div>
        <div className="flex items-center gap-4">
          <a href={`/dashboard/?lang=${locale}`} className="hover:text-foreground/70 transition">{t("footer.customerLogin")}</a>
          <a href={kontaktHref} className="hover:text-foreground/70 transition">{t("footer.contact")}</a>
          <a href="/impressum.html" className="hover:text-foreground/70 transition">{t("footer.imprint")}</a>
          <a href="/datenschutz.html" className="hover:text-foreground/70 transition">{t("footer.privacy")}</a>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            {t("footer.systemsOperational")}
          </span>
        </div>
      </div>
    </footer>
  );
}
