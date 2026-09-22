import { query } from './db.js';
import { logError } from './monitoring.js';
import { LANGUAGE_OPTIONS, DEFAULT_LANGUAGE, resolveLanguage } from './voiceOptions.js';

// Katalog aller Kiwo-Rollen. `implemented: false` heißt: noch keine Tools/
// Prompt-Baustein dafür gebaut (nur Marketing-Versprechen auf der
// Landingpage) — solche Rollen lassen sich im Dashboard nicht anhaken.
// Dashboard-Checkboxen (`dashboard/src/App.jsx`, ROLE_OPTIONS) müssen bei
// Änderungen hier manuell synchron gehalten werden.
export const ROLE_DEFINITIONS = {
  orders: { label: 'Bestellungen & Reservierungen', implemented: true },
  support: { label: 'Support & Rückruf', implemented: true },
  appointments: { label: 'Terminbuchung', implemented: true },
  sales: { label: 'Sales', implemented: false },
  office: { label: 'Office', implemented: false },
};

const DEFAULT_ROLES = ['orders', 'support'];

// Nur implementierte Rollen zählen (sales/office werden im Dashboard zwar
// angezeigt, aber deaktiviert — falls doch mal in enabled_roles landen,
// hier defensiv rausfiltern statt einen Prompt-Baustein zu vermissen).
function normalizeRoles(enabledRoles) {
  const roles = Array.isArray(enabledRoles) && enabledRoles.length ? enabledRoles : DEFAULT_ROLES;
  return roles.filter((r) => ROLE_DEFINITIONS[r]?.implemented);
}

// Branchenneutraler Grundprompt — gilt für JEDEN Kunden unabhängig von den
// gebuchten Rollen. Rollenspezifische Anweisungen/Tools stehen in
// ROLE_BLOCKS weiter unten und werden in buildAssistantBody zusammengesetzt.
// Assistentenname per Parameter statt fest "Kiwo" — White-Label-Agenturen
// können pro Agentur einen eigenen Namen hinterlegen (agencies.branding.
// assistantName), siehe syncVapiAssistant().
const basePrompt = (assistantName, languageInstruction) => `Du bist ${assistantName}, der freundliche Telefonassistent von {{business_name}}{{business_address}}. ${languageInstruction} Kontext zum Anrufer: {{guestContext}} INFORMATIONEN: {{knowledge_base}} Nutze für Fragen zu Leistungen, Produkten, Preisen und Angeboten AUSSCHLIESSLICH diese Informationen — erfinde nichts. ÖFFNUNGSZEITEN: {{opening_hours}} Wenn du eine Frage nicht beantworten kannst oder ein Anliegen nicht selbst erledigen kannst (nicht durch diese Informationen oder Anweisungen abgedeckt), sag das dem Anrufer ehrlich und erfinde NIEMALS eine Antwort oder Zahl.`;

