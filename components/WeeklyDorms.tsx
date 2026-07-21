"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ALL_DORMS } from "@/lib/dorms";
import { LIGHTS, type LightKey } from "@/lib/lights";

const PALETTE: Record<string, { bg: string; fg: string }> = {
  KYK: { bg: "#e8f3f0", fg: "#0d7a6f" },
  Özel: { bg: "#fdf3e4", fg: "#b07d1e" },
};

const sectors = ["Tümü", "KYK", "Özel"];

const featured = ALL_DORMS
  .filter((d) => d.reviewCount > 0)
  .sort((a, b) => b.reviewCount - a.reviewCount)
  .slice(0, 6);

export function WeeklyDorms() {
  const [active, setActive] = useState("Tümü");

  const list = useMemo(
    () =>
      active === "Tümü"
        ? featured
        : featured.filter((d) => d.type.startsWith(active)),
    [active],
  );

  if (featured.length === 0) {
    return (
      <section id="yurtlar" className="px-16 pb-[72px] max-md:px-5">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-[26px] font-bold text-ink">Bu hafta konuşulanlar 🔥</h2>
            <Link href="/yurtlar" className="text-sm font-semibold text-primary">Tümünü gör →</Link>
          </div>
          <div className="rounded-[22px] border-2 border-dashed border-line bg-surface p-14 text-center">
            <div className="mb-3 text-[40px]">🤫</div>
            <div className="mb-2 text-[19px] font-semibold text-ink">Henüz değerlendirme yok</div>
            <p className="mb-5 text-[15px] text-muted">
              İlk değerlendirmeyi yapan sen ol — yurdun hakkında konuşulsun.
            </p>
            <Link
              href="/anket"
              className="gradient-pink inline-block rounded-xl px-6 py-3 text-[14px] font-bold text-white shadow-glow transition-transform hover:scale-105"
            >
              Değerlendir
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="yurtlar" className="px-16 pb-[72px] max-md:px-5">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-[26px] font-bold text-ink">Bu hafta konuşulanlar 🔥</h2>
          <Link href="/yurtlar" className="text-sm font-semibold text-primary">Tümünü gör →</Link>
        </div>

        <div className="my-6 flex flex-wrap gap-2">
          {sectors.map((s) => {
            const on = s === active;
            return (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={`rounded-pill px-4 py-2 text-[13px] font-semibold transition-all ${on ? "gradient-pink text-white shadow-glow" : "border border-line bg-card text-body hover:border-primary/30"}`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {list.map((d) => {
            const pal = PALETTE[d.type] || PALETTE.Özel;
            const l = LIGHTS[d.light as LightKey];
            return (
              <Link
                key={d.id}
                href={`/yurt/${d.id}`}
                className="group rounded-card border border-line bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3.5">
                  <div
                    className="grid h-[44px] w-[44px] flex-shrink-0 place-items-center rounded-xl text-[18px] font-bold"
                    style={{ background: pal.bg, color: pal.fg }}
                  >
                    {d.name.charAt(0).toLocaleUpperCase("tr")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-[15px] font-bold uppercase text-ink">{d.name}</div>
                    <div className="text-[12.5px] text-faint">{d.type} · {d.city} · {d.reviewCount} yorum</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[12px] font-semibold" style={{ background: `${l.dot}18`, color: l.badgeFg }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: l.dot }} />
                    {l.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
