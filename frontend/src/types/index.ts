/* Backend API tipleri — backend/prisma/schema.prisma ile birebir.
   Swagger hazır olduğunda `npm run gen:api` ile src/types/api.d.ts
   üretilecek; bu elle yazılmış tipler o zaman sadeleşir. */

export type Gender = "ERKEK" | "KADIN" | "UNISEX";

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

export interface Product {
  id: number;
  name: string;
  description: string;
  /** Vitrin bunları kullanmaz; geçerli fiyat ve stok varyantın üzerindedir. */
  price: string;
  stock: number;
  gender: Gender;
  series: string | null;
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
