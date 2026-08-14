import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular — Yurt Değerlendirme",
  description:
    "KYK yurt başvurusu, özel yurt fiyatları, yurt hayatı, OrtamNasıl platformu hakkında merak edilenler. 2026 güncel bilgiler.",
  alternates: { canonical: "https://www.ortamnasil.com/sss" },
  openGraph: {
    title: "Sıkça Sorulan Sorular — OrtamNasıl?",
    description: "KYK yurt başvurusu, özel yurt fiyatları ve yurt hayatı hakkında en çok sorulan sorular.",
    url: "https://www.ortamnasil.com/sss",
  },
};

const CATEGORY_INFO: Record<string, { title: string; icon: string; iconBg: string; iconFg: string }> = {
  platform: { title: "Platform hakkında", icon: "?", iconBg: "var(--primary-10, rgba(13,148,136,.1))", iconFg: "var(--primary, #0d9488)" },
  kyk: { title: "KYK yurtları", icon: "K", iconBg: "#e8f3f0", iconFg: "#0d7a6f" },
  ozel: { title: "Özel yurtlar", icon: "Ö", iconBg: "#fdf3e4", iconFg: "#b07d1e" },
};

export default async function SSSPage() {
  const items = await prisma.faqItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const categoryOrder = ["platform", "kyk", "ozel"];
  const orderedCategories = categoryOrder.filter((c) => grouped[c]?.length);

  const allFaqs = items.map((f) => ({
    "@type": "Question" as const,
    name: f.question,
    acceptedAnswer: { "@type": "Answer" as const, text: f.answer },
  }));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs,
  };

  return (
    <div className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[820px] px-8 pb-20 pt-10 max-md:px-5">
        <div className="mb-10">
          <h1 className="mb-3 text-[32px] font-bold tracking-[-0.5px] text-ink">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-[16px] leading-relaxed text-muted">
            OrtamNasıl? platformu, KYK yurtları ve özel yurtlar hakkında en çok merak edilenler.
          </p>
        </div>

        {orderedCategories.map((cat) => {
          const info = CATEGORY_INFO[cat] || CATEGORY_INFO.platform;
          return (
            <section key={cat} className="mb-10">
              <h2 className="mb-5 flex items-center gap-2.5 text-[20px] font-bold text-ink">
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg text-[14px]"
                  style={{ background: info.iconBg, color: info.iconFg }}
                >
                  {info.icon}
                </span>
                {info.title}
              </h2>
              <div className="grid gap-3">
                {grouped[cat].map((faq) => (
                  <details
                    key={faq.id}
                    className="group rounded-[16px] border border-line bg-card transition-all open:border-primary/20 open:shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-[15.5px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <span className="ml-3 flex-shrink-0 text-[18px] text-faint transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="border-t border-line px-6 py-4 text-[14.5px] leading-relaxed text-muted">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-[18px] border border-line bg-card p-12 text-center">
            <div className="mb-3 text-[40px]">❓</div>
            <div className="text-[18px] font-bold text-ink">Henüz soru eklenmemiş</div>
          </div>
        )}

        <div className="rounded-[22px] border-2 border-dashed border-primary/30 bg-surface px-10 py-10 text-center max-md:px-6">
          <div className="mb-2 text-[24px] font-bold text-ink">
            Başka sorun mu var?
          </div>
          <p className="mx-auto mb-5 max-w-[440px] text-[15px] text-muted">
            İletişim sayfamızdan bize ulaşabilirsin.
          </p>
          <Link
            href="/iletisim"
            className="gradient-pink inline-block rounded-2xl px-7 py-3.5 text-[15px] font-bold text-white shadow-glow"
          >
            İletişime geç
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