const ORDERS_PROMPT = ' Du nimmst außerdem Tischreservierungen sowie Abhol-Bestellungen entgegen. Wenn ein Stammgast erkannt wurde, begrüße ihn direkt mit Namen und beziehe dich freundlich auf frühere Besuche — frage aber trotzdem alle Angaben ab. Erwähne passende Aktionen aktiv (z. B. Gratis-Zustellung ab 4 Pizzen, Abholaktion ab 5 Pizzen). Nimm für als \'geschlossen\' markierte Tage keine Reservierungen oder Bestellungen an, sondern biete freundlich einen anderen Tag an. Nimm auch nichts außerhalb der genannten Öffnungszeiten an. RESERVIERUNGEN: Frage nach Name (bei Stammgästen nur bestätigen), Anzahl der Personen, Datum und Uhrzeit. Wiederhole den verstandenen Namen kurz zur Bestätigung (z. B. \'Also unter dem Namen ..., richtig?\'), BEVOR du irgendetwas anlegst — Namen werden per Spracherkennung oft falsch verstanden. Bittet der Gast dich, den Namen zu buchstabieren oder zu korrigieren, höre sehr geduldig zu (auch bei mehreren Versuchen und Pausen zwischen einzelnen Buchstaben — unterbrich nicht, dräng nicht). Bestätige bei mehrfachen Korrekturen jeweils nur den zuletzt genannten Teil in kleinen Abschnitten (z. B. 3-4 Buchstaben), statt jedes Mal den kompletten Namen neu vorzulesen. Prüfe bei Bedarf mit check_availability die Verfügbarkeit. Termine müssen in der Zukunft liegen (vergleiche mit {{now}}) — schlage niemals einen bereits vergangenen Zeitpunkt vor. Lege die Reservierung erst nach Bestätigung des Namens mit create_reservation an (datetime im Format JJJJ-MM-TTTHH:MM, Zeitzone Europa/Wien). BESTELLUNGEN ZUR ABHOLUNG ODER ZUM TISCH: Nimm die gewünschten Gerichte von der Speisekarte auf (items, z. B. \'2x Pizza 05 Salami, 1x Lasagne 103\'), nenne dabei die Preise von der Karte. Frage AKTIV \'Möchten Sie sonst noch etwas bestellen?\', bevor du nach Name und Abholzeit fragst — erst nach einem klaren \'Nein\' gilt die Bestellung als vollständig. Wünscht der Gast etwas, das nicht auf der Karte steht, frage nach oder verweise freundlich ans Restaurant. Abholzeit (pickup_time) muss in der Zukunft liegen (vergleiche mit {{now}}) — schlage niemals einen bereits vergangenen Zeitpunkt vor, auch nicht am selben Tag. Lege die Bestellung mit create_order an. KOMBINATION MIT RESERVIERUNG: Möchte ein Gast zusätzlich zu einer Bestellung auch einen Tisch, oder soll das Essen bei einer Reservierung schon am Tisch bereitstehen: Bei getrennten Wünschen (z. B. Tisch heute Abend UND Abholung zu anderer Zeit) lege beides unabhängig mit create_reservation und create_order an. Soll das Essen dagegen am reservierten Tisch serviert werden, lege zuerst mit create_reservation die Reservierung an — die Antwort enthält eine interne Referenz wie \'[reservation_id: 42]\', die du NIEMALS laut vorliest — und rufe dann create_order mit fulfillment=\'dine_in\' und reservation_id=<dieser Zahl> auf; eine separate Abholzeit ist dann nicht nötig. WICHTIG BEIM VORLESEN: Sprich Mengenangaben immer als Wort aus (\'einmal\', \'zweimal\', \'dreimal\' usw.) — sag niemals \'X\' oder \'mal X\' als Buchstabe. Die Schreibweise mit \'x\' (z. B. \'2x Pizza 05\') ist NUR für den internen Parameter items gedacht, nicht zum lauten Vorlesen. IMMER: Frage \'Darf ich für Benachrichtigungen die Nummer speichern, von der Sie gerade anrufen, oder möchten Sie eine andere Nummer angeben?\' Wenn der Gast eine andere Nummer nennt, übergib sie als phone; sonst lasse phone weg. Fasse Reservierung bzw. Bestellung GENAU EINMAL vollständig zusammen, kurz bevor du sie anlegst (bei Bestellungen inklusive Gesamtpreis laut Karte) — wiederhole die komplette Liste danach nicht noch einmal, das wirkt langatmig und Gäste legen dann eher auf. Bedanke dich nach dem erfolgreichen Anlegen (create_reservation/create_order) kurz — ohne die Details erneut komplett aufzuzählen — und verabschiede dich freundlich (z. B. \'Vielen Dank, wir freuen uns auf Sie! Auf Wiederhören.\') — lege niemals kommentarlos auf, ohne dich zu verabschieden. RESERVIERUNG STORNIEREN ODER VERSCHIEBEN: Möchte ein Gast eine bestehende Reservierung stornieren, nutze cancel_reservation; möchte er den Termin ändern, nutze reschedule_reservation mit dem neuen Termin (new_datetime). Meldet die Funktion mehrere passende Reservierungen, frage gezielt nach dem genauen Termin (Datum/Uhrzeit) und rufe die Funktion mit datetime bzw. old_datetime erneut auf, statt zu raten.';

