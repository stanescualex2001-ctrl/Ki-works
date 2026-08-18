// Speichert die Cookie-Consent-Wahl des Besuchers. Aktuell setzt die
// Website keine Analyse-/Marketing-Cookies (siehe Datenschutzerklärung) —
// dieses Modul ist bewusstes Grundgerüst für den Tag, an dem z. B.
// Analytics/ein Pixel dazukommt: solcher Code sollte dann vor dem Laden
// hasConsent("analytics")/hasConsent("marketing") prüfen, statt einfach
// loszuladen.
const CONSENT_KEY = "kiworks-cookie-consent";

export function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setConsent(choice) {
  // choice: "all" | "essential"
  const value = {
    essential: true,
    analytics: choice === "all",
    marketing: choice === "all",
    decidedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* localStorage evtl. blockiert — Wahl gilt dann nur für die Session */
  }
  return value;
}

export function hasConsent(category) {
  if (category === "essential") return true;
  const consent = getConsent();
  return !!consent?.[category];
}
