import type { Metadata } from "next";
import { CollectionGrid } from "@/components/collection/collection-grid";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ApiErrorState } from "@/components/layout/api-error";
import { loadCatalog } from "@/lib/catalog-api";

export const metadata: Metadata = {
  title: "Koleksiyon",
  description: "Zemrek saat koleksiyonunu keşfedin.",
};

/* Filtre seçimleri adresten sunucuda okunup prop olarak iniyor. `useSearchParams`
   bir Suspense sınırı gerektiriyor; sayfa zaten dinamik olduğu için o sınıra
   gerek kalmıyor. */
type Params = {
  searchParams: Promise<{ q?: string; seri?: string; cinsiyet?: string }>;
};

export default async function CollectionPage({ searchParams }: Params) {
  const [{ products, failed }, sp] = await Promise.all([
    loadCatalog(),
    searchParams,
  ]);

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
        <CollectionGrid
          products={products}
          query={sp.q ?? ""}
          series={sp.seri ?? "Tümü"}
          gender={sp.cinsiyet ?? "Tümü"}
        />
      )}
    </div>
  );
}