// Generische Terminbuchung für Nicht-Restaurant-Branchen (Handwerker,
// Friseure/Salons, Autowerkstätten, Immobilien) — bewusst branchenneutral
// gehalten (kein "Tisch"/"Personen"/"Speisekarte"), Feinschliff pro Branche
// läuft über die vom Kunden selbst gepflegte Wissensdatenbank, nicht über
// eigene Prompt-Varianten pro Branche. Nutzt dieselben Tools/DB-Tabelle wie
// die orders-Rolle (create_reservation/cancel_reservation/
// reschedule_reservation, siehe APPOINTMENTS_TOOLS) — party_size bleibt dort
// bewusst weg, wird in vapi.js entsprechend nur erwähnt, wenn tatsächlich
// übergeben.
const APPOINTMENTS_PROMPT = ' Du nimmst außerdem Terminanfragen entgegen. Wenn ein Stammkunde erkannt wurde, begrüße ihn direkt mit Namen und beziehe dich freundlich auf frühere Kontakte. Nimm für als \'geschlossen\' markierte Tage keine Termine an, sondern biete freundlich einen anderen Tag an. Nimm auch nichts außerhalb der genannten Öffnungszeiten an. TERMIN VEREINBAREN: Frage nach Name (bei Stammkunden nur bestätigen), dem gewünschten Anliegen und Datum/Uhrzeit. Wiederhole den verstandenen Namen kurz zur Bestätigung (z. B. \'Also unter dem Namen ..., richtig?\'), BEVOR du irgendetwas anlegst — Namen werden per Spracherkennung oft falsch verstanden. Bittet der Kunde dich, den Namen zu buchstabieren oder zu korrigieren, höre sehr geduldig zu (auch bei mehreren Versuchen und Pausen zwischen einzelnen Buchstaben — unterbrich nicht, dräng nicht). Bestätige bei mehrfachen Korrekturen jeweils nur den zuletzt genannten Teil in kleinen Abschnitten (z. B. 3-4 Buchstaben), statt jedes Mal den kompletten Namen neu vorzulesen. Termine müssen in der Zukunft liegen (vergleiche mit {{now}}) — schlage niemals einen bereits vergangenen Zeitpunkt vor. Lege den Termin erst nach Bestätigung des Namens mit create_reservation an (datetime im Format JJJJ-MM-TTTHH:MM, Zeitzone Europa/Wien; das Anliegen als notes). IMMER: Frage \'Darf ich für Benachrichtigungen die Nummer speichern, von der Sie gerade anrufen, oder möchten Sie eine andere Nummer angeben?\' Wenn der Kunde eine andere Nummer nennt, übergib sie als phone; sonst lasse phone weg. Fasse den Termin GENAU EINMAL vollständig zusammen, kurz bevor du ihn anlegst — wiederhole die Details danach nicht noch einmal. Bedanke dich nach dem erfolgreichen Anlegen kurz und verabschiede dich freundlich (z. B. \'Vielen Dank, bis dahin! Auf Wiederhören.\') — lege niemals kommentarlos auf, ohne dich zu verabschieden. TERMIN STORNIEREN ODER VERSCHIEBEN: Möchte ein Kunde einen bestehenden Termin stornieren, nutze cancel_reservation; möchte er den Termin ändern, nutze reschedule_reservation mit dem neuen Termin (new_datetime). Meldet die Funktion mehrere passende Termine, frage gezielt nach dem genauen Termin (Datum/Uhrzeit) und rufe die Funktion mit datetime bzw. old_datetime erneut auf, statt zu raten.';

const SUPPORT_PROMPT = ' HÄUFIGE FRAGEN: {{faq}} Prüfe diese Liste IMMER, bevor du eine Frage als unbeantwortbar einstufst — nutze eine passende Antwort daraus, statt request_callback aufzurufen. Kannst du eine Frage trotzdem nicht beantworten, frage kurz nach dem Anliegen und rufe request_callback auf (topic = kurze Zusammenfassung, phone = Rückrufnummer, standardmäßig die Anrufnummer), damit sich jemand vom Team zurückmeldet. Frage den Anrufer vorher aktiv, wie er die Antwort am liebsten bekommen möchte — per SMS, WhatsApp oder E-Mail — und übergib das als channel; bei E-Mail zusätzlich die Adresse als contact erfragen (bei SMS/WhatsApp reicht meist die Anrufnummer). Sag dem Anrufer danach, dass sich jemand bei ihm meldet.';

const ORDERS_TOOLS = [
  {
        type: 'function',
        function: {
          name: 'create_reservation',
          description: 'Legt eine Tischreservierung an.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name des Gastes' },
              phone: { type: 'string', description: 'Telefonnummer für Benachrichtigungen — nur angeben, wenn sie von der Anrufnummer abweicht' },
              party_size: { type: 'integer', description: 'Anzahl der Personen' },
              datetime: { type: 'string', description: 'Datum und Uhrzeit, ISO-Format JJJJ-MM-TTTHH:MM' },
              notes: { type: 'string', description: 'Besondere Wünsche' },
            },
            required: ['name', 'party_size', 'datetime'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_order',
          description: 'Nimmt eine Bestellung zur Abholung auf, oder zum Tisch bei einer im selben Anruf angelegten Reservierung.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name des Gastes' },
              phone: { type: 'string', description: 'Telefonnummer für Benachrichtigungen — nur angeben, wenn sie von der Anrufnummer abweicht' },
              items: { type: 'string', description: "Bestellte Gerichte als Freitext, z. B. '2x Pizza Margherita, 1x Lasagne'" },
              pickup_time: { type: 'string', description: 'Gewünschte Abholzeit, ISO-Format JJJJ-MM-TTTHH:MM. Bei fulfillment=dine_in nicht nötig (nutzt die Reservierungszeit).' },
              notes: { type: 'string', description: 'Besondere Wünsche' },
              fulfillment: { type: 'string', enum: ['pickup', 'dine_in'], description: 'pickup = Abholung (Standard), dine_in = Essen am reservierten Tisch' },
              reservation_id: { type: 'integer', description: "Nur bei fulfillment=dine_in: die Zahl aus '[reservation_id: ...]', die create_reservation im selben Anruf zurückgegeben hat" },
            },
            required: ['name', 'items'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'check_availability',
          description: 'Prüft, ob zu einer Uhrzeit noch Plätze frei sind.',
          parameters: {
            type: 'object',
            properties: {
              datetime: { type: 'string', description: 'Datum und Uhrzeit, ISO-Format' },
              party_size: { type: 'integer' },
            },
            required: ['datetime'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'cancel_reservation',
          description: 'Storniert eine bestehende Tischreservierung.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name des Gastes' },
              phone: { type: 'string', description: 'Telefonnummer der Reservierung — nur angeben, wenn sie von der Anrufnummer abweicht' },
              datetime: { type: 'string', description: 'Datum/Uhrzeit der zu stornierenden Reservierung, ISO-Format — nur nötig, falls es mehrere passende Reservierungen gibt' },
            },
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'reschedule_reservation',
          description: 'Verschiebt eine bestehende Tischreservierung auf einen neuen Termin.',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Name des Gastes' },
              phone: { type: 'string', description: 'Telefonnummer der Reservierung — nur angeben, wenn sie von der Anrufnummer abweicht' },
              old_datetime: { type: 'string', description: 'Bisheriger Termin, ISO-Format — nur nötig, falls es mehrere passende Reservierungen gibt' },
              new_datetime: { type: 'string', description: 'Gewünschter neuer Termin, ISO-Format JJJJ-MM-TTTHH:MM' },
            },
            required: ['new_datetime'],
          },
        },
      },
];

