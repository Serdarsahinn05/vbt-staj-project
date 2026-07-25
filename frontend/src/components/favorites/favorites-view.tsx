"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BagIcon, TrashIcon } from "@/components/ui/icons";
import { Notice } from "@/components/ui/notice";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/hooks/use-catalog";
import { useFavorites } from "@/hooks/use-favorites";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "@/stores/toast-store";

/* Favoriler renk bazlı: aynı modelin iki rengi iki ayrı favoridir.
   Giriş yapılmışsa liste backend'den gelir, misafirlerde tarayıcıda tutulur. */
export function FavoritesView() {
  const { ids, signedIn, clear } = useFavorites();
  const { variantIndex, isPending } = useCatalog();
  const addToCart = useCartStore((s) => s.add);

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

  // Tükenmiş renk sepete eklenemiyor; toplu eklemede sessizce atlanıyor ama
  // düğme kaç ürünün ekleneceğini yazdığı için sürpriz olmuyor.
  const stoktakiler = rows.filter(({ variant }) => variant.stock > 0);

  function addAllToCart() {
    for (const { variant } of stoktakiler) addToCart(variant.id, 1);
    toast({
      title: `${stoktakiler.length} ürün sepete eklendi`,
      description: "Favorilerinizdeki stoktaki modeller",
      action: { label: "Sepete Git", href: "/sepet" },
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="text-small text-body">{rows.length} kayıt</span>

        <div className="flex flex-wrap items-center gap-4">
          {stoktakiler.length > 0 && (
            <Button variant="primary" size="sm" onClick={addAllToCart}>
              <BagIcon />
              {stoktakiler.length === rows.length
                ? "Hepsini sepete ekle"
                : `Stoktaki ${stoktakiler.length} ürünü sepete ekle`}
            </Button>
          )}
          <button
            type="button"
            onClick={clear}
            className="inline-flex cursor-pointer items-center gap-1.5 text-small text-body underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            <TrashIcon size={15} />
            Tümünü kaldır
          </button>
        </div>
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
