import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import Impressum from "./pages/Impressum.jsx";
import Datenschutz from "./pages/Datenschutz.jsx";

export function renderHome() {
  return renderToString(<App />);
}

export function renderImpressum() {
  return renderToString(<Impressum />);
}

export function renderDatenschutz() {
  return renderToString(<Datenschutz />);
}
