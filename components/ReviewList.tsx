"use client";

import { useState } from "react";
import { LIGHTS } from "@/lib/lights";
import type { ProfileReview } from "@/lib/companies";

// İtiraf kartları + "faydalı" toggle. Prototipteki voted:{} state'inin karşılığı.
export function ReviewList({ reviews }: { reviews: ProfileReview[] }) {
  const [voted, setVoted] = useState<Record<number, boolean>>({});

  return (
    <div className="grid gap-3.5">
      {reviews.map((r, i) => {
        const l = LIGHTS[r.light];
        const up = r.up + (voted[i] ? 1 : 0);
        return (
          <div key={i} className="rounded-card border border-line bg-card p-6">
            <div className="mb-3 flex items-center gap-2.5">
              <div
                className="grid h-[34px] w-[34px] place-items-center rounded-full text-base"
                style={{ background: r.avBg }}
              >
                {r.emoji}
              </div>
              <div className="flex-1">
                <span className="font-mono text-[13.5px] font-medium text-ink">
                  {r.author}
                </span>
                <span className="text-[12.5px] text-faint">
                  {" "}
                  · {r.role} · {r.when}
                </span>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-pill px-3 py-[5px] text-[12.5px] font-semibold"
                style={{ background: l.badgeBg, color: l.badgeFg }}
              >
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: l.dot }} />
                {l.label}
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-body">{r.text}</p>
            <div className="mt-3.5 flex gap-4 text-[13px] text-faint">
              <button
                onClick={() => setVoted((v) => ({ ...v, [i]: !v[i] }))}
                aria-pressed={!!voted[i]}
                className="hover:text-primary"
                style={{ color: voted[i] ? "#0d7a6f" : undefined }}
              >
                👍 Faydalı ({up})
              </button>
              <button className="hover:text-primary">Aynen yaşadım ({r.same})</button>
              <button className="hover:text-light-red">Bildir</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
