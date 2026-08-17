import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import Impressum from "./pages/Impressum.jsx";
import Datenschutz from "./pages/Datenschutz.jsx";
import Kontakt from "./pages/Kontakt.jsx";
import { LanguageProvider, DEFAULT_LOCALE } from "./i18n/index.jsx";

export function renderHome(locale = DEFAULT_LOCALE) {
  return renderToString(
    <LanguageProvider locale={locale}>
      <App />
    </LanguageProvider>,
  );
}

export function renderImpressum() {
  return renderToString(
    <LanguageProvider locale="de">
      <Impressum />
    </LanguageProvider>,
  );
}

export function renderDatenschutz() {
  return renderToString(
    <LanguageProvider locale="de">
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
