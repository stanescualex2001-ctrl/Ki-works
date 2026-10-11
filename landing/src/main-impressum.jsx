import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Impressum from "./pages/Impressum.jsx";
import { LanguageProvider, SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./i18n/index.jsx";
import "./index.css";
import "./reveal.js";

const htmlLang = document.documentElement.lang;
const initialLocale = SUPPORTED_LOCALES.includes(htmlLang) ? htmlLang : DEFAULT_LOCALE;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider locale={initialLocale}>
      <Impressum />
    </LanguageProvider>
  </StrictMode>,
);
