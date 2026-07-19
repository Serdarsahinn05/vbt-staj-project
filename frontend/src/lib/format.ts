/* İçerik formatları — design system tokens.json "content" bölümüne göre:
   fiyat ₺74.900,00 · puan "★ 4.9 (128)" (tek yıldız, 5'li dizi asla) */

export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(n);
}

export function formatRating(score: number, count: number): string {
  return `★ ${score.toLocaleString("tr-TR")} (${count})`;
}
