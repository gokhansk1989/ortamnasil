import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/profil/", "/opengraph-image", "/favicon.ico", "/yurt/*/opengraph-image"],
      },
    ],
    sitemap: "https://www.ortamnasil.com/sitemap.xml",
  };
}
