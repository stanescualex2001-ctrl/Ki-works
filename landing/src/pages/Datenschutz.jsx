import { PageShell } from "../components/PageShell.jsx";

const datenkategorien = [
  {
    kategorie: "Website-Nutzung",
    beispiele: "Aufruf der Seiten (keine Analyse-Cookies gesetzt)",
    zweck: "Bereitstellung der Website",
  },
  {
    kategorie: "Kontaktanfragen",
    beispiele: "Name, Betrieb, E-Mail, Telefon, Nachricht",
    zweck: "Bearbeitung Ihrer Anfrage",
  },
  {
    kategorie: "Gästedaten (im Auftrag des Betriebs)",
    beispiele: "Name, Telefonnummer, Reservierungs-/Bestelldetails",
    zweck: "Reservierungs-/Bestellannahme",
  },
  {
    kategorie: "Anruf-Rohdaten",
    beispiele: "Gesprächsaufzeichnung, Transkript",
    zweck: "Erstellung der Reservierung/Bestellung, Qualitätssicherung — Löschung nach 7 Tagen",
  },
  {
    kategorie: "Kunden-Zugangsdaten",
    beispiele: "Login-E-Mail, verschlüsseltes Passwort",
    zweck: "Zugang zum Dashboard",
  },
];

const dienstleister = [
  { name: "Anthropic (Claude API)", ort: "USA", zweck: "Verarbeitung von Gesprächsinhalten zur Erstellung von Zusammenfassungen und Auswertungen." },
  { name: "Vapi Inc.", ort: "USA", zweck: "Technische Abwicklung der Telefonanrufe, Spracherkennung, Aufzeichnung." },
  { name: "Twilio Inc.", ort: "USA/EU", zweck: "Telefonnummern und SMS-Versand." },
  { name: "Contabo GmbH", ort: "Deutschland", zweck: "Serverhosting (Datenbank, Anwendung)." },
  { name: "E-Mail-Hosting-Anbieter", ort: "", zweck: "Versand von Benachrichtigungs-E-Mails." },
];

function A({ href, children, external = false }) {
  const opensNewTab = external || href.startsWith("mailto:");
  return (
    <a
      href={href}
      {...(opensNewTab ? { target: "_blank", rel: "noreferrer" } : {})}
      className="text-cyan-300 hover:text-cyan-200 transition"
    >
      {children}
    </a>
  );
}

