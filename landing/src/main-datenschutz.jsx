import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Datenschutz from "./pages/Datenschutz.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Datenschutz />
  </StrictMode>,
);
