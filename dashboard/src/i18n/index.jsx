// Gleiches Dictionary+Context-Muster wie landing/src/i18n/index.jsx, aber
// hier darf der Provider selbst navigator/localStorage lesen (dashboard/
// ist eine reine Client-App ohne SSR) — analog zu theme.js/getStoredTheme.
import { createContext, useContext, useMemo, useState } from "react";
import de from "./de.json";
import en from "./en.json";
import ro from "./ro.json";

export const SUPPORTED_LOCALES = ["de", "en", "ro"];
export const DEFAULT_LOCALE = "de";
const KEY = "kiworks-lang";

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

export function detectInitialLocale() {
  // ?lang= kommt vom "Kunden-Login"-Link auf der Landingpage (dashboard/
  // ist eine separate SPA ohne gemeinsamen State mit landing/) — hat
  // Vorrang vor einer älteren gespeicherten Wahl, weil der Klick aus einer
  // bestimmten Sprachversion der Website die klare aktuelle Absicht ist.
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED_LOCALES.includes(fromUrl)) {
      persistLocale(fromUrl);
      return fromUrl;
    }
  } catch {
    /* ignorieren */
  }
  try {
    const stored = localStorage.getItem(KEY);
    if (SUPPORTED_LOCALES.includes(stored)) return stored;
  } catch {
    /* localStorage evtl. blockiert */
  }
  const nav = (navigator.language || DEFAULT_LOCALE).slice(0, 2).toLowerCase();
  return SUPPORTED_LOCALES.includes(nav) ? nav : DEFAULT_LOCALE;
}

function persistLocale(locale) {
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    /* localStorage evtl. blockiert — Wahl gilt dann nur für die Session */
  }
}

const I18nContext = createContext({ locale: DEFAULT_LOCALE, t: createTranslator(DEFAULT_LOCALE), setLocale: () => {} });

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectInitialLocale);
  const setLocale = (next) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    persistLocale(next);
    setLocaleState(next);
  };
  const value = useMemo(() => ({ locale, t: createTranslator(locale), setLocale }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
