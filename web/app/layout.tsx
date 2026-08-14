import type { Metadata } from "next";
import Script from "next/script";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
    },
  },
  other: {
    "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
  },
  category: "education",
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
        <link rel="alternate" hrefLang="tr" href="https://www.ortamnasil.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4400330012095219"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});`}
            </Script>
          </>
        )}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
        {children}
      </body>
    </html>
  );
}
