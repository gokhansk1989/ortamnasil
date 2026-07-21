"use client";

import { useEffect, useState } from "react";
import { LIGHTS } from "@/lib/lights";

interface TickerItem {
  type: string;
  nick: string;
  dormName: string;
  light: string;
}

export function MarqueeTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    fetch("/api/aktivite")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.ticker?.length) setItems(d.ticker); })
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-pill border border-line bg-card px-[18px] py-2.5 text-[13.5px] text-faint">
        <span className="h-2 w-2 rounded-full bg-faint animate-blink" />
        Henüz aktivite yok — ilk değerlendirmeyi sen yap!
      </div>
    );
  }

  const doubled = [...items, ...items, ...items];

  return (
    <div className="group flex overflow-hidden">
      <div
        className="flex shrink-0 gap-3 group-hover:[animation-play-state:paused]"
        style={{ animation: "marquee 24s linear infinite" }}
      >
        {doubled.map((t, i) => {
          const l = LIGHTS[t.light as keyof typeof LIGHTS];
          const action = t.type === "survey"
            ? (t.light === "red" ? "kırmızı ışık yaktı" : t.light === "green" ? "yeşil ışık yaktı" : "değerlendirdi")
            : "itiraf yazdı";
          return (
            <div
              key={i}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-pill border border-line bg-card px-[18px] py-2.5 text-[13.5px] text-muted transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: l?.dot ?? "#5a6a66" }} />
              <span className="font-mono text-ink">{t.nick}</span>
              <span>{t.dormName} — {action}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
