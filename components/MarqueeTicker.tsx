"use client";

import { type TickerItem } from "@/lib/data";

export function MarqueeTicker({ items }: { items: TickerItem[] }) {
  const doubled = [...items, ...items, ...items];

  return (
    <div className="group flex overflow-hidden">
      <div
        className="flex shrink-0 gap-3 group-hover:[animation-play-state:paused]"
        style={{ animation: "marquee 24s linear infinite" }}
      >
        {doubled.map((t, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-pill border border-line bg-card px-[18px] py-2.5 text-[13.5px] text-muted transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: t.dot }}
            />
            <span className="font-mono text-ink">{t.who}</span>
            <span>{t.what}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
