import { useState } from "react";
import { Mail, Phone, Send, Check } from "lucide-react";
import { PageShell } from "../components/PageShell.jsx";

function ContactForm() {
  const [form, setForm] = useState({ name: "", business: "", email: "", phone: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    fetch("/api/public/interest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Senden fehlgeschlagen");
        setStatus("done");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  };

  if (status === "done") {
    return (
      <div className="glass mt-10 flex items-center gap-3.5 rounded-2xl p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
          <Check className="h-5 w-5" />
        </span>
        <div>
          <div className="text-sm font-medium text-white/90">Danke für Ihre Nachricht!</div>
          <div className="mt-0.5 text-sm text-white/60">Wir melden uns so schnell wie möglich bei Ihnen.</div>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/40 focus:bg-white/[0.05]";

  return (
    <form onSubmit={submit} className="glass mt-10 rounded-2xl p-6 md:p-8">
      <h2 className="text-lg font-semibold">Nachricht schreiben</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-white/45 sm:col-span-1">
          Name*
          <input required className={`mt-1.5 ${inputCls}`} value={form.name} onChange={set("name")} />
        </label>
        <label className="text-xs text-white/45 sm:col-span-1">
          Betrieb
          <input className={`mt-1.5 ${inputCls}`} value={form.business} onChange={set("business")} />
        </label>
        <label className="text-xs text-white/45 sm:col-span-1">
          E-Mail*
          <input required type="email" className={`mt-1.5 ${inputCls}`} value={form.email} onChange={set("email")} />
        </label>
        <label className="text-xs text-white/45 sm:col-span-1">
          Telefon
          <input className={`mt-1.5 ${inputCls}`} value={form.phone} onChange={set("phone")} />
        </label>
        <label className="text-xs text-white/45 sm:col-span-2">
          Nachricht*
          <textarea
            required
            rows={4}
            className={`mt-1.5 resize-none ${inputCls}`}
            value={form.message}
            onChange={set("message")}
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <label className="mt-5 flex items-start gap-2.5 text-[11px] text-white/45">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/[0.03] accent-cyan-400"
        />
        Ich habe die{" "}
        <a href="/datenschutz.html" className="text-cyan-300 hover:text-cyan-200 transition">
          Datenschutzerklärung
        </a>{" "}
        gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage zu.*
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending" || !consent}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-[#0A0F1D] glow-cyan hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
        >
          {status === "sending" ? "Wird gesendet…" : "Nachricht senden"} <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}

export default function Kontakt() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold">Kontakt</h1>
        <p className="mt-4 max-w-xl text-sm md:text-base text-white/65 leading-relaxed">
          Fragen zu Kiwo oder der KI-Works Plattform? Schreiben Sie uns eine Nachricht — wir melden uns gerne bei
          Ihnen.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <div className="glass flex flex-1 items-center gap-3.5 rounded-2xl p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs text-white/45">E-Mail</div>
              <div className="mt-0.5 text-sm font-medium text-white/90">info@ki-works.eu</div>
            </div>
          </div>
          <a
            href="tel:+436509915759"
            className="glass hover-glow hover-glow-violet flex flex-1 items-center gap-3.5 rounded-2xl p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/20">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs text-white/45">Telefon</div>
              <div className="mt-0.5 text-sm font-medium text-white/90">+43 650 9915759</div>
            </div>
          </a>
        </div>

        <ContactForm />
      </div>
    </PageShell>
  );
}
