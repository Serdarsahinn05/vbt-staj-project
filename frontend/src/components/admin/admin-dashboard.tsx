"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { AdminField } from "./admin-field";
import { AdminTopbar } from "./admin-topbar";
import { VariantThumb } from "./variant-thumb";
import { ApiError } from "@/lib/api";
import { fetchAllProducts, updateVariant } from "@/lib/catalog-api";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import {
  finalPrice,
  isValidPrice,
  sanitizePriceInput,
  toNumber,
} from "@/lib/pricing";
import type { Gender, Product, ProductVariant } from "@/types";

/* Fiyat / stok / indirim yönetimi.

   Fiyat ve indirim MODEL bazında: bir saatin rengi değişince fiyatı
   değişmez. Stok renk bazında, çünkü her renkten farklı adet olabilir.
   Backend fiyatı varyantta tuttuğu için kaydederken model fiyatı o modelin
   bütün varyantlarına aynı şekilde yazılıyor.

   Tek yazma ucu `PATCH /products/variants/:id` (ADMIN korumalı). Ürün
   ekleme–silme ve kategori uçları backend'de yetkisiz olduğu için panele
   alınmadı. */

const PRODUCTS_KEY = ["admin", "products"] as const;
const SERIES_ORDER = ["Signature", "Horizon", "Apex"];

type PriceField = "price" | "discount";
type PriceDraft = Partial<Record<PriceField, string>>;
type RowState = { kind: "saved" } | { kind: "error"; message: string };

const GENDER_LABEL: Record<Gender, string> = {
  ERKEK: "Erkek",
  KADIN: "Kadın",
  UNISEX: "Erkek / Kadın", // "Unisex" göstermiyoruz; her iki kategoride de yer alır
};

