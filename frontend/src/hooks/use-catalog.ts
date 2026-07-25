"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "@/lib/catalog-api";
import { indexVariants } from "@/lib/catalog";

const CATALOG_KEY = ["catalog"] as const;

/* Sepet, favoriler ve ödeme sayfaları yalnızca varyant kimliği saklar;
   ürün adı, görseli ve fiyatı için katalogu buradan çeker. */
export function useCatalog() {
  const query = useQuery({
    queryKey: CATALOG_KEY,
    queryFn: fetchCatalog,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    products: query.data ?? [],
    variantIndex: indexVariants(query.data ?? []),
  };
}
