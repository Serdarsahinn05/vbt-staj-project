import { api } from "@/lib/api";
import { toCatalog, type CatalogProduct } from "@/lib/catalog";
import type {
  Category,
  CreateProductPayload,
  Paginated,
  Product,
  ProductQuery,
  ProductVariant,
  UpdateProductPayload,
  UpdateVariantPayload,
} from "@/types";

/* Katalog uçları.
   Backend'de `?series=` ve `?sortOrder=` parametreleri yok, `?gender=ERKEK`
   de UNISEX ürünleri döndürmüyor. Katalog 10 ürün olduğu için tamamını tek
   istekte çekip filtrelemeyi ve sıralamayı arayüzde yapıyoruz. */

function toQueryString(query: ProductQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function fetchProducts(
  query: ProductQuery = {},
): Promise<Paginated<Product>> {
  return api<Paginated<Product>>(`/products${toQueryString(query)}`);
}

/* Backend varyantları sıralamadan döndürüyor (`include: { variants: true }`,
   `orderBy` yok), yani satır sırası bir güncellemeden sonra değişebiliyor.
   Varsayılan renk buna bağlı olduğu için kimliğe göre sabitliyoruz. */
export async function fetchAllProducts(): Promise<Product[]> {
  const { data } = await fetchProducts({ limit: 100, sortBy: "name" });
  return data.map((product) => ({
    ...product,
    variants: [...product.variants].sort((a, b) => a.id - b.id),
  }));
}

/** Vitrinin kullandığı, seriye göre sıralanmış katalog. */
export async function fetchCatalog(): Promise<CatalogProduct[]> {
  return toCatalog(await fetchAllProducts());
}

/* Sunucuda render edilen sayfalar için: API kapalıysa sayfayı çökertmek
   yerine boş katalogla devam edip kullanıcıya durum mesajı gösteriyoruz. */
export async function loadCatalog(): Promise<{
  products: CatalogProduct[];
  failed: boolean;
}> {
  try {
    return { products: await fetchCatalog(), failed: false };
  } catch {
    return { products: [], failed: true };
  }
}

/** Fiyat / stok / indirim güncelleme — sadece ADMIN. */
export function updateVariant(
  variantId: number,
  payload: UpdateVariantPayload,
): Promise<ProductVariant> {
  return api<ProductVariant>(`/products/variants/${variantId}`, {
    method: "PATCH",
    auth: true,
    body: payload,
  });
}

/* Ürün yönetimi — hepsi ADMIN korumalı. */

export function fetchCategories(): Promise<Category[]> {
  return api<Category[]>("/categories");
}

export function createProduct(payload: CreateProductPayload): Promise<Product> {
  return api<Product>("/products", { method: "POST", auth: true, body: payload });
}

export function updateProduct(
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> {
  return api<Product>(`/products/${id}`, {
    method: "PATCH",
    auth: true,
    body: payload,
  });
}

export function deleteProduct(id: number): Promise<void> {
  return api<void>(`/products/${id}`, { method: "DELETE", auth: true });
}
