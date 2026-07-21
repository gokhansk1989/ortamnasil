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
  metadataBase: new URL("https://www.ortamnasil.com"),
  title: {
    default: "OrtamNasıl? — Yurt nasıl, içerden öğren.",
    template: "%s | OrtamNasıl?",
  },
  description:
    "Anonim öğrenci yurt değerlendirme platformu. KYK, özel yurt, apart — yemek, internet, temizlik, giriş saati hakkında gerçek yorumlar. Kaydolmadan önce içerden öğren.",
  keywords: [
    "yurt değerlendirme", "KYK yurt yorum", "öğrenci yurdu", "yurt ortamı",
    "anonim yurt yorumları", "OrtamNasıl", "özel yurt", "yurt karşılaştırma",
    "KYK yurt", "öğrenci yurdu yorumları", "yurt puanlama", "yurt tavsiye",
    "üniversite yurt", "devlet yurdu", "yurt şikayetleri", "yurt deneyimleri",
  ],
  alternates: {
    canonical: "https://www.ortamnasil.com",
  },
  openGraph: {
    title: "OrtamNasıl? — Yurt nasıl, içerden öğren.",
    description: "Türkiye'nin anonim öğrenci yurt değerlendirme platformu. 2.400+ yurt, gerçek deneyimler, gizli kimlikler.",
    type: "website",
    locale: "tr_TR",
    url: "https://www.ortamnasil.com",
    siteName: "OrtamNasıl?",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OrtamNasıl? — Yurt nasıl, içerden öğren.",
    description: "Türkiye'nin anonim öğrenci yurt değerlendirme platformu. 2.400+ yurt, gerçek deneyimler.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "OrtamNasıl?",
  url: "https://www.ortamnasil.com",
  description: "Türkiye'nin anonim öğrenci yurt değerlendirme platformu",
  inLanguage: "tr",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.ortamnasil.com/yurtlar?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${outfit.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
