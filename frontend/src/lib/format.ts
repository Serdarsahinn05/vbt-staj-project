/* İçerik formatları — design system tokens.json "content" bölümüne göre
   fiyat ₺74.900,00 biçiminde yazılır. */

export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

/* Fiyatlar yönetim panelinden giriliyor; henüz girilmemiş ürünlerde
   ₺0,00 yerine bekleme metni gösterilir. */
export function formatPriceOrPending(value: number): string {
  return value > 0 ? formatPrice(value) : "Fiyat yakında";
}
