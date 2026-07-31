#!/usr/bin/env bash
#
# Stößt die Vapi-Assistenten-Synchronisierung für ein Restaurant manuell an
# (z. B. um eine Prompt-Änderung auf einen Bestandskunden nachzuziehen).
# Bei "Neuer Kunde" im Dashboard bzw. beim Ändern von Name/Adresse/Nummer
# passiert das automatisch — dieses Skript ist nur für den manuellen Fall.
# Aufruf: bash setup-vapi.sh <restaurant-id>
#
set -euo pipefail

RESTAURANT_ID="${1:-}"
[[ -n "$RESTAURANT_ID" ]] || { echo "Nutzung: bash setup-vapi.sh <restaurant-id>"; exit 1; }

RESULT=$(curl -sS -X POST "http://127.0.0.1:3001/api/restaurants/$RESTAURANT_ID/sync-vapi")
echo "$RESULT" | jq .

OK=$(echo "$RESULT" | jq -r '.vapi.ok // false')
if [[ "$OK" != "true" ]]; then
  echo "FEHLER: $(echo "$RESULT" | jq -r '.vapi.warning // .error // "unbekannter Fehler"')"
  exit 1
fi

NUMBER=$(echo "$RESULT" | jq -r '.vapi_phone_number // "<keine Nummer hinterlegt>"')
echo ""
echo "FERTIG! Testanruf: $NUMBER"
