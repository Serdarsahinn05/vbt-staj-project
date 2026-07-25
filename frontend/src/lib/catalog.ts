import { finalPrice, toNumber } from "@/lib/pricing";
import type { Gender, Product, ProductSpecs, ProductVariant } from "@/types";

/* Backend ürününü arayüzün kullandığı biçime çevirir. Slug, cinsiyet listesi,
   fiyat, stok, renk, görsel, açıklama ve teknik künyenin tamamı API'den gelir;
   burada yalnızca gösterim biçimine çevriliyor. */

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

export interface CatalogProduct extends ProductSpecs {
  id: number;
  slug: string;
  name: string;
  series: string;
  category: string;
  styleTags: string[];
  genders: DisplayGender[];
  description: string;
  variants: CatalogVariant[];
}

/** Seriler vitrinde bu sırayla listelenir. */
export const SERIES_ORDER = ["Signature", "Horizon", "Apex"];

/* Koleksiyona en son giren modeller, yeniden eskiye. Backend'de ürünün
   eklenme tarihi yok; liste burada elle tutuluyor ve yeni model çıktıkça
   başa ekleniyor. İlk sıradaki "En Yeni" rozetini alır. */
export const NEW_ARRIVALS = ["lunaris", "aurelius"];

export function isNew(product: CatalogProduct): boolean {
  return NEW_ARRIVALS.includes(product.slug);
}

export function isNewest(product: CatalogProduct): boolean {
  return NEW_ARRIVALS[0] === product.slug;
}

/** Vitrindeki "Yeni Gelenler" şeridi: listedeki sırayı korur. */
export function newArrivals(products: CatalogProduct[]): CatalogProduct[] {
  return NEW_ARRIVALS.flatMap((slug) => {
    const found = products.find((p) => p.slug === slug);
    return found ? [found] : [];
  });
}

/** İndirimi olan modeller, indirim oranı yüksekten düşüğe. */
export function discounted(products: CatalogProduct[]): CatalogProduct[] {
  return products
    .filter((p) => p.variants.some((v) => v.discount > 0))
    .sort((a, b) => maxDiscount(b) - maxDiscount(a));
}

export function maxDiscount(product: CatalogProduct): number {
  return Math.max(...product.variants.map((v) => v.discount));
}

/* Teknik künyenin ürün sayfasındaki sırası ve başlıkları. Değeri boş olan
   alan basılmıyor, bu yüzden sıra burada sabit tutuluyor. */
export const SPEC_FIELDS: { key: keyof ProductSpecs; label: string }[] = [
  { key: "caseSize", label: "Kasa" },
  { key: "movement", label: "Mekanizma" },
  { key: "material", label: "Malzeme" },
  { key: "dial", label: "Kadran" },
  { key: "bezel", label: "Çerçeve" },
  { key: "crystal", label: "Kristal" },
  { key: "crown", label: "Kurma Kolu" },
  { key: "strap", label: "Bilezik / Kayış" },
  { key: "waterResistance", label: "Su Geçirmezlik" },
];

const GENDER_LABEL: Record<Gender, DisplayGender> = {
  ERKEK: "Erkek",
  KADIN: "Kadın",
};

/* İki renkli modellerde künye alanı her iki rengi tek metinde topluyor:
   "Rose Gold (Renk 1) / Silver (Renk 2)". Kullanıcı renkleri adıyla seçtiği
   için "(Renk 2)" ona bir şey anlatmıyor — seçili renge düşen parçayı ayırıp
   yalnızca onu gösteriyoruz.

   Eşleştirme sıraya değil renk ADINA bakıyor: metindeki "(Renk 1)" etiketi
   varyant dizisinin sırasıyla aynı olmak zorunda değil (backend Vesper'ın
   sırasını değiştirdiğinde ikisi ayrıştı). Ad da tutmazsa metin olduğu gibi
   kalıyor — yanlış rengi göstermektense hepsini göstermek yeğdir. */
const COLOR_TAG = /\s*\(Renk \d+\)/g;

export function specForVariant(value: string, colorName: string): string {
  if (!/\(Renk \d+\)/.test(value)) return value;

  const parts = value.split("/").map((p) => p.trim());
  // "Beyaz Altın" ↔ "…– Beyaz Altın tonu (Renk 2)" gibi kısmi eşleşmeler için
  // rengin ilk kelimesi yeterli sayılıyor.
  const key = colorName.split(/[\s/]+/)[0].toLocaleLowerCase("tr");
  const part = parts.find((p) => p.toLocaleLowerCase("tr").includes(key));

  return (part ?? value).replace(COLOR_TAG, "").trim();
}

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
    slug: product.slug,
    name: product.name,
    series: product.series ?? "Zemrek",
    category: product.category?.name ?? "",
    styleTags: product.styleTags ?? [],
    genders: product.genders.map((g) => GENDER_LABEL[g]),
    description: product.description,
    variants: product.variants.map(toVariant),

    caseSize: product.caseSize,
    material: product.material,
    bezel: product.bezel,
    crown: product.crown,
    crystal: product.crystal,
    waterResistance: product.waterResistance,
    movement: product.movement,
    strap: product.strap,
    dial: product.dial,
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
