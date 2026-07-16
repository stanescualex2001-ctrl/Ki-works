// SMS-Versand über Twilio. Ohne konfigurierte Zugangsdaten stiller No-Op,
// damit das System auch ohne Twilio vollständig funktioniert.
const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM = process.env.TWILIO_FROM || 'KiWorks'; // Nummer oder Absendername

export async function sendSms(to, body) {
  if (!SID || !TOKEN || !to) return false;
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          authorization: `Basic ${Buffer.from(`${SID}:${TOKEN}`).toString('base64')}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: FROM, Body: body }),
      },
    );
    if (!res.ok) console.error('Twilio SMS error', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('Twilio SMS failed:', err.message);
    return false;
  }
}

export function orderSms(order, restaurantName) {
  const when = order.requested_at
    ? ` zur Abholung um ${new Date(order.requested_at).toLocaleTimeString('de-AT', { timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit' })}`
    : '';
  return `Bestellung angenommen (${restaurantName}): ${order.items}${when}. Danke, ${order.customer_name}!`;
}

export function reservationSms(reservation, restaurantName) {
  const when = new Date(reservation.reserved_at).toLocaleString('de-AT', {
    timeZone: 'Europe/Vienna', dateStyle: 'medium', timeStyle: 'short',
  });
  return `Reservierung bestätigt: ${reservation.customer_name}, `
    + `${reservation.party_size} Personen am ${when} – ${restaurantName}. Bis bald!`;
}

export function cancellationSms(reservation, restaurantName) {
  const when = new Date(reservation.reserved_at).toLocaleString('de-AT', {
    timeZone: 'Europe/Vienna', dateStyle: 'medium', timeStyle: 'short',
  });
  return `Ihre Reservierung bei ${restaurantName} am ${when} wurde storniert.`;
}

export function rescheduleSms(reservation, restaurantName) {
  const when = new Date(reservation.reserved_at).toLocaleString('de-AT', {
    timeZone: 'Europe/Vienna', dateStyle: 'medium', timeStyle: 'short',
  });
  return `Ihre Reservierung bei ${restaurantName} wurde auf ${when} verschoben.`;
}
