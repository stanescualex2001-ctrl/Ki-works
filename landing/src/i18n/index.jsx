// Leichtgewichtiges i18n ohne externe Library — bewusst so, weil landing/
// nur EINMALIG beim Build serverseitig gerendert wird (react-dom/server in
// scripts/prerender.js, kein Request-Server); eine i18n-Library würde hier
// nur Suspense/Loader-Overhead bringen, ohne Mehrwert gegenüber einem
// simplen t(key)-Lookup. Gleiches Grundmuster wie das bestehende
// Light/Dark-Theme (theme.js): ein globaler Wert, hier per Context statt
// CSS-Klasse weitergereicht.
import { createContext, useContext, useMemo } from "react";
import de from "./de.json";
import en from "./en.json";
import ro from "./ro.json";

// Neue Sprache = neuer Eintrag hier + eine neue <locale>.json — kein
// sonstiger Umbau nötig (Registry-Muster wie ROLE_BLOCKS in vapiAdmin.js).
export const SUPPORTED_LOCALES = ["de", "en", "ro"];
export const DEFAULT_LOCALE = "de";

const dictionaries = { de, en, ro };

function lookup(dict, key) {
  return key.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict);
}

export function createTranslator(locale) {
  const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
  return function t(key, vars) {
    let val = lookup(dict, key);
    if (val === undefined) {
      val = lookup(dictionaries[DEFAULT_LOCALE], key);
      if (val === undefined) return key;
    }
    if (typeof val === "string" && vars) {
      return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{{${k}}}`, v), val);
    }
    return val;
  };
}

const LanguageContext = createContext({ locale: DEFAULT_LOCALE, t: createTranslator(DEFAULT_LOCALE) });

// locale kommt immer als Prop von außen (main.jsx liest document.documentElement.lang,
// entry-server.jsx übergibt sie explizit beim Prerendern) — der Provider selbst
// greift bewusst NIE auf navigator/localStorage zu, da dieser Code auch in Node
// beim SSR-Prerender läuft, wo es kein window gibt.
export function LanguageProvider({ locale = DEFAULT_LOCALE, children }) {
  const value = useMemo(() => ({ locale, t: createTranslator(locale) }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}

// Baut aus einem Seitentyp + Ziel-Locale die URL der entsprechenden anderen
// Sprachversion. Bewusst über einen expliziten "page"-Typ statt
// window.location.pathname gelöst — dieser Code läuft auch in Node beim
// SSR-Prerender, wo es kein window gibt. Nur "home"/"kontakt" haben
// übersetzte Varianten; "legal" (Impressum/Datenschutz) hat keine → null.
// Generisch für beliebig viele Sprachen: DEFAULT_LOCALE liegt an der
// Wurzel (/, /kontakt.html), jede andere Sprache unter /<locale>/.
export function localizedPath(page, targetLocale) {
  if (page === "legal") return null;
  const isKontakt = page === "kontakt";
  if (targetLocale === DEFAULT_LOCALE) return isKontakt ? "/kontakt.html" : "/";
  return isKontakt ? `/${targetLocale}/kontakt.html` : `/${targetLocale}/`;
}
