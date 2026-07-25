/* Backend API tipleri — backend/prisma/schema.prisma ile birebir.
   Swagger hazır olduğunda `npm run gen:api` ile src/types/api.d.ts
   üretilecek; bu elle yazılmış tipler o zaman sadeleşir. */

export type Gender = "ERKEK" | "KADIN";

export interface Category {
  id: number;
  name: string;
}

/** Bir ürünün tek renk seçeneği. Fiyat/stok/indirim renk bazında tutulur. */
export interface ProductVariant {
  id: number;
  colorName: string;
  colorHex: string;
  images: string[];
  price: string; // Prisma Decimal → JSON'da string
  stock: number;
  discount: number; // yüzde, 0-100
  productId: number;
}

/* Ürün sayfasındaki teknik künye. Hepsi backend'de opsiyonel: dolu olmayan
   alan arayüzde hiç gösterilmiyor. */
export interface ProductSpecs {
  caseSize: string | null;
  material: string | null;
  bezel: string | null;
  crown: string | null;
  crystal: string | null;
  waterResistance: string | null;
  movement: string | null;
  strap: string | null;
  dial: string | null;
}

export interface Product extends ProductSpecs {
  id: number;
  name: string;
  slug: string;
  description: string;
  /** Model fiyatı; geçerli satış fiyatı yine varyantın üzerindedir. */
  price: string;
  /** Bir ürün iki cinsiyete birden ait olabilir: ["ERKEK", "KADIN"]. */
  genders: Gender[];
  series: string | null;
  /** Stil etiketleri ("Lüks", "Dress", "Spor"…). */
  styleTags: string[];
  categoryId: number;
  category?: Category;
  variants: ProductVariant[];
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductQuery {
  search?: string;
  categoryId?: number;
  gender?: Gender;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "name";
  page?: number;
  limit?: number;
}

/* ---------- Sepet ---------- */

/** GET /cart satırı; varyant ve ürün bilgisi gömülü gelir. */
export interface ServerCartItem {
  id: number;
  cartId: number;
  variantId: number;
  quantity: number;
  /** İndirim uygulanmış birim fiyat. */
  unitPrice: number;
  lineTotal: number;
  variant?: ProductVariant & { product?: Product };
}

export interface ServerCart {
  id: number;
  userId: number;
  items: ServerCartItem[];
  total: number;
}

/* ---------- Yorumlar ---------- */

export interface Review {
  id: number;
  rating: number; // 1-5
  /** Yorum metni isteğe bağlı: yalnızca puan verilebiliyor. */
  comment: string | null;
  createdAt: string;
  userId: number;
  productId: number;
  user?: { id: number; name: string };
}

/** GET /products/:id/reviews — liste, ortalama puan ve toplam sayı. */
export interface ReviewSummary {
  data: Review[];
  average: number;
  count: number;
}

/* ---------- Auth ---------- */

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface Address {
  id: number;
  title: string;
  city: string;
  district: string;
  detail: string;
  userId: number;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  addresses?: Address[];
}

/* ---------- Admin ---------- */

/** PATCH /products/variants/:id gövdesi. */
export interface UpdateVariantPayload {
  price?: string;
  stock?: number;
  discount?: number;
}

/** POST /products içindeki renk seçeneği. */
export interface VariantPayload {
  colorName: string;
  colorHex: string;
  images: string[];
  price?: string;
  stock?: number;
  discount?: number;
}

/* POST /products gövdesi. Zorunlu alanlar backend DTO'suyla birebir:
   ad, slug, açıklama, fiyat, en az bir cinsiyet, kategori ve en az bir renk. */
export interface CreateProductPayload extends Partial<ProductSpecs> {
  name: string;
  slug: string;
  description: string;
  price: string;
  genders: Gender[];
  categoryId: number;
  variants: VariantPayload[];
  series?: string;
  styleTags?: string[];
}

/** PATCH /products/:id gövdesi — hepsi isteğe bağlı. */
export type UpdateProductPayload = Partial<CreateProductPayload>;
