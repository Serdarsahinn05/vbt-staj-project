import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* Kişiye özel ve yönetim sayfaları dizine kapalı: içerikleri oturuma bağlı
   olduğu için arama sonucunda bir işe yaramıyor. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/hesap", "/sepet", "/odeme", "/favoriler"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
