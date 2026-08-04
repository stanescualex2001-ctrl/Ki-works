import { Mail, Phone } from "lucide-react";
import { PageShell } from "../components/PageShell.jsx";

export default function Kontakt() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 md:py-24">
        <a href="/" className="inline-flex items-center text-sm text-white/50 hover:text-white/80 transition">
          ← Zurück zur Startseite
        </a>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold">Kontakt</h1>
        <p className="mt-4 max-w-xl text-sm md:text-base text-white/65 leading-relaxed">
          Fragen zu Kiwo oder der KI-Works Plattform? Wir melden uns gerne bei Ihnen.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="mailto:info@ki-works.eu"
            className="glass hover-glow hover-glow-cyan flex flex-1 items-center gap-3.5 rounded-2xl p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs text-white/45">E-Mail</div>
              <div className="mt-0.5 text-sm font-medium text-white/90">info@ki-works.eu</div>
            </div>
          </a>
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
      </div>
    </PageShell>
  );
}
