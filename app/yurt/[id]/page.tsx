import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DormReviews } from "@/components/DormReviews";
import { getDormProfile } from "@/lib/directory";
import { LIGHTS } from "@/lib/lights";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const c = getDormProfile(params.id);
  const title = `${c.name} — Yurt Değerlendirme`;
  const description = `${c.name} hakkında anonim öğrenci yorumları. ${c.meta}. Yemek, temizlik, internet, giriş saati ve daha fazlası.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.ortamnasil.com/yurt/${params.id}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://www.ortamnasil.com/yurt/${params.id}`,
    },
  };
}

export default function DormPage({ params }: { params: { id: string } }) {
  const c = getDormProfile(params.id);
  const light = LIGHTS[c.light];

  const dormJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: c.name,
    description: `${c.name} — ${c.meta}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: c.quickFacts.find((f) => f.k === "Şehir")?.v,
      addressCountry: "TR",
    },
    url: `https://www.ortamnasil.com/yurt/${params.id}`,
  };

  return (
    <div className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dormJsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[1100px] px-8 pb-20 pt-10 max-md:px-5">
        {/* Breadcrumb */}
        <div className="mb-6 text-[13.5px] text-faint">
          <Link href="/yurtlar">Yurtlar</Link> / {c.sector} /{" "}
          <span className="text-ink">{c.name}</span>
        </div>

        {/* BAŞLIK + SKOR */}
        <div className="mb-5 grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1">
          <div className="rounded-[22px] border border-line bg-card p-8">
            <div className="flex items-start gap-5">
              <div className="gradient-pink grid h-[72px] w-[72px] place-items-center rounded-2xl text-[30px] font-bold text-white">
                {c.initial}
              </div>
              <div className="flex-1">
                <h1 className="mb-1.5 text-[30px] font-bold tracking-[-.5px] text-ink">{c.name}</h1>
                <div className="text-[14.5px] text-faint">{c.meta}</div>
                <div className="mt-3.5 flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-card px-3.5 py-1.5 text-[13px] text-primary">
                    🌐 {c.website}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-card px-3.5 py-1.5 text-[13px] text-primary">
                    📍 {c.linkedin}
                  </span>
                </div>
                <div className="mt-2.5 font-mono text-[12.5px] text-faint">
                  kayıt {c.recordNo} · KurdeleKesen: {c.creatorNick} ✂️
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="flex flex-col justify-center rounded-[22px] bg-ink p-7 text-center text-white">
              <div className="mb-3.5 font-mono text-[11.5px] tracking-wider text-primary-light">
                ORTAM SKORU
              </div>
              <div className="mb-4 flex justify-center gap-2.5">
                {(["red", "orange", "yellow"] as const).map((k) => (
                  <span
                    key={k}
                    className="h-[18px] w-[18px] rounded-full"
                    style={{ background: `${LIGHTS[k].dot}40` }}
                  />
                ))}
                <span
                  className="h-[18px] w-[18px] rounded-full animate-blink"
                  style={{ background: light.dot, boxShadow: `0 0 18px ${light.dot}` }}
                />
              </div>
              <div className="text-[26px] font-bold" style={{ color: light.dotBright }}>
                {light.label}
              </div>
              <div className="mt-1.5 text-[13px] text-onDarkMuted">
                {c.reviewCount} anonim öğrenci onaylıyor. {light.sub}.
              </div>
            </div>

            <div className="rounded-[22px] border border-line bg-card p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-[13px] font-semibold text-faint">Google yorumları</span>
              </div>
              <p className="mb-4 text-[13px] leading-snug text-muted">
                Bu yurt hakkında Google Maps&apos;teki yorumları incele.
              </p>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(c.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-[14px] font-semibold text-ink transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <span>Google&apos;da yorumları gör</span>
                <span className="text-faint">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_340px] items-start gap-5 max-lg:grid-cols-1">
          <div>
            {/* KATEGORİ KIRILIMI */}
            <div className="mb-5 rounded-[22px] border border-line bg-card px-8 py-7">
              <h2 className="mb-5 text-[19px] font-bold text-ink">Kategori kırılımı</h2>
              {c.categories.length > 0 ? (
                <div className="grid gap-4">
                  {c.categories.map((k) => {
                    const kl = LIGHTS[k.light];
                    return (
                      <div
                        key={k.name}
                        className="grid grid-cols-[180px_1fr_130px] items-center gap-4 max-md:grid-cols-[110px_1fr]"
                      >
                        <div className="text-[14.5px] text-body">{k.name}</div>
                        <div className="h-2.5 overflow-hidden rounded-pill bg-surface">
                          <div
                            className="h-full rounded-pill"
                            style={{ background: kl.dot, width: k.w }}
                          />
                        </div>
                        <div
                          className="text-right text-[12.5px] font-semibold max-md:col-span-2 max-md:text-left"
                          style={{ color: kl.badgeFg }}
                        >
                          {k.verdict}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-faint">
                  Henüz yeterli değerlendirme yok. İlk anketi sen doldur!
                </div>
              )}
              <div className="mt-5 border-t border-dashed border-line pt-4 text-[13px] text-faint">
                {c.ageNote}
              </div>
            </div>

            {/* IŞIK DAĞILIMI */}
            <div className="mb-5 rounded-[22px] border border-line bg-card px-8 py-7">
              <h2 className="mb-5 text-[19px] font-bold text-ink">
                Işık dağılımı{" "}
                <span className="text-[13px] font-normal text-faint">
                  — {c.reviewCount} anket sonucu
                </span>
              </h2>
              <div className="grid gap-3">
                {c.distribution.map((d) => (
                  <div
                    key={d.name}
                    className="grid grid-cols-[150px_1fr_44px] items-center gap-3.5 max-md:grid-cols-[110px_1fr_36px]"
                  >
                    <div className="flex items-center gap-2 text-[13.5px] text-body">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: d.dot }} />
                      {d.name}
                    </div>
                    <div className="h-[22px] overflow-hidden rounded-md bg-surface">
                      <div className="h-full rounded-md" style={{ background: d.dot, width: d.w }} />
                    </div>
                    <div className="text-right font-mono text-[12.5px] text-faint">{d.count}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-dashed border-line pt-3.5 text-[13px] text-faint">
                Trend: <strong className="text-body">{c.trend}</strong>
              </div>
            </div>

            {/* İTİRAFLAR */}
            <DormReviews
              dormId={c.id}
              fallbackReviews={c.reviews}
              totalCount={c.reviewCount}
            />
          </div>

          {/* SAĞ SÜTUN */}
          <div className="grid gap-5">
            <div className="rounded-[22px] border-2 border-dashed border-primary/30 bg-surface p-6 text-center">
              <div className="mb-1.5 text-[15px] font-bold text-ink">Burada kaldın mı? 🤔</div>
              <p className="mb-4 text-[13.5px] leading-snug text-muted">
                3 dakikalık anket. Yurt yönetimi asla bilmeyecek.
              </p>
              <Link
                href={`/anket?dorm=${c.id}`}
                className="gradient-pink block rounded-xl py-3.5 text-[15px] font-bold text-white shadow-glow transition-transform hover:scale-105"
              >
                Anonim değerlendir
              </Link>
            </div>
            <div className="rounded-[22px] border border-line bg-card p-6">
              <div className="mb-3.5 font-mono text-[11.5px] tracking-wider text-faint">
                HIZLI BİLGİLER
              </div>
              <div className="grid gap-3 text-sm">
                {c.quickFacts.map((f) => (
                  <div key={f.k} className="flex justify-between">
                    <span className="text-faint">{f.k}</span>
                    <span className="font-semibold" style={{ color: LIGHTS[f.tone].badgeFg }}>
                      {f.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] bg-surface2 p-5 text-[13px] leading-relaxed text-muted">
              <strong className="text-ink">Benzer ışıklılar:</strong>{" "}
              <Link href="/yurt/marmara-kyk-yurdu">Marmara KYK Yurdu</Link>,{" "}
              <Link href="/yurt/ege-kyk-yurdu">Ege KYK Yurdu</Link>,{" "}
              <Link href="/yurt/campus-suit-apart">Campus Suit Apart</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
