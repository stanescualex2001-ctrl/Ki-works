import { useEffect, useState } from "react";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, createTranslator } from "../i18n/index.jsx";

// Rechtstexte (Impressum/Datenschutz) werden bewusst NICHT automatisch
// übersetzt (Risiko von Nuancenverlust bei KI-Übersetzung rechtlich
// bindender Inhalte) — es gibt dafür auch keine /en/-Variante dieser
// Seiten. Zeigt stattdessen einen kurzen Hinweis, wenn die Browsersprache
// des Besuchers nicht Deutsch ist (rein client-seitig ermittelt — diese
// Seiten selbst laufen immer mit locale="de", ein Besucher kann aber z. B.
// von /en/ aus über den Footer-Link hierher gelangt sein).
export function LegalLanguageNotice() {
  const [suggestLocale, setSuggestLocale] = useState(null);

  useEffect(() => {
    const navLocale = (navigator.language || "").toLowerCase().slice(0, 2);
    if (SUPPORTED_LOCALES.includes(navLocale) && navLocale !== DEFAULT_LOCALE) {
      setSuggestLocale(navLocale);
    }
  }, []);

  if (!suggestLocale) return null;
  const t = createTranslator(suggestLocale);
  return (
    <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-foreground/75">
      {t("legalNotice.germanOnly")}
    </div>
  );
}
