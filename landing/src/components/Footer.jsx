export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-white/40 font-mono sm:px-6">
        <div className="truncate">© {new Date().getFullYear()} KI-Works · agent kiwo v1.0</div>
        <div className="flex items-center gap-4">
          <a href="/dashboard/" className="hover:text-white/70 transition">Kunden-Login</a>
          <a href="/impressum.html" className="hover:text-white/70 transition">Impressum</a>
          <a href="/datenschutz.html" className="hover:text-white/70 transition">Datenschutz</a>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
