/* Backend API tipleri (backend/prisma/schema.prisma ile uyumlu).
   Swagger hazır olduğunda `npm run gen:api` ile src/types/api.d.ts
   otomatik üretilecek; bu elle yazılmış tipler o zaman sadeleştirilir. */

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string; // Prisma Decimal → JSON'da string gelir
  stock: number;
  images: string[];
  categoryId: number;
  category?: Category;
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
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "name";
  page?: number;
  limit?: number;
}
