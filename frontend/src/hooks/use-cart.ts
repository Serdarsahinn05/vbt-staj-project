"use client";

import { useCatalog } from "@/hooks/use-catalog";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";

export interface CartRow {
  item: CartItem;
  product: CatalogProduct;
  variant: CatalogVariant;
}

/* Sepet satırları yalnızca varyant kimliği tutar; ürün adı, görseli ve
   güncel fiyatı her açılışta katalogdan okunur. Böylece yönetim panelinden
   değişen fiyat sepete de yansır. Katalogdan düşmüş varyantlar elenir. */
export function useCart() {
  const items = useCartStore((s) => s.items);
  const hydrated = useHydrated();
  const { variantIndex, isPending } = useCatalog();

  const rows: CartRow[] = items.flatMap((item) => {
    const entry = variantIndex.get(item.variantId);
    return entry ? [{ item, ...entry }] : [];
  });

  const subtotal = rows.reduce(
    (sum, row) => sum + row.variant.price * row.item.quantity,
    0,
  );

  // Kargo ücreti backend'de tanımlı değil; koleksiyonun tamamı ücretsiz kargo.
  const shipping = 0;

  return {
    rows,
    subtotal,
    shipping,
    total: subtotal + shipping,
    ready: hydrated && !isPending,
  };
}
