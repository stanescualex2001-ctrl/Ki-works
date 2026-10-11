import { PageShell } from "../components/PageShell.jsx";
import { useI18n } from "../i18n/index.jsx";

export default function Impressum() {
  const { t } = useI18n();
  const i = t("impressum");
  const angaben = [
    { label: i.labels.operator, value: i.values.operator },
    { label: i.labels.address, value: i.values.address },
    {
      label: i.labels.email,
      value: (
        <a
          href="mailto:info@ki-works.eu"
          target="_blank"
          rel="noreferrer"
          className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200 transition"
        >
          info@ki-works.eu
        </a>
      ),
    },
    { label: i.labels.phone, value: i.values.phone },
    { label: i.labels.businessPurpose, value: i.values.businessPurpose },
    { label: i.labels.registration, value: i.values.registration },
    { label: i.labels.authority, value: i.values.authority },
  ];

  return (
    <PageShell page="impressum">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold">{i.title}</h1>

        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-800/90 dark:text-amber-100/90">
          <strong className="text-amber-600 dark:text-amber-300">{i.internalNoticeLabel}</strong> {i.internalNotice}
        </div>

        <h2 className="mt-10 text-lg font-semibold">{i.sectionAngabenTitle}</h2>
        <dl className="mt-4 space-y-4">
          {angaben.map((a) => (
            <div key={a.label}>
              <dt className="text-xs text-foreground/45">{a.label}</dt>
              <dd className="mt-0.5 text-sm text-foreground/85">{a.value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-10 text-lg font-semibold">{i.disputeTitle}</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">
          {i.disputeDesc}{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200 transition"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          .
        </p>

        <h2 className="mt-10 text-lg font-semibold">{i.liabilityTitle}</h2>
        <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{i.liabilityDesc}</p>
      </div>
    </PageShell>
  );
}
