import { finalPrice, toNumber } from "@/lib/pricing";
import type { Gender, Product, ProductVariant } from "@/types";

/* Backend ürününü arayüzün kullandığı biçime çevirir.
   Burada üretilen tek bilgi `slug` — backend'de slug alanı yok, ürün adından
   türetiliyor. Fiyat, stok, renk, görsel ve açıklamanın tamamı API'den gelir. */

export type DisplayGender = "Erkek" | "Kadın";

export interface CatalogVariant {
  /** Backend varyant kimliği; sepet ve favori anahtarı budur. */
  id: number;
  colorName: string;
  colorHex: string;
  images: string[];
  /** İndirim öncesi liste fiyatı. */
  listPrice: number;
  /** İndirim uygulanmış satış fiyatı. */
  price: number;
  discount: number;
  stock: number;
}

export interface CatalogProduct {
  id: number;
  slug: string;
  name: string;
  series: string;
  category: string;
  genders: DisplayGender[];
  description: string;
  variants: CatalogVariant[];
}

/** Seriler vitrinde bu sırayla listelenir. */
export const SERIES_ORDER = ["Signature", "Horizon", "Apex"];

const TURKISH_LETTERS: Record<string, string> = {
  ı: "i", İ: "i", ş: "s", Ş: "s", ğ: "g", Ğ: "g",
  ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c",
};

function slugify(value: string): string {
  return value
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (c) => TURKISH_LETTERS[c])
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* Katalogda "Unisex" diye bir raf yok: unisex bir saat hem Erkek hem Kadın
   listesinde görünür. */
const GENDER_MAP: Record<Gender, DisplayGender[]> = {
  ERKEK: ["Erkek"],
  KADIN: ["Kadın"],
  UNISEX: ["Erkek", "Kadın"],
};

function toVariant(variant: ProductVariant): CatalogVariant {
  return {
    id: variant.id,
    colorName: variant.colorName,
    colorHex: variant.colorHex,
    images: variant.images,
    listPrice: toNumber(variant.price),
    price: finalPrice(variant.price, variant.discount),
    discount: variant.discount,
    stock: variant.stock,
  };
}

function toCatalogProduct(product: Product): CatalogProduct {
  return {
    id: product.id,
    slug: slugify(product.name),
    name: product.name,
    series: product.series ?? "Zemrek",
    category: product.category?.name ?? "",
    genders: GENDER_MAP[product.gender],
    description: product.description,
    variants: product.variants.map(toVariant),
  };
}

export function toCatalog(products: Product[]): CatalogProduct[] {
  return products.map(toCatalogProduct).sort(compareProducts);
}

function seriesRank(series: string): number {
  const index = SERIES_ORDER.indexOf(series);
  return index === -1 ? SERIES_ORDER.length : index;
}

export function compareProducts(a: CatalogProduct, b: CatalogProduct): number {
  return (
    seriesRank(a.series) - seriesRank(b.series) ||
    a.name.localeCompare(b.name, "tr")
  );
}

/** Kartta ve listede gösterilen fiyat: en ucuz varyantınki. */
export function startingPrice(product: CatalogProduct): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function defaultVariant(product: CatalogProduct): CatalogVariant {
  return product.variants[0];
}

export function inStock(product: CatalogProduct): boolean {
  return product.variants.some((v) => v.stock > 0);
}

/* Ana sayfadaki seçki: her seriden o serinin en üst modeli girer, kalan
   yerler fiyatı en yüksek modellerle dolar. Böylece seçki üç seriyi de temsil
   eder ve panelden fiyat değişince kendini günceller. Alfabetik sıralama
   yerine bu kural var; ad sırası seriyi temsil etmiyor. */
export function featuredProducts(
  products: CatalogProduct[],
  count = 6,
): CatalogProduct[] {
  const available = products.filter(inStock);
  const pool = available.length > 0 ? available : products;
  const byPrice = [...pool].sort(
    (a, b) => startingPrice(b) - startingPrice(a) || compareProducts(a, b),
  );

  const picked: CatalogProduct[] = [];
  for (const series of SERIES_ORDER) {
    const top = byPrice.find((p) => p.series === series);
    if (top) picked.push(top);
  }
  for (const product of byPrice) {
    if (picked.length >= count) break;
    if (!picked.includes(product)) picked.push(product);
  }

  return picked.slice(0, count).sort(compareProducts);
}


/** Sepet ve favori satırlarını ürün bilgisiyle eşleştirmek için indeks. */
export function indexVariants(
  products: CatalogProduct[],
): Map<number, { product: CatalogProduct; variant: CatalogVariant }> {
  const index = new Map<
    number,
    { product: CatalogProduct; variant: CatalogVariant }
  >();
  for (const product of products) {
    for (const variant of product.variants) {
      index.set(variant.id, { product, variant });
    }
  }
  return index;
}

export function getBySlug(
  products: CatalogProduct[],
  slug: string,
): CatalogProduct | undefined {
  return products.find((p) => p.slug === slug);
}

