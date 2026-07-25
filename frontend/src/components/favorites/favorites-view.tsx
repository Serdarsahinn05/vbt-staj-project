"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/hooks/use-catalog";
import { useFavorites } from "@/hooks/use-favorites";

/* Favoriler renk bazlı: aynı modelin iki rengi iki ayrı favoridir.
   Giriş yapılmışsa liste backend'den gelir, misafirlerde tarayıcıda tutulur. */
export function FavoritesView() {
  const { ids, signedIn, clear } = useFavorites();
  const { variantIndex, isPending } = useCatalog();

  if (isPending) return <ProductGridSkeleton count={4} />;

  const rows = ids.flatMap((id) => {
    const entry = variantIndex.get(id);
    return entry ? [entry] : [];
  });

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Henüz favoriniz yok"
        message="Beğendiğiniz modelleri kalp simgesiyle buraya ekleyebilirsiniz."
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="text-small text-body">{rows.length} kayıt</span>
        <button
          type="button"
          onClick={clear}
          className="cursor-pointer text-small text-body underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Tümünü kaldır
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 max-sm:grid-cols-1 max-sm:gap-4">
        {rows.map(({ product, variant }) => (
          <ProductCard key={variant.id} product={product} variant={variant} />
        ))}
      </div>

      {!signedIn && (
        <Notice>
          Favorileriniz şu an yalnızca bu tarayıcıda saklanıyor. Giriş
          yaptığınızda hesabınıza taşınır.
        </Notice>
      )}
    </>
  );
}
