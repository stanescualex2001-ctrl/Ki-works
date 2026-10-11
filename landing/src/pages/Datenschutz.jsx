import { PageShell } from "../components/PageShell.jsx";
import { useI18n } from "../i18n/index.jsx";

function A({ href, children, external = false }) {
  const opensNewTab = external || href.startsWith("mailto:");
  return (
    <a
      href={href}
      {...(opensNewTab ? { target: "_blank", rel: "noreferrer" } : {})}
      className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200 transition"
    >
      {children}
    </a>
  );
}

export default function Datenschutz() {
  const { t } = useI18n();
  const d = t("datenschutz");

  return (
    <PageShell page="datenschutz">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold">{d.title}</h1>

        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-800/90 dark:text-amber-100/90">
          <strong className="text-amber-600 dark:text-amber-300">{d.internalNoticeLabel}</strong> {d.internalNotice}
        </div>

        <h2 className="mt-10 text-lg font-semibold">{d.s1.title}</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">
          {d.s1.textBefore} <A href="mailto:info@ki-works.eu">info@ki-works.eu</A> {d.s1.textAfter}
        </p>

        <h2 className="mt-10 text-lg font-semibold">{d.s2.title}</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{d.s2.intro}</p>
        <ul className="mt-3 list-disc space-y-2.5 pl-5 text-sm text-foreground/65 leading-relaxed">
          <li>
            <strong className="text-foreground/85">{d.s2.visitorsBold1}</strong>{d.s2.visitorsMid}{" "}
            <strong className="text-foreground/85">{d.s2.visitorsBold2}</strong>{d.s2.visitorsRest}
          </li>
          <li>
            <strong className="text-foreground/85">{d.s2.guestsBold1}</strong>{d.s2.guestsMid}{" "}
            <strong className="text-foreground/85">{d.s2.guestsBold2}</strong>{d.s2.guestsRest}
          </li>
        </ul>

        <h2 className="mt-10 text-lg font-semibold">{d.s3.title}</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-foreground/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-foreground/10 text-xs text-foreground/45">
                <th className="px-4 py-3 font-medium">{d.s3.colCategory}</th>
                <th className="px-4 py-3 font-medium">{d.s3.colExamples}</th>
                <th className="px-4 py-3 font-medium">{d.s3.colPurpose}</th>
              </tr>
            </thead>
            <tbody>
              {d.s3.rows.map((row) => (
                <tr key={row.category} className="border-b border-foreground/5 last:border-0 align-top">
                  <td className="px-4 py-3 text-foreground/80">{row.category}</td>
                  <td className="px-4 py-3 text-foreground/60">{row.examples}</td>
                  <td className="px-4 py-3 text-foreground/60">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-lg font-semibold">{d.s4.title}</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{d.s4.text}</p>

        <h2 className="mt-10 text-lg font-semibold">{d.s5.title}</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{d.s5.intro}</p>
        <ul className="mt-3 space-y-2.5 pl-5 text-sm text-foreground/65 leading-relaxed list-disc">
          {d.s5.providers.map((p) => (
            <li key={p.name}>
              <strong className="text-foreground/85">{p.name}</strong>
              {p.location && `, ${p.location}`} — {p.purpose}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">
          {d.s5.transferBefore}{" "}
          <A href="https://www.twilio.com/en-us/legal/data-protection-addendum" external>
            {d.s5.transferLinkText}
          </A>{" "}
          {d.s5.transferAfter}
        </p>

        <h2 className="mt-10 text-lg font-semibold">{d.s6.title}</h2>
        <ul className="mt-3 space-y-2.5 pl-5 text-sm text-foreground/65 leading-relaxed list-disc">
          {d.s6.items.map((item) => (
            <li key={item.bold}>
              <strong className="text-foreground/85">{item.bold}</strong> {item.rest}
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-lg font-semibold">{d.s7.title}</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">
          {d.s7.textBefore} <A href="mailto:info@ki-works.eu">info@ki-works.eu</A> {d.s7.textMid}{" "}
          <A href="https://www.dsb.gv.at" external>dsb.gv.at</A> {d.s7.textAfter}
        </p>

        <h2 className="mt-10 text-lg font-semibold">{d.s8.title}</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{d.s8.text}</p>

        <h2 className="mt-10 text-lg font-semibold">{d.s9.title}</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{d.s9.text}</p>
      </div>
    </PageShell>
  );
}
