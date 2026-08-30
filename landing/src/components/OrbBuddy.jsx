import { useEffect, useId, useRef } from "react";

// Werte aus dem Mausverfolgungs-Test-Artefakt (25.08.2026 mit Nutzer finalisiert):
// Glanz-/Blickreichweite 75%, Glätte/Trägheit 0.40, Parallax-Versatz 35px,
// Kugel-Glanz bewegt sich NICHT mit (nur Augen/Pupillen/Mund + leichter Parallax).
const TRACK_INTENSITY = 0.75;
const TRACK_EASE = 0.4;
const TRACK_PARALLAX = 35;
const TRACK_PUPIL_RANGE = 1.0 + TRACK_INTENSITY * 2.2;
const TRACK_EYES_RANGE = 3 + TRACK_INTENSITY * 6;
const TRACK_MOUTH_RANGE = 1.2 + TRACK_INTENSITY * 3.2;
const BASE_PUPIL_L = { cx: 88, cy: 107.5 };
const BASE_PUPIL_R = { cx: 116, cy: 107.5 };

/* ---------- Kiwo character: Orb Buddy ---------- */
// track: aktiviert Mausverfolgung (nur für den großen Hero-/CTA-Orb Buddy
// gedacht, nicht für kleine Instanzen wie Sidebar/Chat-Widget-Avatar).
export function OrbBuddy({ size = 44, track = false }) {
  const uid = useId().replace(/:/g, "");
  const wrapRef = useRef(null);
  const eyesRef = useRef(null);
  const mouthRef = useRef(null);
  const pupilLRef = useRef(null);
  const pupilRRef = useRef(null);

  useEffect(() => {
    if (!track) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    let targetDx = 0;
    let targetDy = 0;
    let curDx = 0;
    let curDy = 0;
    let raf = null;

    const tick = () => {
      curDx += (targetDx - curDx) * TRACK_EASE;
      curDy += (targetDy - curDy) * TRACK_EASE;

      if (wrapRef.current) {
        const tx = curDx * TRACK_PARALLAX;
        const ty = curDy * TRACK_PARALLAX * 0.7;
        wrapRef.current.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      }
      if (pupilLRef.current) {
        pupilLRef.current.setAttribute("cx", (BASE_PUPIL_L.cx + curDx * TRACK_PUPIL_RANGE).toFixed(2));
        pupilLRef.current.setAttribute("cy", (BASE_PUPIL_L.cy + curDy * TRACK_PUPIL_RANGE).toFixed(2));
      }
      if (pupilRRef.current) {
        pupilRRef.current.setAttribute("cx", (BASE_PUPIL_R.cx + curDx * TRACK_PUPIL_RANGE).toFixed(2));
        pupilRRef.current.setAttribute("cy", (BASE_PUPIL_R.cy + curDy * TRACK_PUPIL_RANGE).toFixed(2));
      }
      if (eyesRef.current) {
        eyesRef.current.setAttribute(
          "transform",
          `translate(${(curDx * TRACK_EYES_RANGE).toFixed(2)}, ${(curDy * TRACK_EYES_RANGE).toFixed(2)})`,
        );
      }
      if (mouthRef.current) {
        mouthRef.current.setAttribute(
          "transform",
          `translate(${(curDx * TRACK_MOUTH_RANGE).toFixed(2)}, ${(curDy * TRACK_MOUTH_RANGE).toFixed(2)})`,
        );
      }

      raf = (Math.abs(targetDx - curDx) > 0.0008 || Math.abs(targetDy - curDy) > 0.0008)
        ? requestAnimationFrame(tick)
        : null;
    };

    const updateTarget = (clientX, clientY) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      targetDx = Math.max(-1, Math.min(1, (clientX - halfW) / halfW));
      targetDy = Math.max(-1, Math.min(1, (clientY - halfH) / halfH));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => updateTarget(e.clientX, e.clientY);
    // Touch-Geräte haben kein Hover — die Augen folgen stattdessen dem
    // Finger, solange er den Bildschirm berührt (kein preventDefault,
    // Scrollen bleibt normal möglich).
    const onTouchMove = (e) => {
      const touch = e.touches[0];
      if (touch) updateTarget(touch.clientX, touch.clientY);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouchMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouchMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [track]);

  const orb = (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" className="orb-float">
      <defs>
        <radialGradient id={`ob-glow-${uid}`} cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#22D3EE" stopOpacity="0.55" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ob-body-${uid}`} cx="34%" cy="28%" r="80%">
          <stop offset="0" stopColor="#A5F3FC" />
          <stop offset="0.4" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#7C3AED" />
        </radialGradient>
        <radialGradient id={`ob-shine-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id={`ob-blurA-${uid}`}><feGaussianBlur stdDeviation="10" /></filter>
        <filter id={`ob-blurB-${uid}`}><feGaussianBlur stdDeviation="3.2" /></filter>
        <filter id={`ob-blurC-${uid}`}><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      <ellipse cx="100" cy="172" rx="32" ry="7" fill="#000" opacity="0.28" filter={`url(#ob-blurC-${uid})`} />
      <circle cx="100" cy="112" r="66" fill={`url(#ob-glow-${uid})`} filter={`url(#ob-blurA-${uid})`} />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-6 100 60;6 100 60;-6 100 60"
                           dur="3.5s" repeatCount="indefinite" />
        <line x1="100" y1="60" x2="100" y2="45" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="40" r="9" fill="#67E8F9" opacity="0.45" filter={`url(#ob-blurB-${uid})`} />
        <circle cx="100" cy="40" r="4.4" fill="#ECFEFF" />
      </g>
      <circle cx="100" cy="112" r="46" fill={`url(#ob-body-${uid})`} />
      <ellipse cx="83" cy="92" rx="20" ry="14" fill={`url(#ob-shine-${uid})`} opacity="0.8"
               filter={`url(#ob-blurB-${uid})`} transform="rotate(-18 83 92)" />
      <path d="M124 132 A46 46 0 0 1 96 157" fill="none" stroke="#4C1D95" strokeWidth="10"
            strokeLinecap="round" opacity="0.18" filter={`url(#ob-blurB-${uid})`} />
      <g ref={eyesRef}>
        <g>
          <animate attributeName="opacity" values="1;1;0.1;1;1" keyTimes="0;0.46;0.5;0.54;1"
                   dur="4.2s" repeatCount="indefinite" />
          <circle cx="86" cy="110" r="5.6" fill="#0B1220" />
          <circle cx="114" cy="110" r="5.6" fill="#0B1220" />
          <circle ref={pupilLRef} cx="88" cy="107.5" r="1.6" fill="#fff" />
          <circle ref={pupilRRef} cx="116" cy="107.5" r="1.6" fill="#fff" />
        </g>
      </g>
      <g ref={mouthRef}>
        <path d="M87 126 Q100 136 113 126" fill="none" stroke="#0B1220" strokeWidth="4.2" strokeLinecap="round" />
      </g>
    </svg>
  );

  if (!track) return orb;
  return (
    <span ref={wrapRef} style={{ display: "inline-block", lineHeight: 0 }}>
      {orb}
    </span>
  );
}
