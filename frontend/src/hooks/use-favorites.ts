"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, fetchFavorites, removeFavorite } from "@/lib/user-api";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAuthStore } from "@/stores/auth-store";
import { useFavoritesStore } from "@/stores/favorites-store";

export const FAVORITES_KEY = ["favorites"] as const;

/* Favorilerin tek arayüzü. Giriş yapılmışsa kaynak backend, değilse
   tarayıcıdaki store. Bileşenler hangisi olduğunu bilmek zorunda kalmaz. */
export function useFavorites() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const localIds = useFavoritesStore((s) => s.ids);
  const toggleLocal = useFavoritesStore((s) => s.toggle);
  const clearLocal = useFavoritesStore((s) => s.clear);
  const queryClient = useQueryClient();

  const signedIn = hydrated && Boolean(user);

  const { data } = useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: fetchFavorites,
    enabled: signedIn,
  });

  const mutation = useMutation({
    mutationFn: async ({
      variantId,
      add,
    }: {
      variantId: number;
      add: boolean;
    }) => {
      if (add) await addFavorite(variantId);
      else await removeFavorite(variantId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY }),
  });

  const clearMutation = useMutation({
    mutationFn: async (variantIds: number[]) => {
      for (const id of variantIds) await removeFavorite(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY }),
  });

  // Hydration bitmeden localStorage'daki listeyi göstermiyoruz; sunucu
  // çıktısıyla uyuşmadığı için kalpler yanıp sönerdi.
  const ids = signedIn
    ? (data?.map((f) => f.variantId) ?? [])
    : hydrated
      ? localIds
      : [];

  return {
    ids,
    signedIn,
    isFavorite: (variantId: number) => ids.includes(variantId),
    toggle: (variantId: number) => {
      if (signedIn) {
        mutation.mutate({ variantId, add: !ids.includes(variantId) });
      } else {
        toggleLocal(variantId);
      }
    },
    clear: () => {
      if (signedIn) clearMutation.mutate(ids);
      else clearLocal();
    },
  };
}

/** Misafirken eklenen favorileri giriş sonrası hesaba taşır. */
export async function mergeGuestFavorites(): Promise<void> {
  const { ids, clear } = useFavoritesStore.getState();
  if (ids.length === 0) return;

  for (const variantId of ids) {
    try {
      await addFavorite(variantId);
    } catch {
      // Silinmiş bir varyant taşınamaz; kalanları engellemesin.
    }
  }
  clear();
}
