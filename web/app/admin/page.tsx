"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LIGHTS, type LightKey } from "@/lib/lights";

type AdminView = "dashboard" | "moderation" | "reviews" | "surveys" | "dorms" | "users" | "blog" | "faq" | "activity";

const MENU = [
  { key: "dashboard" as const, icon: "📊", name: "Kumanda odası" },
  { key: "moderation" as const, icon: "🚨", name: "Moderasyon" },
  { key: "reviews" as const, icon: "💬", name: "Yorumlar" },
  { key: "surveys" as const, icon: "📋", name: "Anketler" },
  { key: "dorms" as const, icon: "🏠", name: "Yurtlar" },
  { key: "users" as const, icon: "👥", name: "Kullanıcılar" },
  { key: "activity" as const, icon: "⚡", name: "Aktivite" },
  { key: "blog" as const, icon: "📝", name: "Blog" },
  { key: "faq" as const, icon: "❓", name: "SSS" },
];

// ── Types ──

interface PendingReviewItem {
  id: string;
  title: string;
  text: string;
  light: string;
  nick: string;
  dormName: string;
  dormCity: string;
  createdAt: string;
}

interface TrendData {
  todaySurveys: number;
  yesterdaySurveys: number;
  todayUsers: number;
  yesterdayUsers: number;
  thisWeekSurveys: number;
  lastWeekSurveys: number;
  thisWeekUsers: number;
  lastWeekUsers: number;
}

interface ActivityItem {
  type: "survey" | "user" | "review";
  nick: string;
  detail: string;
  light: string | null;
  createdAt: string;
}

interface ChartDay {
  date: string;
  surveys: number;
  users: number;
}

interface DashboardData {
  kpis: {
    pendingReports: number;
    pendingReviews: number;
    dormCount: number;
    kykCount: number;
    ozelCount: number;
    cityCount: number;
    todayReviews: number;
    weeklyUsers: number;
    reviewCount: number;
    surveyCount: number;
    redCount: number;
  };
  trends: TrendData;
  distribution: { light: string; count: number; pct: number }[];
  queue: QueueItem[];
  pendingReviewQueue: PendingReviewItem[];
  activity: ActivityItem[];
  chartData: ChartDay[];
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

interface AdminDorm {
  id: string;
  recordNo: number;
  name: string;
  type: string;
  gender: string;
  city: string;
  district: string | null;
  light: string;
  nearCampus: string | null;
  website: string | null;
  mapsUrl: string | null;
  blurb: string | null;
  surveyCount: number;
  reviewCount: number;
  creatorNick: string;
  createdAt: string;
}

interface AdminUser {
  id: string;
  nick: string;
  emailVerified: boolean;
  frozen: boolean;
  frozenAt: string | null;
  surveyCount: number;
  reviewCount: number;
  mustChangePassword: boolean;
  createdAt: string;
}

// ── Helpers ──

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

const TYPE_LABELS: Record<string, string> = { KYK: "KYK", PRIVATE: "Özel", APART: "Apart" };
const GENDER_LABELS: Record<string, string> = { MALE: "Erkek", FEMALE: "Kız", MIXED: "Karma" };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

// ── Main ──

export default function AdminPage() {
  const router = useRouter();
  const [view, setView] = useState<AdminView>("dashboard");
  const [data, setData] = useState<DashboardData | null>(null);
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifSeen, setNotifSeen] = useState<{ reports: number; reviews: number }>({ reports: 0, reviews: 0 });
  const notifRef = useRef<HTMLDivElement>(null!);

  const notifCount = useMemo(() => {
    if (!data) return 0;
    const newReports = Math.max(0, data.kpis.pendingReports - notifSeen.reports);
    const newReviews = Math.max(0, data.kpis.pendingReviews - notifSeen.reviews);
    return newReports + newReviews;
  }, [data, notifSeen]);

  const markNotifsSeen = useCallback(() => {
    if (data) setNotifSeen({ reports: data.kpis.pendingReports, reviews: data.kpis.pendingReviews });
  }, [data]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/cikis", { method: "POST" });
    router.push("/admin/giris");
  }

