"use client";

import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fires once when the element scrolls into view. */
function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/* Network field — drifting data nodes joined by faint links.          */
/* Represents connected systems; used as the hero background.          */
/* ------------------------------------------------------------------ */
export function NetworkField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Node = { x: number; y: number; vx: number; vy: number; accent: boolean };
    let nodes: Node[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    const LINK = 150;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setup = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.round((w * h) / 16000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        accent: Math.random() < 0.15,
      }));
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.14;
            ctx.strokeStyle = a.accent || b.accent ? `rgba(1,99,154,${alpha * 1.6})` : `rgba(25,29,64,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = n.accent ? "rgba(1,99,154,0.9)" : "rgba(25,29,64,0.25)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.accent ? 2.4 : 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      draw();
    };

    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    if (!prefersReducedMotion()) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none h-full w-full ${className}`} />;
}

/* ------------------------------------------------------------------ */
/* Rotating headline word — gradient text with a drawing underline.    */
/* ------------------------------------------------------------------ */
export function RotatingWord({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-grid pb-2">
      {/* All words share one grid cell so the line keeps a stable size (no layout shift). */}
      {words.map((w, n) => (
        <span
          key={w}
          aria-hidden={n !== i}
          className={`text-gradient col-start-1 row-start-1 whitespace-nowrap transition-all duration-500 ease-out ${
            n === i ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
          }`}
        >
          {w}
        </span>
      ))}
      <span
        key={i}
        aria-hidden
        className="absolute bottom-0 left-0 h-1.5 w-24 origin-left animate-underline rounded-full bg-brand-500 sm:w-32"
      />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Count-up number that animates when scrolled into view.              */
/* e.g. value="300+" → counts 0 → 300 and keeps the "+" suffix.         */
/* ------------------------------------------------------------------ */
export function CountUp({ value, duration = 1600, className = "" }: { value: string; duration?: number; className?: string }) {
  const match = value.match(/^(\D*)([\d,.]+)(.*)$/);
  const target = match ? parseFloat(match[2].replace(/,/g, "")) : 0;
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  // Start at the real value so server-rendered HTML (and no-JS visitors) see correct numbers.
  const [n, setN] = useState(target);

  useEffect(() => {
    if (!inView || !match) return;
    if (prefersReducedMotion()) return setN(target);
    setN(0);
    let raf = 0;
    const start = performance.now();
    const run = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target, duration]);

  if (!match) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {match[1]}
      {n.toLocaleString()}
      {match[3]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal children with a fade/slide when they scroll into view.       */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}
