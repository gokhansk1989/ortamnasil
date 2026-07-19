"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { directory, directorySectors } from "@/lib/companies";
import { CITIES } from "@/lib/dorms";
import { LIGHTS, LIGHT_ORDER, type LightKey } from "@/lib/lights";

const PAGE_SIZE = 20;

const sortOptions = [
  "Sırala: En çok yorum",
  "En yeşil ışık",
  "En kırmızı ışık",
  "En yeni eklenen",
];

export function SirketlerExplorer({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [sector, setSector] = useState("Tümü");
  const [city, setCity] = useState("Tümü");
  const [light, setLight] = useState<LightKey | null>(null);
  const [page, setPage] = useState(1);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return directory.filter(
      (r) =>
        (!q || r.name.toLocaleLowerCase("tr").includes(q) || r.meta.toLocaleLowerCase("tr").includes(q)) &&
        (sector === "Tümü" || r.sector === sector) &&
        (city === "Tümü" || r.meta.includes(city)) &&
        (!light || r.light === light),
    );
  }, [query, sector, city, light]);

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() { setPage(1); }

  return (
    <div className="mx-auto max-w-[1100px] px-8 pb-20 pt-10 max-md:px-5">
      <h1 className="mb-6 text-[32px] font-bold tracking-[-.5px] text-ink">
        Yurt dosyaları 📂{" "}
        <span className="text-base font-normal text-faint">
          ({results.length.toLocaleString("tr")} sonuç)
        </span>
      </h1>

      {/* ARAMA + ŞEHİR + SIRALA */}
      <div className="mb-[18px] flex gap-3 max-md:flex-col">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border-2 border-line bg-card px-[18px] transition-all focus-within:border-primary/40">
          <span className="text-[17px]" aria-hidden>🔍</span>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); resetPage(); }}
            placeholder="Yurt adı veya şehir yaz..."
            aria-label="Yurt adı ara"
            className="flex-1 border-none bg-transparent py-3.5 text-[15.5px] text-ink outline-none placeholder:text-faint2"
          />
          {query && (
            <button onClick={() => { setQuery(""); resetPage(); }} className="text-faint hover:text-primary">✕</button>
          )}
        </div>
        <select
          value={city}
          onChange={(e) => { setCity(e.target.value); resetPage(); }}
          aria-label="Şehir filtresi"
          className="rounded-2xl border-2 border-line bg-card px-3.5 text-[14.5px] text-ink outline-none max-md:py-3"
        >
          <option value="Tümü">Tüm şehirler</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Sıralama"
          className="rounded-2xl border-2 border-line bg-card px-3.5 text-[14.5px] text-ink outline-none max-md:py-3"
        >
          {sortOptions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* TİP ÇİPLERİ */}
      <div className="mb-3.5 flex flex-wrap gap-2">
        {directorySectors.map((s) => {
          const on = s === sector;
          return (
            <button
              key={s}
              onClick={() => { setSector(s); resetPage(); }}
              aria-pressed={on}
              className={`rounded-pill px-4 py-2 text-[13px] font-semibold transition-all ${
                on ? "gradient-pink text-white shadow-glow" : "border border-line bg-card text-body hover:border-primary/30"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* IŞIK FİLTRESİ */}
      <div className="mb-7 flex flex-wrap items-center gap-2">
        <span className="text-[12.5px] text-faint">Işığa göre:</span>
        {([...LIGHT_ORDER.filter((k) => k !== "gray"), "gray"] as LightKey[]).map((key) => {
          const l = LIGHTS[key];
          const on = light === key;
          return (
            <button
              key={key}
              onClick={() => { setLight(on ? null : key); resetPage(); }}
              aria-pressed={on}
              className="inline-flex items-center gap-[7px] rounded-pill border-2 px-3.5 py-[7px] text-[12.5px] font-semibold transition-all"
              style={{
                background: on ? l.badgeBg : "#fff",
                borderColor: on ? l.dot : "#F5F0EB",
                color: on ? l.badgeFg : "#78716C",
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: l.dot }} />
              {l.label}
            </button>
          );
        })}
      </div>

      {/* SONUÇLAR */}
      {paged.length > 0 ? (
        <>
          <div className="grid gap-3">
            {paged.map((c) => {
              const l = LIGHTS[c.light];
              return (
                <Link
                  key={c.id}
                  href={`/sirket/${c.id}`}
                  className="grid grid-cols-[56px_1.4fr_1fr_auto] items-center gap-5 rounded-card border border-line bg-card px-6 py-[18px] text-inherit transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-hover max-md:grid-cols-[52px_1fr] max-md:gap-3"
                >
                  <div
                    className="grid h-[52px] w-[52px] place-items-center rounded-xl text-[21px] font-bold"
                    style={{ background: c.logoBg, color: c.logoFg }}
                  >
                    {c.initial}
                  </div>
                  <div>
                    <div className="text-[16.5px] font-semibold text-ink">{c.name}</div>
                    <div className="mt-[3px] text-[13px] text-faint">{c.meta}</div>
                  </div>
                  <div className="text-[13.5px] italic leading-normal text-muted max-md:hidden">
                    &ldquo;{c.quote}&rdquo;
                  </div>
                  <div className="flex flex-col items-end gap-2 max-md:col-span-2 max-md:flex-row max-md:items-center max-md:justify-between">
                    <span
                      className="inline-flex items-center gap-2 whitespace-nowrap rounded-pill px-3.5 py-1.5 text-[13px] font-semibold"
                      style={{ background: l.badgeBg, color: l.badgeFg }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: l.dot }} />
                      {l.label}
                    </span>
                    <span className="font-mono text-xs text-faint2">{c.reviews} yorum</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* PAGİNASYON */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-body transition-all hover:border-primary/30 disabled:opacity-40"
              >
                ← Önceki
              </button>
              <span className="px-3 font-mono text-sm text-faint">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-body transition-all hover:border-primary/30 disabled:opacity-40"
              >
                Sonraki →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-[22px] border-2 border-dashed border-primary/30 bg-surface px-12 py-16 text-center">
          <div className="mb-3.5 text-[44px]">🔦</div>
          <h2 className="mb-2.5 text-2xl font-bold text-ink">
            &ldquo;{query.trim() || "bu filtre"}&rdquo; için dosya yok
          </h2>
          <p className="mx-auto mb-6 max-w-[400px] text-[15px] leading-relaxed text-muted">
            Ya kimse eklememiş ya da herkes çok mutlu(!). İlk ekleyen sen ol,
            kurdeleyi sen kes. 🎀
          </p>
          <Link
            href="/sirket-ekle"
            className="gradient-pink inline-block rounded-2xl px-[26px] py-3.5 text-[15px] font-bold text-white shadow-glow"
          >
            + Yurt ekle
          </Link>
        </div>
      )}
    </div>
  );
}