  const fetchDashboard = useCallback(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const queue = useMemo(
    () => (data?.queue ?? []).filter((q) => !resolved.has(q.id)),
    [data, resolved],
  );

  function resolve(id: string) {
    setResolved((prev) => new Set(prev).add(id));
  }

  const dateStr = new Date().toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric", weekday: "long",
  });

  return (
    <div className="flex min-h-screen bg-surface2">
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
                {m.key === "reviews" && (data?.kpis?.pendingReviews ?? 0) > 0 && (
                  <span className="ml-auto rounded-pill bg-light-yellow px-2 py-0.5 text-[11.5px] font-semibold text-ink">
                    {data!.kpis.pendingReviews}
                  </span>
                )}
                {m.key === "surveys" && (data?.kpis?.surveyCount ?? 0) > 0 && (
                  <span className="ml-auto font-mono text-[11.5px] text-onDarkMuted">
                    {data!.kpis.surveyCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/[.08] px-4 py-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">A</div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-white/90">Admin</div>
              <div className="truncate text-[11px] text-white/40">Kumanda yetkisi</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] text-white/50 transition-colors hover:bg-white/[.06] hover:text-white/80"
          >
            {loggingOut ? "Çıkılıyor..." : "Oturumu kapat"}
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenu(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-ink py-6 text-white">
            <div className="flex items-center justify-between border-b border-white/[.08] px-6 pb-6">
              <div className="flex items-center gap-2.5">
                <span className="flex gap-1" aria-hidden>
                  <span className="h-[9px] w-[9px] rounded-full bg-light-red" />
                  <span className="h-[9px] w-[9px] rounded-full bg-light-yellow" />
                  <span className="h-[9px] w-[9px] rounded-full bg-light-green" />
                </span>
                <div className="text-[17px] font-bold">OrtamNasıl?</div>
              </div>
              <button onClick={() => setMobileMenu(false)} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 p-3">
              {MENU.map((m) => {
                const on = view === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => { setView(m.key); setMobileMenu(false); }}
                    className="flex items-center gap-3 rounded-[10px] px-3.5 py-[11px] text-[14.5px]"
                    style={{
                      background: on ? "rgba(62,230,168,.14)" : "transparent",
                      color: on ? "#3ee6a8" : "#9ec4bb",
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    <span className="text-base">{m.icon}</span>
                    {m.name}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-white/[.08] px-4 py-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">A</div>
                <div className="text-[13px] font-medium text-white/90">Admin</div>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] text-white/50 hover:bg-white/[.06] hover:text-white/80"
              >
                {loggingOut ? "Çıkılıyor..." : "Oturumu kapat"}
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 px-10 py-8 max-md:px-5">
        <div className="mb-4 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenu(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-lg"
          >
            ☰
          </button>
          <span className="flex-1 text-[15px] font-semibold text-ink">
            {MENU.find((m) => m.key === view)?.icon} {MENU.find((m) => m.key === view)?.name}
          </span>
          <NotificationBell
            notifOpen={notifOpen}
            setNotifOpen={setNotifOpen}
            notifCount={notifCount}
            markNotifsSeen={markNotifsSeen}
            data={data}
            setView={setView}
            notifRef={notifRef}
          />
        </div>
        <div className="mb-6 flex items-center justify-end max-md:hidden">
          <NotificationBell
            notifOpen={notifOpen}
            setNotifOpen={setNotifOpen}
            notifCount={notifCount}
            markNotifsSeen={markNotifsSeen}
            data={data}
            setView={setView}
            notifRef={notifRef}
          />
        </div>

        {view === "dorms" ? (
          <DormManager />
        ) : view === "users" ? (
          <UserManager />
        ) : view === "blog" ? (
          <BlogManager />
        ) : view === "faq" ? (
          <FaqManager />
        ) : view === "reviews" ? (
          <ReviewManager />
        ) : view === "surveys" ? (
          <SurveyManager />
        ) : view === "moderation" ? (
          <ModerationView queue={queue} resolve={resolve} />
        ) : view === "activity" ? (
          <ActivityView activity={data?.activity ?? []} />
        ) : (
          <DashboardView data={data} queue={queue} setView={setView} resolve={resolve} dateStr={dateStr} />
        )}
      </main>
    </div>
  );
}

// ── Notification Bell ──

function NotificationBell({
  notifOpen, setNotifOpen, notifCount, markNotifsSeen, data, setView, notifRef,
}: {
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  notifCount: number;
  markNotifsSeen: () => void;
  data: DashboardData | null;
  setView: (v: AdminView) => void;
  notifRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={notifRef} className="relative">
      <button
        onClick={() => {
          setNotifOpen(!notifOpen);
          if (!notifOpen) markNotifsSeen();
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-lg transition-colors hover:bg-surface"
      >
        🔔
        {notifCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-light-red px-1 text-[10px] font-bold text-white">
            {notifCount > 99 ? "99+" : notifCount}
          </span>
        )}
      </button>
      {notifOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-line bg-card shadow-xl">
          <div className="border-b border-line px-4 py-3">
            <h4 className="text-[14px] font-bold text-ink">Bildirimler</h4>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {!data || (data.kpis.pendingReports === 0 && data.kpis.pendingReviews === 0 && (!data.activity || data.activity.length === 0)) ? (
              <div className="px-4 py-8 text-center text-sm text-faint">Yeni bildirim yok</div>
            ) : (
              <>
                {data.kpis.pendingReports > 0 && (
                  <button
                    onClick={() => { setView("moderation"); setNotifOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbe7e3] text-sm">🚨</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-ink">{data.kpis.pendingReports} bekleyen rapor</div>
                      <div className="text-[11px] text-faint">Moderasyon kuyruğunda</div>
                    </div>
                  </button>
                )}
                {data.kpis.pendingReviews > 0 && (
                  <button
                    onClick={() => { setView("reviews"); setNotifOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbf1db] text-sm">💬</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-ink">{data.kpis.pendingReviews} bekleyen yorum</div>
                      <div className="text-[11px] text-faint">Onay bekliyor</div>
                    </div>
                  </button>
                )}
                {data.activity?.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-t border-line/50">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs">
                      {a.type === "survey" ? "📋" : a.type === "review" ? "💬" : "👤"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] text-ink">
                        <span className="font-semibold">{a.nick}</span>
                        {a.type === "survey" ? ` → ${a.detail}` : a.type === "user" ? " kayıt oldu" : ` yorum yazdı`}
                      </div>
                      <div className="text-[10px] text-faint">{timeAgo(a.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          {data?.activity && data.activity.length > 5 && (
            <button
              onClick={() => { setView("activity"); setNotifOpen(false); }}
              className="w-full border-t border-line px-4 py-2.5 text-center text-[12px] font-semibold text-primary hover:bg-surface"
            >
              Tüm aktiviteleri gör
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ──

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  const pct = previous > 0 ? Math.round((diff / previous) * 100) : current > 0 ? 100 : 0;
  if (diff === 0) return <span className="text-[11px] text-faint">→ aynı</span>;
  const up = diff > 0;
  return (
    <span className={`text-[11px] font-semibold ${up ? "text-[#177a52]" : "text-[#b23a28]"}`}>
      {up ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  );
}

function MiniChart({ data, color }: { data: ChartDay[]; color: string }) {
  if (!data.length) return null;
  const values = data.map((d) => d.surveys + d.users);
  const max = Math.max(...values, 1);
  const w = 280;
  const h = 60;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      <polygon fill={color} fillOpacity="0.08" points={areaPoints} />
    </svg>
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
  const t = data?.trends;
  const dist = data?.distribution ?? [];

  const kpis = [
    {
      label: "Bugün anket",
      value: t?.todaySurveys ?? 0,
      color: "#12312c",
      trend: t ? { current: t.todaySurveys, previous: t.yesterdaySurveys } : null,
    },
    {
      label: "Bugün kayıt",
      value: t?.todayUsers ?? 0,
      color: "#12312c",
      trend: t ? { current: t.todayUsers, previous: t.yesterdayUsers } : null,
    },
    {
      label: "Haftalık anket",
      value: t?.thisWeekSurveys ?? 0,
      color: "#12312c",
      trend: t ? { current: t.thisWeekSurveys, previous: t.lastWeekSurveys } : null,
    },
    {
      label: "Haftalık kayıt",
      value: t?.thisWeekUsers ?? 0,
      color: "#12312c",
      trend: t ? { current: t.thisWeekUsers, previous: t.lastWeekUsers } : null,
    },
    {
      label: "Bekleyen bildirim",
      value: k?.pendingReports ?? 0,
      color: (k?.pendingReports ?? 0) > 0 ? "#b23a28" : "#12312c",
      trend: null,
    },
    {
      label: "Toplam yurt",
      value: k?.dormCount ?? 0,
      color: "#12312c",
      trend: null,
    },
  ];

  return (
    <>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">Kumanda odası</h1>
        <span className="font-mono text-[12.5px] text-faint max-md:hidden">
          {dateStr} · {(k?.dormCount ?? 0).toLocaleString("tr")} yurt kayıtlı
        </span>
      </div>

      <div className="mb-7 grid grid-cols-6 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-card border border-line bg-card p-[22px]">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12px] text-faint">{kpi.label}</span>
              {kpi.trend && <TrendBadge current={kpi.trend.current} previous={kpi.trend.previous} />}
            </div>
            <div className="text-[28px] font-bold" style={{ color: kpi.color }}>
              {kpi.value.toLocaleString("tr")}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.5fr_1fr] gap-5 max-lg:grid-cols-1">
        <div className="grid content-start gap-5">
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
                Kuyruk temiz, bekleyen bildirim yok.
              </div>
            )}
          </div>

          <PendingReviewQueue items={data?.pendingReviewQueue ?? []} setView={setView} />
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

      <div className="mt-5 grid grid-cols-[1.5fr_1fr] gap-5 max-lg:grid-cols-1">
        <div className="rounded-2xl border border-line bg-card px-7 py-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[18px] text-ink">Son 30 gün trendi</h2>
            <span className="text-[12px] text-faint">Anket + Kayıt</span>
          </div>
          {data?.chartData ? (
            <MiniChart data={data.chartData} color="#F97316" />
          ) : (
            <div className="py-8 text-center text-sm text-faint animate-pulse">Yükleniyor...</div>
          )}
          {data?.chartData && (
            <div className="mt-2 flex justify-between text-[11px] text-faint">
              <span>{data.chartData[0]?.date.slice(5)}</span>
              <span>{data.chartData[data.chartData.length - 1]?.date.slice(5)}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-card px-7 py-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[18px] text-ink">Son aktivite</h2>
            <button onClick={() => setView("activity")} className="text-[13px] font-semibold text-primary">
              Tümü →
            </button>
          </div>
          <div className="grid gap-2 max-h-[240px] overflow-y-auto">
            {(data?.activity ?? []).slice(0, 8).map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl bg-surface px-3.5 py-2.5">
                <span className="text-sm">
                  {a.type === "survey" ? "📋" : a.type === "user" ? "👤" : "💬"}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[13px] font-semibold text-ink">{a.nick}</span>
                  <span className="text-[12px] text-faint"> · {a.detail}</span>
                </div>
                <span className="whitespace-nowrap text-[11px] text-faint">{timeAgo(a.createdAt)}</span>
              </div>
            ))}
            {(data?.activity ?? []).length === 0 && (
              <div className="py-4 text-center text-sm text-faint">Henüz aktivite yok.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Moderation ──

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

// ── Dorm Manager ──

const DORMS_PER_PAGE = 25;

function DormManager() {
  const [dorms, setDorms] = useState<AdminDorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tümü");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [editDorm, setEditDorm] = useState<AdminDorm | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadDorms();
  }, []);

  async function loadDorms() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/yurtlar");
      if (res.ok) {
        const data = await res.json();
        setDorms(data.items);
      }
    } catch { /* */ }
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return dorms.filter(
      (d) =>
        (!q || d.name.toLocaleLowerCase("tr").includes(q) || d.city.toLocaleLowerCase("tr").includes(q)) &&
        (typeFilter === "Tümü" || d.type === typeFilter),
    );
  }, [dorms, query, typeFilter]);

  const totalPages = Math.ceil(filtered.length / DORMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * DORMS_PER_PAGE, page * DORMS_PER_PAGE);

  async function handleAddDorm(formData: Record<string, string>) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/yurtlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error); return; }
      setModal(null);
      showToast("Yurt eklendi");
      loadDorms();
    } catch { showToast("Hata oluştu"); }
    setSaving(false);
  }

  async function handleEditDorm(formData: Record<string, string>) {
    if (!editDorm) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/yurtlar/${editDorm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error); return; }
      setModal(null);
      setEditDorm(null);
      showToast("Yurt güncellendi");
      loadDorms();
    } catch { showToast("Hata oluştu"); }
    setSaving(false);
  }

  async function handleDeleteDorm() {
    if (!editDorm) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/yurtlar/${editDorm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error); return; }
      setModal(null);
      setEditDorm(null);
      showToast("Yurt silindi");
      loadDorms();
    } catch { showToast("Hata oluştu"); }
    setSaving(false);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] tracking-[-.4px] text-ink">Yurt yönetimi</h1>
          <p className="mt-1 text-sm text-faint">{dorms.length.toLocaleString("tr")} kayıtlı yurt</p>
        </div>
        <button
          onClick={() => { setEditDorm(null); setModal("add"); }}
          className="gradient-pink rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-glow"
        >
          + Yurt ekle
        </button>
      </div>

      <div className="mb-5 grid grid-cols-[1fr_160px] gap-3 max-md:grid-cols-1">
        <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-inputline bg-card px-4">
          <span className="text-faint">⌕</span>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Yurt adı veya şehir ara..."
            className="flex-1 bg-transparent py-3 text-[15px] text-ink outline-none"
          />
          {query && <button onClick={() => { setQuery(""); setPage(1); }} className="text-faint hover:text-ink">✕</button>}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="rounded-xl border-[1.5px] border-inputline bg-card px-3 py-3 text-sm text-ink outline-none"
        >
          <option value="Tümü">Tüm tipler</option>
          <option value="KYK">KYK</option>
          <option value="PRIVATE">Özel</option>
          <option value="APART">Apart</option>
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-faint animate-pulse">Yükleniyor...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface text-xs text-faint">
                  <th className="px-4 py-3 font-semibold">Yurt Adı</th>
                  <th className="px-4 py-3 font-semibold">Şehir</th>
                  <th className="px-4 py-3 font-semibold max-md:hidden">Tür</th>
                  <th className="px-4 py-3 font-semibold">Işık</th>
                  <th className="px-4 py-3 font-semibold max-md:hidden">Anket</th>
                  <th className="px-4 py-3 font-semibold text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((d) => {
                  const l = LIGHTS[d.light as LightKey] || LIGHTS.gray;
                  return (
                    <tr key={d.id} className="border-b border-line last:border-0 hover:bg-surface/50">
                      <td className="max-w-[280px] truncate px-4 py-3 font-semibold text-ink">{d.name}</td>
                      <td className="px-4 py-3 text-body">{d.city}</td>
                      <td className="px-4 py-3 max-md:hidden">
                        <span
                          className="rounded-pill px-2.5 py-1 text-[11.5px] font-semibold"
                          style={{ background: d.type === "KYK" ? "#e8f3f0" : "#fdf3e4", color: d.type === "KYK" ? "#177a52" : "#b07d1e" }}
                        >
                          {TYPE_LABELS[d.type] || d.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: l.dot }} />
                          <span className="text-xs font-semibold" style={{ color: l.badgeFg }}>{l.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-faint max-md:hidden">{d.surveyCount}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <a
                            href={`/yurt/${d.id}`}
                            target="_blank"
                            rel="noopener"
                            className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-faint hover:bg-surface hover:text-ink"
                          >
                            ↗
                          </a>
                          <button
                            onClick={() => { setEditDorm(d); setModal("edit"); }}
                            className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-surface"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => { setEditDorm(d); setModal("delete"); }}
                            className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-light-red hover:bg-red-50"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
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
      )}

      {/* Yurt ekle / düzenle modal */}
      {(modal === "add" || modal === "edit") && (
        <DormFormModal
          mode={modal}
          dorm={editDorm}
          saving={saving}
          onSave={modal === "add" ? handleAddDorm : handleEditDorm}
          onClose={() => { setModal(null); setEditDorm(null); }}
        />
      )}

      {/* Sil onay modal */}
      {modal === "delete" && editDorm && (
        <ConfirmModal
          title="Yurt sil"
          message={`"${editDorm.name}" yurdunu silmek istediğine emin misin? Bu işlem geri alınamaz.`}
          confirmLabel="Evet, sil"
          saving={saving}
          onConfirm={handleDeleteDorm}
          onClose={() => { setModal(null); setEditDorm(null); }}
        />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}

// ── DormFormModal ──

function DormFormModal({
  mode, dorm, saving, onSave, onClose,
}: {
  mode: "add" | "edit";
  dorm: AdminDorm | null;
  saving: boolean;
  onSave: (data: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(dorm?.name || "");
  const [type, setType] = useState(dorm?.type || "KYK");
  const [gender, setGender] = useState(dorm?.gender || "MIXED");
  const [city, setCity] = useState(dorm?.city || "");
  const [district, setDistrict] = useState(dorm?.district || "");
  const [nearCampus, setNearCampus] = useState((dorm as any)?.nearCampus || "");
  const [website, setWebsite] = useState(dorm?.website || "");
  const [mapsUrl, setMapsUrl] = useState(dorm?.mapsUrl || "");
  const [blurb, setBlurb] = useState(dorm?.blurb || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name, type, gender, city, district, nearCampus, website, mapsUrl, blurb });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="mx-4 w-full max-w-[520px] rounded-[22px] border border-line bg-card p-8 shadow-lg max-h-[90vh] overflow-y-auto"
      >
        <h3 className="mb-5 text-lg font-bold text-ink">
          {mode === "add" ? "Yurt ekle" : "Yurt düzenle"}
        </h3>
        <div className="grid gap-4">
          <Field label="Yurt adı" required>
            <input value={name} onChange={(e) => setName(e.target.value)} className="admin-input" placeholder="Örn: Yıldız KYK Yurdu" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tip">
              <select value={type} onChange={(e) => setType(e.target.value)} className="admin-input">
                <option value="KYK">KYK</option>
                <option value="PRIVATE">Özel</option>
                <option value="APART">Apart</option>
              </select>
            </Field>
            <Field label="Cinsiyet">
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="admin-input">
                <option value="MIXED">Karma</option>
                <option value="MALE">Erkek</option>
                <option value="FEMALE">Kız</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Şehir" required>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="admin-input" placeholder="İstanbul" />
            </Field>
            <Field label="İlçe">
              <input value={district} onChange={(e) => setDistrict(e.target.value)} className="admin-input" placeholder="Kadıköy" />
            </Field>
          </div>
          <Field label="Yakın kampüs">
            <input value={nearCampus} onChange={(e) => setNearCampus(e.target.value)} className="admin-input" placeholder="İTÜ Ayazağa, Boğaziçi Güney..." />
          </Field>
          <Field label="Website">
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className="admin-input" placeholder="https://..." />
          </Field>
          <Field label="Açıklama">
            <textarea value={blurb} onChange={(e) => setBlurb(e.target.value)} className="admin-input min-h-[60px] resize-y" placeholder="Kısa açıklama..." />
          </Field>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-faint hover:bg-surface">
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !city.trim() || saving}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {saving ? "Kaydediliyor..." : mode === "add" ? "Ekle" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── User Manager ──

function UserManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [resetModal, setResetModal] = useState<AdminUser | null>(null);
  const [resetResult, setResetResult] = useState<{ tempPassword: string; emailSent: boolean } | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSaving, setResetSaving] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState<string | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkFreezing, setBulkFreezing] = useState(false);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  }

  async function bulkFreeze(freeze: boolean) {
    setBulkFreezing(true);
    let ok = 0;
    for (const id of selected) {
      try {
        const res = await fetch("/api/admin/kullanicilar/freeze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, freeze }),
        });
        if (res.ok) ok++;
      } catch { /* */ }
    }
    showToast(`${ok} kullanıcı ${freeze ? "donduruldu" : "aktifleştirildi"}`);
    setSelected(new Set());
    setBulkFreezing(false);
    loadUsers();
  }

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kullanicilar");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items);
      }
    } catch { /* */ }
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function toggleFreeze(user: AdminUser) {
    setFreezeLoading(user.id);
    try {
      const res = await fetch("/api/admin/kullanicilar/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, freeze: !user.frozen }),
      });
      if (res.ok) {
        showToast(user.frozen ? `${user.nick} aktifleştirildi` : `${user.nick} donduruldu`);
        loadUsers();
      }
    } catch { showToast("Hata oluştu"); }
    setFreezeLoading(null);
  }

  async function handleResetPassword() {
    if (!resetModal) return;
    setResetSaving(true);
    try {
      const res = await fetch("/api/admin/sifre-sifirla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: resetModal.id,
          email: resetEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error);
      } else {
        setResetResult({ tempPassword: data.tempPassword, emailSent: data.emailSent });
      }
    } catch { showToast("Hata oluştu"); }
    setResetSaving(false);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (!q) return users;
    return users.filter((u) => u.nick.toLocaleLowerCase("tr").includes(q));
  }, [users, query]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">Kullanıcı yönetimi</h1>
        <p className="mt-1 text-sm text-faint">{users.length} kayıtlı kullanıcı</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-xl border-[1.5px] border-inputline bg-card px-4 max-w-[400px]">
          <span className="text-faint">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kullanıcı adı ara..."
            className="flex-1 bg-transparent py-3 text-[15px] text-ink outline-none"
          />
          {query && <button onClick={() => setQuery("")} className="text-faint hover:text-ink">✕</button>}
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-ink">{selected.size} seçili</span>
            <button
              onClick={() => bulkFreeze(true)}
              disabled={bulkFreezing}
              className="rounded-lg bg-[#fbe7e3] px-3 py-1.5 text-[12px] font-semibold text-[#b23a28] hover:bg-[#f7d8d2] disabled:opacity-50"
            >
              Toplu dondur
            </button>
            <button
              onClick={() => bulkFreeze(false)}
              disabled={bulkFreezing}
              className="rounded-lg bg-[#e7f6ef] px-3 py-1.5 text-[12px] font-semibold text-[#177a52] hover:bg-[#d6f0e2] disabled:opacity-50"
            >
              Toplu aktifleştir
            </button>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-faint hover:text-ink">Temizle</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-faint animate-pulse">Yükleniyor...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-xs text-faint">
                <th className="w-10 px-3 py-3">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="accent-primary" />
                </th>
                <th className="px-4 py-3 font-semibold">Kullanıcı</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold max-md:hidden">Anket</th>
                <th className="px-4 py-3 font-semibold max-md:hidden">Kayıt</th>
                <th className="px-4 py-3 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-surface/50">
                  <td className="w-10 px-3 py-3">
                    <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} className="accent-primary" />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDetailUserId(u.id)} className="text-left hover:underline">
                      <div className="font-semibold text-ink">{u.nick}</div>
                      <div className="text-xs text-faint">
                        {u.emailVerified ? "E-posta doğrulanmış" : "E-posta doğrulanmamış"}
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {u.frozen ? (
                      <span className="rounded-pill bg-red-100 px-2.5 py-1 text-[11.5px] font-semibold text-red-700">
                        Dondurulmuş
                      </span>
                    ) : (
                      <span className="rounded-pill bg-green-100 px-2.5 py-1 text-[11.5px] font-semibold text-green-700">
                        Aktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-faint max-md:hidden">{u.surveyCount}</td>
                  <td className="px-4 py-3 text-faint max-md:hidden">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => { setResetModal(u); setResetResult(null); setResetEmail(""); }}
                        className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-surface"
                      >
                        Şifre sıfırla
                      </button>
                      <button
                        onClick={() => toggleFreeze(u)}
                        disabled={freezeLoading === u.id}
                        className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:bg-surface disabled:opacity-50"
                        style={{ color: u.frozen ? "#177a52" : "#b23a28" }}
                      >
                        {freezeLoading === u.id ? "..." : u.frozen ? "Aktifleştir" : "Dondur"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Şifre sıfırlama modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setResetModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="mx-4 w-full max-w-[440px] rounded-[22px] border border-line bg-card p-8 shadow-lg">
            {resetResult ? (
              <>
                <div className="mb-4 text-center text-2xl">✅</div>
                <h3 className="mb-2 text-center text-lg font-bold text-ink">Şifre sıfırlandı</h3>
                <p className="mb-4 text-center text-sm text-faint">
                  <strong>{resetModal.nick}</strong> için yeni geçici şifre:
                </p>
                <div className="mb-4 rounded-xl bg-surface p-4 text-center font-mono text-2xl font-bold tracking-wider text-primary">
                  {resetResult.tempPassword}
                </div>
                {resetResult.emailSent ? (
                  <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
                    E-posta ile gönderildi
                  </p>
                ) : (
                  <p className="mb-4 text-center text-xs text-faint">
                    Bu şifreyi kullanıcıya ilet. E-posta gönderilmedi.
                  </p>
                )}
                <button onClick={() => setResetModal(null)} className="w-full rounded-xl border border-line py-3 text-sm font-semibold text-body hover:bg-surface">
                  Kapat
                </button>
              </>
            ) : (
              <>
                <h3 className="mb-1 text-lg font-bold text-ink">Şifre sıfırla</h3>
                <p className="mb-5 text-sm text-faint">
                  <strong>{resetModal.nick}</strong> için geçici şifre oluşturulacak.
                </p>
                <Field label="Kullanıcının e-postası (opsiyonel)">
                  <input
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    type="email"
                    className="admin-input"
                    placeholder="E-posta girilirse otomatik gönderilir"
                  />
                </Field>
                <p className="mt-2 mb-5 text-xs text-faint">
                  E-posta girilirse hash doğrulanıp otomatik gönderilir. Girilmezse geçici şifre ekranda gösterilir.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setResetModal(null)} className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-faint hover:bg-surface">
                    Vazgeç
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={resetSaving}
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-40"
                  >
                    {resetSaving ? "Sıfırlanıyor..." : "Şifreyi sıfırla"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {detailUserId && <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}

      {toast && <Toast message={toast} />}
    </>
  );
}

// ── Shared Components ──

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label} {required && <span className="text-light-red">*</span>}
      </label>
      {children}
    </div>
  );
}

