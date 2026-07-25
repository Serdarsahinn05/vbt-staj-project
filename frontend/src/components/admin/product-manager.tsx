"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { AdminTopbar } from "./admin-topbar";
import { ProductForm } from "./product-form";
import { ApiError } from "@/lib/api";
import {
  createProduct,
  deleteProduct,
  fetchAllProducts,
  fetchCategories,
  updateProduct,
} from "@/lib/catalog-api";
import { formatPrice } from "@/lib/format";
import { toNumber } from "@/lib/pricing";
import type { CreateProductPayload, Product } from "@/types";

/* Ürün yönetimi: oluşturma, düzenleme ve silme.
   Fiyat ve stok günlük işi olduğu için ayrı bölümde (/admin) duruyor;
   burası ürünün kendisini tanımlayan alanlarla ilgileniyor. */

const PRODUCTS_KEY = ["admin", "products"] as const;
const CATEGORIES_KEY = ["categories"] as const;

type Mode = { kind: "liste" } | { kind: "yeni" } | { kind: "duzenle"; product: Product };

function errorText(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) return error.message;
  return "İşlem tamamlanamadı, tekrar deneyin.";
}

export function ProductManager() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>({ kind: "liste" });
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const { data: products, isPending } = useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: fetchAllProducts,
  });

  const { data: categories } = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: fetchCategories,
  });

  /* Ürün değişince vitrinin katalogu da tazelensin: aynı veriyi iki ayrı
     sorgu tutuyor (panel ham `Product`, vitrin dönüştürülmüş katalog). */
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    queryClient.invalidateQueries({ queryKey: ["catalog"] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      refresh();
      setMode({ kind: "liste" });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateProductPayload }) =>
      updateProduct(id, payload),
    onSuccess: () => {
      refresh();
      setMode({ kind: "liste" });
    },
  });

  const destroy = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      refresh();
      setConfirmingId(null);
    },
  });

  if (mode.kind !== "liste") {
    const editing = mode.kind === "duzenle" ? mode.product : undefined;
    return (
      <div className="min-h-svh bg-page">
        <AdminTopbar />
        <main className="mx-auto max-w-[1180px] px-8 py-10 max-md:px-4 max-md:py-6">
          {/* Form uzun; listeye dönüş için sayfanın sonuna inmek gerekmesin. */}
          <button
            type="button"
            onClick={() => setMode({ kind: "liste" })}
            className="mb-4 inline-flex cursor-pointer items-center gap-2 text-small text-body transition-colors duration-[var(--duration-fast)] ease-standard hover:text-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Ürünlere dön
          </button>

          <h1 className="mb-6 font-heading text-h2 font-semibold text-heading">
            {editing ? `${editing.name} — Düzenle` : "Yeni Ürün"}
          </h1>
          <ProductForm
            product={editing}
            categories={categories ?? []}
            saving={create.isPending || update.isPending}
            error={errorText(create.error ?? update.error)}
            onCancel={() => setMode({ kind: "liste" })}
            onSubmit={(payload) =>
              editing
                ? update.mutate({ id: editing.id, payload })
                : create.mutate(payload)
            }
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-page">
      <AdminTopbar />

      <main className="mx-auto max-w-[1180px] px-8 py-10 max-md:px-4 max-md:py-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-h2 font-semibold text-heading">
              Ürünler
            </h1>
            <p className="mt-1.5 text-small text-body">
              Katalogdaki modelleri oluşturun, düzenleyin veya kaldırın.
            </p>
          </div>
          <Button
            variant="accent"
            size="md"
            onClick={() => setMode({ kind: "yeni" })}
          >
            Yeni ürün
          </Button>
        </div>

        {errorText(destroy.error) && (
          <div className="mb-6 rounded-sm border border-[#B3382C]/35 bg-[#B3382C]/8 px-4 py-3 text-small text-[#B3382C]">
            {errorText(destroy.error)}
          </div>
        )}

        {isPending ? (
          <PanelSkeleton rows={4} />
        ) : (
          <ul className="flex flex-col gap-3">
            {(products ?? []).map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-center gap-4 rounded-md border border-border-subtle bg-surface shadow-soft p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-heading text-[15px] font-semibold text-heading">
                      {product.name}
                    </span>
                    {product.series && (
                      <span className="rounded-pill bg-sunken px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-body">
                        {product.series}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-small text-body">
                    {formatPrice(toNumber(product.price))} ·{" "}
                    {product.variants.length} renk · /urun/{product.slug}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMode({ kind: "duzenle", product })}
                    className="cursor-pointer rounded-sm border border-border-strong/55 px-3 py-1.5 text-small text-body transition-colors hover:border-accent hover:text-accent"
                  >
                    Düzenle
                  </button>

                  {confirmingId === product.id ? (
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => destroy.mutate(product.id)}
                        disabled={destroy.isPending}
                        className="cursor-pointer rounded-sm border border-[#B3382C] bg-[#B3382C]/10 px-3 py-1.5 text-small text-[#B3382C] transition-colors hover:bg-[#B3382C]/20 disabled:opacity-50"
                      >
                        {destroy.isPending ? "Siliniyor…" : "Evet, sil"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="cursor-pointer text-small text-body underline-offset-4 hover:underline"
                      >
                        Vazgeç
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(product.id)}
                      aria-label={`${product.name} ürününü sil`}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-border-strong/55 px-3 py-1.5 text-small text-body transition-colors hover:border-[#B3382C] hover:text-[#B3382C]"
                    >
                      <TrashIcon size={14} />
                      Sil
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
