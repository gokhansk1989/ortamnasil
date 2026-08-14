import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { LIGHTS, lightFromRatio, type LightKey } from "@/lib/lights";

const TYPE_LABELS: Record<string, string> = { KYK: "KYK", PRIVATE: "Özel", APART: "Apart" };
const GENDER_LABELS: Record<string, string> = { MALE: "Erkek", FEMALE: "Kız", MIXED: "Karma" };

function cityFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/(^|\s)\S/g, (c) => c.toLocaleUpperCase("tr"));
}

async function getCityData(slug: string) {
  const cityName = cityFromSlug(slug);

  const dorms = await prisma.dorm.findMany({
    where: { city: { equals: cityName, mode: "insensitive" } },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { surveys: true, reviews: true } },
      surveys: { select: { ratio: true } },
    },
  });

  if (dorms.length === 0) return null;

  const actualCity = dorms[0].city;

  const rows = dorms.map((d) => {
    const total = d._count.surveys + d._count.reviews;
    const validRatios = d.surveys.filter((s) => s.ratio !== null).map((s) => s.ratio!);
    const avgRatio = validRatios.length > 0
      ? validRatios.reduce((a, b) => a + b, 0) / validRatios.length
      : null;
    const light = lightFromRatio(avgRatio) as LightKey;
    return {
      id: d.id,
      name: d.name,
      type: d.type,
      typeLabel: TYPE_LABELS[d.type] || d.type,
      gender: GENDER_LABELS[d.gender] || d.gender,
      district: d.district,
      light,
      total,
    };
  });

  const kykCount = rows.filter((r) => r.type === "KYK").length;
  const ozelCount = rows.filter((r) => r.type === "PRIVATE" || r.type === "APART").length;
  const totalSurveys = rows.reduce((s, r) => s + r.total, 0);
  const topDorms = [...rows].sort((a, b) => b.total - a.total).slice(0, 3);

  const relatedBlogs = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: { slug: true, title: true, excerpt: true, readTime: true, category: true },
  });

  const kykDorms = rows.filter((r) => r.type === "KYK");
  const ozelDorms = rows.filter((r) => r.type === "PRIVATE" || r.type === "APART");
  const kykWithReviews = kykDorms.filter((r) => r.total > 0);
  const ozelWithReviews = ozelDorms.filter((r) => r.total > 0);

  return { city: actualCity, dorms: rows, kykCount, ozelCount, totalSurveys, topDorms, relatedBlogs, kykWithReviews: kykWithReviews.length, ozelWithReviews: ozelWithReviews.length };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getCityData(params.slug);
  if (!data) return { title: "Şehir bulunamadı" };

  const title = `${data.city} Yurtları — KYK ve Özel Yurt Değerlendirmeleri`;
  const description = `${data.city} şehrindeki ${data.dorms.length} yurdun anonim öğrenci değerlendirmeleri. ${data.kykCount} KYK, ${data.ozelCount} özel yurt. Ortam skorları, yemek, internet, temizlik yorumları.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.ortamnasil.com/sehir/${params.slug}` },
    openGraph: {
      title,
      description,
      url: `https://www.ortamnasil.com/sehir/${params.slug}`,
    },
    ...(data.totalSurveys === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function CityPage({ params }: { params: { slug: string } }) {
  const data = await getCityData(params.slug);
  if (!data) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://www.ortamnasil.com" },
      { "@type": "ListItem", position: 2, name: "Yurtlar", item: "https://www.ortamnasil.com/yurtlar" },
      { "@type": "ListItem", position: 3, name: `${data.city} Yurtları`, item: `https://www.ortamnasil.com/sehir/${params.slug}` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${data.city} Öğrenci Yurtları`,
    numberOfItems: data.dorms.length,
    itemListElement: data.dorms.slice(0, 20).map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.name,
      url: `https://www.ortamnasil.com/yurt/${d.id}`,
    })),
  };

  const cityFaqs = [
    { q: `${data.city} KYK yurtları nasıl?`, a: `${data.city} şehrinde ${data.kykCount} adet KYK yurdu bulunmaktadır. Yurtların kalitesi değişkenlik göstermektedir; detaylı öğrenci değerlendirmeleri için yurt sayfalarını inceleyebilirsiniz.` },
    { q: `${data.city} özel yurt fiyatları ne kadar?`, a: `${data.city} şehrinde ${data.ozelCount} adet özel yurt ve apart bulunmaktadır. Fiyatlar konuma, oda tipine ve sunulan hizmetlere göre değişmektedir. Gerçek öğrenci deneyimleri için yurt değerlendirmelerini okuyabilirsiniz.` },
    { q: `${data.city} yurtlarında toplam kaç değerlendirme var?`, a: `${data.city} şehrindeki yurtlar için şu ana kadar ${data.totalSurveys} adet anonim öğrenci değerlendirmesi yapılmıştır.` },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cityFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[1100px] px-8 pb-20 pt-10 max-md:px-5">
        <div className="mb-6 text-[13.5px] text-faint">
          <Link href="/yurtlar">Yurtlar</Link> /{" "}
          <span className="text-ink">{data.city}</span>
        </div>

        <div className="mb-8">
          <h1 className="mb-3 text-[32px] font-bold tracking-[-0.5px] text-ink">
            {data.city} Yurtları
          </h1>
          <p className="max-w-[640px] text-[16px] leading-relaxed text-muted">
            {data.city} şehrindeki {data.dorms.length} yurdun anonim öğrenci
            değerlendirmeleri. Yemek, internet, temizlik, giriş saati — kaydolmadan
            önce içerden öğren.
          </p>
        </div>

        {/* İSTATİSTİKLER */}
        <div className="mb-8 grid grid-cols-4 gap-4 max-md:grid-cols-2">
          <div className="rounded-[18px] border border-line bg-card px-5 py-4 text-center">
            <div className="text-[28px] font-bold text-ink">{data.dorms.length}</div>
            <div className="text-[13px] text-faint">Toplam yurt</div>
          </div>
          <div className="rounded-[18px] border border-line bg-card px-5 py-4 text-center">
            <div className="text-[28px] font-bold text-ink">{data.kykCount}</div>
            <div className="text-[13px] text-faint">KYK yurdu</div>
          </div>
          <div className="rounded-[18px] border border-line bg-card px-5 py-4 text-center">
            <div className="text-[28px] font-bold text-ink">{data.ozelCount}</div>
            <div className="text-[13px] text-faint">Özel yurt</div>
          </div>
          <div className="rounded-[18px] border border-line bg-card px-5 py-4 text-center">
            <div className="text-[28px] font-bold text-ink">{data.totalSurveys}</div>
            <div className="text-[13px] text-faint">Değerlendirme</div>
          </div>
        </div>

        {/* EN ÇOK DEĞERLENDİRİLEN */}
        {data.topDorms.length > 0 && data.topDorms[0].total > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-[20px] font-bold text-ink">
              {data.city} en çok değerlendirilen yurtlar
            </h2>
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              {data.topDorms.filter((d) => d.total > 0).map((d, i) => {
                const l = LIGHTS[d.light];
                return (
                  <Link
                    key={d.id}
                    href={`/yurt/${d.id}`}
                    className="group rounded-[18px] border border-line bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="gradient-pink grid h-10 w-10 place-items-center rounded-xl text-[17px] font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-[15px] font-bold text-ink">{d.name}</div>
                        <div className="text-[12px] text-faint">{d.typeLabel} · {d.total} değerlendirme</div>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[12px] font-semibold"
                      style={{ background: l.badgeBg, color: l.badgeFg }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: l.dot }} />
                      {l.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* TÜM YURTLAR */}
        <h2 className="mb-4 text-[20px] font-bold text-ink">
          {data.city} tüm yurtlar ({data.dorms.length})
        </h2>
        <div className="grid gap-3">
          {data.dorms.map((d) => {
            const l = LIGHTS[d.light];
            const pal = d.type === "KYK"
              ? { bg: "#e8f3f0", fg: "#0d7a6f" }
              : { bg: "#fdf3e4", fg: "#b07d1e" };
            return (
              <Link
                key={d.id}
                href={`/yurt/${d.id}`}
                className="grid grid-cols-[52px_1fr_auto] items-center gap-4 rounded-[16px] border border-line bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-hover max-md:grid-cols-[44px_1fr]"
              >
                <div
                  className="grid h-[48px] w-[48px] place-items-center rounded-xl text-[20px] font-bold max-md:h-[40px] max-md:w-[40px] max-md:text-[16px]"
                  style={{ background: pal.bg, color: pal.fg }}
                >
                  {d.name.charAt(0).toLocaleUpperCase("tr")}
                </div>
                <div>
                  <div className="text-[15.5px] font-semibold text-ink">{d.name}</div>
                  <div className="mt-0.5 text-[13px] text-faint">
                    {d.typeLabel} · {d.gender}{d.district ? ` · ${d.district}` : ""} · {d.total > 0 ? `${d.total} değerlendirme` : "Henüz değerlendirme yok"}
                  </div>
                </div>
                <div className="max-md:hidden">
                  <span
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill px-3 py-1.5 text-[12.5px] font-semibold"
                    style={{ background: l.badgeBg, color: l.badgeFg }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: l.dot }} />
                    {l.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* SEO İÇERİK */}
        <div className="mt-10 mb-8 rounded-[18px] border border-line bg-card p-7 max-md:p-5">
          <h2 className="mb-3 text-[20px] font-bold text-ink">
            {data.city} Yurt Rehberi
          </h2>
          <div className="space-y-3 text-[14.5px] leading-relaxed text-muted">
            <p>
              {data.city} şehrinde toplam {data.dorms.length} öğrenci yurdu bulunmaktadır.
              Bunların {data.kykCount} tanesi KYK (Kredi ve Yurtlar Kurumu) yurdu,
              {data.ozelCount > 0 ? ` ${data.ozelCount} tanesi özel yurt ve apart türündedir` : " geri kalanı özel yurtlardır"}.
              {data.totalSurveys > 0
                ? ` Şu ana kadar ${data.totalSurveys} anonim öğrenci değerlendirmesi yapılmıştır.`
                : " Henüz değerlendirme yapılmamıştır — ilk değerlendiren sen ol!"}
            </p>
            <p>
              OrtamNasıl? üzerinden {data.city} yurtlarının yemek kalitesi, internet hızı,
              temizlik durumu, giriş-çıkış saatleri ve genel ortam hakkında gerçek öğrenci
              deneyimlerini okuyabilirsin. Tüm değerlendirmeler tamamen anonim ve bağımsızdır.
            </p>
          </div>
        </div>

        {/* KYK vs ÖZEL KARŞILAŞTIRMA */}
        {data.kykCount > 0 && data.ozelCount > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-[20px] font-bold text-ink">
              {data.city} — KYK ve Özel Yurt Karşılaştırması
            </h2>
            <div className="overflow-x-auto rounded-[16px] border border-line">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-line bg-surface">
                    <th className="px-5 py-3 font-semibold text-ink">Kriter</th>
                    <th className="px-5 py-3 font-semibold text-ink">KYK Yurtları</th>
                    <th className="px-5 py-3 font-semibold text-ink">Özel Yurtlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-card">
                  <tr>
                    <td className="px-5 py-3 font-medium text-ink">Yurt sayısı</td>
                    <td className="px-5 py-3 text-muted">{data.kykCount} yurt</td>
                    <td className="px-5 py-3 text-muted">{data.ozelCount} yurt</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-ink">Değerlendirilen</td>
                    <td className="px-5 py-3 text-muted">{data.kykWithReviews} yurt</td>
                    <td className="px-5 py-3 text-muted">{data.ozelWithReviews} yurt</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-ink">Aylık ücret</td>
                    <td className="px-5 py-3 text-muted">~1.500 TL (2025-2026)</td>
                    <td className="px-5 py-3 text-muted">4.000 — 15.000 TL</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-ink">Oda tipi</td>
                    <td className="px-5 py-3 text-muted">4-8 kişilik</td>
                    <td className="px-5 py-3 text-muted">1-3 kişilik</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-ink">Yemek</td>
                    <td className="px-5 py-3 text-muted">Dâhil (yemekhane)</td>
                    <td className="px-5 py-3 text-muted">Dâhil veya ayrı</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-ink">Giriş saati</td>
                    <td className="px-5 py-3 text-muted">Var (23:00-23:30)</td>
                    <td className="px-5 py-3 text-muted">Genellikle yok</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* İLGİLİ BLOG YAZILARI */}
        {data.relatedBlogs.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-[20px] font-bold text-ink">
              Yurt hayatı rehberleri
            </h2>
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              {data.relatedBlogs.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-[16px] border border-line bg-card p-5 transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-faint">
                    {post.readTime} okuma
                  </div>
                  <div className="mb-1.5 text-[15px] font-semibold text-ink group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted line-clamp-2">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* SSS */}
        <div className="mt-10 mb-10">
          <h2 className="mb-4 text-[20px] font-bold text-ink">
            {data.city} yurtları hakkında sık sorulan sorular
          </h2>
          <div className="grid gap-3">
            {cityFaqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-[16px] border border-line bg-card transition-all open:border-primary/20 open:shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-3 flex-shrink-0 text-[18px] text-faint transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="border-t border-line px-6 py-4 text-[14.5px] leading-relaxed text-muted">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-[22px] border-2 border-dashed border-primary/30 bg-surface px-10 py-10 text-center max-md:px-6">
          <div className="mb-2 text-[28px] font-bold text-ink">
            {data.city} yurdun listede yok mu?
          </div>
          <p className="mx-auto mb-5 max-w-[440px] text-[15px] text-muted">
            Sen ekle, kurdeleyi sen kes. İlk ekleyen olmanın ayrıcalığını yaşa.
          </p>
          <Link
            href="/yurt-ekle"
            className="gradient-pink inline-block rounded-2xl px-7 py-3.5 text-[15px] font-bold text-white shadow-glow transition-transform hover:scale-105"
          >
            + Yurt ekle
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
