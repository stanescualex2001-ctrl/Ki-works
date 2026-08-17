import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Impressum from "./pages/Impressum.jsx";
import { LanguageProvider } from "./i18n/index.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider locale="de">
      <Impressum />
    </LanguageProvider>
  </StrictMode>,
);
