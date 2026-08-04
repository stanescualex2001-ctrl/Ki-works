// Baut den beim Client-Build leeren <div id="root"> zu echtem, im rohen HTML
// lesbarem Text um — nötig, damit KI-Crawler (die kein JavaScript ausführen)
// denselben Inhalt sehen wie ein Mensch im Browser. Läuft einmalig nach
// `vite build` + `vite build --ssr`, siehe package.json "build"-Skript.
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(dir, "..", "dist");
const ssrEntry = path.join(dir, "..", "dist-server", "entry-server.js");

const { renderHome, renderImpressum, renderDatenschutz } = await import(`file://${ssrEntry}`);

const pages = [
  { file: "index.html", render: renderHome },
  { file: "impressum.html", render: renderImpressum },
  { file: "datenschutz.html", render: renderDatenschutz },
];

for (const { file, render } of pages) {
  const appHtml = render();
  const filePath = path.join(distDir, file);
  const html = readFileSync(filePath, "utf-8");
  const withContent = html.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );
  writeFileSync(filePath, withContent);
  console.log(`Prerender ok: ${file} — ${appHtml.length} Zeichen eingefügt.`);
}

rmSync(path.join(dir, "..", "dist-server"), { recursive: true, force: true });
