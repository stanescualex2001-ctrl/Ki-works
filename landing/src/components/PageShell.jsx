import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";

/* Gemeinsamer Rahmen (Hintergrund, Header, Footer) für Unterseiten wie
   Impressum/Datenschutz, damit sie im selben Design wie die Startseite
   erscheinen. */
export function PageShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22),transparent_60%)] blur-3xl" />
      <Header />
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
