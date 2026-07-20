import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OrtamNasıl? — Yurt nasıl, içerden öğren.",
  description:
    "Anonim öğrenci yurt değerlendirme platformu. KYK, özel yurt, apart — yemek, internet, temizlik, giriş saati hakkında gerçek yorumlar. Kaydolmadan önce içerden öğren.",
  keywords: [
    "yurt değerlendirme", "KYK yurt yorum", "öğrenci yurdu", "yurt ortamı",
    "anonim yurt yorumları", "OrtamNasıl", "özel yurt", "yurt karşılaştırma",
  ],
  openGraph: {
    title: "OrtamNasıl? — Yurt nasıl, içerden öğren.",
    description: "Anonim öğrenci yurt değerlendirme platformu. Gerçek deneyimler, gizli kimlikler.",
    type: "website",
    locale: "tr_TR",
    siteName: "OrtamNasıl?",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrtamNasıl? — Yurt nasıl, içerden öğren.",
    description: "Anonim öğrenci yurt değerlendirme platformu.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${outfit.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
