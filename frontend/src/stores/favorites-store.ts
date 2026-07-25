import { create } from "zustand";
import { persist } from "zustand/middleware";

/* Misafir kullanıcının favorileri. Giriş yapıldığında kaynak backend'e
   (`GET /favorites`) geçer — bkz. hooks/use-favorites.
   Backend gibi varyant bazlı: aynı modelin farklı rengi ayrı favoridir. */

interface FavoritesState {
  ids: number[];
  toggle: (variantId: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (variantId) =>
        set((s) => ({
          ids: s.ids.includes(variantId)
            ? s.ids.filter((id) => id !== variantId)
            : [...s.ids, variantId],
        })),
      remove: (variantId) =>
        set((s) => ({ ids: s.ids.filter((id) => id !== variantId) })),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "zemrek-favorites",
      // Saklanan kimlikler varyant kimliğidir; önceki sürümün kayıtları okunamaz.
      version: 2,
      partialize: (s) => ({ ids: s.ids }),
      /* Sürüm 2 öncesi kayıtlar ürün kimliği tutar, varyanta çevrilemez — liste
         boş başlar. `migrate` verilmezse Zustand sürüm uyuşmazlığında
         "no migrate function was provided" hatasını konsola basıyor. */
      migrate: () => ({ ids: [] }),
    },
  ),
);
