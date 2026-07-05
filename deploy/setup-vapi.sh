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
  "firstMessage": "Grüß Gott, hier ist der Reservierungsassistent vom Restaurant Venezia in Schwertberg. Wie kann ich Ihnen helfen?",
  "transcriber": { "provider": "deepgram", "model": "nova-2", "language": "de" },
  "voice": { "provider": "11labs", "voiceId": "FTNCalFNG5bRnkkaP5Ug" },
  "model": {
    "provider": "anthropic",
    "model": "claude-haiku-4-5-20251001",
    "messages": [
      {
        "role": "system",
        "content": "Du bist der freundliche Telefonassistent des Restaurants Venezia am Marktplatz 10 in 4311 Schwertberg, Österreich. Du sprichst Deutsch und nimmst Tischreservierungen entgegen. Frage nach: Name, Anzahl der Personen, Datum und Uhrzeit. Prüfe bei Bedarf mit check_availability die Verfügbarkeit. Sobald du alle Angaben hast, lege die Reservierung mit create_reservation an (datetime im Format JJJJ-MM-TTTHH:MM, Zeitzone Europa/Wien). Bestätige die Reservierung am Ende noch einmal. Heutiges Datum: {{now}}."
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
              "phone":      { "type": "string", "description": "Telefonnummer des Gastes" },
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
  curl -sS -X PATCH "https://api.vapi.ai/phone-number/$PHONE_ID" \
    -H "Authorization: Bearer $VAPI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"assistantId\": \"$ASSISTANT_ID\"}" | jq '{id, number, assistantId}'
else
  echo "WARNUNG: Nummer $VAPI_PHONE_NUMBER nicht im Vapi-Konto gefunden — im Vapi-Dashboard manuell verknüpfen."
fi

echo "==> Assistant-ID in der Datenbank speichern..."
curl -sS -X PATCH "http://127.0.0.1:3001/api/restaurants/1" \
  -H "Content-Type: application/json" \
  -d "{\"vapi_assistant_id\": \"$ASSISTANT_ID\"}" | jq '{id, name, vapi_assistant_id}'

echo ""
echo "FERTIG! Testanruf: $VAPI_PHONE_NUMBER"
