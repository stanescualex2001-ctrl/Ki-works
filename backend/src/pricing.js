// Minuten-Kontingente je Tarif (siehe landing/src/App.jsx pricingTiers — bei
// einer künftigen Preisänderung dort UND hier anpassen) + einheitlicher
// Überschreitungspreis. Eigenes Modul statt Konstante in server.js, da
// usageWarnings.js dieselben Werte braucht (keine Duplikation).
export const PRICING_TIER_ORDER = ['solo', 'team', 'scale'];

export const PRICING_TIERS = {
  solo: { label: 'Solo', minutesIncluded: 600 },
  team: { label: 'Team', minutesIncluded: 1500 },
  scale: { label: 'Scale', minutesIncluded: 3500 },
};

export const OVERAGE_RATE_PER_MINUTE = 0.20;
