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

export async function createSalesDraft({ to, subject, text }) {
  const host = process.env.KIWORKS_MAIL_IMAP_HOST;
  const port = Number(process.env.KIWORKS_MAIL_IMAP_PORT || 993);
  const user = process.env.KIWORKS_MAIL_IMAP_USER;
  const pass = process.env.KIWORKS_MAIL_IMAP_PASSWORD;
  if (!host || !user || !pass) {
    throw new Error('KIWORKS_MAIL_IMAP_HOST/_USER/_PASSWORD nicht gesetzt');
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
