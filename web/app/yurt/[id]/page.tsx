import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShareButtons } from "@/components/ShareButtons";
import { DormReviews } from "@/components/DormReviews";
import { DormSurveyNudge } from "@/components/DormSurveyNudge";
import { AdSlot } from "@/components/AdSlot";
import { LIGHTS, lightFromRatio, type LightKey } from "@/lib/lights";
import { prisma } from "@/lib/prisma";
import type { ProfileReview } from "@/lib/directory";

interface ReviewForSchema {
  text: string;
  light: string;
  nick: string;
  date: string;
}

interface DormData {
  id: string;
  name: string;
  initial: string;
  type: string;
  gender: string;
  city: string;
  district: string | null;
  nearCampus: string | null;
  website: string | null;
  mapsUrl: string | null;
  light: LightKey;
  surveyCount: number;
  reviewCount: number;
  distribution: { name: string; dot: string; w: string; count: number }[];
  quickFacts: { k: string; v: string; tone: LightKey }[];
  trend: string;
  ageNote: string;
  seoDescription: string;
  schemaReviews: ReviewForSchema[];
  fallbackReviews: ProfileReview[];
  totalReviewCount: number;
}

const TYPE_LABELS: Record<string, string> = { KYK: "KYK", PRIVATE: "Özel", APART: "Apart" };
const GENDER_LABELS: Record<string, string> = { MALE: "Erkek", FEMALE: "Kız", MIXED: "Karma" };

