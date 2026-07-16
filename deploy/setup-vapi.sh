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
  "firstMessage": "Grüß Gott, hier ist der KI-Reservierungsassistent vom Restaurant Venezia in Schwertberg. Zur Qualitätssicherung wird dieses Gespräch aufgezeichnet und automatisiert verarbeitet. Wie kann ich Ihnen helfen?",
  "transcriber": { "provider": "deepgram", "model": "nova-2", "language": "de" },
  "voice": { "provider": "azure", "voiceId": "de-AT-IngridNeural" },
  "model": {
    "provider": "anthropic",
    "model": "claude-haiku-4-5-20251001",
    "messages": [
      {
        "role": "system",
        "content": "Du bist der freundliche Telefonassistent des Restaurants Venezia am Marktplatz 10 in 4311 Schwertberg, Österreich. Du sprichst Deutsch und nimmst Tischreservierungen sowie Abhol-Bestellungen entgegen. Kontext zum Anrufer: {{guestContext}} Wenn ein Stammgast erkannt wurde, begrüße ihn direkt mit Namen und beziehe dich freundlich auf frühere Besuche — frage aber trotzdem alle Angaben ab. SPEISEKARTE UND INFOS: {{menu}} Nutze für Gerichte, Preise, Aktionen und Öffnungszeiten AUSSCHLIESSLICH diese Karte — erfinde nichts. Erwähne passende Aktionen aktiv (z. B. Gratis-Zustellung ab 4 Pizzen, Abholaktion ab 5 Pizzen). WICHTIG: Mittwoch ist Ruhetag (außer an Feiertagen) — nimm für Mittwoch keine Reservierungen oder Bestellungen an, sondern biete freundlich einen anderen Tag an. Nimm auch nichts außerhalb der Öffnungszeiten an. RESERVIERUNGEN: Frage nach Name (bei Stammgästen nur bestätigen), Anzahl der Personen, Datum und Uhrzeit. Prüfe bei Bedarf mit check_availability die Verfügbarkeit. Lege die Reservierung mit create_reservation an (datetime im Format JJJJ-MM-TTTHH:MM, Zeitzone Europa/Wien). BESTELLUNGEN ZUR ABHOLUNG: Nimm die gewünschten Gerichte von der Speisekarte auf (items, z. B. '2x Pizza 05 Salami, 1x Lasagne 103'), nenne dabei die Preise von der Karte, frage nach Name und gewünschter Abholzeit (pickup_time) und lege die Bestellung mit create_order an. Wünscht der Gast etwas, das nicht auf der Karte steht, frage nach oder verweise freundlich ans Restaurant. IMMER: Frage 'Darf ich für Benachrichtigungen die Nummer speichern, von der Sie gerade anrufen, oder möchten Sie eine andere Nummer angeben?' Wenn der Gast eine andere Nummer nennt, übergib sie als phone; sonst lasse phone weg. Bestätige Reservierung bzw. Bestellung am Ende noch einmal vollständig, bei Bestellungen inklusive Gesamtpreis laut Karte. Heutiges Datum: {{now}}."
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
          "description": "Nimmt eine Bestellung zur Abholung auf.",
          "parameters": {
            "type": "object",
            "properties": {
              "name":        { "type": "string", "description": "Name des Gastes" },
              "phone":       { "type": "string", "description": "Telefonnummer für Benachrichtigungen — nur angeben, wenn sie von der Anrufnummer abweicht" },
              "items":       { "type": "string", "description": "Bestellte Gerichte als Freitext, z. B. '2x Pizza Margherita, 1x Lasagne'" },
              "pickup_time": { "type": "string", "description": "Gewünschte Abholzeit, ISO-Format JJJJ-MM-TTTHH:MM" },
              "notes":       { "type": "string", "description": "Besondere Wünsche" }
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
