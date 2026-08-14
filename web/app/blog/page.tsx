import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Yurt Rehberi, KYK Başvuru, Yurt Hayatı İpuçları",
  description:
    "KYK yurt başvurusu nasıl yapılır, yurt hayatına hazırlık, yurt seçerken dikkat edilecekler. OrtamNasıl? blog.",
  alternates: { canonical: "https://www.ortamnasil.com/blog" },
  openGraph: {
    title: "Blog — OrtamNasıl?",
    description: "KYK başvuru rehberi, yurt hayatı ipuçları ve öğrenci deneyimleri.",
    url: "https://www.ortamnasil.com/blog",
  },
};

const CATEGORY_BADGES: Record<string, { label: string; bg: string; fg: string }> = {
  rehber: { label: "Rehber", bg: "#e8f3f0", fg: "#0d7a6f" },
  haber: { label: "Haber", bg: "#eee8f7", fg: "#6b42b0" },
  ipucu: { label: "İpucu", bg: "#fdf3e4", fg: "#b07d1e" },
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      readTime: true,
      publishedAt: true,
    },
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://www.ortamnasil.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.ortamnasil.com/blog" },
    ],
  };

  return (
    <div className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[900px] px-8 pb-20 pt-10 max-md:px-5">
        <div className="mb-10">
          <h1 className="mb-3 text-[32px] font-bold tracking-[-0.5px] text-ink">
            Blog
          </h1>
          <p className="max-w-[600px] text-[16px] leading-relaxed text-muted">
            KYK başvurusu, yurt hayatına hazırlık ve yurt seçimi hakkında
            kapsamlı rehberler. Deneyimli öğrencilerin bilgisi, senin için.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-[18px] border border-line bg-card p-12 text-center">
            <div className="mb-3 text-[40px]">📝</div>
            <div className="text-[18px] font-bold text-ink">Henüz yazı yok</div>
            <p className="mt-2 text-[14px] text-muted">Yakında içerikler burada olacak.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {posts.map((post) => {
              const badge = CATEGORY_BADGES[post.category] || CATEGORY_BADGES.rehber;
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-[18px] border border-line bg-card p-7 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-hover max-md:p-5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className="rounded-lg px-2.5 py-1 text-[12px] font-bold"
                      style={{ background: badge.bg, color: badge.fg }}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[12px] text-faint">{post.readTime} okuma</span>
                  </div>
                  <h2 className="mb-2 text-[19px] font-bold text-ink group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[14.5px] leading-relaxed text-muted">
                    {post.excerpt}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-12 rounded-[22px] border-2 border-dashed border-primary/30 bg-surface px-10 py-10 text-center max-md:px-6">
          <div className="mb-2 text-[24px] font-bold text-ink">
            Yurt deneyimini paylaş
          </div>
          <p className="mx-auto mb-5 max-w-[440px] text-[15px] text-muted">
            Yurt hakkında dürüst değerlendirmeni yaz, binlerce öğrenciye yol göster.
          </p>
          <Link
            href="/anket"
            className="gradient-pink inline-block rounded-2xl px-7 py-3.5 text-[15px] font-bold text-white shadow-glow"
          >
            Anket doldur
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
