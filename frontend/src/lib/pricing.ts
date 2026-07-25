/* Fiyat yardımcıları. Backend fiyatı Decimal → string olarak döndürüyor
   ("61500"), indirim ise varyant üzerinde yüzde olarak duruyor. */

export function toNumber(price: string | number): number {
  const n = typeof price === "number" ? price : Number.parseFloat(price);
  return Number.isFinite(n) ? n : 0;
}

/** İndirim uygulanmış nihai fiyat. Kuruşa yuvarlar. */
export function finalPrice(price: string | number, discount: number): number {
  const base = toNumber(price);
  const pct = Math.min(Math.max(discount, 0), 100);
  return Math.round(base * (1 - pct / 100) * 100) / 100;
}

/** Backend `price` alanı için kabul edilen biçim: "61500" ya da "61500.50". */
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

export function isValidPrice(value: string): boolean {
  return PRICE_PATTERN.test(value);
}

/** Kullanıcı girdisini backend'in beklediği biçime yaklaştırır (virgül → nokta). */
export function sanitizePriceInput(value: string): string {
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  const [whole, ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
}
