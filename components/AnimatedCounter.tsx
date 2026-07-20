"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  label: string;
  highlight?: boolean;
}

function parseNumber(s: string): number | null {
  const cleaned = s.replace(/\./g, "").replace(/,/g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
}

export function AnimatedCounter({ value, label, highlight }: Props) {
  const target = parseNumber(value);
  const [display, setDisplay] = useState(target !== null ? "0" : value);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (target === null || animated.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 2000;
          const start = performance.now();
          function tick(now: number) {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(ease * target!).toLocaleString("tr"));
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref}>
      <div
        className={`text-[34px] font-bold tabular-nums ${
          highlight ? "text-primary" : "text-ink"
        }`}
      >
        {display}
      </div>
      <div className="text-sm text-faint">{label}</div>
    </div>
  );
}
