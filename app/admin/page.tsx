"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_DORMS, CITIES, STATS, type Dorm } from "@/lib/dorms";
import { LIGHTS } from "@/lib/lights";

type AdminView = "dashboard" | "moderation" | "dorms";

const MENU = [
  { key: "dashboard" as const, icon: "📊", name: "Kumanda odası" },
  { key: "moderation" as const, icon: "🚨", name: "Moderasyon" },
  { key: "dorms" as const, icon: "🏠", name: "Yurtlar" },
];

const DORMS_PER_PAGE = 25;

interface DashboardData {
  kpis: {
    pendingReports: number;
    dormCount: number;
    kykCount: number;
    ozelCount: number;
    cityCount: number;
    todayReviews: number;
    weeklyUsers: number;
    reviewCount: number;
    redCount: number;
  };
  distribution: { light: string; count: number; pct: number }[];
  queue: QueueItem[];
}

interface QueueItem {
  id: string;
  reason: string;
  reviewText: string;
  dormName: string;
  reporterNick: string;
  reviewId: string;
  createdAt: string;
}

const REASON_LABELS: Record<string, { tag: string; bg: string; fg: string }> = {
  NAME_DISCLOSURE: { tag: "İSİM İFŞASI", bg: "#fbe7e3", fg: "#b23a28" },
  PROFANITY: { tag: "KÜFÜR / HAKARET", bg: "#fbf1db", fg: "#96690f" },
  SPAM: { tag: "SPAM", bg: "#eef1f0", fg: "#5a6a66" },
};

