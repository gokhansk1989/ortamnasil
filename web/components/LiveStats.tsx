"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatedCounter } from "./AnimatedCounter";

// Platform yeniyken çıplak "0 değerlendirme" sayacı siteyi ölü gösteriyor.
// Hedefe kalan yol daha dürüst ve katkıya davet ediyor; eşik aşılınca
// bileşen kendiliğinden normal sayaçlara dönüyor.
const GOAL = 300;

export function LiveStats({ dormCount }: { dormCount: string }) {
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [redCount, setRedCount] = useState(0);

  useEffect(() => {
    fetch("/api/istatistik")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setReviewCount(data.reviewCount);
        setRedCount(data.redCount);
      })
      .catch(() => {});
  }, []);

  if (reviewCount !== null && reviewCount < GOAL) {
    const pct = Math.max(2, Math.round((reviewCount / GOAL) * 100));
    return (
      <section className="px-16 pb-16 max-md:px-5">
        <div className="mx-auto max-w-[620px] rounded-[22px] border border-line bg-card px-8 py-7 max-md:px-6">
          <div className="mb-2 text-center font-mono text-[11.5px] tracking-wider text-faint">
            İLK {GOAL} DEĞERLENDİRME HEDEFİ
          </div>
          <p className="mb-5 text-center text-[15px] leading-relaxed text-muted">
            <strong className="text-ink">{dormCount}</strong> yurt listeye girdi, sıra
            deneyimlerde. Yeterli değerlendirme birikince ışıklar yanmaya başlayacak.
          </p>

          <div className="mb-2.5 h-2.5 overflow-hidden rounded-pill bg-surface">
            <div
              className="h-full rounded-pill bg-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mb-6 flex justify-between font-mono text-[12.5px] text-faint">
            <span>
              <strong className="text-primary">{reviewCount.toLocaleString("tr")}</strong>{" "}
              değerlendirme
            </span>
            <span>hedef {GOAL}</span>
          </div>

          <div className="text-center">
            <Link
              href="/anket"
              className="inline-flex rounded-xl bg-ink px-6 py-3 text-[14.5px] font-bold text-white transition-transform hover:scale-105"
            >
              Sayacı bir artır →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const stats = [
    { value: dormCount, label: "yurt dosyalandı" },
    { value: (reviewCount ?? 0).toLocaleString("tr"), label: "anonim değerlendirme" },
    { value: redCount.toLocaleString("tr"), label: "\"uzak dur\" verildi" },
  ];

  return (
    <section className="flex justify-center gap-16 px-16 pb-16 text-center max-md:flex-wrap max-md:gap-8 max-md:px-5">
      {stats.map((s, i) => (
        <div key={i} className="flex items-stretch gap-16 max-md:gap-8">
          {i > 0 && <div className="w-px bg-line max-md:hidden" />}
          <AnimatedCounter value={s.value} label={s.label} />
        </div>
      ))}
    </section>
  );
}
