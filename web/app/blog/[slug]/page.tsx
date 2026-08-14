import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogReactions } from "@/components/BlogReactions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true },
    select: { title: true, excerpt: true, slug: true },
  });
  if (!post) return { title: "Yazı bulunamadı" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://www.ortamnasil.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.ortamnasil.com/blog/${post.slug}`,
      type: "article",
    },
  };
}

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true },
  });
  if (!post) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://www.ortamnasil.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.ortamnasil.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://www.ortamnasil.com/blog/${post.slug}` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "OrtamNasıl?",
      url: "https://www.ortamnasil.com",
    },
    mainEntityOfPage: `https://www.ortamnasil.com/blog/${post.slug}`,
  };

  const dateStr = post.updatedAt.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header />
      <article className="mx-auto max-w-[760px] px-8 pb-20 pt-10 max-md:px-5">
        <div className="mb-6 text-[13.5px] text-faint">
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>{" "}
          / <span className="text-ink">{post.title.length > 50 ? post.title.slice(0, 50) + "…" : post.title}</span>
        </div>

        <h1 className="mb-4 text-[32px] font-bold leading-tight tracking-[-0.5px] text-ink max-md:text-[26px]">
          {post.title}
        </h1>
        <div className="mb-8 flex items-center gap-4 text-[13px] text-faint">
          <span>{post.readTime} okuma</span>
          <span>Son güncelleme: {dateStr}</span>
        </div>

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <BlogReactions
          slug={post.slug}
          title={post.title}
          initialLikes={post.likeCount}
        />

        <div className="mt-12 rounded-[18px] border border-line bg-card p-7 text-center">
          <div className="mb-2 text-[20px] font-bold text-ink">
            Bu yazı faydalı oldu mu?
          </div>
          <p className="mx-auto mb-4 max-w-[400px] text-[14px] text-muted">
            Yurdun hakkında gerçek deneyimini paylaşarak binlerce öğrenciye yardımcı olabilirsin.
          </p>
          <Link
            href="/anket"
            className="gradient-pink inline-block rounded-2xl px-6 py-3 text-[14px] font-bold text-white shadow-glow"
          >
            Yurt değerlendir
          </Link>
        </div>
      </article>
      <Footer />
    </div>
  );
}