const LIGHT_META: Record<string, { name: string; color: string }> = {
  green: { name: "Tavsiye edilir", color: "#2eb586" },
  yellow: { name: "Ortalama", color: "#e8b93c" },
  orange: { name: "Dikkatli ol", color: "#eb8a4a" },
  red: { name: "Uzak dur", color: "#e05d4b" },
  gray: { name: "Veri yok", color: "#5a6a66" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export default function AdminPage() {
  const [view, setView] = useState<AdminView>("dashboard");
  const [data, setData] = useState<DashboardData | null>(null);
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {});
  }, []);

  const queue = useMemo(
    () => (data?.queue ?? []).filter((q) => !resolved.has(q.id)),
    [data, resolved],
  );

  function resolve(id: string) {
    setResolved((prev) => new Set(prev).add(id));
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric", weekday: "long",
  });

  return (
    <div className="flex min-h-screen bg-surface2">
      {/* SOL MENÜ */}
      <aside className="sticky top-0 flex h-screen w-60 flex-shrink-0 flex-col bg-ink py-6 text-white max-md:hidden">
        <div className="flex items-center gap-2.5 border-b border-white/[.08] px-6 pb-6">
          <span className="flex gap-1" aria-hidden>
            <span className="h-[9px] w-[9px] rounded-full bg-light-red" />
            <span className="h-[9px] w-[9px] rounded-full bg-light-yellow" />
            <span className="h-[9px] w-[9px] rounded-full bg-light-green animate-blink" />
          </span>
          <div>
            <div className="text-[17px] font-bold">OrtamNasıl?</div>
            <div className="font-mono text-[10.5px] tracking-wider text-accentMono">KUMANDA ODASI</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {MENU.map((m) => {
            const on = view === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setView(m.key)}
                className="flex items-center gap-3 rounded-[10px] px-3.5 py-[11px] text-[14.5px]"
                style={{
                  background: on ? "rgba(62,230,168,.14)" : "transparent",
                  color: on ? "#3ee6a8" : "#9ec4bb",
                  fontWeight: on ? 600 : 400,
                }}
              >
                <span className="text-base">{m.icon}</span>
                {m.name}
                {m.key === "moderation" && queue.length > 0 && (
                  <span className="ml-auto rounded-pill bg-light-red px-2 py-0.5 text-[11.5px] font-semibold text-white">
                    {queue.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 px-10 py-8 max-md:px-5">
        {view === "dorms" ? (
          <DormManager />
        ) : view === "moderation" ? (
          <ModerationView queue={queue} resolve={resolve} />
        ) : (
          <DashboardView data={data} queue={queue} setView={setView} resolve={resolve} dateStr={dateStr} />
        )}
      </main>
    </div>
  );
}

function DashboardView({
  data, queue, setView, resolve, dateStr,
}: {
  data: DashboardData | null;
  queue: QueueItem[];
  setView: (v: AdminView) => void;
  resolve: (id: string) => void;
  dateStr: string;
}) {
  const k = data?.kpis;
  const dist = data?.distribution ?? [];

  const kpis = [
    { label: "Bekleyen bildirimler", value: k?.pendingReports ?? 0, color: (k?.pendingReports ?? 0) > 0 ? "#b23a28" : "#12312c" },
    { label: "Toplam yurt", value: k?.dormCount ?? 0, color: "#12312c" },
    { label: "Bugünkü itiraf", value: k?.todayReviews ?? 0, color: "#12312c" },
    { label: "Yeni kullanıcı (7g)", value: k?.weeklyUsers ?? 0, color: "#12312c" },
  ];

  return (
    <>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">Kumanda odası</h1>
        <span className="font-mono text-[12.5px] text-faint max-md:hidden">
          {dateStr} · {(k?.dormCount ?? 0).toLocaleString("tr")} yurt kayıtlı
        </span>
      </div>

      <div className="mb-7 grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-card border border-line bg-card p-[22px]">
            <div className="mb-1.5 text-[13px] text-faint">{kpi.label}</div>
            <div className="text-[30px] font-bold" style={{ color: kpi.color }}>
              {kpi.value.toLocaleString("tr")}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-5 max-lg:grid-cols-1">
        <div className="rounded-2xl border border-line bg-card px-7 py-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[18px] text-ink">Moderasyon kuyruğu</h2>
            <button onClick={() => setView("moderation")} className="text-[13px] font-semibold text-primary">
              Tümü ({queue.length}) →
            </button>
          </div>
          {queue.length > 0 ? (
            <div className="grid gap-3">
              {queue.slice(0, 3).map((q) => (
                <CaseCard key={q.id} q={q} resolve={resolve} compact />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-faint">
              🧹 Kuyruk temiz, bekleyen bildirim yok.
            </div>
          )}
        </div>

        <div className="grid content-start gap-5">
          <div className="rounded-2xl border border-line bg-card px-7 py-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-[18px] text-ink">Yurt veritabanı</h2>
              <button onClick={() => setView("dorms")} className="text-[13px] font-semibold text-primary">
                Yönet →
              </button>
            </div>
            <div className="grid gap-3 text-sm">
              {[
                { label: "Toplam yurt", value: k?.dormCount ?? 0, color: "#12312c" },
                { label: "KYK (devlet)", value: k?.kykCount ?? 0, color: "#177a52" },
                { label: "Özel yurt", value: k?.ozelCount ?? 0, color: "#b07d1e" },
                { label: "Şehir sayısı", value: k?.cityCount ?? 0, color: "#12312c" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between rounded-xl bg-surface px-4 py-3">
                  <span className="text-faint">{row.label}</span>
                  <span className="font-bold" style={{ color: row.color }}>{row.value.toLocaleString("tr")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-ink px-7 py-6 text-white">
            <div className="mb-4 font-mono text-[11px] tracking-wider text-accentMono">
              PLATFORM IŞIK DAĞILIMI
            </div>
            {dist.some((d) => d.count > 0) ? (
              <>
                <div className="mb-3.5 flex h-3.5 overflow-hidden rounded-pill">
                  {dist.filter((d) => d.pct > 0).map((d) => (
                    <span key={d.light} style={{ width: `${d.pct}%`, background: LIGHT_META[d.light]?.color }} />
                  ))}
                </div>
                <div className="grid gap-1.5 text-[12.5px] text-onDarkMuted">
                  {dist.map((d) => (
                    <div key={d.light} className="flex justify-between">
                      <span>{LIGHT_META[d.light]?.name}</span>
                      <span>%{d.pct}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-4 text-center text-sm text-onDarkMuted">
                Henüz anket verisi yok.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ModerationView({ queue, resolve }: { queue: QueueItem[]; resolve: (id: string) => void }) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">
          Moderasyon kuyruğu{" "}
          <span className="text-[15px] font-normal text-faint">({queue.length} bekliyor)</span>
        </h1>
      </div>
      <div className="grid max-w-[860px] gap-3.5">
        {queue.map((q) => (
          <CaseCard key={q.id} q={q} resolve={resolve} />
        ))}
        {queue.length === 0 && (
          <div className="rounded-2xl border-[1.5px] border-dashed border-onDarkMuted bg-card p-14 text-center">
            <div className="mb-3 text-[40px]">🧹</div>
            <div className="text-[19px] font-semibold text-ink">Kuyruk tertemiz</div>
            <div className="mt-1.5 text-sm text-faint">Git bir kahve al, hak ettin.</div>
          </div>
        )}
      </div>
    </>
  );
}

function DormManager() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tümü");
  const [cityFilter, setCityFilter] = useState("Tümü");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return ALL_DORMS.filter(
      (d) =>
        (!q || d.name.toLocaleLowerCase("tr").includes(q) || d.city.toLocaleLowerCase("tr").includes(q) || d.district.toLocaleLowerCase("tr").includes(q)) &&
        (typeFilter === "Tümü" || d.type === typeFilter) &&
        (cityFilter === "Tümü" || d.city === cityFilter),
    );
  }, [query, typeFilter, cityFilter]);

  const totalPages = Math.ceil(filtered.length / DORMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * DORMS_PER_PAGE, page * DORMS_PER_PAGE);
  function resetPage() { setPage(1); }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">Yurt yönetimi</h1>
        <p className="mt-1 text-sm text-faint">
          {ALL_DORMS.length.toLocaleString("tr")} kayıtlı yurt · {CITIES.length} şehir
        </p>
      </div>

      <div className="mb-5 grid grid-cols-[1fr_160px_160px] gap-3 max-md:grid-cols-1">
        <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-inputline bg-card px-4">
          <span className="text-faint">⌕</span>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); resetPage(); }}
            placeholder="Yurt adı, şehir veya ilçe ara…"
            className="flex-1 bg-transparent py-3 text-[15px] text-ink outline-none"
          />
          {query && <button onClick={() => { setQuery(""); resetPage(); }} className="text-faint hover:text-ink">✕</button>}
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }} className="rounded-xl border-[1.5px] border-inputline bg-card px-3 py-3 text-sm text-ink outline-none">
          <option value="Tümü">Tüm tipler</option>
          <option value="KYK">KYK (devlet)</option>
          <option value="Özel">Özel yurt</option>
        </select>
        <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); resetPage(); }} className="rounded-xl border-[1.5px] border-inputline bg-card px-3 py-3 text-sm text-ink outline-none">
          <option value="Tümü">Tüm şehirler</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-faint">{filtered.length.toLocaleString("tr")} yurt bulundu</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-xs text-faint">
              <th className="px-4 py-3 font-semibold">Yurt Adı</th>
              <th className="px-4 py-3 font-semibold">Şehir</th>
              <th className="px-4 py-3 font-semibold max-md:hidden">İlçe</th>
              <th className="px-4 py-3 font-semibold">Tür</th>
              <th className="px-4 py-3 font-semibold">Işık</th>
              <th className="px-4 py-3 font-semibold max-md:hidden">Yorum</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((d) => {
              const l = LIGHTS[d.light];
              return (
                <tr key={d.id} className="border-b border-line last:border-0 hover:bg-surface/50">
                  <td className="max-w-[280px] truncate px-4 py-3 font-semibold text-ink">{d.name}</td>
                  <td className="px-4 py-3 text-body">{d.city}</td>
                  <td className="px-4 py-3 text-faint max-md:hidden">{d.district}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-pill px-2.5 py-1 text-[11.5px] font-semibold" style={{ background: d.type === "KYK" ? "#e8f3f0" : "#fdf3e4", color: d.type === "KYK" ? "#177a52" : "#b07d1e" }}>
                      {d.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: l.dot }} />
                      <span className="text-xs font-semibold" style={{ color: l.badgeFg }}>{l.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-faint max-md:hidden">{d.reviewCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[13px] text-faint">Sayfa {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-line bg-card px-3.5 py-2 text-sm font-semibold text-body disabled:opacity-40">← Önceki</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-line bg-card px-3.5 py-2 text-sm font-semibold text-body disabled:opacity-40">Sonraki →</button>
          </div>
        </div>
      )}
    </>
  );
}

function CaseCard({ q, resolve, compact = false }: { q: QueueItem; resolve: (id: string) => void; compact?: boolean }) {
  const r = REASON_LABELS[q.reason] ?? REASON_LABELS.SPAM;
  return (
    <div className={`border border-line ${compact ? "rounded-xl px-[18px] py-4" : "rounded-card bg-card px-[26px] py-[22px]"}`}>
      <div className={`flex items-center gap-2 ${compact ? "mb-2" : "mb-2.5"}`}>
        <span className="rounded-pill px-2.5 py-[3px] text-[11.5px] font-semibold" style={{ background: r.bg, color: r.fg }}>
          {r.tag}
        </span>
        <span className="font-mono text-xs text-faint max-md:hidden">
          {q.reporterNick} → {q.dormName}
        </span>
        <span className="ml-auto text-xs text-faint">{timeAgo(q.createdAt)}</span>
      </div>
      <p className={`${compact ? "mb-3 text-[13.5px]" : "mb-3.5 text-[14.5px]"} leading-relaxed text-body`}>
        &ldquo;{q.reviewText.length > 120 ? q.reviewText.slice(0, 117) + "..." : q.reviewText}&rdquo;
      </p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => resolve(q.id)} className="rounded-lg bg-[#e7f6ef] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#177a52] hover:bg-[#d6f0e2]">
          ✓ Onayla
        </button>
        <button onClick={() => resolve(q.id)} className="rounded-lg bg-[#fbe7e3] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#b23a28] hover:bg-[#f7d8d2]">
          ✕ Kaldır
        </button>
      </div>
    </div>
  );
}
