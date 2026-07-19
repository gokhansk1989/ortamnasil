"use client";

import { useMemo, useState } from "react";
import {
  MENU, QUEUE, KPIS, PLATFORM_DIST, type AdminView,
} from "@/lib/admin";
import { ALL_DORMS, CITIES, STATS, type Dorm } from "@/lib/dorms";
import { LIGHTS } from "@/lib/lights";

const DORMS_PER_PAGE = 25;

export default function AdminPage() {
  const [view, setView] = useState<AdminView>("dashboard");
  const [resolved, setResolved] = useState<Record<number, boolean>>({});

  const queue = useMemo(
    () => QUEUE.filter((q) => !resolved[q.id]),
    [resolved],
  );
  const resolve = (id: number) => setResolved((r) => ({ ...r, [id]: true }));

  const clickable: AdminView[] = ["dashboard", "moderation", "dorms"];

  return (
    <div className="flex min-h-screen bg-surface2">
      {/* MOBİL ÜSTBAR */}
      <div className="sticky top-0 z-20 hidden border-b border-white/[.08] bg-ink px-4 py-3 max-md:block">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="flex gap-1" aria-hidden>
            <span className="h-[7px] w-[7px] rounded-full bg-light-red" />
            <span className="h-[7px] w-[7px] rounded-full bg-light-yellow" />
            <span className="h-[7px] w-[7px] rounded-full bg-light-green animate-blink" />
          </span>
          <span className="text-[15px] font-bold text-white">OrtamNasıl?</span>
          <span className="ml-1 font-mono text-[9px] tracking-wider text-accentMono">KUMANDA</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {MENU.filter((m) => clickable.includes(m.key)).map((m) => {
            const on = view === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setView(m.key)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px]"
                style={{
                  background: on ? "rgba(62,230,168,.14)" : "transparent",
                  color: on ? "#3ee6a8" : "#9ec4bb",
                  fontWeight: on ? 600 : 400,
                }}
              >
                <span>{m.icon}</span>
                {m.name}
                {m.badge != null && (
                  <span className="rounded-pill bg-light-red px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
            <div className="font-mono text-[10.5px] tracking-wider text-accentMono">
              KUMANDA ODASI
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {MENU.map((m) => {
            const on = view === m.key;
            const isClickable = clickable.includes(m.key);
            return (
              <button
                key={m.key}
                onClick={() => isClickable && setView(m.key)}
                aria-current={on}
                className="flex items-center gap-3 rounded-[10px] px-3.5 py-[11px] text-[14.5px]"
                style={{
                  background: on ? "rgba(62,230,168,.14)" : "transparent",
                  color: on ? "#3ee6a8" : "#9ec4bb",
                  fontWeight: on ? 600 : 400,
                  cursor: isClickable ? "pointer" : "not-allowed",
                }}
              >
                <span className="text-base">{m.icon}</span>
                {m.name}
                {m.badge != null && (
                  <span className="ml-auto rounded-pill bg-light-red px-2 py-0.5 text-[11.5px] font-semibold text-white">
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/[.08] px-6 pt-4 font-mono text-xs text-[#7fa89f]">
          👑 admin@ortamnasil.com
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 px-10 py-8 max-md:px-5">
        {view === "dorms" ? (
          <DormManager />
        ) : view === "moderation" ? (
          <ModerationView queue={queue} resolve={resolve} />
        ) : (
          <DashboardView queue={queue} setView={setView} resolve={resolve} />
        )}
      </main>
    </div>
  );
}

/* ──────────── DASHBOARD ──────────── */
function DashboardView({
  queue,
  setView,
  resolve,
}: {
  queue: typeof QUEUE;
  setView: (v: AdminView) => void;
  resolve: (id: number) => void;
}) {
  return (
    <>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">Kumanda odası</h1>
        <span className="font-mono text-[12.5px] text-faint max-md:hidden">
          18 Tem 2026, Cumartesi · {STATS.totalDorms.toLocaleString("tr")} yurt kayıtlı
        </span>
      </div>

      <div className="mb-7 grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-card border border-line bg-card p-[22px]">
            <div className="mb-1.5 text-[13px] text-faint">{k.label}</div>
            <div className="text-[30px] font-bold" style={{ color: k.color }}>
              {k.value}
            </div>
            <div className="mt-1 text-[12.5px]" style={{ color: k.noteColor }}>
              {k.note}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-5 max-lg:grid-cols-1">
        <div className="rounded-2xl border border-line bg-card px-7 py-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[18px] text-ink">Moderasyon kuyruğu</h2>
            <button
              onClick={() => setView("moderation")}
              className="text-[13px] font-semibold text-primary"
            >
              Tümü ({queue.length}) →
            </button>
          </div>
          <div className="grid gap-3">
            {queue.slice(0, 3).map((q) => (
              <CaseCard key={q.id} q={q} resolve={resolve} compact />
            ))}
          </div>
        </div>

        <div className="grid content-start gap-5">
          {/* YURT ÖZETİ */}
          <div className="rounded-2xl border border-line bg-card px-7 py-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-[18px] text-ink">Yurt veritabanı</h2>
              <button
                onClick={() => setView("dorms")}
                className="text-[13px] font-semibold text-primary"
              >
                Yönet →
              </button>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between rounded-xl bg-surface px-4 py-3">
                <span className="text-faint">Toplam yurt</span>
                <span className="font-bold text-ink">{STATS.totalDorms.toLocaleString("tr")}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-surface px-4 py-3">
                <span className="text-faint">KYK (devlet)</span>
                <span className="font-semibold text-[#177a52]">{STATS.totalKYK}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-surface px-4 py-3">
                <span className="text-faint">Özel yurt</span>
                <span className="font-semibold text-[#b07d1e]">{STATS.totalOzel}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-surface px-4 py-3">
                <span className="text-faint">Şehir sayısı</span>
                <span className="font-semibold text-ink">{STATS.totalCities}</span>
              </div>
            </div>
          </div>

          {/* PLATFORM IŞIK DAĞILIMI */}
          <div className="rounded-2xl bg-ink px-7 py-6 text-white">
            <div className="mb-4 font-mono text-[11px] tracking-wider text-accentMono">
              PLATFORM IŞIK DAĞILIMI
            </div>
            <div className="mb-3.5 flex h-3.5 overflow-hidden rounded-pill">
              {PLATFORM_DIST.map((d) => (
                <span key={d.name} style={{ width: d.w, background: d.color }} />
              ))}
            </div>
            <div className="grid gap-1.5 text-[12.5px] text-onDarkMuted">
              {PLATFORM_DIST.map((d) => (
                <div key={d.name} className="flex justify-between">
                  <span>{d.name}</span>
                  <span>{d.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ──────────── MODERATION ──────────── */
function ModerationView({
  queue,
  resolve,
}: {
  queue: typeof QUEUE;
  resolve: (id: number) => void;
}) {
  return (
    <>
      <div className="mb-6 flex items-baseline justify-between max-md:flex-col max-md:gap-3">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">
          Moderasyon kuyruğu{" "}
          <span className="text-[15px] font-normal text-faint">
            ({queue.length} bekliyor)
          </span>
        </h1>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-pill bg-ink px-4 py-2 text-[13px] font-semibold text-white">Tümü</button>
          {["İsim ifşası", "Küfür / hakaret", "Spam"].map((f) => (
            <button key={f} className="rounded-pill border border-line bg-card px-4 py-2 text-[13px] text-body">
              {f}
            </button>
          ))}
        </div>
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

/* ──────────── YURT YÖNETİMİ ──────────── */
function DormManager() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tümü");
  const [cityFilter, setCityFilter] = useState("Tümü");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [addedDorms, setAddedDorms] = useState<Dorm[]>([]);

  const allDorms = useMemo(() => [...addedDorms, ...ALL_DORMS], [addedDorms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return allDorms.filter(
      (d) =>
        (!q || d.name.toLocaleLowerCase("tr").includes(q) || d.city.toLocaleLowerCase("tr").includes(q) || d.district.toLocaleLowerCase("tr").includes(q)) &&
        (typeFilter === "Tümü" || d.type === typeFilter) &&
        (cityFilter === "Tümü" || d.city === cityFilter),
    );
  }, [query, typeFilter, cityFilter, allDorms]);

  const totalPages = Math.ceil(filtered.length / DORMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * DORMS_PER_PAGE, page * DORMS_PER_PAGE);

  function resetPage() { setPage(1); }

  function handleAdd(dorm: Dorm) {
    setAddedDorms((prev) => [dorm, ...prev]);
    setShowAdd(false);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3">
        <div>
          <h1 className="text-[26px] tracking-[-.4px] text-ink">Yurt yönetimi</h1>
          <p className="mt-1 text-sm text-faint">
            {allDorms.length.toLocaleString("tr")} kayıtlı yurt · {CITIES.length} şehir
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-white hover:bg-primary-dark"
        >
          + Yeni yurt ekle
        </button>
      </div>

      {/* FİLTRELER */}
      <div className="mb-5 grid grid-cols-[1fr_160px_160px] gap-3 max-md:grid-cols-1">
        <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-inputline bg-card px-4">
          <span className="text-faint">⌕</span>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); resetPage(); }}
            placeholder="Yurt adı, şehir veya ilçe ara…"
            className="flex-1 bg-transparent py-3 text-[15px] text-ink outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(""); resetPage(); }} className="text-faint hover:text-ink">✕</button>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }}
          className="rounded-xl border-[1.5px] border-inputline bg-card px-3 py-3 text-sm text-ink outline-none"
        >
          <option value="Tümü">Tüm tipler</option>
          <option value="KYK">KYK (devlet)</option>
          <option value="Özel">Özel yurt</option>
        </select>
        <select
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); resetPage(); }}
          className="rounded-xl border-[1.5px] border-inputline bg-card px-3 py-3 text-sm text-ink outline-none"
        >
          <option value="Tümü">Tüm şehirler</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* SONUÇ SAYISI */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-faint">
          {filtered.length.toLocaleString("tr")} yurt bulundu
        </span>
        <div className="flex gap-2 text-[12.5px]">
          <span className="rounded-pill bg-[#e8f3f0] px-2.5 py-1 font-semibold text-[#177a52]">
            KYK: {filtered.filter((d) => d.type === "KYK").length}
          </span>
          <span className="rounded-pill bg-[#fdf3e4] px-2.5 py-1 font-semibold text-[#b07d1e]">
            Özel: {filtered.filter((d) => d.type === "Özel").length}
          </span>
        </div>
      </div>

      {/* TABLO */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-xs text-faint">
              <th className="px-4 py-3 font-semibold">Yurt Adı</th>
              <th className="px-4 py-3 font-semibold">Şehir</th>
              <th className="px-4 py-3 font-semibold max-md:hidden">İlçe</th>
              <th className="px-4 py-3 font-semibold">Tür</th>
              <th className="px-4 py-3 font-semibold max-md:hidden">Cinsiyet</th>
              <th className="px-4 py-3 font-semibold max-md:hidden">Kapasite</th>
              <th className="px-4 py-3 font-semibold">Işık</th>
              <th className="px-4 py-3 font-semibold max-md:hidden">Yorum</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((d) => {
              const l = LIGHTS[d.light];
              return (
                <tr key={d.id} className="border-b border-line last:border-0 hover:bg-surface/50">
                  <td className="max-w-[280px] truncate px-4 py-3 font-semibold text-ink">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-body">{d.city}</td>
                  <td className="px-4 py-3 text-faint max-md:hidden">{d.district}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-pill px-2.5 py-1 text-[11.5px] font-semibold"
                      style={{
                        background: d.type === "KYK" ? "#e8f3f0" : "#fdf3e4",
                        color: d.type === "KYK" ? "#177a52" : "#b07d1e",
                      }}
                    >
                      {d.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body max-md:hidden">{d.gender}</td>
                  <td className="px-4 py-3 font-mono text-faint max-md:hidden">{d.capacityLabel || "—"}</td>
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

      {/* PAGİNASYON */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[13px] text-faint">
            Sayfa {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-line bg-card px-3.5 py-2 text-sm font-semibold text-body disabled:opacity-40"
            >
              ← Önceki
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-line bg-card px-3.5 py-2 text-sm font-semibold text-body disabled:opacity-40"
            >
              Sonraki →
            </button>
          </div>
        </div>
      )}

      {/* YURT EKLEME MODALI */}
      {showAdd && <AddDormModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </>
  );
}

/* ──────────── YURT EKLEME MODALI ──────────── */
function AddDormModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (dorm: Dorm) => void;
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [type, setType] = useState<"KYK" | "Özel">("Özel");
  const [gender, setGender] = useState<"Kız" | "Erkek" | "Karma">("Karma");
  const [capacity, setCapacity] = useState("");
  const [success, setSuccess] = useState(false);

  const valid = name.trim().length > 3 && city.trim().length > 1;

  function handleSubmit() {
    if (!valid) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9ğüşöçı]/g, "-").replace(/-+/g, "-").slice(0, 60);
    const dorm: Dorm = {
      id: slug + "-" + Date.now(),
      name: name.trim(),
      city: city.trim(),
      district: district.trim(),
      type,
      gender,
      capacity: parseInt(capacity) || 0,
      capacityLabel: capacity ? `${capacity} kişilik` : "—",
      light: "gray",
      reviewCount: 0,
      status: "approved",
      addedAt: new Date().toISOString().slice(0, 10),
      addedBy: "admin",
    };
    setSuccess(true);
    setTimeout(() => onAdd(dorm), 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[560px] rounded-2xl bg-card p-8 shadow-xl">
        {!success ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">Yeni yurt ekle</h2>
              <button onClick={onClose} className="text-xl text-faint hover:text-ink">✕</button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Yurt adı <span className="text-[#b23a28]">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="örn. KYK Atatürk Öğrenci Yurdu"
                  className="w-full rounded-[10px] border-[1.5px] border-inputline bg-card px-4 py-3 text-[15px] text-ink outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">
                    Şehir <span className="text-[#b23a28]">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-[10px] border-[1.5px] border-inputline bg-card px-3 py-3 text-sm text-ink outline-none"
                  >
                    <option value="">Seç…</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">İlçe</label>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="örn. Kocasinan"
                    className="w-full rounded-[10px] border-[1.5px] border-inputline bg-card px-4 py-3 text-sm text-ink outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Tip</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "KYK" | "Özel")}
                    className="w-full rounded-[10px] border-[1.5px] border-inputline bg-card px-3 py-3 text-sm text-ink outline-none"
                  >
                    <option value="KYK">KYK (devlet)</option>
                    <option value="Özel">Özel yurt</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Cinsiyet</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "Kız" | "Erkek" | "Karma")}
                    className="w-full rounded-[10px] border-[1.5px] border-inputline bg-card px-3 py-3 text-sm text-ink outline-none"
                  >
                    <option value="Kız">Kız</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Karma">Karma</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Kapasite</label>
                  <input
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ""))}
                    placeholder="örn. 250"
                    className="w-full rounded-[10px] border-[1.5px] border-inputline bg-card px-4 py-3 text-sm text-ink outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-line bg-card px-6 py-3 text-sm font-semibold text-body"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!valid}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
                style={{ background: valid ? "#0d7a6f" : "#b9c9c4", cursor: valid ? "pointer" : "not-allowed" }}
              >
                Yurdu kaydet
              </button>
            </div>
          </>
        ) : (
          <div className="animate-pop py-6 text-center">
            <div className="mb-3 text-[44px]">✅</div>
            <h2 className="mb-2 text-xl font-semibold text-ink">Yurt eklendi!</h2>
            <p className="text-sm text-muted">
              <strong className="text-ink">{name.trim()}</strong> veritabanına kaydedildi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────── CASE CARD ──────────── */
function CaseCard({
  q,
  resolve,
  compact = false,
}: {
  q: (typeof QUEUE)[number];
  resolve: (id: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={`border border-line ${compact ? "rounded-xl px-[18px] py-4" : "rounded-card bg-card px-[26px] py-[22px]"}`}>
      <div className={`flex items-center gap-2 ${compact ? "mb-2" : "mb-2.5"}`}>
        <span
          className="rounded-pill px-2.5 py-[3px] text-[11.5px] font-semibold"
          style={{ background: q.tagBg, color: q.tagFg }}
        >
          {q.tag}
        </span>
        <span className="font-mono text-xs text-faint max-md:hidden">
          {q.who} → {q.dorm}
        </span>
        <span className="ml-auto text-xs text-faint2">
          {q.when}
          {!compact && ` · ${q.reports} bildirim`}
        </span>
      </div>
      <p className={`${compact ? "mb-3 text-[13.5px]" : "mb-3.5 text-[14.5px]"} leading-relaxed text-body`}>
        {q.text}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => resolve(q.id)}
          className="rounded-lg bg-[#e7f6ef] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#177a52] hover:bg-[#d6f0e2]"
        >
          ✓ Onayla{!compact && ", yayında kalsın"}
        </button>
        <button
          onClick={() => resolve(q.id)}
          className="rounded-lg bg-[#fbe7e3] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#b23a28] hover:bg-[#f7d8d2]"
        >
          ✕ Kaldır
        </button>
        <button className="rounded-lg bg-surface2 px-3.5 py-[7px] text-[12.5px] font-semibold text-muted">
          {compact ? "Düzenleme iste" : "Yazara düzenleme iste"}
        </button>
      </div>
    </div>
  );
}