function fieldError(
  field: PriceField | "stock",
  value: string,
): string | null {
  if (value.trim() === "") return "Boş olamaz";
  if (field === "price") {
    return isValidPrice(value) ? null : "Örn. 61500 veya 61500.50";
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return "Tam sayı olmalı";
  if (field === "discount" && n > 100) return "0 – 100 arası";
  return null;
}

function seriesRank(series: string | null): number {
  const i = SERIES_ORDER.indexOf(series ?? "");
  return i === -1 ? SERIES_ORDER.length : i;
}

/** Modelin geçerli fiyatı: ilk varyantınki. Renkler arası fark olmamalı. */
function serverPrice(product: Product, field: PriceField): string {
  const first = product.variants[0];
  return field === "price" ? first.price : String(first.discount);
}

/** Renkler arasında fiyat ya da indirim farkı kalmış mı? */
function hasVariantMismatch(product: Product): boolean {
  const [first, ...rest] = product.variants;
  return rest.some(
    (v) => v.price !== first.price || v.discount !== first.discount,
  );
}

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: fetchAllProducts,
  });

  const [priceDrafts, setPriceDrafts] = useState<Record<number, PriceDraft>>({});
  const [stockDrafts, setStockDrafts] = useState<Record<number, string>>({});
  const [rowStates, setRowStates] = useState<Record<number, RowState>>({});
  const [missingImages, setMissingImages] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [series, setSeries] = useState("Tümü");
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);

  const products = useMemo(() => {
    const list = data ?? [];
    return [...list].sort(
      (a, b) =>
        seriesRank(a.series) - seriesRank(b.series) ||
        a.name.localeCompare(b.name, "tr"),
    );
  }, [data]);

  const priceOf = (product: Product, field: PriceField): string =>
    priceDrafts[product.id]?.[field] ?? serverPrice(product, field);

  const stockOf = (variant: ProductVariant): string =>
    stockDrafts[variant.id] ?? String(variant.stock);

  const isDirty = (product: Product): boolean =>
    (["price", "discount"] as PriceField[]).some(
      (f) => priceOf(product, f) !== serverPrice(product, f),
    ) ||
    product.variants.some((v) => stockOf(v) !== String(v.stock));

  const errorsOf = (product: Product) => ({
    price: fieldError("price", priceOf(product, "price")),
    discount: fieldError("discount", priceOf(product, "discount")),
    stock: Object.fromEntries(
      product.variants.map((v) => [v.id, fieldError("stock", stockOf(v))]),
    ) as Record<number, string | null>,
  });

  const hasError = (product: Product): boolean => {
    const e = errorsOf(product);
    return Boolean(e.price ?? e.discount) ||
      Object.values(e.stock).some(Boolean);
  };

  const dirtyProducts = products.filter(isDirty);
  const invalidCount = dirtyProducts.filter(hasError).length;

  const stats = useMemo(() => {
    const variants = products.flatMap((p) => p.variants);
    return {
      products: products.length,
      variants: variants.length,
      missingPrice: products.filter((p) => toNumber(p.variants[0].price) === 0)
        .length,
      outOfStock: variants.filter((v) => v.stock === 0).length,
      inventoryValue: variants.reduce(
        (sum, v) => sum + finalPrice(v.price, v.discount) * v.stock,
        0,
      ),
      mismatched: products.filter(hasVariantMismatch).length,
    };
  }, [products]);

  const seriesOptions = useMemo(() => {
    const found = new Set(products.map((p) => p.series ?? "—"));
    return ["Tümü", ...SERIES_ORDER.filter((s) => found.has(s))];
  }, [products]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("tr");
    return products.filter((p) => {
      if (series !== "Tümü" && p.series !== series) return false;
      if (term && !p.name.toLocaleLowerCase("tr").includes(term)) return false;
      if (onlyIncomplete) {
        const incomplete =
          toNumber(p.variants[0].price) === 0 ||
          p.variants.some((v) => v.stock === 0) ||
          hasVariantMismatch(p);
        if (!incomplete) return false;
      }
      return true;
    });
  }, [products, search, series, onlyIncomplete]);

  function clearRowState(productId: number) {
    setRowStates((prev) => {
      if (!(productId in prev)) return prev;
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  function setPrice(product: Product, field: PriceField, raw: string) {
    const value =
      field === "price" ? sanitizePriceInput(raw) : raw.replace(/\D/g, "");
    setPriceDrafts((prev) => ({
      ...prev,
      [product.id]: { ...prev[product.id], [field]: value },
    }));
    clearRowState(product.id);
  }

  function setStock(product: Product, variantId: number, raw: string) {
    setStockDrafts((prev) => ({
      ...prev,
      [variantId]: raw.replace(/\D/g, ""),
    }));
    clearRowState(product.id);
  }

  function resetProduct(product: Product) {
    setPriceDrafts((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    setStockDrafts((prev) => {
      const next = { ...prev };
      for (const v of product.variants) delete next[v.id];
      return next;
    });
  }

  function markMissingImage(variantId: number) {
    setMissingImages((prev) =>
      prev.includes(variantId) ? prev : [...prev, variantId],
    );
  }

  // Model fiyatı, o modelin bütün renklerine aynı değerle yazılır.
  async function save(list: Product[]) {
    const savable = list.filter((p) => !hasError(p));
    if (savable.length === 0) return;

    setSaving(true);
    const results: Record<number, RowState> = {};
    const savedIds: number[] = [];

    for (const product of savable) {
      const price = priceOf(product, "price");
      const discount = Number(priceOf(product, "discount"));
      try {
        for (const variant of product.variants) {
          await updateVariant(variant.id, {
            price,
            discount,
            stock: Number(stockOf(variant)),
          });
        }
        results[product.id] = { kind: "saved" };
        savedIds.push(product.id);
      } catch (err) {
        results[product.id] = {
          kind: "error",
          message: err instanceof ApiError ? err.message : "Kaydedilemedi",
        };
      }
    }

    setRowStates((prev) => ({ ...prev, ...results }));
    setPriceDrafts((prev) => {
      const next = { ...prev };
      for (const id of savedIds) delete next[id];
      return next;
    });
    setStockDrafts((prev) => {
      const next = { ...prev };
      for (const product of savable) {
        if (!savedIds.includes(product.id)) continue;
        for (const v of product.variants) delete next[v.id];
      }
      return next;
    });
    await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    setSaving(false);
  }

  if (isPending) {
    return (
      <Shell>
        <PanelSkeleton rows={4} />
      </Shell>
    );
  }

  if (isError) {
    return (
      <Shell>
        <div className="mx-auto max-w-[520px] rounded-lg border border-[#B3382C]/30 bg-[#B3382C]/10 p-8 text-center">
          <h2 className="font-heading text-h3 font-semibold text-heading">
            Ürünler alınamadı
          </h2>
          <p className="mt-3 text-small text-body">
            {error instanceof ApiError ? error.message : "Sunucuya ulaşılamadı."}
          </p>
          <Button className="mt-6" onClick={() => void refetch()}>
            Yeniden dene
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="z-rise mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow className="mb-2">Katalog</Eyebrow>
          <h1 className="font-heading text-h2 font-semibold text-heading">
            Fiyat &amp; Stok Yönetimi
          </h1>
        </div>
        <Button
          variant="surface"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Yenileniyor…" : "Yenile"}
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <StatCard label="Model" value={String(stats.products)} />
        <StatCard label="Renk varyantı" value={String(stats.variants)} />
        <StatCard
          label="Fiyatı girilmemiş"
          value={String(stats.missingPrice)}
          tone={stats.missingPrice > 0 ? "warn" : "ok"}
        />
        <StatCard
          label="Stoğu biten renk"
          value={String(stats.outOfStock)}
          tone={stats.outOfStock > 0 ? "warn" : "ok"}
        />
        <StatCard
          label="Stok değeri"
          value={formatPrice(stats.inventoryValue)}
        />
      </div>

      {stats.missingPrice > 0 && (
        <Notice>
          <strong className="font-semibold">
            {stats.missingPrice} modelin fiyatı ₺0.
          </strong>{" "}
          Fiyat girilmeden mağazada &quot;Fiyat yakında&quot; yazar ve ürün
          sepete eklenemez.
        </Notice>
      )}

      {stats.mismatched > 0 && (
        <Notice>
          <strong className="font-semibold">
            {stats.mismatched} modelin renkleri arasında fiyat farkı var.
          </strong>{" "}
          Fiyat model bazında olmalı; ilgili modeli kaydettiğinizde bütün
          renkler aynı fiyata eşitlenir.
        </Notice>
      )}

      {missingImages.length > 0 && (
        <Notice>
          <strong className="font-semibold">
            {missingImages.length} rengin görseli yüklenmemiş.
          </strong>{" "}
          Seed bu modeller için de Cloudinary bağlantısı üretmiş ama dosyalar
          orada yok — backend&apos;e bildirilmeli.
        </Notice>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Model ara…"
          aria-label="Model ara"
          className="w-[220px] rounded-sm border border-border-strong/55 bg-surface px-4 py-2.5 text-small text-heading outline-none transition-colors duration-[var(--duration-fast)] ease-standard placeholder:text-body/70 focus:border-accent max-sm:w-full"
        />

        <div className="flex items-center gap-1.5 rounded-pill bg-sunken p-1">
          {seriesOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSeries(option)}
              className={cn(
                "cursor-pointer rounded-pill px-3.5 py-1.5 text-small font-medium",
                "transition-colors duration-[var(--duration-fast)] ease-standard",
                series === option
                  ? "bg-dark text-on-dark"
                  : "text-body hover:text-heading",
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-small text-body">
          <input
            type="checkbox"
            checked={onlyIncomplete}
            onChange={(e) => setOnlyIncomplete(e.target.checked)}
            className="size-4 cursor-pointer accent-[var(--color-accent)]"
          />
          Sadece eksikler
        </label>
      </div>

      <div className="flex flex-col gap-5 pb-28">
        {visibleProducts.map((product) => (
          <ProductGroup
            key={product.id}
            product={product}
            priceOf={priceOf}
            stockOf={stockOf}
            errors={errorsOf(product)}
            dirty={isDirty(product)}
            invalid={hasError(product)}
            mismatched={hasVariantMismatch(product)}
            state={rowStates[product.id]}
            saving={saving}
            onPriceChange={setPrice}
            onStockChange={setStock}
            onReset={resetProduct}
            onSave={(p) => void save([p])}
            onMissingImage={markMissingImage}
          />
        ))}

        {visibleProducts.length === 0 && (
          <p className="rounded-lg border border-border-subtle bg-surface py-16 text-center text-body">
            Filtreye uyan model yok.
          </p>
        )}
      </div>

      {dirtyProducts.length > 0 && (
        <SaveBar
          count={dirtyProducts.length}
          invalidCount={invalidCount}
          saving={saving}
          onSave={() => void save(dirtyProducts)}
          onReset={() => {
            setPriceDrafts({});
            setStockDrafts({});
          }}
        />
      )}
    </Shell>
  );
}

/* ---------- alt bileşenler ---------- */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-page">
      <AdminTopbar />
      <main className="mx-auto max-w-[1180px] px-8 py-10 max-md:px-4 max-md:py-6">
        {children}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-5 shadow-soft">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-body">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 font-heading text-h3 font-semibold tabular-nums",
          tone === "warn" && "text-[#B3382C]",
          tone === "ok" && "text-primary",
          tone === "neutral" && "text-heading",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-md border border-[#B3382C]/25 bg-[#B3382C]/10 px-5 py-4 text-small leading-[1.6] text-body">
      {children}
    </div>
  );
}

type ProductErrors = {
  price: string | null;
  discount: string | null;
  stock: Record<number, string | null>;
};

function ProductGroup({
  product,
  priceOf,
  stockOf,
  errors,
  dirty,
  invalid,
  mismatched,
  state,
  saving,
  onPriceChange,
  onStockChange,
  onReset,
  onSave,
  onMissingImage,
}: {
  product: Product;
  priceOf: (product: Product, field: PriceField) => string;
  stockOf: (variant: ProductVariant) => string;
  errors: ProductErrors;
  dirty: boolean;
  invalid: boolean;
  mismatched: boolean;
  state?: RowState;
  saving: boolean;
  onPriceChange: (product: Product, field: PriceField, value: string) => void;
  onStockChange: (
    product: Product,
    variantId: number,
    value: string,
  ) => void;
  onReset: (product: Product) => void;
  onSave: (product: Product) => void;
  onMissingImage: (variantId: number) => void;
}) {
  const price = priceOf(product, "price");
  const discount = priceOf(product, "discount");
  const net = finalPrice(price, Number(discount) || 0);
  const discounted = !invalid && Number(discount) > 0;
  const totalStock = product.variants.reduce(
    (sum, v) => sum + (Number(stockOf(v)) || 0),
    0,
  );

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border bg-surface shadow-soft transition-colors duration-[var(--duration-fast)] ease-standard",
        dirty ? "border-accent" : "border-border-subtle",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border-subtle bg-sunken px-5 py-4">
        <h2 className="font-heading text-h3 font-semibold text-heading">
          {product.name}
        </h2>
        {product.series && <Badge>{product.series}</Badge>}
        <span className="text-small text-body">
          {GENDER_LABEL[product.gender]}
        </span>
        {product.category && (
          <span className="text-small text-body">
            · {product.category.name}
          </span>
        )}
        <span className="ml-auto text-[11px] tabular-nums text-body">
          #{product.id} · {product.variants.length} renk · toplam {totalStock}{" "}
          adet
        </span>
      </div>

      {/* Fiyat model bazında: bütün renkler için geçerli. */}
      <div
        className={cn(
          "flex flex-wrap items-start gap-x-6 gap-y-4 px-5 py-5",
          dirty && "bg-accent-soft/40",
        )}
      >
        <AdminField
          label="Fiyat (tüm renkler)"
          prefix="₺"
          className="w-[150px]"
          value={price}
          error={errors.price}
          onChange={(e) => onPriceChange(product, "price", e.target.value)}
        />
        <AdminField
          label="İndirim"
          suffix="%"
          className="w-[90px] text-right"
          value={discount}
          error={errors.discount}
          onChange={(e) => onPriceChange(product, "discount", e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
            Satış fiyatı
          </span>
          <div className="flex items-baseline gap-2 py-2">
            {discounted && (
              <span className="text-small tabular-nums text-body line-through">
                {formatPrice(price)}
              </span>
            )}
            <span
              className={cn(
                "font-heading text-body-lg font-semibold tabular-nums",
                invalid ? "text-body" : "text-heading",
              )}
            >
              {invalid ? "—" : formatPrice(net)}
            </span>
          </div>
        </div>

        <div className="ml-auto flex min-h-10 items-center gap-3 self-center">
          {state?.kind === "error" && (
            <span className="text-[11px] text-[#B3382C]">{state.message}</span>
          )}
          {state?.kind === "saved" && !dirty && (
            <span className="text-[11px] font-medium text-primary">
              ✓ Kaydedildi
            </span>
          )}
          {mismatched && !dirty && (
            <span className="text-[11px] text-[#B3382C]">
              Renkler arası fiyat farkı var
            </span>
          )}
          {dirty && (
            <>
              <button
                type="button"
                onClick={() => onReset(product)}
                className="cursor-pointer text-[11px] text-body underline-offset-2 hover:underline"
              >
                Geri al
              </button>
              <Button
                size="sm"
                variant="accent"
                disabled={saving || invalid}
                onClick={() => onSave(product)}
              >
                Kaydet
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stok renk bazında: her renkten farklı adet olabilir. */}
      <div className="divide-y divide-border-subtle border-t border-border-subtle">
        {product.variants.map((variant) => (
          <div
            key={variant.id}
            className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3.5"
          >
            <VariantThumb
              src={variant.images[0]}
              alt={`${product.name} ${variant.colorName}`}
              onMissing={() => onMissingImage(variant.id)}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-full border border-border-strong/30"
                  style={{ backgroundColor: variant.colorHex }}
                />
                <span className="truncate text-body font-medium text-heading">
                  {variant.colorName}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] tabular-nums text-body">
                varyant #{variant.id} · {variant.images.length} görsel
              </div>
            </div>

            <AdminField
              label="Stok"
              className="w-[86px] text-right"
              value={stockOf(variant)}
              error={errors.stock[variant.id]}
              onChange={(e) =>
                onStockChange(product, variant.id, e.target.value)
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function SaveBar({
  count,
  invalidCount,
  saving,
  onSave,
  onReset,
}: {
  count: number;
  invalidCount: number;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-dark">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-8 py-4 max-md:px-4">
        <span className="text-small text-on-dark">
          <strong className="font-semibold">{count}</strong> modelde
          kaydedilmemiş değişiklik
          {invalidCount > 0 && (
            <span className="text-[#E39B93]">
              {" "}
              · {invalidCount} tanesi hatalı, atlanacak
            </span>
          )}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={saving}
            className="cursor-pointer text-small text-on-dark-muted transition-colors duration-[var(--duration-fast)] ease-standard hover:text-accent disabled:opacity-50"
          >
            Tümünü geri al
          </button>
          <Button variant="accent" onClick={onSave} disabled={saving}>
            {saving ? "Kaydediliyor…" : "Tümünü Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
