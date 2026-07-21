import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrafficScale } from "@/components/TrafficScale";
import { HeroSearch } from "@/components/HeroSearch";
import { WeeklyDorms } from "@/components/WeeklyDorms";
import { LogoFull } from "@/components/Logo";
import { TypewriterHero } from "@/components/TypewriterHero";
import { EmojiRain } from "@/components/EmojiRain";
import { MarqueeTicker } from "@/components/MarqueeTicker";
import { LiveStats } from "@/components/LiveStats";
import { LiveIndicator } from "@/components/LiveIndicator";
import { StaggerCards } from "@/components/StaggerCards";
import { ticker } from "@/lib/data";
import { STATS } from "@/lib/dorms";

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

const STICKERS = ["💬", "⚡", "🔥", "💖", "👀", "✨"];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />

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
          <p className="mx-auto mb-9 max-w-[520px] text-lg leading-relaxed text-muted">
            Kaydolmadan önce sormaya çekindiklerin — yemek, internet, giriş saati —
            burada anonim anlatılıyor. 🤫
          </p>

          <HeroSearch />

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
          <MarqueeTicker items={ticker} />
        </div>
      </section>

      {/* STICKER BAR */}
      <section className="flex justify-center gap-4 pb-6">
        {STICKERS.map((s, i) => (
          <span
            key={i}
            className="text-2xl opacity-40 transition-all hover:scale-125 hover:opacity-100"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            {s}
          </span>
        ))}
      </section>

      {/* İSTATİSTİK ŞERİDİ */}
      <LiveStats dormCount={STATS.totalDorms.toLocaleString("tr")} />

      <WeeklyDorms />

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
            <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-pill bg-primary/10 px-4 py-[6px] text-[13px] font-bold text-primary">
              🎉 İLK EKLEYENE TEBRİK TÖRENİ
            </div>
            <h2 className="mb-2.5 text-[28px] font-bold text-ink">
              Yurdun haritada yok mu?
            </h2>
            <p className="max-w-[520px] text-[15.5px] leading-relaxed text-muted">
              Sen ekle, kurdeleyi sen kes. Karışıklık olmasın diye konum veya
              harita adresini de ekleyebilirsin — &ldquo;hangi Yıldız Yurdu?&rdquo; dramı
              yaşamayalım. ✂️
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
    </div>
  );
}