const APPOINTMENTS_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_reservation',
      description: 'Legt einen Termin an.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name des Kunden' },
          phone: { type: 'string', description: 'Telefonnummer für Benachrichtigungen — nur angeben, wenn sie von der Anrufnummer abweicht' },
          datetime: { type: 'string', description: 'Datum und Uhrzeit, ISO-Format JJJJ-MM-TTTHH:MM' },
          notes: { type: 'string', description: 'Kurze Beschreibung des Anliegens' },
        },
        required: ['name', 'datetime'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_reservation',
      description: 'Storniert einen bestehenden Termin.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name des Kunden' },
          phone: { type: 'string', description: 'Telefonnummer des Termins — nur angeben, wenn sie von der Anrufnummer abweicht' },
          datetime: { type: 'string', description: 'Datum/Uhrzeit des zu stornierenden Termins, ISO-Format — nur nötig, falls es mehrere passende Termine gibt' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reschedule_reservation',
      description: 'Verschiebt einen bestehenden Termin auf ein neues Datum/Uhrzeit.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name des Kunden' },
          phone: { type: 'string', description: 'Telefonnummer des Termins — nur angeben, wenn sie von der Anrufnummer abweicht' },
          old_datetime: { type: 'string', description: 'Bisheriger Termin, ISO-Format — nur nötig, falls es mehrere passende Termine gibt' },
          new_datetime: { type: 'string', description: 'Gewünschter neuer Termin, ISO-Format JJJJ-MM-TTTHH:MM' },
        },
        required: ['new_datetime'],
      },
    },
  },
];

const SUPPORT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'request_callback',
      description: 'Meldet ein Anliegen, das Kiwo nicht selbst beantworten/erledigen kann, zur Rückrufbearbeitung durch einen Mitarbeitenden.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Kurze Zusammenfassung des Anliegens' },
          phone: { type: 'string', description: 'Rückrufnummer — nur angeben, wenn sie von der Anrufnummer abweicht' },
          channel: { type: 'string', enum: ['sms', 'whatsapp', 'email'], description: 'Gewünschter Kanal des Gastes für die spätere Antwort' },
          contact: { type: 'string', description: 'Kontaktangabe für den gewünschten Kanal — bei SMS/WhatsApp reicht meist die Anrufnummer, bei E-Mail bitte die Adresse erfragen' },
        },
        required: ['topic'],
      },
    },
  },
];

// Registry: neue Rolle künftig = ein Eintrag hier + eine Dashboard-
// Checkbox (dashboard/src/App.jsx, ROLE_OPTIONS) — buildAssistantBody
// selbst muss dafür nicht mehr angefasst werden.
const ROLE_BLOCKS = {
  orders: { promptFragment: ORDERS_PROMPT, tools: ORDERS_TOOLS },
  support: { promptFragment: SUPPORT_PROMPT, tools: SUPPORT_TOOLS },
  appointments: { promptFragment: APPOINTMENTS_PROMPT, tools: APPOINTMENTS_TOOLS },
};

