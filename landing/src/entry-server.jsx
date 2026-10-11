import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import Impressum from "./pages/Impressum.jsx";
import Datenschutz from "./pages/Datenschutz.jsx";
import Kontakt from "./pages/Kontakt.jsx";
import Funktionen from "./pages/Funktionen.jsx";
import Partner from "./pages/Partner.jsx";
import { LanguageProvider, DEFAULT_LOCALE } from "./i18n/index.jsx";

export function renderHome(locale = DEFAULT_LOCALE) {
  return renderToString(
    <LanguageProvider locale={locale}>
      <App />
    </LanguageProvider>,
  );
}

export function renderImpressum(locale = DEFAULT_LOCALE) {
  return renderToString(
    <LanguageProvider locale={locale}>
      <Impressum />
    </LanguageProvider>,
  );
}

export function renderDatenschutz(locale = DEFAULT_LOCALE) {
  return renderToString(
    <LanguageProvider locale={locale}>
      <Datenschutz />
    </LanguageProvider>,
  );
}

export function renderKontakt(locale = DEFAULT_LOCALE) {
  return renderToString(
    <LanguageProvider locale={locale}>
      <Kontakt />
    </LanguageProvider>,
  );
}

export function renderFunktionen(locale = DEFAULT_LOCALE) {
  return renderToString(
    <LanguageProvider locale={locale}>
      <Funktionen />
    </LanguageProvider>,
  );
}

export function renderPartner(locale = DEFAULT_LOCALE) {
  return renderToString(
    <LanguageProvider locale={locale}>
      <Partner />
    </LanguageProvider>,
  );
}
