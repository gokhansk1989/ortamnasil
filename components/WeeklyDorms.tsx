"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { dorms as featuredDorms, sectors } from "@/lib/data";
import { DormCard } from "./DormCard";

export function WeeklyDorms() {
  const [active, setActive] = useState("Tümü");

  const list = useMemo(
    () =>
      active === "Tümü"
        ? featuredDorms
        : featuredDorms.filter((c) => c.sector.startsWith(active)),
    [active],
  );

  return (
    <section id="yurtlar" className="px-16 pb-[72px] max-md:px-5">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-[26px] font-bold text-ink">
            Bu hafta konuşulanlar 🔥
          </h2>
          <Link href="/yurtlar" className="text-sm font-semibold text-primary">
            Tümünü gör →
          </Link>
        </div>

        <div className="my-6 flex flex-wrap gap-2">
          {sectors.map((s) => {
            const on = s === active;
            return (
              <button
                key={s}
                onClick={() => setActive(s)}
                aria-pressed={on}
                className={`rounded-pill px-4 py-2 text-[13px] font-semibold transition-all ${
                  on
                    ? "gradient-pink text-white shadow-glow"
                    : "border border-line bg-card text-body hover:border-primary/30"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {list.map((c) => (
            <DormCard key={c.id} c={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