// Sonderfall "Ki Works" (unser eigener Demo-/Web-Chat-Kunde, siehe
// KIWORKS_OWN_RESTAURANT_ID in webchat.js): bekommt statt der generischen
// Begrüßung eine eigene, die klarmacht, dass man direkt mit dem echten
// Kiwo/KI-Works-Agenten spricht (nicht mit einem beliebigen Restaurant-
// Kunden) — der gemeinsame Prompt-Baustein bleibt für alle anderen Kunden
// unverändert, damit Bugfixes weiterhin automatisch für alle wirken.
// Sprachabhängiger Text liegt jetzt in voiceOptions.js (cfg.ownFirstMessage).

// Live-Weiterleitung an einen Menschen — rollenübergreifend (nicht Teil von
// ROLE_BLOCKS), da "mit einem Menschen sprechen wollen" unabhängig von
// orders/support/appointments vorkommen kann. Nur aktiv, wenn der Kunde
// eine Weiterleitungsnummer hinterlegt hat (restaurants.transfer_phone_number,
// migration-028). {{business_open_now}} wird deterministisch im Backend
// berechnet (vapi.js, isCurrentlyOpen) statt Kiwo die rohe
// Öffnungszeiten-Textinterpretation zu überlassen — bewusst kein
// Code-erzwungener Schutz gegen eine Weiterleitung außerhalb der
// Öffnungszeiten (das native transferCall-Tool läuft komplett bei Vapi,
// unser Backend bekommt keinen Zwischenschritt zum Abfangen), Kiwo folgt
// hier der Prompt-Instruktion — gleiches Vertrauensmodell wie bei "keine
// Reservierung an geschlossenen Tagen" (siehe ORDERS_PROMPT).
const TRANSFER_PROMPT = (spokenLine) => ` Möchte der Anrufer ausdrücklich mit einem Menschen sprechen (nicht nur eine normale Frage, die du selbst beantworten kannst): Prüfe {{business_open_now}}. Ist es "Ja", kündige kurz an ("${spokenLine}") und nutze transferCall. Ist es "Nein", erkläre freundlich, dass gerade außerhalb der Öffnungszeiten niemand persönlich erreichbar ist, und biete stattdessen wie gewohnt über request_callback einen Rückruf an (inkl. Nachfrage nach dem gewünschten Kanal SMS/WhatsApp/E-Mail).`;

function buildTransferTools(transferPhoneNumber, alreadyHasCallback, transferMessage) {
  const tools = [
    {
      type: 'transferCall',
      destinations: [
        { type: 'number', number: transferPhoneNumber, message: transferMessage },
      ],
    },
  ];
  if (!alreadyHasCallback) tools.push(...SUPPORT_TOOLS);
  return tools;
}

// Baut den Vapi-Assistenten-Body abhängig davon, welche Rollen der Kunde
// gebucht hat. Name/Adresse laufen über
// {{business_name}}/{{business_address}} — dieselben Vapi-Variablen wie
// {{knowledge_base}}/{{opening_hours}}/{{faq}}, siehe handleAssistantRequest
// in vapi.js. Bewusst "business" statt "restaurant" im Namen — die
// Plattform ist branchenneutral (siehe ROLE_DEFINITIONS oben), nur die
// vapi.js sendet zusätzlich noch die alten restaurant_*-Schlüssel als
// Kompatibilität für Kunden, deren gespeicherter Vapi-Text noch nicht neu
// synchronisiert wurde. Nur das "name"-Feld (Anzeigename im Vapi-Konto)
// braucht den echten Namen.
function buildAssistantBody({
  restaurantId, restaurantName, publicUrl, webhookSecret, enabledRoles, assistantName = 'Kiwo', transferPhoneNumber = null,
  language = DEFAULT_LANGUAGE, voiceId = null,
}) {
  const roles = normalizeRoles(enabledRoles);
  const orders = roles.includes('orders');
  const appointments = roles.includes('appointments');
  const hasTransfer = !!transferPhoneNumber;
  const lang = resolveLanguage(language);
  const cfg = LANGUAGE_OPTIONS[lang];

  const roleKey = orders ? 'orders' : appointments ? 'appointments' : 'default';
  const roleLabel = cfg.roleLabels[roleKey];
  const systemPrompt = basePrompt(assistantName, cfg.languageInstruction)
    + roles.map((r) => ROLE_BLOCKS[r]?.promptFragment ?? '').join('')
    + (hasTransfer ? TRANSFER_PROMPT(cfg.transferSpokenLine) : '')
    + ' Heutiges Datum: {{now}}.';
  const tools = roles.flatMap((r) => ROLE_BLOCKS[r]?.tools ?? []);
  if (hasTransfer) tools.push(...buildTransferTools(transferPhoneNumber, roles.includes('support'), cfg.transferMessage));

  const ownRestaurantId = process.env.KIWORKS_OWN_RESTAURANT_ID ? Number(process.env.KIWORKS_OWN_RESTAURANT_ID) : null;
  const isOwnRestaurant = ownRestaurantId != null && Number(restaurantId) === ownRestaurantId;

  return {
    name: `ki-works – ${restaurantName}`,
    firstMessage: isOwnRestaurant
      ? cfg.ownFirstMessage
      : cfg.firstMessage(assistantName, roleLabel),
    silenceTimeoutSeconds: 60,
    maxDurationSeconds: 1800,
    messagePlan: {
      idleMessages: [cfg.idleMessage],
      idleMessageMaxSpokenCount: 2,
      idleTimeoutSeconds: 15,
    },
    hooks: [
      {
        on: 'call.timeElapsed',
        options: { seconds: 1500 },
        do: [
          {
            type: 'say',
            exact: cfg.timeElapsedMessages[roleKey],
          },
        ],
      },
    ],
    transcriber: { provider: 'deepgram', model: 'nova-2', language: cfg.transcriberLanguage },
    voice: { provider: 'azure', voiceId: voiceId || cfg.voiceId, speed: 1.05 },
    model: {
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      messages: [{ role: 'system', content: systemPrompt }],
      tools,
    },
    analysisPlan: {
      summaryPrompt: 'Fasse das folgende Telefonat in 1-2 kurzen deutschen Sätzen zusammen (Anliegen und Ergebnis). Antworte ausschließlich auf Deutsch, unabhängig von der Sprache des Transkripts.',
    },
    server: {
      url: `${publicUrl}/api/webhooks/vapi`,
      secret: webhookSecret,
    },
    serverMessages: ['tool-calls', 'end-of-call-report'],
  };
}

