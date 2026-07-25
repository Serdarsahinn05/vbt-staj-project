/* Sitenin kendi adresi. Mutlak URL üretmek gereken yerlerde kullanılıyor:
   sitemap, robots ve paylaşım önizlemeleri (OpenGraph) göreli adres kabul
   etmiyor. Vercel dağıtımı `VERCEL_PROJECT_PRODUCTION_URL` değişkenini
   kendisi verdiği için ayrıca tanımlamaya gerek kalmıyor. */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3001";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Zemrek";
export const SITE_DESCRIPTION =
  "El işçiliğiyle üretilen İsviçre mekanizmalı premium saatler. Signature, Horizon ve Apex koleksiyonlarını keşfedin.";
