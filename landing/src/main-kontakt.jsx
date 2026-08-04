import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Kontakt from "./pages/Kontakt.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Kontakt />
  </StrictMode>,
);
