import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { YurtlarExplorer } from "@/components/YurtlarExplorer";

export const metadata: Metadata = {
  title: "Yurtlar — Tüm Yurtları Keşfet",
  description:
    "Türkiye'deki 2.400+ KYK, özel ve apart yurdu karşılaştır. Anonim öğrenci değerlendirmeleri, ortam skorları ve detaylı kategori kırılımları.",
  alternates: {
    canonical: "https://www.ortamnasil.com/yurtlar",
  },
  openGraph: {
    title: "Yurtlar — Tüm Yurtları Keşfet",
    description: "2.400+ yurdu karşılaştır. Anonim öğrenci değerlendirmeleri ve ortam skorları.",
    url: "https://www.ortamnasil.com/yurtlar",
  },
};

export default function YurtlarPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <YurtlarExplorer initialQuery={searchParams.q ?? ""} />
      <Footer />
    </div>
  );
}
