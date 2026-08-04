import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import Impressum from "./pages/Impressum.jsx";
import Datenschutz from "./pages/Datenschutz.jsx";
import Kontakt from "./pages/Kontakt.jsx";

export function renderHome() {
  return renderToString(<App />);
}

export function renderImpressum() {
  return renderToString(<Impressum />);
}

export function renderDatenschutz() {
  return renderToString(<Datenschutz />);
}

export function renderKontakt() {
  return renderToString(<Kontakt />);
}
