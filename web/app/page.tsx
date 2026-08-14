import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrafficScale } from "@/components/TrafficScale";
import { HeroSearch } from "@/components/HeroSearch";
import { WeeklyDorms, type FeaturedDorm } from "@/components/WeeklyDorms";
import { LogoFull } from "@/components/Logo";
import { TypewriterHero } from "@/components/TypewriterHero";
import { EmojiRain } from "@/components/EmojiRain";
import { MarqueeTicker } from "@/components/MarqueeTicker";
import { LiveIndicator } from "@/components/LiveIndicator";
import { StaggerCards } from "@/components/StaggerCards";
import { VerificationBanner } from "@/components/VerificationBanner";
import { SurveyReminderBanner } from "@/components/SurveyReminderBanner";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import { WelcomeToast } from "@/components/WelcomeToast";
import { prisma } from "@/lib/prisma";
import { lightFromRatio, type LightKey } from "@/lib/lights";

export const dynamic = "force-dynamic";

const steps = [
  {
    emoji: "🥸",
    tag: "ADIM_01",
    title: "Takma adını seç",
    body: 'Gerçek ismin bizde bile yok. "SinirliPenguen42" seni gayet iyi temsil eder.',
  },
  {
    emoji: "📝",
    tag: "ADIM_02",
    title: "Anketi doldur",
    body: '"Yurt yemeği: doy da gel mi, dua ederek gir mi?" tarzında sorular. 3 dakika, söz.',
  },
  {
    emoji: "🚦",
    tag: "ADIM_03",
    title: "Işık yansın",
    body: "Yorumlar birikir, yurdun ışığı yanar: yeşilse kapağı at, kırmızıysa... biliyorsun.",
  },
];

const TYPE_LABELS: Record<string, string> = { KYK: "KYK", PRIVATE: "Özel", APART: "Apart" };

export default async function HomePage() {
  const dorms = await prisma.dorm.findMany({
    include: {
      _count: { select: { surveys: true, reviews: true } },
      surveys: { select: { ratio: true } },
    },
  });

  const totalDorms = dorms.length;

  const featured: FeaturedDorm[] = dorms
    .map((d) => {
      const total = d._count.surveys + d._count.reviews;
      const validRatios = d.surveys.filter((s) => s.ratio !== null).map((s) => s.ratio!);
      const avgRatio = validRatios.length > 0
        ? validRatios.reduce((a, b) => a + b, 0) / validRatios.length
        : null;
      return {
        id: d.id,
        name: d.name,
        city: d.city,
        type: TYPE_LABELS[d.type] || d.type,
        light: lightFromRatio(avgRatio) as LightKey,
        reviewCount: total,
      };
    })
    .filter((d) => d.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6);
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OrtamNasıl?",
    url: "https://www.ortamnasil.com",
    logo: "https://www.ortamnasil.com/logo.png",
    description: "Türkiye'deki KYK, özel ve apart yurtları hakkında anonim öğrenci değerlendirmeleri.",
    sameAs: ["https://twitter.com/ortam_nasil"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OrtamNasıl?",
    url: "https://www.ortamnasil.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.ortamnasil.com/yurtlar?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Header />
      <VerificationBanner />
      <SurveyReminderBanner />

      {/* HERO */}
      <section className="relative overflow-hidden px-16 pb-16 pt-14 text-center max-md:px-5">
        <EmojiRain />

        <div className="relative">
          <div className="mb-6 flex justify-center">
            <LogoFull />
          </div>

          <LiveIndicator />

          <h1 className="mb-4 text-[52px] font-bold leading-[1.08] tracking-[-1.5px] max-md:text-[36px]">
            <span style={{ color: "#3a3a3a" }}>Ortam nasıl,</span>{" "}
            <TypewriterHero />
          </h1>
          <p className="mx-auto mb-8 max-w-[540px] text-lg leading-relaxed text-muted">
            Yeni başladık — ilk değerlendirmeler şimdi yazılıyor. Kaldığın yurdu
            30 saniyede anlat, senden sonra gelen körlemesine seçmesin. 🤝
          </p>

          <div className="mb-9 flex flex-col items-center gap-3">
            <Link
              href="/anket"
              className="gradient-pink rounded-2xl px-9 py-[18px] text-[17px] font-bold text-white shadow-glow transition-transform hover:scale-105"
            >
              Yurdunu değerlendir →
            </Link>
            <span className="text-[13px] text-faint">
              8 soru · ~30 saniye · tamamen anonim 🥸
            </span>
          </div>

          <div>
            <p className="mb-3 text-[13px] text-faint">ya da merak ettiğin yurda bak</p>
            <HeroSearch />
          </div>

          <p className="mt-5 text-sm text-faint">
            Yurdun listede yok mu?{" "}
            <Link href="/yurt-ekle" className="font-semibold text-primary">
              İlk ekleyen sen ol ✂️
            </Link>
          </p>
        </div>
      </section>

      <TrafficScale />

      {/* CANLI AKIŞ */}
      <section className="px-16 pb-14 max-md:px-5">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-blink" />
            <span className="font-mono text-[12.5px] tracking-wider text-faint">
              CANLI — SON İTİRAFLAR
            </span>
          </div>
          <MarqueeTicker />
        </div>
      </section>

      <WeeklyDorms featured={featured} />

      {/* NASIL ÇALIŞIR */}
      <section id="nasil" className="bg-surface px-16 py-16 max-md:px-5">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-2 text-center text-[28px] font-bold text-ink">
            Nasıl çalışır?
          </h2>
          <p className="mb-10 text-center text-muted">
            Gayet basit, 3 adım. Toplam 3 dakika. ⏱️
          </p>
          <StaggerCards steps={steps} />
        </div>
      </section>

      {/* YURT EKLE CTA */}
      <section className="px-16 py-[72px] max-md:px-5">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-12 overflow-hidden rounded-[22px] border-2 border-dashed border-primary/30 bg-surface px-12 py-11 max-md:flex-col max-md:gap-6 max-md:px-6">
          <div>
            <h2 className="mb-2.5 text-[28px] font-bold text-ink">
              Yurdun listede yok mu?
            </h2>
            <p className="max-w-[520px] text-[15.5px] leading-relaxed text-muted">
              Sen ekle, kurdeleyi sen kes. Yurt adını ve şehrini gir,
              gerisini biz halledelim. ✂️
            </p>
          </div>
          <Link
            href="/yurt-ekle"
            className="gradient-pink flex-shrink-0 rounded-2xl px-[30px] py-4 text-base font-bold text-white shadow-glow transition-transform hover:scale-105"
          >
            + Yurt ekle
          </Link>
        </div>
      </section>

      <Footer />
      <PushNotificationPrompt />
      <WelcomeToast />
    </div>
  );
}
