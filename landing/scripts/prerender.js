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

const { render } = await import(`file://${ssrEntry}`);
const appHtml = render();

const indexPath = path.join(distDir, "index.html");
const html = readFileSync(indexPath, "utf-8");
const withContent = html.replace(
  '<div id="root"></div>',
  `<div id="root">${appHtml}</div>`,
);
writeFileSync(indexPath, withContent);

rmSync(path.join(dir, "..", "dist-server"), { recursive: true, force: true });

console.log("Prerender ok:", appHtml.length, "Zeichen in dist/index.html eingefügt.");
