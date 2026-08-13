import { PageShell } from "../components/PageShell.jsx";

const angaben = [
  { label: "Betreiber", value: "[Name / Firmenname eintragen]" },
  { label: "Anschrift", value: "[Straße, PLZ, Ort, Österreich]" },
  {
    label: "E-Mail",
    value: (
      <a
        href="mailto:info@ki-works.eu"
        target="_blank"
        rel="noreferrer"
        className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200 transition"
      >
        info@ki-works.eu
      </a>
    ),
  },
  { label: "Telefon", value: "[Telefonnummer eintragen]" },
  { label: "Unternehmensgegenstand", value: "KI-gestützte Telefonassistenz für Gastronomie und Dienstleister" },
  { label: "Gewerbeberechtigung / Firmenbuchnummer / UID", value: "[falls vorhanden eintragen]" },
  { label: "Zuständige Aufsichtsbehörde / Kammer", value: "[falls zutreffend eintragen]" },
];

export default function Impressum() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold">Impressum</h1>

        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-800/90 dark:text-amber-100/90">
          <strong className="text-amber-600 dark:text-amber-300">Hinweis (intern):</strong> Platzhalter unten mit den
          echten Firmendaten ausfüllen. Diese Seite sollte vor der Veröffentlichung von einem
          Anwalt bzw. Datenschutzberater geprüft werden — insbesondere hinsichtlich
          Gewerbeberechtigung, Firmenbuch-/UID-Nummer und Aufsichtsbehörde.
        </div>

        <h2 className="mt-10 text-lg font-semibold">Angaben gemäß § 5 ECG, § 25 Mediengesetz</h2>
        <dl className="mt-4 space-y-4">
          {angaben.map((a) => (
            <div key={a.label}>
              <dt className="text-xs text-foreground/45">{a.label}</dt>
              <dd className="mt-0.5 text-sm text-foreground/85">{a.value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-10 text-lg font-semibold">EU-Streitschlichtung</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
          bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200 transition"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          .
        </p>

        <h2 className="mt-10 text-lg font-semibold">Haftung für Inhalte</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">
          Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die
          Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr
          übernehmen.
        </p>
      </div>
    </PageShell>
  );
}
