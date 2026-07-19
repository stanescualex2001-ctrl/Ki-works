#!/usr/bin/env bash
#
# Legt den Vapi-Assistenten für das Test-Restaurant Venezia an und
# verknüpft ihn mit der Vapi-Telefonnummer.
# Voraussetzung: install.sh wurde ausgeführt (/etc/ki-works/ki-works.env existiert).
#
set -euo pipefail
source /etc/ki-works/ki-works.env

[[ -n "${VAPI_API_KEY:-}" ]] || { echo "VAPI_API_KEY fehlt in /etc/ki-works/ki-works.env"; exit 1; }
PUBLIC_URL="${KIWORKS_PUBLIC_URL:-https://ki-works.eu}"

echo "==> Vapi-Assistent 'ki-works – Venezia' anlegen..."
ASSISTANT_JSON=$(curl -sS -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "name": "ki-works – Venezia",
  "firstMessage": "Grüß Gott, hier ist Kiwo, der KI-Reservierungsassistent vom Restaurant Venezia in Schwertberg. Zur Qualitätssicherung wird dieses Gespräch aufgezeichnet und automatisiert verarbeitet. Wie kann ich Ihnen helfen?",
  "silenceTimeoutSeconds": 60,
  "messagePlan": {
    "idleMessages": ["Sind Sie noch da? Kann ich Ihnen noch weiterhelfen?"],
    "idleMessageMaxSpokenCount": 2,
    "idleTimeoutSeconds": 15
  },
  "transcriber": { "provider": "deepgram", "model": "nova-2", "language": "de" },
  "voice": { "provider": "azure", "voiceId": "de-AT-IngridNeural" },
  "model": {
    "provider": "anthropic",
    "model": "claude-haiku-4-5-20251001",
    "messages": [
      {
        "role": "system",
        "content": "Du bist Kiwo, der freundliche Telefonassistent des Restaurants Venezia am Marktplatz 10 in 4311 Schwertberg, Österreich. Du sprichst Deutsch und nimmst Tischreservierungen sowie Abhol-Bestellungen entgegen. Kontext zum Anrufer: {{guestContext}} Wenn ein Stammgast erkannt wurde, begrüße ihn direkt mit Namen und beziehe dich freundlich auf frühere Besuche — frage aber trotzdem alle Angaben ab. SPEISEKARTE UND INFOS: {{menu}} Nutze für Gerichte, Preise, Aktionen und Öffnungszeiten AUSSCHLIESSLICH diese Karte — erfinde nichts. Erwähne passende Aktionen aktiv (z. B. Gratis-Zustellung ab 4 Pizzen, Abholaktion ab 5 Pizzen). ÖFFNUNGSZEITEN: {{opening_hours}} Nimm für als 'geschlossen' markierte Tage keine Reservierungen oder Bestellungen an, sondern biete freundlich einen anderen Tag an. Nimm auch nichts außerhalb der genannten Öffnungszeiten an. RESERVIERUNGEN: Frage nach Name (bei Stammgästen nur bestätigen), Anzahl der Personen, Datum und Uhrzeit. Wiederhole den verstandenen Namen kurz zur Bestätigung (z. B. 'Also unter dem Namen ..., richtig?'), BEVOR du irgendetwas anlegst — Namen werden per Spracherkennung oft falsch verstanden. Bittet der Gast dich, den Namen zu buchstabieren oder zu korrigieren, höre sehr geduldig zu (auch bei mehreren Versuchen und Pausen zwischen einzelnen Buchstaben — unterbrich nicht, dräng nicht). Bestätige bei mehrfachen Korrekturen jeweils nur den zuletzt genannten Teil in kleinen Abschnitten (z. B. 3-4 Buchstaben), statt jedes Mal den kompletten Namen neu vorzulesen. Prüfe bei Bedarf mit check_availability die Verfügbarkeit. Termine müssen in der Zukunft liegen (vergleiche mit {{now}}) — schlage niemals einen bereits vergangenen Zeitpunkt vor. Lege die Reservierung erst nach Bestätigung des Namens mit create_reservation an (datetime im Format JJJJ-MM-TTTHH:MM, Zeitzone Europa/Wien). BESTELLUNGEN ZUR ABHOLUNG ODER ZUM TISCH: Nimm die gewünschten Gerichte von der Speisekarte auf (items, z. B. '2x Pizza 05 Salami, 1x Lasagne 103'), nenne dabei die Preise von der Karte. Frage AKTIV 'Möchten Sie sonst noch etwas bestellen?', bevor du nach Name und Abholzeit fragst — erst nach einem klaren 'Nein' gilt die Bestellung als vollständig. Wünscht der Gast etwas, das nicht auf der Karte steht, frage nach oder verweise freundlich ans Restaurant. Abholzeit (pickup_time) muss in der Zukunft liegen (vergleiche mit {{now}}) — schlage niemals einen bereits vergangenen Zeitpunkt vor, auch nicht am selben Tag. Lege die Bestellung mit create_order an. KOMBINATION MIT RESERVIERUNG: Möchte ein Gast zusätzlich zu einer Bestellung auch einen Tisch, oder soll das Essen bei einer Reservierung schon am Tisch bereitstehen: Bei getrennten Wünschen (z. B. Tisch heute Abend UND Abholung zu anderer Zeit) lege beides unabhängig mit create_reservation und create_order an. Soll das Essen dagegen am reservierten Tisch serviert werden, lege zuerst mit create_reservation die Reservierung an — die Antwort enthält eine interne Referenz wie '[reservation_id: 42]', die du NIEMALS laut vorliest — und rufe dann create_order mit fulfillment='dine_in' und reservation_id=<dieser Zahl> auf; eine separate Abholzeit ist dann nicht nötig. WICHTIG BEIM VORLESEN: Sprich Mengenangaben immer als Wort aus ('einmal', 'zweimal', 'dreimal' usw.) — sag niemals 'X' oder 'mal X' als Buchstabe. Die Schreibweise mit 'x' (z. B. '2x Pizza 05') ist NUR für den internen Parameter items gedacht, nicht zum lauten Vorlesen. IMMER: Frage 'Darf ich für Benachrichtigungen die Nummer speichern, von der Sie gerade anrufen, oder möchten Sie eine andere Nummer angeben?' Wenn der Gast eine andere Nummer nennt, übergib sie als phone; sonst lasse phone weg. Fasse Reservierung bzw. Bestellung GENAU EINMAL vollständig zusammen, kurz bevor du sie anlegst (bei Bestellungen inklusive Gesamtpreis laut Karte) — wiederhole die komplette Liste danach nicht noch einmal, das wirkt langatmig und Gäste legen dann eher auf. Bedanke dich nach dem erfolgreichen Anlegen (create_reservation/create_order) kurz — ohne die Details erneut komplett aufzuzählen — und verabschiede dich freundlich (z. B. 'Vielen Dank, wir freuen uns auf Sie! Auf Wiederhören.') — lege niemals kommentarlos auf, ohne dich zu verabschieden. RESERVIERUNG STORNIEREN ODER VERSCHIEBEN: Möchte ein Gast eine bestehende Reservierung stornieren, nutze cancel_reservation; möchte er den Termin ändern, nutze reschedule_reservation mit dem neuen Termin (new_datetime). Meldet die Funktion mehrere passende Reservierungen, frage gezielt nach dem genauen Termin (Datum/Uhrzeit) und rufe die Funktion mit datetime bzw. old_datetime erneut auf, statt zu raten. Heutiges Datum: {{now}}."
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "create_reservation",
          "description": "Legt eine Tischreservierung an.",
          "parameters": {
            "type": "object",
            "properties": {
              "name":       { "type": "string", "description": "Name des Gastes" },
              "phone":      { "type": "string", "description": "Telefonnummer für Benachrichtigungen — nur angeben, wenn sie von der Anrufnummer abweicht" },
              "party_size": { "type": "integer", "description": "Anzahl der Personen" },
              "datetime":   { "type": "string", "description": "Datum und Uhrzeit, ISO-Format JJJJ-MM-TTTHH:MM" },
              "notes":      { "type": "string", "description": "Besondere Wünsche" }
            },
            "required": ["name", "party_size", "datetime"]
          }
        }
      },
      {
        "type": "function",
        "function": {
          "name": "create_order",
          "description": "Nimmt eine Bestellung zur Abholung auf, oder zum Tisch bei einer im selben Anruf angelegten Reservierung.",
          "parameters": {
            "type": "object",
            "properties": {
              "name":           { "type": "string", "description": "Name des Gastes" },
              "phone":          { "type": "string", "description": "Telefonnummer für Benachrichtigungen — nur angeben, wenn sie von der Anrufnummer abweicht" },
              "items":          { "type": "string", "description": "Bestellte Gerichte als Freitext, z. B. '2x Pizza Margherita, 1x Lasagne'" },
              "pickup_time":    { "type": "string", "description": "Gewünschte Abholzeit, ISO-Format JJJJ-MM-TTTHH:MM. Bei fulfillment=dine_in nicht nötig (nutzt die Reservierungszeit)." },
              "notes":          { "type": "string", "description": "Besondere Wünsche" },
              "fulfillment":    { "type": "string", "enum": ["pickup", "dine_in"], "description": "pickup = Abholung (Standard), dine_in = Essen am reservierten Tisch" },
              "reservation_id": { "type": "integer", "description": "Nur bei fulfillment=dine_in: die Zahl aus '[reservation_id: ...]', die create_reservation im selben Anruf zurückgegeben hat" }
            },
            "required": ["name", "items"]
          }
        }
      },
      {
        "type": "function",
        "function": {
          "name": "check_availability",
          "description": "Prüft, ob zu einer Uhrzeit noch Plätze frei sind.",
          "parameters": {
            "type": "object",
            "properties": {
              "datetime":   { "type": "string", "description": "Datum und Uhrzeit, ISO-Format" },
              "party_size": { "type": "integer" }
            },
            "required": ["datetime"]
          }
        }
      },
      {
        "type": "function",
        "function": {
          "name": "cancel_reservation",
          "description": "Storniert eine bestehende Tischreservierung.",
          "parameters": {
            "type": "object",
            "properties": {
              "name":     { "type": "string", "description": "Name des Gastes" },
              "phone":    { "type": "string", "description": "Telefonnummer der Reservierung — nur angeben, wenn sie von der Anrufnummer abweicht" },
              "datetime": { "type": "string", "description": "Datum/Uhrzeit der zu stornierenden Reservierung, ISO-Format — nur nötig, falls es mehrere passende Reservierungen gibt" }
            },
            "required": []
          }
        }
      },
      {
        "type": "function",
        "function": {
          "name": "reschedule_reservation",
          "description": "Verschiebt eine bestehende Tischreservierung auf einen neuen Termin.",
          "parameters": {
            "type": "object",
            "properties": {
              "name":         { "type": "string", "description": "Name des Gastes" },
              "phone":        { "type": "string", "description": "Telefonnummer der Reservierung — nur angeben, wenn sie von der Anrufnummer abweicht" },
              "old_datetime": { "type": "string", "description": "Bisheriger Termin, ISO-Format — nur nötig, falls es mehrere passende Reservierungen gibt" },
              "new_datetime": { "type": "string", "description": "Gewünschter neuer Termin, ISO-Format JJJJ-MM-TTTHH:MM" }
            },
            "required": ["new_datetime"]
          }
        }
      }
    ]
  },
  "server": {
    "url": "$PUBLIC_URL/api/webhooks/vapi",
    "secret": "$VAPI_WEBHOOK_SECRET"
  },
  "serverMessages": ["tool-calls", "end-of-call-report"]
}
EOF
)

