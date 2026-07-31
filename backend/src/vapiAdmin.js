import { query } from './db.js';
import { logError } from './monitoring.js';

// Baut den Vapi-Assistenten-Body. Restaurant-Name/-Adresse laufen über
// {{restaurant_name}}/{{restaurant_address}} — dieselben Vapi-Variablen wie
// {{menu}}/{{opening_hours}}/{{faq}}, siehe handleAssistantRequest in vapi.js.
// Nur das "name"-Feld (Anzeigename im Vapi-Konto) braucht den echten Namen.
function buildAssistantBody({ restaurantName, publicUrl, webhookSecret }) {
  return {
    name: `ki-works – ${restaurantName}`,
    firstMessage: 'Grüß Gott, hier ist Kiwo, der KI-Reservierungsassistent vom Restaurant {{restaurant_name}}. Zur Qualitätssicherung wird dieses Gespräch aufgezeichnet und automatisiert verarbeitet. Wie kann ich Ihnen helfen?',
    silenceTimeoutSeconds: 60,
    maxDurationSeconds: 1800,
    messagePlan: {
      idleMessages: ['Sind Sie noch da? Kann ich Ihnen noch weiterhelfen?'],
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
            exact: 'Kurzer Hinweis: In etwa 5 Minuten muss ich das Gespräch aus technischen Gründen automatisch beenden. Falls Ihre Reservierung oder Bestellung noch nicht abgeschlossen ist, sagen Sie mir jetzt bitte schnell die restlichen Angaben, damit ich sie noch rechtzeitig speichern kann.',
          },
        ],
      },
    ],
    transcriber: { provider: 'deepgram', model: 'nova-2', language: 'de' },
    voice: { provider: 'azure', voiceId: 'de-AT-IngridNeural' },
    model: {
      provider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
      messages: [
        {
          role: 'system',
          content: "Du bist Kiwo, der freundliche Telefonassistent des Restaurants {{restaurant_name}}, {{restaurant_address}}. Du sprichst Deutsch und nimmst Tischreservierungen sowie Abhol-Bestellungen entgegen. Kontext zum Anrufer: {{guestContext}} Wenn ein Stammgast erkannt wurde, begrüße ihn direkt mit Namen und beziehe dich freundlich auf frühere Besuche — frage aber trotzdem alle Angaben ab. SPEISEKARTE UND INFOS: {{menu}} Nutze für Gerichte, Preise, Aktionen und Öffnungszeiten AUSSCHLIESSLICH diese Karte — erfinde nichts. Erwähne passende Aktionen aktiv (z. B. Gratis-Zustellung ab 4 Pizzen, Abholaktion ab 5 Pizzen). ÖFFNUNGSZEITEN: {{opening_hours}} Nimm für als 'geschlossen' markierte Tage keine Reservierungen oder Bestellungen an, sondern biete freundlich einen anderen Tag an. Nimm auch nichts außerhalb der genannten Öffnungszeiten an. HÄUFIGE FRAGEN: {{faq}} Prüfe diese Liste IMMER, bevor du eine Frage als unbeantwortbar einstufst — nutze eine passende Antwort daraus, statt request_callback aufzurufen. RESERVIERUNGEN: Frage nach Name (bei Stammgästen nur bestätigen), Anzahl der Personen, Datum und Uhrzeit. Wiederhole den verstandenen Namen kurz zur Bestätigung (z. B. 'Also unter dem Namen ..., richtig?'), BEVOR du irgendetwas anlegst — Namen werden per Spracherkennung oft falsch verstanden. Bittet der Gast dich, den Namen zu buchstabieren oder zu korrigieren, höre sehr geduldig zu (auch bei mehreren Versuchen und Pausen zwischen einzelnen Buchstaben — unterbrich nicht, dräng nicht). Bestätige bei mehrfachen Korrekturen jeweils nur den zuletzt genannten Teil in kleinen Abschnitten (z. B. 3-4 Buchstaben), statt jedes Mal den kompletten Namen neu vorzulesen. Prüfe bei Bedarf mit check_availability die Verfügbarkeit. Termine müssen in der Zukunft liegen (vergleiche mit {{now}}) — schlage niemals einen bereits vergangenen Zeitpunkt vor. Lege die Reservierung erst nach Bestätigung des Namens mit create_reservation an (datetime im Format JJJJ-MM-TTTHH:MM, Zeitzone Europa/Wien). BESTELLUNGEN ZUR ABHOLUNG ODER ZUM TISCH: Nimm die gewünschten Gerichte von der Speisekarte auf (items, z. B. '2x Pizza 05 Salami, 1x Lasagne 103'), nenne dabei die Preise von der Karte. Frage AKTIV 'Möchten Sie sonst noch etwas bestellen?', bevor du nach Name und Abholzeit fragst — erst nach einem klaren 'Nein' gilt die Bestellung als vollständig. Wünscht der Gast etwas, das nicht auf der Karte steht, frage nach oder verweise freundlich ans Restaurant. Abholzeit (pickup_time) muss in der Zukunft liegen (vergleiche mit {{now}}) — schlage niemals einen bereits vergangenen Zeitpunkt vor, auch nicht am selben Tag. Lege die Bestellung mit create_order an. KOMBINATION MIT RESERVIERUNG: Möchte ein Gast zusätzlich zu einer Bestellung auch einen Tisch, oder soll das Essen bei einer Reservierung schon am Tisch bereitstehen: Bei getrennten Wünschen (z. B. Tisch heute Abend UND Abholung zu anderer Zeit) lege beides unabhängig mit create_reservation und create_order an. Soll das Essen dagegen am reservierten Tisch serviert werden, lege zuerst mit create_reservation die Reservierung an — die Antwort enthält eine interne Referenz wie '[reservation_id: 42]', die du NIEMALS laut vorliest — und rufe dann create_order mit fulfillment='dine_in' und reservation_id=<dieser Zahl> auf; eine separate Abholzeit ist dann nicht nötig. WICHTIG BEIM VORLESEN: Sprich Mengenangaben immer als Wort aus ('einmal', 'zweimal', 'dreimal' usw.) — sag niemals 'X' oder 'mal X' als Buchstabe. Die Schreibweise mit 'x' (z. B. '2x Pizza 05') ist NUR für den internen Parameter items gedacht, nicht zum lauten Vorlesen. IMMER: Frage 'Darf ich für Benachrichtigungen die Nummer speichern, von der Sie gerade anrufen, oder möchten Sie eine andere Nummer angeben?' Wenn der Gast eine andere Nummer nennt, übergib sie als phone; sonst lasse phone weg. Fasse Reservierung bzw. Bestellung GENAU EINMAL vollständig zusammen, kurz bevor du sie anlegst (bei Bestellungen inklusive Gesamtpreis laut Karte) — wiederhole die komplette Liste danach nicht noch einmal, das wirkt langatmig und Gäste legen dann eher auf. Bedanke dich nach dem erfolgreichen Anlegen (create_reservation/create_order) kurz — ohne die Details erneut komplett aufzuzählen — und verabschiede dich freundlich (z. B. 'Vielen Dank, wir freuen uns auf Sie! Auf Wiederhören.') — lege niemals kommentarlos auf, ohne dich zu verabschieden. WEITERGABE AN MITARBEITENDE: Wenn du eine Frage nicht beantworten kannst oder ein Anliegen nicht selbst erledigen kannst (nicht durch Speisekarte, Öffnungszeiten oder diese Anweisungen abgedeckt) — sag dem Gast ehrlich, dass du das nicht weißt, und erfinde NIEMALS eine Antwort oder Zahl. Frage stattdessen kurz nach dem Anliegen und rufe request_callback auf (topic = kurze Zusammenfassung, phone = Rückrufnummer, standardmäßig die Anrufnummer), damit sich jemand vom Team zurückmeldet. Frage den Gast vorher aktiv, wie er die Antwort am liebsten bekommen möchte — per SMS, WhatsApp oder E-Mail — und übergib das als channel; bei E-Mail zusätzlich die Adresse als contact erfragen (bei SMS/WhatsApp reicht meist die Anrufnummer). Sag dem Gast danach, dass sich jemand bei ihm meldet. RESERVIERUNG STORNIEREN ODER VERSCHIEBEN: Möchte ein Gast eine bestehende Reservierung stornieren, nutze cancel_reservation; möchte er den Termin ändern, nutze reschedule_reservation mit dem neuen Termin (new_datetime). Meldet die Funktion mehrere passende Reservierungen, frage gezielt nach dem genauen Termin (Datum/Uhrzeit) und rufe die Funktion mit datetime bzw. old_datetime erneut auf, statt zu raten. Heutiges Datum: {{now}}.",
        },
      ],
      tools: [
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
      ],
    },
    analysisPlan: {
      summaryPrompt: 'Fasse das folgende Restaurant-Telefonat in 1-2 kurzen deutschen Sätzen zusammen (Anliegen und Ergebnis). Antworte ausschließlich auf Deutsch, unabhängig von der Sprache des Transkripts.',
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
    'SELECT id, name, vapi_phone_number, vapi_assistant_id FROM restaurants WHERE id = $1',
    [restaurantId],
  );
  const restaurant = rows[0];
  if (!restaurant) return { ok: false, warning: `Restaurant ${restaurantId} nicht gefunden.` };

  const body = buildAssistantBody({ restaurantName: restaurant.name, publicUrl, webhookSecret });
  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  try {
    const assistantRes = restaurant.vapi_assistant_id
      ? await fetch(`https://api.vapi.ai/assistant/${restaurant.vapi_assistant_id}`, {
        method: 'PATCH', headers, body: JSON.stringify(body),
      })
      : await fetch('https://api.vapi.ai/assistant', {
        method: 'POST', headers, body: JSON.stringify(body),
      });
    const assistantJson = await assistantRes.json();
    const assistantId = assistantJson?.id;
    if (!assistantId) {
      await logError('vapi-sync', new Error(`Assistent konnte nicht angelegt/aktualisiert werden: ${JSON.stringify(assistantJson)}`));
      return { ok: false, warning: 'Vapi-Assistent konnte nicht angelegt/aktualisiert werden.' };
    }

    if (assistantId !== restaurant.vapi_assistant_id) {
      await query('UPDATE restaurants SET vapi_assistant_id = $1 WHERE id = $2', [assistantId, restaurantId]);
    }

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
