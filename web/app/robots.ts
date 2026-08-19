import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/profil/", "/giris", "/anket", "/opengraph-image", "/favicon.ico"],
      },
    ],
    sitemap: "https://www.ortamnasil.com/sitemap.xml",
  };
}
