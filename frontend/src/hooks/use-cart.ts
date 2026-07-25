"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCatalog } from "@/hooks/use-catalog";
import { useHydrated } from "@/hooks/use-hydrated";
import { ApiError } from "@/lib/api";
import {
  addCartItem,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart-api";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { toast } from "@/stores/toast-store";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";

export const CART_KEY = ["cart"] as const;

export interface CartRow {
  item: CartItem;
  product: CatalogProduct;
  variant: CatalogVariant;
}

/* Sepetin tek arayüzü. Giriş yapılmışsa kaynak backend (`/cart`), değilse
   tarayıcıdaki store. Bileşenler hangisi olduğunu bilmek zorunda kalmaz —
   favorilerde kurduğumuz desenin aynısı. */

function errorText(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "İşlem tamamlanamadı, tekrar deneyin.";
}

/** Yalnızca sepeti değiştiren eylemler; katalog çekmez. */
export function useCartActions() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const signedIn = hydrated && Boolean(user);
  const queryClient = useQueryClient();

  /* Eylemler tek tek seçiliyor: `useCartStore()` argümansız çağrılırsa tüm
     duruma abone olunuyor ve sepet her değiştiğinde bu hook'u kullanan bütün
     ürün kartları yeniden render ediliyor. */
  const localAdd = useCartStore((s) => s.add);
  const localSetQuantity = useCartStore((s) => s.setQuantity);
  const localRemove = useCartStore((s) => s.remove);
  const localClear = useCartStore((s) => s.clear);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: CART_KEY });

  /* Sunucu hatası kullanıcıya bildirimle dönüyor: en sık karşılaşılan durum
     stok yetmemesi ve sessizce yutulursa sepete eklenmediği anlaşılmıyor. */
  const onError = (error: unknown) => toast({ title: errorText(error) });

  const addMutation = useMutation({
    mutationFn: ({ variantId, quantity }: CartItem) =>
      addCartItem(variantId, quantity),
    onSuccess: invalidate,
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ variantId, quantity }: CartItem) =>
      updateCartItem(variantId, quantity),
    onSuccess: invalidate,
    onError,
  });

  const removeMutation = useMutation({
    mutationFn: (variantId: number) => removeCartItem(variantId),
    onSuccess: invalidate,
    onError,
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: invalidate,
    onError,
  });

  return {
    signedIn,

    add: (variantId: number, quantity = 1) => {
      if (signedIn) addMutation.mutate({ variantId, quantity });
      else localAdd(variantId, quantity);
    },

    setQuantity: (variantId: number, quantity: number) => {
      if (!signedIn) return localSetQuantity(variantId, quantity);
      // Backend adet için 1 alt sınırı koyuyor; sıfıra inmek satırı silmek demek.
      if (quantity <= 0) removeMutation.mutate(variantId);
      else updateMutation.mutate({ variantId, quantity });
    },

    remove: (variantId: number) => {
      if (signedIn) removeMutation.mutate(variantId);
      else localRemove(variantId);
    },

    clear: () => {
      if (signedIn) clearMutation.mutate();
      else localClear();
    },
  };
}

/* Sepet satırları yalnızca varyant kimliği tutar; ürün adı, görseli ve güncel
   fiyatı katalogdan okunur. Böylece hem misafir hem oturum sepeti aynı
   biçimde gösterilir ve panelden değişen fiyat sepete de yansır. */
export function useCart() {
  const actions = useCartActions();
  const hydrated = useHydrated();
  const localItems = useCartStore((s) => s.items);
  const { variantIndex, isPending: catalogPending } = useCatalog();

  const { data: serverCart, isPending: cartPending } = useQuery({
    queryKey: CART_KEY,
    queryFn: fetchCart,
    enabled: actions.signedIn,
  });

  const items: CartItem[] = actions.signedIn
    ? (serverCart?.items.map(({ variantId, quantity }) => ({
        variantId,
        quantity,
      })) ?? [])
    : hydrated
      ? localItems
      : [];

  // Katalogdan düşmüş varyantlar eleniyor; sayılar da bu satırlardan geliyor.
  const rows: CartRow[] = items.flatMap((item) => {
    const entry = variantIndex.get(item.variantId);
    return entry ? [{ item, ...entry }] : [];
  });

  const count = rows.reduce((n, row) => n + row.item.quantity, 0);

  const subtotal = rows.reduce(
    (sum, row) => sum + row.variant.price * row.item.quantity,
    0,
  );

  // Kargo ücreti backend'de tanımlı değil; koleksiyonun tamamı ücretsiz kargo.
  const shipping = 0;

  return {
    ...actions,
    rows,
    count,
    subtotal,
    shipping,
    total: subtotal + shipping,
    ready:
      hydrated && !catalogPending && !(actions.signedIn && cartPending),
  };
}

/** Misafirken eklenen satırları giriş sonrası hesaba taşır. */
export async function mergeGuestCart(): Promise<void> {
  const { items, clear } = useCartStore.getState();
  if (items.length === 0) return;

  for (const { variantId, quantity } of items) {
    try {
      await addCartItem(variantId, quantity);
    } catch {
      // Stoğu yetmeyen ya da silinmiş varyant taşınamaz; kalanları engellemesin.
    }
  }
  clear();
}
