// Merkt sich die Herkunft (utm_source/medium/campaign) eines Besuchs nur für
// die Dauer des Tabs (sessionStorage, kein Cookie, keine Weitergabe an Dritte).
// Wird erst beim Absenden des Kontaktformulars mitgeschickt (siehe Kontakt.jsx).
const KEY = "kiworks-utm";
const clean = (v) => (v || "").replace(/[^\w.\-]/g, "").slice(0, 40);

function capture() {
  if (typeof window === "undefined") return;
  try {
    const q = new URLSearchParams(window.location.search);
    const parts = ["utm_source", "utm_medium", "utm_campaign"].map((k) => clean(q.get(k)));
    if (parts.some(Boolean)) sessionStorage.setItem(KEY, parts.join("/"));
  } catch {
    // sessionStorage kann blockiert sein — dann eben ohne Herkunft
  }
}

export function getUtm() {
  try {
    return sessionStorage.getItem(KEY) || null;
  } catch {
    return null;
  }
}

capture();
