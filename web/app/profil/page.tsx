"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LIGHTS, type LightKey } from "@/lib/lights";

interface Badge {
  slug: string;
  label: string;
  emoji: string;
  count: number;
}

interface ReviewItem {
  id: string;
  dormName: string;
  dormId: string;
  light: LightKey;
  createdAt: string;
  helpfulCount: number;
}

interface ProfileData {
  nick: string;
  badges: Badge[];
  stats: {
    reviews: number;
    surveys: number;
    dormsAdded: number;
    totalHelpful: number;
    redLights: number;
  };
  reviews: ReviewItem[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} hafta önce`;
  const months = Math.floor(days / 30);
  return `${months} ay önce`;
}

export default function ProfilPage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profil")
      .then((r) => {
        if (r.status === 401) {
          router.push("/giris");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
        setLoading(false);
      })
      .catch(() => {
        router.push("/giris");
      });
  }, [router]);

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-faint">Yükleniyor...</div>
      </div>
    );
  }

  const statCards = [
    { value: data.stats.reviews, label: "itiraf", highlight: false },
    { value: data.stats.dormsAdded, label: "eklenen yurt", highlight: false },
    { value: data.stats.totalHelpful, label: '"faydalı" oyu', highlight: false },
    { value: data.stats.redLights, label: "kırmızı ışık yakıldı", highlight: true },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-16 py-4 backdrop-blur-md max-md:px-5">
        <Logo />
        <nav className="flex items-center gap-6 text-[15px]">
          <Link href="/yurtlar" className="text-body hover:text-primary max-md:hidden">Yurtlar</Link>
          <Link href="/anket" className="gradient-pink rounded-pill px-6 py-2.5 font-semibold text-white shadow-glow transition-transform hover:scale-105">
            Yorum yaz
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-[900px] px-8 pb-20 pt-12 max-md:px-5">
        <div className="mb-5 flex items-center gap-7 rounded-[22px] bg-ink px-10 py-9 text-white max-md:flex-col max-md:px-6 max-md:text-center">
          <div className="grid h-[88px] w-[88px] flex-shrink-0 place-items-center rounded-full bg-white/[.08] text-[42px]">
            🥸
          </div>
          <div className="flex-1">
            <div className="mb-2 font-mono text-[11.5px] tracking-widest text-primary-light">
              ANONİM KİMLİK KARTI — GERÇEK İSİM: BİZDE BİLE YOK
            </div>
            <h1 className="mb-2 text-[30px] font-bold tracking-[-.5px]">{data.nick}</h1>
            <div className="flex flex-wrap gap-2 max-md:justify-center">
              {data.badges.map((b) => (
                <span
                  key={b.slug}
                  className="rounded-pill bg-primary/20 px-3 py-[5px] text-[12.5px] font-semibold text-primary-light"
                >
                  {b.emoji} {b.label}{b.count > 1 ? ` ×${b.count}` : ""}
                </span>
              ))}
              {data.stats.reviews > 0 && (
                <span className="rounded-pill bg-white/[.08] px-3 py-[5px] text-[12.5px] font-semibold text-onDarkMuted">
                  ✍️ {data.stats.reviews} itiraf
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-card border border-line bg-card p-5 text-center transition-all hover:shadow-sm">
              <div
                className="text-[28px] font-bold"
                style={{ color: s.highlight ? "#F97316" : "#1C1917" }}
              >
                {s.value}
              </div>
              <div className="text-[13px] text-faint">{s.label}</div>
            </div>
          ))}
        </div>

        {data.reviews.length > 0 ? (
          <>
            <h2 className="mb-4 text-xl font-bold text-ink">İtirafların 📝</h2>
            <div className="grid gap-3.5">
              {data.reviews.map((m) => {
                const l = LIGHTS[m.light];
                return (
                  <div key={m.id} className="flex items-center gap-[18px] rounded-card border border-line bg-card px-6 py-[22px] transition-all hover:border-primary/20 hover:shadow-sm max-md:flex-wrap">
                    <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: l.dot }} />
                    <div className="flex-1">
                      <div className="text-[15.5px] font-semibold text-ink">
                        <Link href={`/yurt/${m.dormId}`} className="hover:text-primary">
                          {m.dormName}
                        </Link>
                        {" — "}
                        <span style={{ color: l.badgeFg }}>{l.label}</span>
                      </div>
                      <div className="mt-[3px] text-[13.5px] text-faint">
                        {timeAgo(m.createdAt)} · {m.helpfulCount} faydalı oyu
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-card border-2 border-dashed border-line bg-surface p-10 text-center">
            <div className="mb-2 text-[32px]">🫥</div>
            <div className="mb-1 text-[16px] font-semibold text-ink">Henüz itiraf yazmadın</div>
            <p className="mb-4 text-[14px] text-muted">
              Kaldığın yurdu değerlendir, diğer öğrencilere yol göster.
            </p>
            <Link
              href="/anket"
              className="gradient-pink inline-block rounded-xl px-6 py-3 text-[14px] font-bold text-white shadow-glow transition-transform hover:scale-105"
            >
              İlk değerlendirmeni yap
            </Link>
          </div>
        )}

        <div className="mt-8 rounded-card bg-surface2 px-6 py-5 text-[13.5px] leading-relaxed text-muted">
          🔒 <strong className="text-ink">Anonimlik sözümüz:</strong> E-postan tek yönlü
          şifrelenir, IP kaydı tutulmaz, yorumların takma adınla bile eşleştirilemez
          şekilde saklanır. Yurt yönetimi arasa da verecek bir şeyimiz yok.
        </div>
      </div>
    </div>
  );
}
