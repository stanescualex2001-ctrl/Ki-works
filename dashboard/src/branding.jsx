// Löst White-Label-Branding anhand der aufgerufenen Domain auf (same-origin
// Fetch, Host-Header stimmt automatisch). Fällt bei Fehlern/unbekannter
// Domain auf {isAgency:false} zurück — Dashboard zeigt dann normales
// KI-Works-Branding, kein Sonderfall nötig. Muss VOR dem ersten Render
// abgeschlossen sein, damit der Login-Screen nie kurz KI-Works aufblitzen
// lässt, siehe main.jsx.
import { createContext, useContext } from 'react';

const BrandingContext = createContext({ isAgency: false });

export async function fetchBranding() {
  try {
    const res = await fetch('/api/public/branding');
    if (!res.ok) return { isAgency: false };
    return await res.json();
  } catch {
    return { isAgency: false };
  }
}

export function applyBrandingToDocument(branding) {
  if (!branding?.isAgency) return;
  if (branding.productName) document.title = branding.productName;
  const root = document.documentElement.style;
  const vars = {
    accent: '--accent', accentStrong: '--accent-strong', accentSoft: '--accent-soft',
    accentBadgeText: '--accent-badge-text', violet: '--violet', violetSoft: '--violet-soft',
    violetText: '--violet-text',
  };
  for (const [key, cssVar] of Object.entries(vars)) {
    if (branding[key]) root.setProperty(cssVar, branding[key]);
  }
}

export function BrandingProvider({ branding, children }) {
  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
