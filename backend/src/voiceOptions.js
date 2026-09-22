// Registry der am Telefon wählbaren Sprachen — eine Quelle der Wahrheit für
// vapiAdmin.js (buildAssistantBody), gleiches Prinzip wie ROLE_BLOCKS/
// BUSINESS_PROFILES. Feste, pro Kunde wählbare Sprache (kein Live-Wechsel
// innerhalb eines Anrufs — bewusste Entscheidung, siehe CLAUDE.md
// "Mehrsprachigkeit am Telefon").
//
// languageInstruction wird an den (weiterhin deutschen) LLM-Instruktions-
// text angehängt — Claude folgt einer Sprachanweisung zuverlässig, auch
// wenn der Rest der Instruktionen auf Deutsch ist. Alle anderen Felder
// hier sind dagegen wörtlich vorgelesene Strings OHNE LLM dazwischen
// (firstMessage, idleMessage, Hooks, Transfer-Ansagen) — die MÜSSEN echt
// übersetzt sein, sonst hört z. B. ein englischer Anrufer trotz englischer
// Stimme eine deutsche Ansage.
export const DEFAULT_LANGUAGE = 'de';

export const LANGUAGE_OPTIONS = {
  de: {
    label: 'Deutsch',
    transcriberLanguage: 'de',
    voiceId: 'de-AT-IngridNeural',
    languageInstruction: 'Du sprichst Deutsch.',
    roleLabels: {
      orders: 'KI-Reservierungsassistent',
      appointments: 'KI-Terminassistent',
      default: 'digitale Mitarbeiter',
    },
    firstMessage: (assistantName, roleLabel) => `Grüß Gott, hier ist ${assistantName}, der ${roleLabel} von {{business_name}}. Zur Qualitätssicherung wird dieses Gespräch aufgezeichnet und automatisiert verarbeitet. Wie kann ich Ihnen helfen?`,
    ownFirstMessage: 'Grüß Gott, hier ist Kiwo, der KI-Agent der Plattform KI-Works. Sie sprechen jetzt direkt mit mir — testen Sie live, wie ich am Telefon klinge und arbeite. Wie kann ich Ihnen helfen?',
    idleMessage: 'Sind Sie noch da? Kann ich Ihnen noch weiterhelfen?',
    timeElapsedMessages: {
      orders: 'Kurzer Hinweis: In etwa 5 Minuten muss ich das Gespräch aus technischen Gründen automatisch beenden. Falls Ihre Reservierung oder Bestellung noch nicht abgeschlossen ist, sagen Sie mir jetzt bitte schnell die restlichen Angaben, damit ich sie noch rechtzeitig speichern kann.',
      appointments: 'Kurzer Hinweis: In etwa 5 Minuten muss ich das Gespräch aus technischen Gründen automatisch beenden. Falls Ihr Termin noch nicht abgeschlossen ist, sagen Sie mir jetzt bitte schnell die restlichen Angaben, damit ich ihn noch rechtzeitig speichern kann.',
      default: 'Kurzer Hinweis: In etwa 5 Minuten muss ich das Gespräch aus technischen Gründen automatisch beenden. Bitte nennen Sie mir jetzt kurz Ihr Anliegen, damit ich es noch rechtzeitig weiterleiten kann.',
    },
    transferSpokenLine: 'Ich verbinde Sie jetzt weiter.',
    transferMessage: 'Ich verbinde Sie jetzt.',
    // Nur für die Demo-Sprachauswahl (Squad, siehe syncDemoSquad in
    // vapiAdmin.js) — Entscheidungshilfe für das handoff-Tool des
    // Auswahl-Assistenten, kein Nutzer-facing Text.
    handoffDescription: 'Der Anrufer möchte Deutsch sprechen.',
  },
  en: {
    label: 'English',
    transcriberLanguage: 'en',
    voiceId: 'en-US-AvaNeural',
    languageInstruction: 'You speak English.',
    roleLabels: {
      orders: 'AI reservation assistant',
      appointments: 'AI appointment assistant',
      default: 'digital assistant',
    },
    firstMessage: (assistantName, roleLabel) => `Hello, this is ${assistantName}, the ${roleLabel} for {{business_name}}. For quality assurance, this call is being recorded and processed automatically. How can I help you?`,
    ownFirstMessage: 'Hello, this is Kiwo, the AI agent of the KI-Works platform. You are now speaking directly with me — try live how I sound and work on the phone. How can I help you?',
    idleMessage: 'Are you still there? Is there anything else I can help you with?',
    timeElapsedMessages: {
      orders: "Quick note: in about 5 minutes I have to end this call automatically for technical reasons. If your reservation or order isn't finished yet, please tell me the remaining details now so I can still save them in time.",
      appointments: "Quick note: in about 5 minutes I have to end this call automatically for technical reasons. If your appointment isn't finished yet, please tell me the remaining details now so I can still save them in time.",
      default: 'Quick note: in about 5 minutes I have to end this call automatically for technical reasons. Please tell me your request now so I can still pass it on in time.',
    },
    transferSpokenLine: "I'm transferring you now.",
    transferMessage: "I'm transferring you now.",
    handoffDescription: 'The caller wants to speak English.',
  },
  ro: {
    label: 'Română',
    transcriberLanguage: 'ro',
    voiceId: 'ro-RO-AlinaNeural',
    languageInstruction: 'Vorbești română.',
    roleLabels: {
      orders: 'asistentul AI pentru rezervări',
      appointments: 'asistentul AI pentru programări',
      default: 'angajatul digital',
    },
    firstMessage: (assistantName, roleLabel) => `Bună ziua, sunt ${assistantName}, ${roleLabel} de la {{business_name}}. Pentru asigurarea calității, acest apel este înregistrat și procesat automat. Cu ce vă pot ajuta?`,
    ownFirstMessage: 'Bună ziua, sunt Kiwo, agentul AI al platformei KI-Works. Vorbiți acum direct cu mine — testați în direct cum sun și cum lucrez la telefon. Cu ce vă pot ajuta?',
    idleMessage: 'Mai sunteți pe fir? Vă mai pot ajuta cu ceva?',
    timeElapsedMessages: {
      orders: 'O mențiune scurtă: în aproximativ 5 minute trebuie să închei apelul automat din motive tehnice. Dacă rezervarea sau comanda dumneavoastră nu este încă finalizată, vă rog să-mi spuneți acum rapid detaliile rămase, ca să le pot salva la timp.',
      appointments: 'O mențiune scurtă: în aproximativ 5 minute trebuie să închei apelul automat din motive tehnice. Dacă programarea dumneavoastră nu este încă finalizată, vă rog să-mi spuneți acum rapid detaliile rămase, ca să le pot salva la timp.',
      default: 'O mențiune scurtă: în aproximativ 5 minute trebuie să închei apelul automat din motive tehnice. Vă rog să-mi spuneți pe scurt solicitarea dumneavoastră, ca să o pot transmite mai departe la timp.',
    },
    transferSpokenLine: 'Vă fac legătura acum.',
    transferMessage: 'Vă fac legătura acum.',
    handoffDescription: 'Apelantul dorește să vorbească română.',
  },
};

export function resolveLanguage(language) {
  return LANGUAGE_OPTIONS[language] ? language : DEFAULT_LANGUAGE;
}
