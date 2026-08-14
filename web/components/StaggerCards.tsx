"use client";

import { useEffect, useRef, useState } from "react";

interface Step {
  emoji: string;
  tag: string;
  title: string;
  body: string;
}

export function StaggerCards({ steps }: { steps: Step[] }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
      {steps.map((s, i) => (
        <div
          key={s.tag}
          className="rounded-card border border-line bg-card p-7 shadow-lg transition-transform hover:scale-[1.02]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.15}s`,
          }}
        >
          <div className="mb-3 text-3xl">{s.emoji}</div>
          <div className="mb-1 font-mono text-[12px] font-medium text-primary">
            {s.tag}
          </div>
          <div className="mb-2 text-lg font-semibold text-ink">{s.title}</div>
          <p className="text-[14.5px] leading-relaxed text-muted">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
