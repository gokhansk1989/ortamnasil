import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SurveyReminderBanner } from "@/components/SurveyReminderBanner";
import { YurtlarExplorer, type DormRow } from "@/components/YurtlarExplorer";
import { prisma } from "@/lib/prisma";
import type { LightKey } from "@/lib/lights";

export const metadata: Metadata = {
  title: "Yurtlar — Tüm Yurtları Keşfet",
  description:
    "Türkiye'deki KYK, özel ve apart yurtları karşılaştır. Anonim öğrenci değerlendirmeleri, ortam skorları ve detaylı kategori kırılımları.",
  alternates: { canonical: "https://www.ortamnasil.com/yurtlar" },
  openGraph: {
    title: "Yurtlar — Tüm Yurtları Keşfet",
    description: "Yurtları karşılaştır. Anonim öğrenci değerlendirmeleri ve ortam skorları.",
    url: "https://www.ortamnasil.com/yurtlar",
  },
};

const TYPE_LABELS: Record<string, string> = { KYK: "KYK", PRIVATE: "Özel", APART: "Apart" };
const GENDER_LABELS: Record<string, string> = { MALE: "Erkek", FEMALE: "Kız", MIXED: "Karma" };

function dormColor(type: string) {
  return type === "KYK"
    ? { bg: "#e8f3f0", fg: "#0d7a6f" }
    : { bg: "#fdf3e4", fg: "#b07d1e" };
}

export default async function YurtlarPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const dorms = await prisma.dorm.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { surveys: true, reviews: true } } },
  });

  const cities = [...new Set(dorms.map((d) => d.city))].sort((a, b) => a.localeCompare(b, "tr"));

  const rows: DormRow[] = dorms.map((d) => {
    const pal = dormColor(d.type);
    const typeLabel = TYPE_LABELS[d.type] || d.type;
    const genderLabel = GENDER_LABELS[d.gender] || d.gender;
    return {
      id: d.id,
      name: d.name,
      initial: d.name.charAt(0).toLocaleUpperCase("tr"),
      logoBg: pal.bg,
      logoFg: pal.fg,
      meta: `${typeLabel} · ${d.city} · ${genderLabel}`,
      sector: typeLabel,
      reviews: d._count.surveys + d._count.reviews,
      light: d.light.toLowerCase() as LightKey,
    };
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://www.ortamnasil.com" },
      { "@type": "ListItem", position: 2, name: "Yurtlar", item: "https://www.ortamnasil.com/yurtlar" },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Türkiye Öğrenci Yurtları",
    numberOfItems: rows.length,
    itemListElement: rows.filter((d) => d.reviews > 0).slice(0, 30).map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.name,
      url: `https://www.ortamnasil.com/yurt/${d.id}`,
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
      <Header />
      <SurveyReminderBanner />
      <YurtlarExplorer initialQuery={searchParams.q ?? ""} dorms={rows} cities={cities} />
      <Footer />
    </div>
  );
}
