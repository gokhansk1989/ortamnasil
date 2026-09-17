import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = "https://www.ortamnasil.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/yurtlar`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/sss`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/kurallar`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/gizlilik`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/iletisim`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [dorms, blogPosts] = await Promise.all([
    prisma.dorm.findMany({
      select: {
        id: true,
        city: true,
        nearCampus: true,
        createdAt: true,
        _count: { select: { surveys: true } },
      },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const dormPages: MetadataRoute.Sitemap = dorms.map((d) => ({
    url: `${BASE}/yurt/${d.id}`,
    lastModified: d.createdAt.toISOString(),
    changeFrequency: "weekly" as const,
    priority: d._count.surveys > 0 ? 0.8 : 0.6,
  }));

  const uniqueCities = [...new Set(dorms.map((d) => d.city))];
  const cityPages: MetadataRoute.Sitemap = uniqueCities.map((city) => ({
    url: `${BASE}/sehir/${encodeURIComponent(city.toLocaleLowerCase("tr").replace(/\s+/g, "-"))}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const uniqueUnis = [...new Set(
    dorms.map((d) => d.nearCampus).filter((n): n is string => !!n),
  )];
  const uniPages: MetadataRoute.Sitemap = uniqueUnis.map((uni) => ({
    url: `${BASE}/universite/${encodeURIComponent(uni.toLocaleLowerCase("tr").replace(/\s+/g, "-"))}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.updatedAt.toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...blogPages, ...cityPages, ...uniPages, ...dormPages];
}
