import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrafficScale } from "@/components/TrafficScale";
import { HeroSearch } from "@/components/HeroSearch";
import { WeeklyDorms } from "@/components/WeeklyDorms";
import { LogoFull } from "@/components/Logo";
import { ticker, stats } from "@/lib/data";

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
        {/* Background decorations */}
        <div className="pointer-events-none absolute -top-[80px] left-1/2 h-[500px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,45,120,.08),transparent_55%)]" />
        <div className="pointer-events-none absolute right-[10%] top-[20%] text-4xl opacity-20 animate-float">💬</div>
        <div className="pointer-events-none absolute left-[8%] top-[30%] text-3xl opacity-15 animate-wiggle">⚡</div>
        <div className="pointer-events-none absolute right-[20%] top-[60%] text-2xl opacity-15 animate-float" style={{ animationDelay: "1s" }}>👀</div>

        <div className="relative">
          <div className="mb-6 flex justify-center">
            <LogoFull />
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-pill bg-surface px-5 py-2 text-[13px] font-semibold text-primary">
            <span className="h-2 w-2 rounded-full bg-light-green animate-blink" />
            Şu an 3 kişi bir yerlerde yorum yazıyor
          </div>

          <h1 className="mb-4 text-[52px] font-bold leading-[1.08] tracking-[-1.5px] text-ink max-md:text-[36px]">
            Yurt nasıl,{" "}
            <span className="gradient-text">içerden öğren.</span>
          </h1>
          <p className="mx-auto mb-9 max-w-[520px] text-lg leading-relaxed text-muted">
            Kaydolmadan önce sormaya çekindiklerin — yemek, internet, giriş saati —
            burada anonim anlatılıyor. 🤫
          </p>

          <HeroSearch />

          <p className="mt-5 text-sm text-faint">
            Yurdun listede yok mu?{" "}
            <Link href="/yurt-ekle" className="font-semibold text-primary">
              İlk ekleyen sen ol 🎀
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
          <div className="flex gap-3 overflow-x-auto pb-1">
            {ticker.map((t, i) => (
              <div
                key={i}
                className="flex flex-shrink-0 items-center gap-2.5 whitespace-nowrap rounded-pill border border-line bg-card px-[18px] py-2.5 text-[13.5px] text-muted transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: t.dot }}
                />
                <span className="font-mono text-ink">{t.who}</span>
                <span>{t.what}</span>
              </div>
            ))}
          </div>
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
      <section className="flex justify-center gap-16 px-16 pb-16 text-center max-md:flex-wrap max-md:gap-8 max-md:px-5">
        {stats.map((s, i) => (
          <div key={i} className="flex items-stretch gap-16 max-md:gap-8">
            {i > 0 && <div className="w-px bg-line max-md:hidden" />}
            <div>
              <div
                className={`text-[34px] font-bold ${
                  s.highlight ? "text-primary" : "text-ink"
                }`}
              >
                {s.value}
              </div>
              <div className="text-sm text-faint">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      <WeeklyDorms />

      {/* NASIL ÇALIŞIR */}
      <section id="nasil" className="bg-ink px-16 py-16 max-md:px-5">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-2 text-center text-[28px] font-bold text-white">
            Nasıl çalışır?
          </h2>
          <p className="mb-10 text-center text-onDarkMuted">
            Gayet basit, 3 adım. Toplam 3 dakika. ⏱️
          </p>
          <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
            {steps.map((s) => (
              <div key={s.tag} className="rounded-card border border-white/10 bg-white/[.06] p-7 transition-transform hover:scale-[1.02]">
                <div className="mb-3 text-3xl">{s.emoji}</div>
                <div className="mb-1 font-mono text-[12px] text-primary-light">
                  {s.tag}
                </div>
                <div className="mb-2 text-lg font-semibold text-white">
                  {s.title}
                </div>
                <p className="text-[14.5px] leading-relaxed text-onDarkMuted">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
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
              yaşamayalım. 🎀
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