ASSISTANT_ID=$(echo "$ASSISTANT_JSON" | jq -r '.id // empty')
[[ -n "$ASSISTANT_ID" ]] || { echo "Assistent konnte nicht angelegt werden:"; echo "$ASSISTANT_JSON" | jq .; exit 1; }
echo "    Assistant-ID: $ASSISTANT_ID"

echo "==> Telefonnummer $VAPI_PHONE_NUMBER mit dem Assistenten verknüpfen..."
PHONE_ID=$(curl -sS https://api.vapi.ai/phone-number \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  | jq -r --arg num "$VAPI_PHONE_NUMBER" '.[] | select(.number == $num) | .id')

if [[ -n "$PHONE_ID" ]]; then
  # Kein fester Assistent auf der Nummer: Vapi fragt bei jedem Anruf per
  # assistant-request beim Backend an — so bekommt der Agent Stammgast-Kontext.
  curl -sS -X PATCH "https://api.vapi.ai/phone-number/$PHONE_ID" \
    -H "Authorization: Bearer $VAPI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"assistantId\": null, \"server\": {\"url\": \"$PUBLIC_URL/api/webhooks/vapi\", \"secret\": \"$VAPI_WEBHOOK_SECRET\"}}" \
    | jq '{id, number, server: .server.url}'
else
  echo "WARNUNG: Nummer $VAPI_PHONE_NUMBER nicht im Vapi-Konto gefunden — im Vapi-Dashboard manuell verknüpfen."
fi

echo "==> Assistant-ID in der Datenbank speichern..."
curl -sS -X PATCH "http://127.0.0.1:3001/api/restaurants/1" \
  -H "Content-Type: application/json" \
  -d "{\"vapi_assistant_id\": \"$ASSISTANT_ID\"}" | jq '{id, name, vapi_assistant_id}'

echo ""
echo "FERTIG! Testanruf: $VAPI_PHONE_NUMBER"
