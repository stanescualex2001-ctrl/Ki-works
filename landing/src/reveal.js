/* Scroll-Animationen für alle Seiten (dezent). Wird von jedem main-*.jsx importiert.
   Prinzipien:
   - Ruhezustand sichtbar: Nur Elemente unterhalb der Auslöse-Linie werden nach dem Laden
     ausgeblendet (Klasse .rv). Prerender-HTML und Crawler sehen immer den vollen Inhalt.
   - Eigene Scroll-Messung statt IntersectionObserver (rootMargin wird in iframes ignoriert).
   - Respektiert prefers-reduced-motion (JS tut nichts, CSS zeigt alles).
   - Greift per DOM-Muster (Überschriften, Raster, Listen, Karten, Buttons), nicht per
     Markup im JSX: neue Blöcke werden automatisch mit animiert. Siehe docs/CHANGELOG.md. */

const LINE = 0.65; // Element startet, sobald seine Oberkante 65 % von oben erreicht
const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const seen = new WeakSet();
const pending = new Set();
const tracked = [];
let counters = [];
let blobs = [];

const NUM = /^(\d[\d.,]*)(\s?(?:€|%|\+|Min\.?|min))?$/;

function fmt(n, like) {
  return /\./.test(like) && n >= 1000 ? n.toLocaleString("de-AT") : String(n);
}

function countUp(el) {
  const node = [...el.childNodes].find((n) => n.nodeType === 3 && NUM.test(n.nodeValue.trim()));
  if (!node || node.__done) return;
  node.__done = true;
  const m = node.nodeValue.trim().match(NUM);
  const to = parseInt(m[1].replace(/[.,]/g, ""), 10);
  const suffix = m[2] || "";
  const lead = node.nodeValue.match(/^\s*/)[0];
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / 900);
    const e = 1 - Math.pow(1 - p, 3);
    node.nodeValue = lead + fmt(Math.round(to * e), m[1]) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  node.nodeValue = lead + "0" + suffix;
  requestAnimationFrame(step);
}

function hide(el, i, kind) {
  if (seen.has(el) || el.style.opacity !== "" || el.style.transform !== "") return;
  seen.add(el);
  if (el.getBoundingClientRect().top < innerHeight * LINE) return;
  el.style.setProperty("--rv-d", Math.min(i, 6) * 90 + "ms");
  el.setAttribute("data-rv", kind || "up");
  el.classList.add("rv");
  tracked.push(el);
  pending.add(el);
}

function scan() {
  if (reduce) return;
  const root = document.getElementById("root");
  if (!root) return;
  root.querySelectorAll("section, main > div").forEach((sec) => {
    sec.querySelectorAll("h1, h2").forEach((h) => {
      [h.previousElementSibling, h, h.nextElementSibling]
        .filter(Boolean)
        .forEach((g, i) => hide(g, i, g === h ? "up" : i === 0 ? "left" : "blur"));
    });
    sec.querySelectorAll(".grid, .flex-wrap, .space-y-3, .space-y-4, .space-y-5, .space-y-6, ul, ol").forEach((g) => {
      const kids = [...g.children];
      if (kids.length < 2 || kids.length > 14) return;
      const list = g.matches("ul, ol, .space-y-3, .space-y-4, .space-y-5, .space-y-6");
      kids.forEach((k, i) => {
        const kind = list ? "left" : kids.length === 2 ? (i === 0 ? "left" : "right") : ["left", "zoom", "right"][i % 3];
        hide(k, list ? i : i % 3, kind);
      });
    });
    sec.querySelectorAll("img, video, table, form").forEach((m) => hide(m, 0, "zoom"));
  });
  /* Block-Karten außerhalb von Rastern (FAQ, Banner, Hinweisboxen, Konditionen) */
  const skipArea = (el) => el.closest("header, nav, [class*='fixed']");
  const owned = (el) => {
    for (let a = el.parentElement; a && a !== root; a = a.parentElement) if (seen.has(a)) return true;
    return false;
  };
  root.querySelectorAll("[class*='rounded-2xl'], [class*='rounded-3xl'], .glass").forEach((el) => {
    if (skipArea(el) || seen.has(el) || owned(el) || el.getBoundingClientRect().height < 60) return;
    hide(el, 0, "up");
  });
  /* Buttons und CTA-Links: Pop-Effekt, kommen kurz nach ihrer Karte */
  root.querySelectorAll("a[class*='rounded-full'], button[class*='rounded-full']").forEach((el) => {
    if (!skipArea(el)) hide(el, 3, "pop");
  });
  root.querySelectorAll("footer > *").forEach((f, i) => hide(f, i, "up"));
  root.querySelectorAll("section *").forEach((el) => {
    if (el.children.length === 0 && el.textContent.length <= 9 && NUM.test(el.textContent.trim())) {
      const v = parseInt(el.textContent.replace(/[.,]/g, ""), 10);
      if (v >= 1990 && v <= 2100) return; // Jahreszahlen nicht hochzählen
      if (!el.__cnt) {
        el.__cnt = true;
        counters.push(el);
        pending.add(el);
      }
    }
  });
  blobs = [...root.querySelectorAll(".blur-3xl")].filter((b) => b.className.includes("absolute"));
  check();
}

function reveal(el) {
  el.classList.add("rv-in");
  const done = () => {
    el.classList.remove("rv", "rv-in");
    el.removeAttribute("data-rv");
    el.style.removeProperty("--rv-d");
    el.removeEventListener("transitionend", done);
  };
  el.addEventListener("transitionend", done);
  setTimeout(done, 2200);
}

function check() {
  const line = innerHeight * LINE;
  pending.forEach((el) => {
    if (el.getBoundingClientRect().top >= line) return;
    pending.delete(el);
    if (el.classList.contains("rv")) reveal(el);
    if (counters.includes(el)) countUp(el);
  });
}

function frame() {
  const bar = document.getElementById("rv-bar");
  const h = document.documentElement.scrollHeight - innerHeight;
  if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")";
  if (reduce) return;
  check();
  /* Am Seitenende alles noch Wartende abspielen (Footer liegt sonst unter der Linie). */
  if (h > 0 && scrollY >= h - 6) {
    tracked.forEach((el) => {
      if (el.classList.contains("rv") && !el.classList.contains("rv-in")) {
        pending.delete(el);
        reveal(el);
      }
    });
    counters.forEach(countUp);
  }
  blobs.forEach((b) => {
    const sec = (b.closest("section") || b.parentElement).getBoundingClientRect();
    const off = (sec.top + sec.height / 2 - innerHeight / 2) * 0.06;
    b.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
  });
}

function start() {
  const bar = document.createElement("div");
  bar.id = "rv-bar";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  let t = null;
  const rescan = () => {
    clearTimeout(t);
    t = setTimeout(scan, 120);
  };
  new MutationObserver(rescan).observe(document.getElementById("root"), { childList: true, subtree: true });
  setTimeout(scan, 60);
  addEventListener("scroll", () => requestAnimationFrame(frame), { passive: true });
  addEventListener("resize", () => requestAnimationFrame(frame));
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