export default function Datenschutz() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 md:py-24">
        <a href="/" className="inline-flex items-center text-sm text-white/50 hover:text-white/80 transition">
          ← Zurück zur Startseite
        </a>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold">Datenschutzerklärung</h1>

        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100/90">
          <strong className="text-amber-300">Hinweis (intern):</strong> Diese Erklärung ist ein
          technischer Ausgangstext und ersetzt keine Rechtsberatung. Bitte vor Veröffentlichung von
          einem Anwalt bzw. Datenschutzberater prüfen lassen — insbesondere die Angaben zu
          Verantwortlichem, Rechtsgrundlagen und Drittland-Übermittlungen (USA).
        </div>

        <h2 className="mt-10 text-lg font-semibold">1. Verantwortlicher</h2>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          [Name / Firmenname], [Anschrift], E-Mail: <A href="mailto:info@ki-works.eu">info@ki-works.eu</A>{" "}
          (im Folgenden „ki-works", „wir").
        </p>

        <h2 className="mt-10 text-lg font-semibold">2. Wer ist wofür verantwortlich?</h2>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          Diese Erklärung betrifft zwei unterschiedliche Rollen:
        </p>
        <ul className="mt-3 list-disc space-y-2.5 pl-5 text-sm text-white/65 leading-relaxed">
          <li>
            <strong className="text-white/85">Website-Besucher und Interessenten</strong> (z. B.
            das Kontaktformular auf dieser Seite): Hier ist{" "}
            <strong className="text-white/85">ki-works</strong> Verantwortlicher im Sinne der
            DSGVO.
          </li>
          <li>
            <strong className="text-white/85">Gäste unserer Restaurant-/Geschäftskunden</strong>,
            die telefonisch reservieren oder bestellen: Hier ist der jeweilige{" "}
            <strong className="text-white/85">Betrieb</strong> (z. B. das Restaurant)
            Verantwortlicher, ki-works verarbeitet die Daten in dessen Auftrag als
            Auftragsverarbeiter (Art. 28 DSGVO). Der Betrieb informiert seine Gäste eigenständig;
            ki-works stellt hierfür Hinweistexte und den telefonischen Aufzeichnungshinweis
            bereit.
          </li>
        </ul>

        <h2 className="mt-10 text-lg font-semibold">3. Welche Daten wir verarbeiten</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/45">
                <th className="px-4 py-3 font-medium">Kategorie</th>
                <th className="px-4 py-3 font-medium">Beispiele</th>
                <th className="px-4 py-3 font-medium">Zweck</th>
              </tr>
            </thead>
            <tbody>
              {datenkategorien.map((row) => (
                <tr key={row.kategorie} className="border-b border-white/5 last:border-0 align-top">
                  <td className="px-4 py-3 text-white/80">{row.kategorie}</td>
                  <td className="px-4 py-3 text-white/60">{row.beispiele}</td>
                  <td className="px-4 py-3 text-white/60">{row.zweck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-lg font-semibold">4. Rechtsgrundlagen</h2>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          Vertragserfüllung bzw. vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) für
          Reservierungen/Bestellungen und Kundenanfragen; berechtigtes Interesse (Art. 6 Abs. 1
          lit. f DSGVO) an Betrieb und Verbesserung des Dienstes, z. B. Qualitätssicherung von
          Telefonaten.
        </p>

        <h2 className="mt-10 text-lg font-semibold">5. Empfänger und Auftragsverarbeiter</h2>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          Zur Erbringung unseres Dienstes setzen wir folgende Dienstleister ein:
        </p>
        <ul className="mt-3 space-y-2.5 pl-5 text-sm text-white/65 leading-relaxed list-disc">
          {dienstleister.map((d) => (
            <li key={d.name}>
              <strong className="text-white/85">{d.name}</strong>
              {d.ort && `, ${d.ort}`} — {d.zweck}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          Bei Übermittlung in die USA stützen wir uns auf geeignete Garantien (z. B.
          EU-Standardvertragsklauseln bzw. Data Privacy Framework der jeweiligen Anbieter). [Von
          Anwalt/Datenschutzberater bestätigen lassen.]
        </p>

        <h2 className="mt-10 text-lg font-semibold">6. Speicherdauer</h2>
        <ul className="mt-3 space-y-2.5 pl-5 text-sm text-white/65 leading-relaxed list-disc">
          <li>
            <strong className="text-white/85">Gesprächsaufzeichnung und Transkript:</strong>{" "}
            werden automatisiert nach <strong className="text-white/85">7 Tagen</strong> gelöscht.
          </li>
          <li>
            <strong className="text-white/85">Reservierungs- und Bestelldaten:</strong> werden für
            die Dauer der Geschäftsbeziehung bzw. gesetzlicher Aufbewahrungspflichten des
            jeweiligen Betriebs gespeichert.
          </li>
          <li>
            <strong className="text-white/85">Kontaktanfragen:</strong> werden gelöscht, sobald
            sie bearbeitet sind und keine gesetzliche Aufbewahrungspflicht entgegensteht.
          </li>
        </ul>

        <h2 className="mt-10 text-lg font-semibold">7. Ihre Rechte</h2>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
          Datenübertragbarkeit und Widerspruch. Wenden Sie sich hierfür an{" "}
          <A href="mailto:info@ki-works.eu">info@ki-works.eu</A> bzw. — bei Gästedaten — direkt an
          den jeweiligen Betrieb. Sie haben zudem das Recht, sich bei der österreichischen
          Datenschutzbehörde (<A href="https://www.dsb.gv.at" external>dsb.gv.at</A>) zu
          beschweren.
        </p>

        <h2 className="mt-10 text-lg font-semibold">8. Cookies</h2>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          Diese Website verwendet keine Analyse- oder Tracking-Cookies.
        </p>
      </div>
    </PageShell>
  );
}