function ConfirmModal({
  title, message, confirmLabel, saving, onConfirm, onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  saving: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="mx-4 w-full max-w-[400px] rounded-[22px] border border-line bg-card p-8 shadow-lg">
        <h3 className="mb-2 text-lg font-bold text-ink">{title}</h3>
        <p className="mb-6 text-sm text-faint">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-faint hover:bg-surface">
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {saving ? "Siliniyor..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-lg">
      {message}
    </div>
  );
}

// ── Blog Manager ──

interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  published: boolean;
  publishedAt: string | null;
  likeCount: number;
  viewCount: number;
  createdAt: string;
}

function BlogManager() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [editPost, setEditPost] = useState<BlogPostItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) { const data = await res.json(); setPosts(data.items); }
    } catch { /* */ }
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleSave(formData: Record<string, string | boolean>) {
    setSaving(true);
    try {
      const url = editPost ? `/api/admin/blog/${editPost.id}` : "/api/admin/blog";
      const method = editPost ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) { showToast(data.error); setSaving(false); return; }
      setModal(null);
      setEditPost(null);
      showToast(editPost ? "Yazı güncellendi" : "Yazı eklendi");
      loadPosts();
    } catch { showToast("Hata oluştu"); }
    setSaving(false);
  }

  async function handleDelete() {
    if (!editPost) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog/${editPost.id}`, { method: "DELETE" });
      if (!res.ok) { showToast("Silinemedi"); setSaving(false); return; }
      setModal(null);
      setEditPost(null);
      showToast("Yazı silindi");
      loadPosts();
    } catch { showToast("Hata oluştu"); }
    setSaving(false);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] tracking-[-.4px] text-ink">Blog yönetimi</h1>
          <p className="mt-1 text-sm text-faint">{posts.length} yazı</p>
        </div>
        <button onClick={() => { setEditPost(null); setModal("add"); }} className="gradient-pink rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-glow">
          + Yeni yazı
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-faint animate-pulse">Yükleniyor...</div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-onDarkMuted bg-card p-14 text-center">
          <div className="mb-3 text-[40px]">📝</div>
          <div className="text-[19px] font-semibold text-ink">Henüz yazı yok</div>
          <div className="mt-1.5 text-sm text-faint">İlk blog yazını ekle.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-xs text-faint">
                <th className="px-4 py-3 font-semibold">Başlık</th>
                <th className="px-4 py-3 font-semibold max-md:hidden">Kategori</th>
                <th className="px-4 py-3 font-semibold max-md:hidden">Görüntüleme</th>
                <th className="px-4 py-3 font-semibold max-md:hidden">Beğeni</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold max-md:hidden">Tarih</th>
                <th className="px-4 py-3 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface/50">
                  <td className="max-w-[300px] truncate px-4 py-3 font-semibold text-ink">{p.title}</td>
                  <td className="px-4 py-3 max-md:hidden">
                    <span className="rounded-pill bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-faint">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-faint max-md:hidden">{(p.viewCount ?? 0).toLocaleString("tr")}</td>
                  <td className="px-4 py-3 font-mono text-faint max-md:hidden">{(p.likeCount ?? 0).toLocaleString("tr")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-pill px-2.5 py-1 text-[11.5px] font-semibold ${p.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.published ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-faint max-md:hidden">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => { setEditPost(p); setModal("edit"); }} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-surface">Düzenle</button>
                      <button onClick={() => { setEditPost(p); setModal("delete"); }} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-light-red hover:bg-red-50">Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <BlogFormModal post={editPost} saving={saving} onSave={handleSave} onClose={() => { setModal(null); setEditPost(null); }} />
      )}

      {modal === "delete" && editPost && (
        <ConfirmModal title="Yazı sil" message={`"${editPost.title}" yazısını silmek istediğine emin misin?`} confirmLabel="Evet, sil" saving={saving} onConfirm={handleDelete} onClose={() => { setModal(null); setEditPost(null); }} />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}

function BlogFormModal({ post, saving, onSave, onClose }: { post: BlogPostItem | null; saving: boolean; onSave: (data: Record<string, string | boolean>) => void; onClose: () => void }) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "rehber");
  const [readTime, setReadTime] = useState(post?.readTime || "5 dk");
  const [published, setPublished] = useState(post?.published ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ title, slug, excerpt, content, category, readTime, published });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="mx-4 w-full max-w-[680px] rounded-[22px] border border-line bg-card p-8 shadow-lg max-h-[90vh] overflow-y-auto">
        <h3 className="mb-5 text-lg font-bold text-ink">{post ? "Yazı düzenle" : "Yeni yazı"}</h3>
        <div className="grid gap-4">
          <Field label="Başlık" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input" placeholder="KYK Yurt Başvurusu Nasıl Yapılır?" />
          </Field>
          <Field label="Slug (URL)">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="admin-input font-mono text-[13px]" placeholder="kyk-yurt-basvurusu-nasil-yapilir" />
          </Field>
          <Field label="Özet">
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="admin-input min-h-[60px] resize-y" placeholder="Kısa açıklama..." />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Kategori">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input">
                <option value="rehber">Rehber</option>
                <option value="haber">Haber</option>
                <option value="ipucu">İpucu</option>
              </select>
            </Field>
            <Field label="Okuma süresi">
              <input value={readTime} onChange={(e) => setReadTime(e.target.value)} className="admin-input" placeholder="5 dk" />
            </Field>
            <Field label="Durum">
              <label className="mt-2 flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-line accent-primary" />
                Yayında
              </label>
            </Field>
          </div>
          <Field label="İçerik (HTML)" required>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="admin-input min-h-[240px] resize-y font-mono text-[13px]" placeholder="<h2>Başlık</h2><p>İçerik...</p>" />
          </Field>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-faint hover:bg-surface">Vazgeç</button>
          <button type="submit" disabled={!title.trim() || !content.trim() || saving} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-40">
            {saving ? "Kaydediliyor..." : post ? "Kaydet" : "Ekle"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── FAQ Manager ──

interface FaqItemData {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  published: boolean;
}

function FaqManager() {
  const [items, setItems] = useState<FaqItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [editItem, setEditItem] = useState<FaqItemData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faq");
      if (res.ok) { const data = await res.json(); setItems(data.items); }
    } catch { /* */ }
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleSave(formData: Record<string, string | number | boolean>) {
    setSaving(true);
    try {
      const url = editItem ? `/api/admin/faq/${editItem.id}` : "/api/admin/faq";
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) { showToast(data.error); setSaving(false); return; }
      setModal(null);
      setEditItem(null);
      showToast(editItem ? "Soru güncellendi" : "Soru eklendi");
      loadItems();
    } catch { showToast("Hata oluştu"); }
    setSaving(false);
  }

  async function handleDelete() {
    if (!editItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faq/${editItem.id}`, { method: "DELETE" });
      if (!res.ok) { showToast("Silinemedi"); setSaving(false); return; }
      setModal(null);
      setEditItem(null);
      showToast("Soru silindi");
      loadItems();
    } catch { showToast("Hata oluştu"); }
    setSaving(false);
  }

  const CATEGORY_LABELS: Record<string, string> = { platform: "Platform", kyk: "KYK", ozel: "Özel" };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] tracking-[-.4px] text-ink">SSS yönetimi</h1>
          <p className="mt-1 text-sm text-faint">{items.length} soru</p>
        </div>
        <button onClick={() => { setEditItem(null); setModal("add"); }} className="gradient-pink rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-glow">
          + Yeni soru
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-faint animate-pulse">Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-onDarkMuted bg-card p-14 text-center">
          <div className="mb-3 text-[40px]">❓</div>
          <div className="text-[19px] font-semibold text-ink">Henüz soru yok</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-xs text-faint">
                <th className="w-12 px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Soru</th>
                <th className="px-4 py-3 font-semibold max-md:hidden">Kategori</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-faint">{item.sortOrder}</td>
                  <td className="max-w-[400px] truncate px-4 py-3 font-semibold text-ink">{item.question}</td>
                  <td className="px-4 py-3 max-md:hidden">
                    <span className="rounded-pill bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-faint">{CATEGORY_LABELS[item.category] || item.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-pill px-2.5 py-1 text-[11.5px] font-semibold ${item.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {item.published ? "Aktif" : "Gizli"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => { setEditItem(item); setModal("edit"); }} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-surface">Düzenle</button>
                      <button onClick={() => { setEditItem(item); setModal("delete"); }} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-light-red hover:bg-red-50">Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <FaqFormModal item={editItem} saving={saving} onSave={handleSave} onClose={() => { setModal(null); setEditItem(null); }} />
      )}

      {modal === "delete" && editItem && (
        <ConfirmModal title="Soru sil" message={`"${editItem.question}" sorusunu silmek istediğine emin misin?`} confirmLabel="Evet, sil" saving={saving} onConfirm={handleDelete} onClose={() => { setModal(null); setEditItem(null); }} />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}

function FaqFormModal({ item, saving, onSave, onClose }: { item: FaqItemData | null; saving: boolean; onSave: (data: Record<string, string | number | boolean>) => void; onClose: () => void }) {
  const [question, setQuestion] = useState(item?.question || "");
  const [answer, setAnswer] = useState(item?.answer || "");
  const [category, setCategory] = useState(item?.category || "platform");
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);
  const [published, setPublished] = useState(item?.published ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ question, answer, category, sortOrder, published });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="mx-4 w-full max-w-[560px] rounded-[22px] border border-line bg-card p-8 shadow-lg max-h-[90vh] overflow-y-auto">
        <h3 className="mb-5 text-lg font-bold text-ink">{item ? "Soru düzenle" : "Yeni soru"}</h3>
        <div className="grid gap-4">
          <Field label="Soru" required>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} className="admin-input" placeholder="KYK yurt başvurusu ne zaman?" />
          </Field>
          <Field label="Cevap" required>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="admin-input min-h-[120px] resize-y" placeholder="Detaylı cevap..." />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Kategori">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input">
                <option value="platform">Platform</option>
                <option value="kyk">KYK</option>
                <option value="ozel">Özel</option>
              </select>
            </Field>
            <Field label="Sıra">
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="admin-input" />
            </Field>
            <Field label="Durum">
              <label className="mt-2 flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-line accent-primary" />
                Aktif
              </label>
            </Field>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-faint hover:bg-surface">Vazgeç</button>
          <button type="submit" disabled={!question.trim() || !answer.trim() || saving} className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-40">
            {saving ? "Kaydediliyor..." : item ? "Kaydet" : "Ekle"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Pending Review Queue (Dashboard) ──

function PendingReviewQueue({ items, setView }: { items: PendingReviewItem[]; setView: (v: AdminView) => void }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-7 py-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[18px] text-ink">Yorum onay kuyruğu</h2>
        <button onClick={() => setView("reviews")} className="text-[13px] font-semibold text-primary">
          Tümü ({items.length}) →
        </button>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-3">
          {items.slice(0, 3).map((r) => {
            const l = LIGHT_META[r.light.toLowerCase()];
            return (
              <div key={r.id} className="rounded-xl border border-line px-[18px] py-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: l?.color ?? "#5a6a66" }} />
                  </span>
                  <span className="font-mono text-xs text-faint">
                    {r.nick} → {r.dormName}
                  </span>
                  <span className="ml-auto text-xs text-faint">{timeAgo(r.createdAt)}</span>
                </div>
                <div className="mb-1 text-[13.5px] font-semibold text-ink">{r.title}</div>
                <p className="text-[13px] leading-relaxed text-body">
                  {r.text.length > 120 ? r.text.slice(0, 117) + "..." : r.text}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-faint">
          Bekleyen yorum yok, hepsi onaylanmış.
        </div>
      )}
    </div>
  );
}

// ── Review Manager ──

interface ReviewItem {
  id: string;
  recordNo: number;
  title: string;
  text: string;
  light: string;
  relation: string;
  period: string | null;
  status: string;
  dormName: string;
  dormCity: string;
  nick: string;
  createdAt: string;
  flags?: { code: string; label: string; detail: string }[];
}

const RELATION_LABELS: Record<string, string> = {
  CURRENT_RESIDENT: "Mevcut sakin",
  FORMER_RESIDENT: "Eski sakin",
  SHORT_STAY: "Kısa konaklama",
  VISITED: "Ziyaret etti",
};

function ReviewManager() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"PENDING" | "APPROVED" | "REMOVED">("PENDING");
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function loadReviews(status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/yorumlar?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.items);
        setPendingCount(data.pendingCount);
      }
    } catch { /* */ }
    setLoading(false);
  }

  useEffect(() => { loadReviews(tab); }, [tab]);

  async function handleAction(reviewId: string, action: "approve" | "reject") {
    setActionLoading(reviewId);
    try {
      const res = await fetch("/api/admin/yorumlar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action }),
      });
      if (res.ok) {
        showToast(action === "approve" ? "Yorum onaylandı" : "Yorum reddedildi");
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setPendingCount((c) => action === "approve" || action === "reject" ? Math.max(0, c - (tab === "PENDING" ? 1 : 0)) : c);
      }
    } catch { showToast("Hata oluştu"); }
    setActionLoading(null);
  }

  const tabs: { key: "PENDING" | "APPROVED" | "REMOVED"; label: string }[] = [
    { key: "PENDING", label: "Bekleyen" },
    { key: "APPROVED", label: "Onaylı" },
    { key: "REMOVED", label: "Kaldırılan" },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">
          Yorum onayı{" "}
          {pendingCount > 0 && (
            <span className="text-[15px] font-normal text-faint">({pendingCount} bekliyor)</span>
          )}
        </h1>
        <p className="mt-1 text-sm text-faint">Kullanıcı yorumları yönetici onayından sonra yayınlanır</p>
      </div>

      <div className="mb-5 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
            style={{
              background: tab === t.key ? "#12312c" : "transparent",
              color: tab === t.key ? "#fff" : "#5a6a66",
              border: tab === t.key ? "none" : "1px solid #d8e0dd",
            }}
          >
            {t.label}
            {t.key === "PENDING" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-pill bg-light-yellow px-2 py-0.5 text-[11px] font-bold text-ink">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-faint animate-pulse">Yükleniyor...</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-onDarkMuted bg-card p-14 text-center">
          <div className="mb-3 text-[40px]">{tab === "PENDING" ? "✅" : tab === "REMOVED" ? "🚫" : "💬"}</div>
          <div className="text-[19px] font-semibold text-ink">
            {tab === "PENDING" ? "Bekleyen yorum yok" : tab === "REMOVED" ? "Kaldırılan yorum yok" : "Onaylı yorum yok"}
          </div>
          {tab === "PENDING" && <div className="mt-1.5 text-sm text-faint">Tüm yorumlar değerlendirilmiş.</div>}
        </div>
      ) : (
        <div className="grid max-w-[900px] gap-3.5">
          {reviews.map((r) => {
            const l = LIGHT_META[r.light.toLowerCase()];
            return (
              <div key={r.id} className="rounded-card border border-line bg-card px-[26px] py-[22px]">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-faint">#{r.recordNo}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: l?.color ?? "#5a6a66" }} />
                    <span className="text-xs font-semibold" style={{ color: l?.color }}>{l?.name}</span>
                  </span>
                  <span className="rounded-pill bg-surface px-2.5 py-[3px] text-[11.5px] font-semibold text-faint">
                    {RELATION_LABELS[r.relation] || r.relation}
                  </span>
                  {r.period && <span className="text-xs text-faint">{r.period}</span>}
                  <span className="ml-auto text-xs text-faint">{timeAgo(r.createdAt)}</span>
                </div>
                <div className="mb-1 text-[13px] text-faint">
                  <span className="font-semibold text-ink">{r.nick}</span> → {r.dormName}, {r.dormCity}
                </div>
                <div className="mb-1 text-[15px] font-semibold text-ink">{r.title}</div>
                <p className="mb-3 text-[14px] leading-relaxed text-body">{r.text}</p>
                {r.flags && r.flags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {r.flags.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-pill bg-[#fbf1db] px-2.5 py-[3px] text-[11.5px] font-semibold text-[#96690f]"
                      >
                        🚩 {f.label}
                        <span className="font-mono font-normal">&ldquo;{f.detail}&rdquo;</span>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {tab === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleAction(r.id, "approve")}
                        disabled={actionLoading === r.id}
                        className="rounded-lg bg-[#e7f6ef] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#177a52] hover:bg-[#d6f0e2] disabled:opacity-50"
                      >
                        {actionLoading === r.id ? "..." : "Onayla"}
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "reject")}
                        disabled={actionLoading === r.id}
                        className="rounded-lg bg-[#fbe7e3] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#b23a28] hover:bg-[#f7d8d2] disabled:opacity-50"
                      >
                        {actionLoading === r.id ? "..." : "Reddet"}
                      </button>
                    </>
                  )}
                  {tab === "APPROVED" && (
                    <button
                      onClick={() => handleAction(r.id, "reject")}
                      disabled={actionLoading === r.id}
                      className="rounded-lg bg-[#fbe7e3] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#b23a28] hover:bg-[#f7d8d2] disabled:opacity-50"
                    >
                      {actionLoading === r.id ? "..." : "Yayından kaldır"}
                    </button>
                  )}
                  {tab === "REMOVED" && (
                    <button
                      onClick={() => handleAction(r.id, "approve")}
                      disabled={actionLoading === r.id}
                      className="rounded-lg bg-[#e7f6ef] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#177a52] hover:bg-[#d6f0e2] disabled:opacity-50"
                    >
                      {actionLoading === r.id ? "..." : "Onayla ve yayınla"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}

// ── Survey Manager ──

interface SurveyItem {
  id: string;
  nick: string;
  dormName: string;
  dormCity: string;
  light: string;
  lightLabel: string;
  comment: string | null;
  period: string | null;
  answers: number[];
  ratio: number | null;
  helpfulCount: number;
  sameCount: number;
  createdAt: string;
}

const SURVEY_TOPICS = [
  "Yemek", "Temizlik", "İnternet", "Giriş-çıkış",
  "Isınma", "Konum", "Yönetim", "Ortam",
];

function SurveyManager() {
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [lightFilter, setLightFilter] = useState("Tümü");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { loadSurveys(); }, []);

  async function loadSurveys() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/anketler");
      if (res.ok) {
        const data = await res.json();
        setSurveys(data.items);
        setTotal(data.total);
      }
    } catch { /* */ }
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/anketler", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId: deleteId }),
      });
      if (res.ok) {
        showToast("Anket silindi");
        setSurveys((prev) => prev.filter((s) => s.id !== deleteId));
        setTotal((t) => t - 1);
      } else {
        showToast("Silinemedi");
      }
    } catch { showToast("Hata oluştu"); }
    setSaving(false);
    setDeleteId(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return surveys.filter(
      (s) =>
        (!q || s.nick.toLocaleLowerCase("tr").includes(q) || s.dormName.toLocaleLowerCase("tr").includes(q) || s.dormCity.toLocaleLowerCase("tr").includes(q)) &&
        (lightFilter === "Tümü" || s.light === lightFilter),
    );
  }, [surveys, query, lightFilter]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">
          Anket yönetimi{" "}
          <span className="text-[15px] font-normal text-faint">({total} anket)</span>
        </h1>
        <p className="mt-1 text-sm text-faint">Doldurulan tüm yurt anketleri</p>
      </div>

      <div className="mb-5 grid grid-cols-[1fr_160px] gap-3 max-md:grid-cols-1">
        <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-inputline bg-card px-4">
          <span className="text-faint">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kullanıcı, yurt adı veya şehir ara..."
            className="flex-1 bg-transparent py-3 text-[15px] text-ink outline-none"
          />
          {query && <button onClick={() => setQuery("")} className="text-faint hover:text-ink">✕</button>}
        </div>
        <select
          value={lightFilter}
          onChange={(e) => setLightFilter(e.target.value)}
          className="rounded-xl border-[1.5px] border-inputline bg-card px-3 py-3 text-sm text-ink outline-none"
        >
          <option value="Tümü">Tüm ışıklar</option>
          <option value="GREEN">Yeşil</option>
          <option value="YELLOW">Sarı</option>
          <option value="ORANGE">Turuncu</option>
          <option value="RED">Kırmızı</option>
          <option value="GRAY">Gri</option>
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-faint animate-pulse">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-onDarkMuted bg-card p-14 text-center">
          <div className="mb-3 text-[40px]">📋</div>
          <div className="text-[19px] font-semibold text-ink">
            {query || lightFilter !== "Tümü" ? "Sonuç bulunamadı" : "Henüz anket yok"}
          </div>
        </div>
      ) : (
        <div className="grid max-w-[960px] gap-3.5">
          {filtered.map((s) => {
            const l = LIGHT_META[s.light.toLowerCase()];
            const isExpanded = expanded === s.id;
            return (
              <div key={s.id} className="rounded-card border border-line bg-card px-[26px] py-[22px]">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: l?.color ?? "#5a6a66" }} />
                    <span className="text-xs font-semibold" style={{ color: l?.color }}>{s.lightLabel}</span>
                  </span>
                  {s.period && (
                    <span className="rounded-pill bg-surface px-2.5 py-[3px] text-[11.5px] font-semibold text-faint">
                      {s.period}
                    </span>
                  )}
                  {s.ratio !== null && (
                    <span className="rounded-pill bg-surface px-2.5 py-[3px] text-[11.5px] font-semibold text-faint">
                      Oran: %{Math.round(s.ratio * 100)}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-faint">{timeAgo(s.createdAt)}</span>
                </div>

                <div className="mb-1 text-[13px] text-faint">
                  <span className="font-semibold text-ink">{s.nick}</span> → {s.dormName}, {s.dormCity}
                </div>

                {s.comment && (
                  <p className="mb-2 rounded-xl bg-surface px-4 py-3 text-[13.5px] leading-relaxed text-body">
                    &ldquo;{s.comment}&rdquo;
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : s.id)}
                    className="rounded-lg bg-surface px-3.5 py-[7px] text-[12.5px] font-semibold text-body hover:bg-surface2"
                  >
                    {isExpanded ? "Cevapları gizle" : "Cevapları göster"}
                  </button>
                  <span className="text-xs text-faint">
                    👍 {s.helpfulCount} · 🤝 {s.sameCount}
                  </span>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    className="ml-auto rounded-lg bg-[#fbe7e3] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#b23a28] hover:bg-[#f7d8d2]"
                  >
                    Sil
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 grid grid-cols-4 gap-2 max-md:grid-cols-2">
                    {SURVEY_TOPICS.map((topic, i) => {
                      const answered = i < s.answers.length;
                      const positive = answered && s.answers[i] === 1;
                      return (
                        <div
                          key={topic}
                          className="rounded-xl px-3 py-2.5 text-center text-[12px] font-semibold"
                          style={{
                            background: !answered ? "#eef1f0" : positive ? "#e7f6ef" : "#fbe7e3",
                            color: !answered ? "#5a6a66" : positive ? "#177a52" : "#b23a28",
                          }}
                        >
                          <div className="mb-0.5 text-[10px] font-normal opacity-70">{topic}</div>
                          {!answered ? "Pas" : positive ? "İyi" : "Kötü"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title="Anket sil"
          message="Bu anketi silmek istediğine emin misin? Yurdun ışığı ve istatistikleri yeniden hesaplanacak."
          confirmLabel="Evet, sil"
          saving={saving}
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
        />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}

// ── Activity View ──

function ActivityView({ activity }: { activity: ActivityItem[] }) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-[26px] tracking-[-.4px] text-ink">
          Son aktivite{" "}
          <span className="text-[15px] font-normal text-faint">({activity.length} kayıt)</span>
        </h1>
        <p className="mt-1 text-sm text-faint">Kayıtlar, anketler ve yorumlar — canlı akış</p>
      </div>
      <div className="grid max-w-[700px] gap-3">
        {activity.map((a, i) => (
          <div key={i} className="flex items-start gap-3.5 rounded-card border border-line bg-card px-5 py-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg"
              style={{
                background: a.type === "survey" ? "#FFF7ED" : a.type === "user" ? "#EFF6FF" : "#F0FDF4",
              }}
            >
              {a.type === "survey" ? "📋" : a.type === "user" ? "👤" : "💬"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px]">
                <span className="font-semibold text-ink">{a.nick}</span>
                <span className="text-faint">
                  {a.type === "survey" ? " anket doldurdu → " : a.type === "user" ? " hesap oluşturdu · " : " yorum yazdı → "}
                </span>
                <span className="text-body">{a.detail}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11.5px] text-faint">{timeAgo(a.createdAt)}</span>
                {a.light && (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: LIGHT_META[a.light.toLowerCase()]?.color }} />
                    <span className="text-[11px]" style={{ color: LIGHT_META[a.light.toLowerCase()]?.color }}>
                      {LIGHT_META[a.light.toLowerCase()]?.name}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {activity.length === 0 && (
          <div className="rounded-2xl border-[1.5px] border-dashed border-onDarkMuted bg-card p-14 text-center">
            <div className="mb-3 text-[40px]">⚡</div>
            <div className="text-[19px] font-semibold text-ink">Henüz aktivite yok</div>
          </div>
        )}
      </div>
    </>
  );
}

// ── User Detail Modal ──

interface UserDetail {
  id: string;
  nick: string;
  emailVerified: boolean;
  frozen: boolean;
  frozenAt: string | null;
  createdAt: string;
  _count: { surveys: number; reviews: number };
  surveys: { id: string; light: string; ratio: number | null; comment: string | null; createdAt: string; dorm: { name: string; city: string } }[];
  reviews: { id: string; title: string; text: string; status: string; light: string; createdAt: string; dorm: { name: string; city: string } }[];
}

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"surveys" | "reviews">("surveys");

  useEffect(() => {
    fetch(`/api/admin/kullanicilar/${userId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUser(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative max-h-[85vh] w-full max-w-[640px] overflow-y-auto rounded-2xl bg-card p-8 shadow-xl mx-4">
        <button onClick={onClose} className="absolute right-4 top-4 text-faint hover:text-ink text-lg">✕</button>

        {loading ? (
          <div className="py-16 text-center text-faint animate-pulse">Yükleniyor...</div>
        ) : !user ? (
          <div className="py-16 text-center text-faint">Kullanıcı bulunamadı</div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {user.nick.charAt(0).toLocaleUpperCase("tr")}
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-ink">{user.nick}</h2>
                  <div className="flex items-center gap-2 text-[12px] text-faint">
                    <span>{formatDate(user.createdAt)}</span>
                    {user.emailVerified ? (
                      <span className="rounded-pill bg-green-100 px-2 py-0.5 text-[10.5px] font-semibold text-green-700">Doğrulanmış</span>
                    ) : (
                      <span className="rounded-pill bg-yellow-100 px-2 py-0.5 text-[10.5px] font-semibold text-yellow-700">Doğrulanmamış</span>
                    )}
                    {user.frozen && (
                      <span className="rounded-pill bg-red-100 px-2 py-0.5 text-[10.5px] font-semibold text-red-700">Dondurulmuş</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-faint">
                <span>{user._count.surveys} anket</span>
                <span>{user._count.reviews} yorum</span>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setTab("surveys")}
                className="rounded-lg px-4 py-2 text-[13px] font-semibold"
                style={{
                  background: tab === "surveys" ? "#12312c" : "#eef1f0",
                  color: tab === "surveys" ? "#fff" : "#5a6a66",
                }}
              >
                Anketler ({user.surveys.length})
              </button>
              <button
                onClick={() => setTab("reviews")}
                className="rounded-lg px-4 py-2 text-[13px] font-semibold"
                style={{
                  background: tab === "reviews" ? "#12312c" : "#eef1f0",
                  color: tab === "reviews" ? "#fff" : "#5a6a66",
                }}
              >
                Yorumlar ({user.reviews.length})
              </button>
            </div>

            {tab === "surveys" ? (
              <div className="grid gap-2.5">
                {user.surveys.length === 0 && <div className="py-6 text-center text-sm text-faint">Henüz anket doldurmamış.</div>}
                {user.surveys.map((s) => {
                  const l = LIGHT_META[s.light.toLowerCase()];
                  return (
                    <div key={s.id} className="rounded-xl border border-line px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-semibold text-ink">{s.dorm.name}</span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ background: l?.color }} />
                          <span className="text-[11px] font-semibold" style={{ color: l?.color }}>{l?.name}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11.5px] text-faint">
                        <span>{s.dorm.city}</span>
                        {s.ratio !== null && <span>· Oran: %{Math.round(s.ratio * 100)}</span>}
                        <span>· {formatDate(s.createdAt)}</span>
                      </div>
                      {s.comment && (
                        <p className="mt-2 text-[12.5px] text-body leading-relaxed">&ldquo;{s.comment}&rdquo;</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-2.5">
                {user.reviews.length === 0 && <div className="py-6 text-center text-sm text-faint">Henüz yorum yazmamış.</div>}
                {user.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-line px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold text-ink">{r.title || r.dorm.name}</span>
                      <span className="rounded-pill px-2 py-0.5 text-[10.5px] font-semibold" style={{
                        background: r.status === "APPROVED" ? "#e7f6ef" : r.status === "PENDING" ? "#FFF7ED" : "#fbe7e3",
                        color: r.status === "APPROVED" ? "#177a52" : r.status === "PENDING" ? "#96690f" : "#b23a28",
                      }}>
                        {r.status === "APPROVED" ? "Onaylı" : r.status === "PENDING" ? "Bekliyor" : "Kaldırıldı"}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-body leading-relaxed">
                      {r.text.length > 150 ? r.text.slice(0, 147) + "..." : r.text}
                    </p>
                    <div className="mt-1.5 text-[11px] text-faint">{r.dorm.name}, {r.dorm.city} · {formatDate(r.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
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
          Onayla
        </button>
        <button onClick={() => resolve(q.id)} className="rounded-lg bg-[#fbe7e3] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#b23a28] hover:bg-[#f7d8d2]">
          Kaldır
        </button>
      </div>
    </div>
  );
}
