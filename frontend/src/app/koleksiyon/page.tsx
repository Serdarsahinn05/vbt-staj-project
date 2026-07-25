import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionGrid } from "@/components/collection/collection-grid";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { ApiErrorState } from "@/components/layout/api-error";
import { loadCatalog } from "@/lib/catalog-api";

export const metadata: Metadata = {
  title: "Koleksiyon",
  description: "Zemrek saat koleksiyonunu keşfedin.",
};

export default async function CollectionPage() {
  const { products, failed } = await loadCatalog();

  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-24 pt-28 max-md:px-4 max-md:pb-14 max-md:pt-24">
      <div className="mb-10">
        <Eyebrow className="mb-2.5">Koleksiyon</Eyebrow>
        <h1 className="font-heading text-h1 font-semibold text-heading max-md:text-h2">
          Tüm Modeller
        </h1>
      </div>

      {failed ? (
        <ApiErrorState />
      ) : (
        // Filtreler arama parametrelerini okuduğu için Suspense sınırı gerekli.
        <Suspense fallback={<ProductGridSkeleton />}>
          <CollectionGrid products={products} />
        </Suspense>
      )}
    </div>
  );
}
