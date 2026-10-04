// Legt Sales-Akquise-Mails nach Freigabe direkt als Entwurf im Postfach
// info@ki-works.eu an (IMAP APPEND ins Drafts-Verzeichnis) — kein
// automatischer Versand, der letzte Klick ("Senden") bleibt bewusst beim
// Menschen (siehe CLAUDE.md "Akquise-Agent": Kalt-E-Mail-Versand in der EU
// ist rechtlich heikel, deshalb kein Vollautomat).
import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';

// Gängige Postfächer benennen den Entwürfe-Ordner unterschiedlich — der
// erste vorhandene Treffer wird verwendet.
const DRAFT_FOLDER_CANDIDATES = ['Drafts', 'Entwürfe', 'INBOX.Drafts', 'INBOX.Entwürfe'];

// Env-Präfix pro Business: jedes Business hat sein eigenes Postfach
// (<PREFIX>_MAIL_IMAP_HOST/_PORT/_USER/_PASSWORD). 'reseller' nutzt dasselbe
// Postfach wie ki-works. Neues Business = ein Eintrag hier + Env-Variablen.
const MAILBOX_ENV_PREFIX = {
  'ki-works': 'KIWORKS',
  reseller: 'KIWORKS',
  ledtek: 'LEDTEK',
  pixelpress: 'PIXELPRESS',
};

export function hasMailbox(business) {
  return Boolean(MAILBOX_ENV_PREFIX[business]);
}

export async function createSalesDraft({ business = 'ki-works', to, subject, text }) {
  const prefix = MAILBOX_ENV_PREFIX[business];
  if (!prefix) throw new Error(`Kein Postfach für Business "${business}" vorgesehen`);
  const host = process.env[`${prefix}_MAIL_IMAP_HOST`];
  const port = Number(process.env[`${prefix}_MAIL_IMAP_PORT`] || 993);
  const user = process.env[`${prefix}_MAIL_IMAP_USER`];
  const pass = process.env[`${prefix}_MAIL_IMAP_PASSWORD`];
  if (!host || !user || !pass) {
    throw new Error(`${prefix}_MAIL_IMAP_HOST/_USER/_PASSWORD nicht gesetzt`);
  }

  const { message } = await nodemailer.createTransport({ streamTransport: true, buffer: true }).sendMail({
    from: user,
    to,
    subject,
    text,
  });

  const client = new ImapFlow({ host, port, secure: true, auth: { user, pass }, logger: false });
  await client.connect();
  try {
    const mailboxes = await client.list();
    const folder = DRAFT_FOLDER_CANDIDATES.find((name) => mailboxes.some((mb) => mb.path === name))
      || mailboxes.find((mb) => mb.specialUse === '\\Drafts')?.path;
    if (!folder) throw new Error('Kein Entwürfe-Ordner im Postfach gefunden');
    await client.append(folder, message, ['\\Draft']);
  } finally {
    await client.logout();
  }
}