const SSR_EMOJIS = ["🦔", "🦉", "🦩", "🐧", "🦊", "🐻", "🦁", "🐸", "🐙", "🦄"];
const SSR_COLORS = ["#e8f3f0", "#fdf3e4", "#fcebe8", "#e8edf3", "#f3e8f1", "#e8f3e8"];
const LIGHT_LABELS: Record<string, string> = {
  GREEN: "Tavsiye ediyor", YELLOW: "Ortalama buluyor",
  ORANGE: "Dikkatli ol diyor", RED: "Uzak dur diyor", GRAY: "Anket doldurdu",
};
const LIGHT_FALLBACK: Record<string, string> = {
  GREEN: "Bu yurdu tavsiye ediyor.", YELLOW: "Bu yurdu ortalama buluyor.",
  ORANGE: "Bu yurt için dikkatli ol diyor.", RED: "Bu yurttan uzak dur diyor.",
  GRAY: "Anket doldurdu.",
};
const RELATION_LABELS: Record<string, string> = {
  CURRENT_RESIDENT: "Şu an kalıyor", FORMER_RESIDENT: "Eskiden kaldı",
  SHORT_STAY: "Kısa süre kaldı", VISITED: "Gezip gördü",
};

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "dün";
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} hafta önce`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;
  return `${Math.floor(months / 12)} yıl önce`;
}

async function getDormData(id: string): Promise<DormData | null> {
  const dorm = await prisma.dorm.findUnique({
    where: { id },
    include: {
      _count: { select: { surveys: true, reviews: true } },
      surveys: {
        select: { id: true, light: true, ratio: true, comment: true, helpfulCount: true, sameCount: true, createdAt: true, user: { select: { nick: true } } },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, text: true, title: true, light: true, relation: true, helpfulCount: true, sameCount: true, createdAt: true, user: { select: { nick: true } } },
      },
    },
  });

  if (!dorm) return null;

  const lightCounts: Record<string, number> = { GREEN: 0, YELLOW: 0, ORANGE: 0, RED: 0, GRAY: 0 };
  for (const s of dorm.surveys) {
    lightCounts[s.light] = (lightCounts[s.light] || 0) + 1;
  }
  const total = dorm._count.surveys;

  const validRatios = dorm.surveys.filter((s) => s.ratio !== null).map((s) => s.ratio!);
  const avgRatio = validRatios.length > 0
    ? validRatios.reduce((a, b) => a + b, 0) / validRatios.length
    : null;
  const computedLight = lightFromRatio(avgRatio);

  const distData = [
    { name: "Tavsiye edilir", key: "GREEN", dot: "#2eb586" },
    { name: "Ortalama", key: "YELLOW", dot: "#e8b93c" },
    { name: "Dikkatli ol", key: "ORANGE", dot: "#eb8a4a" },
    { name: "Uzak dur", key: "RED", dot: "#e05d4b" },
    { name: "Pas geçti", key: "GRAY", dot: "#b9c9c4" },
  ];

  const distribution = distData.map((d) => {
    const count = lightCounts[d.key] || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { name: d.name, dot: d.dot, w: `${pct}%`, count };
  });

  const typeLabel = TYPE_LABELS[dorm.type] || dorm.type;
  const genderLabel = GENDER_LABELS[dorm.gender] || dorm.gender;

  const location = `${dorm.city}${dorm.district ? " " + dorm.district : ""}`;
  const campusPart = dorm.nearCampus ? ` ${dorm.nearCampus} kampüsüne yakın konumda bulunan` : "";
  const typeFull = dorm.type === "KYK" ? "devlet (KYK)" : dorm.type === "PRIVATE" ? "özel" : "apart";
  const seoDescription = total > 0
    ? `${dorm.name}, ${location} ilinde${campusPart} ${genderLabel.toLowerCase()} ${typeFull} yurttur. ${total} anonim öğrenci değerlendirmesine göre yemek, temizlik, internet, güvenlik ve sosyal ortam hakkında gerçek deneyimleri burada bulabilirsiniz.`
    : `${dorm.name}, ${location} ilinde${campusPart} ${genderLabel.toLowerCase()} ${typeFull} yurttur. Yemek kalitesi, oda temizliği, internet hızı, giriş-çıkış saatleri ve genel yaşam koşulları hakkında henüz bir değerlendirme yapılmamıştır. Bu yurtta kaldıysanız deneyiminizi anonim olarak paylaşarak diğer öğrencilere yardımcı olabilirsiniz.`;

  return {
    id: dorm.id,
    name: dorm.name,
    initial: dorm.name.charAt(0).toLocaleUpperCase("tr"),
    type: typeLabel,
    gender: genderLabel,
    city: dorm.city,
    district: dorm.district,
    nearCampus: dorm.nearCampus,
    website: dorm.website,
    mapsUrl: dorm.mapsUrl,
    light: computedLight,
    surveyCount: total,
    reviewCount: dorm._count.reviews,
    distribution,
    quickFacts: [
      { k: "Yurt tipi", v: typeLabel, tone: (dorm.type === "KYK" ? "green" : "yellow") as LightKey },
      { k: "Şehir", v: dorm.city, tone: "green" as LightKey },
      { k: "İlçe", v: dorm.district || "—", tone: "yellow" as LightKey },
      { k: "Cinsiyet", v: genderLabel, tone: "yellow" as LightKey },
    ],
    trend: total >= 3 ? (avgRatio !== null && avgRatio >= 0.7 ? "Yükselen" : avgRatio !== null && avgRatio < 0.4 ? "Düşen" : "Sabit") : "Henüz veri yok",
    ageNote: `${dorm.city}${dorm.district ? ", " + dorm.district : ""} · ${genderLabel} yurt`,
    seoDescription,
    schemaReviews: [
      ...dorm.reviews.map((r) => ({
        text: r.text,
        light: r.light,
        nick: r.user.nick,
        date: r.createdAt.toISOString().split("T")[0],
      })),
      ...dorm.surveys
        .filter((s) => s.comment)
        .slice(0, 10)
        .map((s) => ({
          text: s.comment!,
          light: s.light,
          nick: s.user.nick,
          date: s.createdAt.toISOString().split("T")[0],
        })),
    ].slice(0, 10),
    fallbackReviews: (() => {
      const reviewItems: ProfileReview[] = dorm.reviews.map((r) => ({
        id: r.id,
        author: r.user.nick,
        emoji: "",
        avBg: "",
        role: RELATION_LABELS[r.relation] || r.relation,
        when: formatTimeAgo(r.createdAt),
        light: r.light.toLowerCase() as LightKey,
        up: r.helpfulCount,
        same: r.sameCount,
        text: r.text,
        type: "review" as const,
        voted: false,
        agreed: false,
      }));
      const surveyItems: ProfileReview[] = dorm.surveys.map((s) => ({
        id: s.id,
        author: s.user.nick,
        emoji: "",
        avBg: "",
        role: LIGHT_LABELS[s.light] || "Anket doldurdu",
        when: formatTimeAgo(s.createdAt),
        light: s.light.toLowerCase() as LightKey,
        up: s.helpfulCount,
        same: s.sameCount,
        text: s.comment || LIGHT_FALLBACK[s.light] || "Anket doldurdu.",
        type: "survey" as const,
        voted: false,
        agreed: false,
      }));
      const all = [...reviewItems, ...surveyItems]
        .sort((a, b) => 0)
        .slice(0, 10);
      all.forEach((item, i) => {
        item.emoji = SSR_EMOJIS[i % SSR_EMOJIS.length];
        item.avBg = SSR_COLORS[i % SSR_COLORS.length];
      });
      return all;
    })(),
    totalReviewCount: dorm._count.reviews + dorm._count.surveys,
  };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const c = await getDormData(params.id);
  if (!c) return { title: "Yurt bulunamadı" };

  const title = `${c.name} Değerlendirme — ${c.city} ${c.type} Yurt Yorumları`;
  const description = c.surveyCount > 0
    ? `${c.name} hakkında ${c.surveyCount} anonim öğrenci yorumu. ${c.type} · ${c.city}${c.district ? " " + c.district : ""}. Yemek, temizlik, internet, giriş saati ve daha fazlası.`
    : `${c.name} — ${c.city}${c.district ? " " + c.district : ""} ${c.type} yurt hakkında öğrenci deneyimleri. Yemek kalitesi, oda temizliği, internet hızı, güvenlik değerlendirmeleri.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.ortamnasil.com/yurt/${params.id}` },
    openGraph: { title, description, type: "article", url: `https://www.ortamnasil.com/yurt/${params.id}` },
    ...(c.surveyCount === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function DormPage({ params }: { params: { id: string } }) {
  const c = await getDormData(params.id);
  if (!c) notFound();

  const light = LIGHTS[c.light];

  const lightToRating = (l: string) =>
    l === "GREEN" ? 5 : l === "YELLOW" ? 3.5 : l === "ORANGE" ? 2.5 : l === "RED" ? 1 : 3;

  const dormJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: c.name,
    description: `${c.name} — ${c.type} · ${c.city}`,
    address: { "@type": "PostalAddress", addressLocality: c.city, addressRegion: c.city, addressCountry: "TR" },
    url: `https://www.ortamnasil.com/yurt/${params.id}`,
    ...(c.website && { sameAs: c.website }),
    aggregateRating: c.surveyCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: c.light === "green" ? "4.5" : c.light === "yellow" ? "3.5" : c.light === "orange" ? "2.5" : c.light === "red" ? "1.5" : "3",
      bestRating: "5",
      worstRating: "1",
      ratingCount: String(c.surveyCount),
    } : undefined,
    review: c.schemaReviews.length > 0 ? c.schemaReviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.nick },
      datePublished: r.date,
      reviewBody: r.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(lightToRating(r.light)),
        bestRating: "5",
        worstRating: "1",
      },
    })) : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://www.ortamnasil.com" },
      { "@type": "ListItem", position: 2, name: "Yurtlar", item: "https://www.ortamnasil.com/yurtlar" },
      { "@type": "ListItem", position: 3, name: c.name, item: `https://www.ortamnasil.com/yurt/${params.id}` },
    ],
  };

  return (
    <div className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dormJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[1100px] px-8 pb-20 pt-10 max-md:px-5">
        {/* Breadcrumb */}
        <div className="mb-6 text-[13.5px] text-faint">
          <Link href="/yurtlar">Yurtlar</Link> / {c.type} /{" "}
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
                <div className="text-[14.5px] text-faint">
                  {c.type} · {c.city}{c.district ? ` · ${c.district}` : ""} · {c.gender} · {c.surveyCount} anket
                </div>
                <p className="mt-2.5 max-w-[540px] text-[13.5px] leading-relaxed text-muted">
                  {c.seoDescription}
                </p>
                {c.website && (
                  <div className="mt-3.5">
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-card px-3.5 py-1.5 text-[13px] text-primary hover:border-primary/30"
                    >
                      🌐 Website
                    </a>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <a
                    href={c.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(c.name + " " + c.city + (c.district ? " " + c.district : ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-card px-3.5 py-1.5 text-[13px] text-primary hover:border-primary/30"
                  >
                    📍 Konum
                  </a>
                  <ShareButtons
                    url={`https://www.ortamnasil.com/yurt/${params.id}`}
                    title={c.name}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {c.surveyCount === 0 ? (
              // Veri yokken gri ışık çıkmaz sokak gibi duruyor; bunun yerine
              // sayfaya gelen kişiyi ilk anlatan olmaya çağırıyoruz.
              <div className="flex flex-col justify-center rounded-[22px] bg-ink p-7 text-center text-white">
                <div className="mb-3.5 font-mono text-[11.5px] tracking-wider text-primary-light">
                  BU YURT HENÜZ SESSİZ
                </div>
                <div className="mb-3 text-[40px]">🔦</div>
                <div className="text-[22px] font-bold leading-tight">
                  Işığı ilk sen yak
                </div>
                <p className="mx-auto mb-5 mt-2 max-w-[260px] text-[13px] leading-relaxed text-onDarkMuted">
                  Burada kaldıysan 8 soruyu cevapla — bu yurdu araştıran bir
                  sonraki öğrenci senin sayende körlemesine seçmesin.
                </p>
                <Link
                  href={`/anket?dorm=${params.id}`}
                  className="gradient-pink mx-auto rounded-xl px-6 py-3 text-[14.5px] font-bold text-white shadow-glow transition-transform hover:scale-105"
                >
                  Değerlendir → 30 sn
                </Link>
              </div>
            ) : (
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
                  {c.surveyCount} anonim öğrenci onaylıyor. {light.sub}.
                </div>
              </div>
            )}

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

        <DormSurveyNudge dormId={params.id} />

        <div className="grid grid-cols-[1fr_340px] items-start gap-5 max-lg:grid-cols-1">
          <div>
            {/* IŞIK DAĞILIMI */}
            <div className="mb-5 rounded-[22px] border border-line bg-card px-8 py-7">
              <h2 className="mb-5 text-[19px] font-bold text-ink">
                Değerlendirmeler{" "}
                <span className="text-[13px] font-normal text-faint">
                  — {c.surveyCount} anket sonucu
                </span>
              </h2>
              {c.surveyCount > 0 ? (
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
              ) : (
                <div className="rounded-2xl border-[1.5px] border-dashed border-line px-6 py-8 text-center">
                  <div className="mb-2 text-[15px] font-semibold text-ink">
                    Bu yurdu henüz kimse anlatmadı
                  </div>
                  <p className="mx-auto mb-4 max-w-[340px] text-[13.5px] leading-relaxed text-faint">
                    Kaldıysan sen anlat: yemek, internet, giriş saati, ısınma.
                    8 soru, yaklaşık 30 saniye, tamamen anonim.
                  </p>
                  <Link
                    href={`/anket?dorm=${params.id}`}
                    className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-[14px] font-bold text-white transition-transform hover:scale-105"
                  >
                    İlk değerlendirmeyi yap →
                  </Link>
                </div>
              )}
              <div className="mt-4 border-t border-dashed border-line pt-3.5 text-[13px] text-faint">
                Trend: <strong className="text-body">{c.trend}</strong>
              </div>
            </div>

            <AdSlot slot="7650614059" format="fluid" layout="in-article" className="mb-5 rounded-[22px] border border-line bg-card p-4" />

            {/* İTİRAFLAR / YORUMLAR */}
            <DormReviews
              dormId={c.id}
              fallbackReviews={c.fallbackReviews}
              totalCount={c.totalReviewCount}
            />

            <AdSlot slot="1711891665" format="fluid" layout="in-article" className="mt-5 rounded-[22px] border border-line bg-card p-4" />
          </div>

          {/* SAĞ SÜTUN */}
          <div className="grid gap-5">
            <div className="rounded-[22px] border-2 border-dashed border-primary/30 bg-surface p-6 text-center">
              <div className="mb-1.5 text-[15px] font-bold text-ink">Burada kaldın mı?</div>
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
          </div>
        </div>

        {/* İLGİLİ İÇERİKLER — SEO & ADS LANDING */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <Link
            href={`/sehir/${encodeURIComponent(c.city.toLocaleLowerCase("tr").replace(/\s+/g, "-"))}`}
            className="group rounded-[18px] border border-line bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md"
          >
            <div className="mb-2 text-[13px] font-bold uppercase tracking-wider text-faint">
              Şehir sayfası
            </div>
            <div className="text-[16px] font-semibold text-ink group-hover:text-primary transition-colors">
              {c.city} tüm yurtları gör →
            </div>
            <p className="mt-1 text-[13px] text-muted">
              {c.city} şehrindeki KYK ve özel yurtları karşılaştır.
            </p>
          </Link>
          <Link
            href="/blog"
            className="group rounded-[18px] border border-line bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md"
          >
            <div className="mb-2 text-[13px] font-bold uppercase tracking-wider text-faint">
              Yurt rehberi
            </div>
            <div className="text-[16px] font-semibold text-ink group-hover:text-primary transition-colors">
              Yurt hayatı ipuçları →
            </div>
            <p className="mt-1 text-[13px] text-muted">
              KYK başvuru, yurt seçimi, oda arkadaşı rehberleri.
            </p>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
