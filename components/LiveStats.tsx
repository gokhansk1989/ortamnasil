"use client";

import { useEffect, useState } from "react";
import { AnimatedCounter } from "./AnimatedCounter";

interface StatData {
  value: string;
  label: string;
  highlight?: boolean;
}

const FALLBACK: StatData[] = [
  { value: "2.471", label: "yurt dosyalandı" },
  { value: "0", label: "anonim itiraf" },
  { value: "0", label: "\"uzak dur\" verildi" },
  { value: "0", label: "gerçek isim sızdırıldı", highlight: true },
];

export function LiveStats({ dormCount }: { dormCount: string }) {
  const [stats, setStats] = useState<StatData[]>([
    { value: dormCount, label: "yurt dosyalandı" },
    ...FALLBACK.slice(1),
  ]);

  useEffect(() => {
    fetch("/api/istatistik")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setStats([
          { value: dormCount, label: "yurt dosyalandı" },
          { value: data.reviewCount.toLocaleString("tr"), label: "anonim itiraf" },
          { value: data.redCount.toLocaleString("tr"), label: "\"uzak dur\" verildi" },
          { value: "0", label: "gerçek isim sızdırıldı", highlight: true },
        ]);
      })
      .catch(() => {});
  }, [dormCount]);

  return (
    <section className="flex justify-center gap-16 px-16 pb-16 text-center max-md:flex-wrap max-md:gap-8 max-md:px-5">
      {stats.map((s, i) => (
        <div key={i} className="flex items-stretch gap-16 max-md:gap-8">
          {i > 0 && <div className="w-px bg-line max-md:hidden" />}
          <AnimatedCounter value={s.value} label={s.label} highlight={s.highlight} />
        </div>
      ))}
    </section>
  );
}
