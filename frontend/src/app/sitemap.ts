import type { MetadataRoute } from "next";
import { loadCatalog } from "@/lib/catalog-api";
import { SITE_URL } from "@/lib/site";

/* Yalnızca herkese açık sayfalar. Sepet, ödeme, hesap ve yönetim paneli
   kişiye özel olduğu için dizine girmemeli — robots.ts de onları engelliyor.
   API kapalıysa ürünler atlanıyor, sitemap yine de üretiliyor. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await loadCatalog();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/koleksiyon`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/giris`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/kayit`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/urun/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