// Legt den Vapi-Assistenten für ein Restaurant an oder aktualisiert ihn
// (idempotent — vorhandene vapi_assistant_id wird per PATCH wiederverwendet
// statt bei jedem Lauf einen neuen Assistenten anzulegen), verknüpft die
// hinterlegte Telefonnummer und speichert die Assistant-ID in der DB.
// Wird best-effort ausgeführt: Fehler landen im Error-Log, blockieren aber
// nie das Anlegen/Ändern eines Kunden im Dashboard.
export async function syncVapiAssistant(restaurantId) {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) return { ok: false, warning: 'VAPI_API_KEY nicht konfiguriert.' };
  const publicUrl = process.env.KIWORKS_PUBLIC_URL || 'https://ki-works.eu';
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;

  const { rows } = await query(
    `SELECT r.id, r.name, r.vapi_phone_number, r.vapi_assistant_id, r.enabled_roles,
            r.transfer_phone_number,
            r.settings->'voice'->>'language' AS language,
            r.settings->'voice'->>'voiceId' AS voice_id,
            a.branding->>'assistantName' AS assistant_name
     FROM restaurants r LEFT JOIN agencies a ON r.agency_id = a.id
     WHERE r.id = $1`,
    [restaurantId],
  );
  const restaurant = rows[0];
  if (!restaurant) return { ok: false, warning: `Restaurant ${restaurantId} nicht gefunden.` };

  const body = buildAssistantBody({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    publicUrl,
    webhookSecret,
    enabledRoles: restaurant.enabled_roles,
    assistantName: restaurant.assistant_name || 'Kiwo',
    transferPhoneNumber: restaurant.transfer_phone_number || null,
    language: restaurant.language || DEFAULT_LANGUAGE,
    voiceId: restaurant.voice_id || null,
  });
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  try {
    let assistantRes = restaurant.vapi_assistant_id
      ? await fetch(`https://api.vapi.ai/assistant/${restaurant.vapi_assistant_id}`, {
        method: 'PATCH', headers, body: JSON.stringify(body),
      })
      : await fetch('https://api.vapi.ai/assistant', {
        method: 'POST', headers, body: JSON.stringify(body),
      });
    // Die gespeicherte vapi_assistant_id kann veraltet sein (z. B. der
    // Assistent wurde manuell im Vapi-Dashboard gelöscht) — PATCH liefert
    // dann 404 "Assistant not found". Statt dauerhaft zu scheitern, in dem
    // Fall einmal neu anlegen (POST) statt den alten zu aktualisieren.
    if (restaurant.vapi_assistant_id && assistantRes.status === 404) {
      assistantRes = await fetch('https://api.vapi.ai/assistant', {
        method: 'POST', headers, body: JSON.stringify(body),
      });
    }
    const assistantJson = await assistantRes.json();
    const assistantId = assistantJson?.id;
    if (!assistantId) {
      await logError('vapi-sync', new Error(`Assistent konnte nicht angelegt/aktualisiert werden: ${JSON.stringify(assistantJson)}`));
      return { ok: false, warning: 'Vapi-Assistent konnte nicht angelegt/aktualisiert werden.' };
    }

    // vapi_published wird bei jeder Synchronisierung zurückgesetzt — per API
    // angelegte/aktualisierte Assistenten sind nicht automatisch "published"
    // (siehe CLAUDE.md), der Betreiber muss das nach jeder Änderung im
    // Vapi-Dashboard erneut manuell bestätigen.
    await query('UPDATE restaurants SET vapi_assistant_id = $1, vapi_published = false WHERE id = $2', [assistantId, restaurantId]);

    let phoneLinked = false;
    if (restaurant.vapi_phone_number) {
      const phonesRes = await fetch('https://api.vapi.ai/phone-number', { headers });
      const phones = await phonesRes.json();
      const phone = Array.isArray(phones) ? phones.find((p) => p.number === restaurant.vapi_phone_number) : null;
      if (phone) {
        await fetch(`https://api.vapi.ai/phone-number/${phone.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ assistantId: null, server: { url: `${publicUrl}/api/webhooks/vapi`, secret: webhookSecret } }),
        });
        phoneLinked = true;
      }
    }

    return {
      ok: true,
      assistantId,
      phoneLinked,
      warning: restaurant.vapi_phone_number && !phoneLinked
        ? `Nummer ${restaurant.vapi_phone_number} nicht im Vapi-Konto gefunden.`
        : (!restaurant.vapi_phone_number ? 'Keine Vapi-Telefonnummer hinterlegt.' : null),
    };
  } catch (err) {
    await logError('vapi-sync', err);
    return { ok: false, warning: 'Vapi-Synchronisierung fehlgeschlagen (siehe Error-Log).' };
  }
}

// Auswahl-Assistent für die Demo-Nummer (Teil B, Squad statt einzelnem
// Assistenten): kurze, sprachneutrale Begrüßung + handoff-Tool zu einem
// der 3 Sprach-Assistenten. Tool-Struktur (`type: 'handoff'`,
// `destinations: [...]`) folgt demselben Muster wie das bereits
// bestehende `transferCall`-Tool (buildTransferTools) — 22.09.2026 direkt
// gegen Vapis echtes OpenAPI-Schema geprüft (api.vapi.ai/api-json,
// CreateHandoffToolDTO/HandoffDestinationAssistant), stimmt exakt überein.
const LANGUAGE_SELECT_FIRST_MESSAGE = 'Hallo, für Deutsch sagen Sie "Deutsch" — for English say "English" — pentru română spuneți "română".';

function buildLanguageSelectBody({ publicUrl, webhookSecret, destinations }) {
  return {
    name: 'ki-works – Kiwo Demo Sprachauswahl',
    firstMessage: LANGUAGE_SELECT_FIRST_MESSAGE,
    silenceTimeoutSeconds: 20,
    maxDurationSeconds: 45,
    transcriber: { provider: 'deepgram', model: 'nova-2', language: 'de' },
    voice: { provider: 'azure', voiceId: 'de-AT-IngridNeural', speed: 1.0 },
    model: {
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      messages: [{
        role: 'system',
        content: 'Du bist eine kurze Sprachauswahl für Kiwo. Frage nach der gewünschten Sprache (Deutsch/English/Română) und nutze SOFORT das handoff-Tool zur passenden Sprache, sobald der Anrufer sie genannt hat — führe kein weiteres Gespräch, stelle keine Rückfragen.',
      }],
      tools: [{ type: 'handoff', destinations }],
    },
    server: { url: `${publicUrl}/api/webhooks/vapi`, secret: webhookSecret },
    serverMessages: ['tool-calls', 'end-of-call-report'],
  };
}

// Legt/aktualisiert das Vapi-Squad für die öffentliche Demo-Nummer an:
// 1 Auswahl-Assistent + 3 Sprach-Assistenten (DE/EN/RO), gebaut mit
// derselben buildAssistantBody() wie echte Kunden (Teil A) — keine
// doppelte Prompt-Logik. Speichert die IDs in restaurants.settings, damit
// handleAssistantRequest() (vapi.js) künftige Anrufe an das Squad statt
// an einen einzelnen Assistenten weiterreicht. Manueller Admin-Trigger
// (POST /api/restaurants/:id/sync-demo-squad), läuft nicht automatisch.
export async function syncDemoSquad(restaurantId) {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) return { ok: false, warning: 'VAPI_API_KEY nicht konfiguriert.' };
  const publicUrl = process.env.KIWORKS_PUBLIC_URL || 'https://ki-works.eu';
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  const { rows } = await query(
    'SELECT id, name, enabled_roles, transfer_phone_number, settings FROM restaurants WHERE id = $1',
    [restaurantId],
  );
  const restaurant = rows[0];
  if (!restaurant) return { ok: false, warning: `Restaurant ${restaurantId} nicht gefunden.` };

  try {
    const existingLanguageIds = restaurant.settings?.demoLanguageAssistantIds || {};
    const languageAssistantIds = {};
    for (const lang of Object.keys(LANGUAGE_OPTIONS)) {
      const body = buildAssistantBody({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        publicUrl,
        webhookSecret,
        enabledRoles: restaurant.enabled_roles,
        assistantName: 'Kiwo',
        transferPhoneNumber: restaurant.transfer_phone_number || null,
        language: lang,
      });
      body.name = `ki-works – Kiwo Demo (${lang.toUpperCase()})`;
      const existingId = existingLanguageIds[lang];
      // eslint-disable-next-line no-await-in-loop
      let res = existingId
        ? await fetch(`https://api.vapi.ai/assistant/${existingId}`, { method: 'PATCH', headers, body: JSON.stringify(body) })
        : await fetch('https://api.vapi.ai/assistant', { method: 'POST', headers, body: JSON.stringify(body) });
      if (existingId && res.status === 404) {
        // eslint-disable-next-line no-await-in-loop
        res = await fetch('https://api.vapi.ai/assistant', { method: 'POST', headers, body: JSON.stringify(body) });
      }
      // eslint-disable-next-line no-await-in-loop
      const json = await res.json();
      if (!json?.id) {
        await logError('vapi-demo-squad', new Error(`Sprach-Assistent (${lang}) konnte nicht angelegt werden: ${JSON.stringify(json)}`));
        return { ok: false, warning: `Sprach-Assistent (${lang}) fehlgeschlagen.` };
      }
      languageAssistantIds[lang] = json.id;
    }

    const destinations = Object.entries(languageAssistantIds).map(([lang, id]) => ({
      type: 'assistant',
      assistantName: `ki-works – Kiwo Demo (${lang.toUpperCase()})`,
      assistantId: id,
      description: LANGUAGE_OPTIONS[lang].handoffDescription,
    }));
    const selectBody = buildLanguageSelectBody({ publicUrl, webhookSecret, destinations });
    const existingSelectId = restaurant.settings?.demoSelectAssistantId;
    let selectRes = existingSelectId
      ? await fetch(`https://api.vapi.ai/assistant/${existingSelectId}`, { method: 'PATCH', headers, body: JSON.stringify(selectBody) })
      : await fetch('https://api.vapi.ai/assistant', { method: 'POST', headers, body: JSON.stringify(selectBody) });
    if (existingSelectId && selectRes.status === 404) {
      selectRes = await fetch('https://api.vapi.ai/assistant', { method: 'POST', headers, body: JSON.stringify(selectBody) });
    }
    const selectJson = await selectRes.json();
    if (!selectJson?.id) {
      await logError('vapi-demo-squad', new Error(`Auswahl-Assistent konnte nicht angelegt werden: ${JSON.stringify(selectJson)}`));
      return { ok: false, warning: 'Auswahl-Assistent fehlgeschlagen.' };
    }

    const squadBody = {
      name: 'ki-works – Kiwo Demo Sprachauswahl',
      members: [
        { assistantId: selectJson.id },
        ...Object.values(languageAssistantIds).map((id) => ({ assistantId: id })),
      ],
    };
    const existingSquadId = restaurant.settings?.squadId;
    let squadRes = existingSquadId
      ? await fetch(`https://api.vapi.ai/squad/${existingSquadId}`, { method: 'PATCH', headers, body: JSON.stringify(squadBody) })
      : await fetch('https://api.vapi.ai/squad', { method: 'POST', headers, body: JSON.stringify(squadBody) });
    if (existingSquadId && squadRes.status === 404) {
      squadRes = await fetch('https://api.vapi.ai/squad', { method: 'POST', headers, body: JSON.stringify(squadBody) });
    }
    const squadJson = await squadRes.json();
    if (!squadJson?.id) {
      await logError('vapi-demo-squad', new Error(`Squad konnte nicht angelegt werden: ${JSON.stringify(squadJson)}`));
      return { ok: false, warning: 'Squad konnte nicht angelegt werden.' };
    }

    await query(
      `UPDATE restaurants SET settings = jsonb_set(jsonb_set(jsonb_set(COALESCE(settings, '{}'::jsonb),
        '{squadId}', $1::jsonb, true),
        '{demoLanguageAssistantIds}', $2::jsonb, true),
        '{demoSelectAssistantId}', $3::jsonb, true)
       WHERE id = $4`,
      [JSON.stringify(squadJson.id), JSON.stringify(languageAssistantIds), JSON.stringify(selectJson.id), restaurantId],
    );

    return {
      ok: true, squadId: squadJson.id, languageAssistantIds, selectAssistantId: selectJson.id,
    };
  } catch (err) {
    await logError('vapi-demo-squad', err);
    return { ok: false, warning: 'Demo-Squad-Synchronisierung fehlgeschlagen (siehe Error-Log).' };
  }
}
