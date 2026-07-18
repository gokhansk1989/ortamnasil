import Link from "next/link";
import type { CompanyCardData } from "@/lib/data";
import { LightBadge } from "./LightBadge";
import { MiniScore } from "./MiniScore";

export function CompanyCard({ c }: { c: CompanyCardData }) {
  return (
    <Link
      href={`/sirket/${c.id}`}
      className="group block rounded-card border border-line bg-card p-6 text-inherit transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-hover"
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="grid h-11 w-11 place-items-center rounded-xl text-lg font-bold transition-transform group-hover:scale-110 group-hover:rotate-3"
          style={{ background: c.logoBg, color: c.logoFg }}
        >
          {c.initial}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-ink">{c.name}</div>
          <div className="text-[13px] text-faint">
            {c.sector} · {c.reviewCount} yorum
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <LightBadge light={c.light} />
        <MiniScore light={c.light} />
      </div>
      <p className="mt-3.5 text-sm leading-relaxed text-muted">{c.quote}</p>
      <div className="mt-3.5 flex items-center gap-2 border-t border-dashed border-line pt-3.5 text-[12.5px] text-faint">
        <span className="font-mono">{c.author}</span>
        <span>·</span>
        <span>{c.when}</span>
      </div>
    </Link>
  );
}
