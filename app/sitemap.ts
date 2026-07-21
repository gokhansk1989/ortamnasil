import { MetadataRoute } from "next";
import { ALL_DORMS } from "@/lib/dorms";

const BASE = "https://www.ortamnasil.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/yurtlar`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/giris`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/anket`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/itiraf-yaz`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/yurt-ekle`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/kurallar`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/gizlilik`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/iletisim`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const dormPages: MetadataRoute.Sitemap = ALL_DORMS.map((d) => ({
    url: `${BASE}/yurt/${d.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...dormPages];
}
