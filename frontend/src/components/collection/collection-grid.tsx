"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ui/product-card";
import { cn } from "@/lib/cn";
import {
  compareProducts,
  startingPrice,
  type CatalogProduct,
  type DisplayGender,
} from "@/lib/catalog";

/* Filtreleme ve sıralama tarayıcıda yapılıyor: backend'de seri filtresi ve
   azalan sıralama yok, `?gender=ERKEK` de unisex modelleri atlıyor.
   Katalog 10 ürün olduğu için tamamı zaten tek istekte geliyor. */

type Sort = "onerilen" | "fiyat-artan" | "fiyat-azalan" | "isim";

const SORTS: { key: Sort; label: string }[] = [
  { key: "onerilen", label: "Önerilen" },
  { key: "fiyat-artan", label: "Fiyat: Düşükten Yükseğe" },
  { key: "fiyat-azalan", label: "Fiyat: Yüksekten Düşüğe" },
  { key: "isim", label: "İsme Göre (A-Z)" },
];

const GENDERS: (DisplayGender | "Tümü")[] = ["Tümü", "Erkek", "Kadın"];

const chip =
  "cursor-pointer rounded-pill border px-4 py-2 text-small font-medium transition-all " +
  "duration-[var(--duration-fast)] ease-standard active:scale-[0.98]";

export function CollectionGrid({ products }: { products: CatalogProduct[] }) {
  const params = useSearchParams();
  const rawQuery = params.get("q") ?? "";
  const query = rawQuery.toLocaleLowerCase("tr");

  const urlSeries = params.get("seri") ?? "Tümü";
  const urlGender = params.get("cinsiyet") ?? "Tümü";

  const [series, setSeries] = useState(urlSeries);
  const [gender, setGender] = useState(urlGender);
  const [sort, setSort] = useState<Sort>("onerilen");

  /* Başlıktaki Erkek/Kadın ve altbilgideki seri bağlantıları aynı rotaya
     gidiyor, yani bileşen yeniden kurulmuyor ve seçim kendiliğinden
     güncellenmiyor. Adres değiştiği anda seçimi ona eşitliyoruz. */
  const [appliedUrl, setAppliedUrl] = useState(`${urlSeries}|${urlGender}`);
  if (appliedUrl !== `${urlSeries}|${urlGender}`) {
    setAppliedUrl(`${urlSeries}|${urlGender}`);
    setSeries(urlSeries);
    setGender(urlGender);
  }

  const seriesOptions = useMemo(
    () => ["Tümü", ...new Set(products.map((p) => p.series))],
    [products],
  );

  const list = useMemo(() => {
    const filtered = products.filter((p) => {
      if (series !== "Tümü" && p.series !== series) return false;
      if (gender !== "Tümü" && !p.genders.includes(gender as DisplayGender)) {
        return false;
      }
      if (query) {
        const haystack =
          `${p.name} ${p.series} ${p.category} ${p.description}`.toLocaleLowerCase(
            "tr",
          );
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    switch (sort) {
      case "fiyat-artan":
        return filtered.sort((a, b) => startingPrice(a) - startingPrice(b));
      case "fiyat-azalan":
        return filtered.sort((a, b) => startingPrice(b) - startingPrice(a));
      case "isim":
        return filtered.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      default:
        return filtered.sort(compareProducts);
    }
  }, [products, series, gender, sort, query]);

  return (
    <>
      {rawQuery && (
        <p className="mb-6 text-body">
          <b className="text-heading">“{rawQuery}”</b> için {list.length} sonuç
        </p>
      )}

      <div className="mb-8 flex flex-col gap-4 border-b border-border-subtle pb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="mr-1 font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body">
            Seri
          </span>
          {seriesOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeries(s)}
              aria-pressed={series === s}
              className={cn(
                chip,
                series === s
                  ? "border-accent bg-accent-soft text-heading"
                  : "border-border-strong/40 text-body hover:border-accent hover:text-heading",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="mr-1 font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body">
            Cinsiyet
          </span>
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              aria-pressed={gender === g}
              className={cn(
                chip,
                gender === g
                  ? "border-accent bg-accent-soft text-heading"
                  : "border-border-strong/40 text-body hover:border-accent hover:text-heading",
              )}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="siralama"
            className="font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body"
          >
            Sırala
          </label>
          <select
            id="siralama"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="cursor-pointer rounded-md border border-border-strong/55 bg-surface px-4 py-2.5 text-small text-body outline-none transition-colors focus:border-accent max-sm:w-full"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <span className="ml-auto text-small text-body max-sm:ml-0">
            {list.length} model
          </span>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-lg border border-border-subtle bg-surface px-6 py-16 text-center">
          <p className="mb-2 font-heading text-h3 font-semibold text-heading">
            Sonuç bulunamadı
          </p>
          <p className="text-body">
            Filtreleri değiştirip tekrar deneyin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 max-sm:grid-cols-1 max-sm:gap-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
