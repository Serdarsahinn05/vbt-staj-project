import { create } from "zustand";
import { persist } from "zustand/middleware";

/* Sepet tarayıcıda tutulur. Backend'in `/cart` uçları varyant bazlı ve hazır
   (`POST /cart/items {variantId, quantity}`); oturumla senkronizasyon ayrı bir
   iş olarak duruyor, misafir sepeti her hâlükârda burada yaşıyor.

   Satır anahtarı varyant kimliğidir: aynı modelin iki rengi iki ayrı satırdır. */

export interface CartItem {
  variantId: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (variantId: number, quantity?: number) => void;
  remove: (variantId: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (variantId, quantity = 1) =>
        set((s) => {
          const exists = s.items.some((i) => i.variantId === variantId);
          return {
            items: exists
              ? s.items.map((i) =>
                  i.variantId === variantId
                    ? { ...i, quantity: i.quantity + quantity }
                    : i,
                )
              : [...s.items, { variantId, quantity }],
          };
        }),

      remove: (variantId) =>
        set((s) => ({
          items: s.items.filter((i) => i.variantId !== variantId),
        })),

      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.variantId !== variantId)
              : s.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity } : i,
                ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "zemrek-cart",
      // Satır biçimi varyant kimliğine dayanır; önceki sürümün kayıtları okunamaz.
      version: 3,
      partialize: (s) => ({ items: s.items }),
      /* Sürüm 3 öncesi satırlar ürün kimliğine dayanır, varyanta çevrilemez —
         sepet boş başlar. `migrate` verilmezse Zustand sürüm uyuşmazlığında
         konsola hata basıp kaydı öylece bırakıyor. */
      migrate: () => ({ items: [] }),
    },
  ),
);
