"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminField } from "./admin-field";
import { SPEC_FIELDS } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { isValidPrice, sanitizePriceInput } from "@/lib/pricing";
import type {
  Category,
  CreateProductPayload,
  Gender,
  Product,
  VariantPayload,
} from "@/types";

/* Ürün oluşturma ve düzenleme formu.

   Alan kümesi backend DTO'suyla birebir: ad, slug, açıklama, fiyat, en az bir
   cinsiyet, kategori ve en az bir renk zorunlu; seri, stil etiketleri ve
   teknik künye isteğe bağlı.

   Fiyat modelde tutuluyor (tüm renkler aynı), stok renk bazında. */

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "ERKEK", label: "Erkek" },
  { value: "KADIN", label: "Kadın" },
];

const SERIES_OPTIONS = ["Signature", "Horizon", "Apex"];

interface VariantDraft extends VariantPayload {
  /** Görseller formda satır satır girildiği için metin olarak tutuluyor. */
  imagesText: string;
}

function emptyVariant(): VariantDraft {
  return {
    colorName: "",
    colorHex: "#C0C0C0",
    images: [],
    imagesText: "",
    stock: 0,
  };
}

function toDraft(product?: Product): {
  name: string;
  slug: string;
  description: string;
  price: string;
  genders: Gender[];
  series: string;
  styleTags: string;
  categoryId: number | null;
  specs: Record<string, string>;
  variants: VariantDraft[];
} {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    genders: product?.genders ?? ["ERKEK"],
    series: product?.series ?? "",
    styleTags: product?.styleTags?.join(", ") ?? "",
    categoryId: product?.categoryId ?? null,
    specs: Object.fromEntries(
      SPEC_FIELDS.map(({ key }) => [key, (product?.[key] as string) ?? ""]),
    ),
    variants: product
      ? product.variants.map((v) => ({
          colorName: v.colorName,
          colorHex: v.colorHex,
          images: v.images,
          imagesText: v.images.join("\n"),
          stock: v.stock,
          discount: v.discount,
        }))
      : [emptyVariant()],
  };
}

/** Ad → slug. Backend slug'ı kendisi türetmiyor, formda üretiliyor. */
const TR: Record<string, string> = {
  ı: "i", İ: "i", ş: "s", Ş: "s", ğ: "g", Ğ: "g",
  ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c",
};

function slugify(value: string): string {
  return value
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (c) => TR[c])
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  product,
  categories,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  /** Doluysa düzenleme, boşsa oluşturma. */
  product?: Product;
  categories: Category[];
  saving: boolean;
  error: string | null;
  onSubmit: (payload: CreateProductPayload) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(() => toDraft(product));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setVariant = (index: number, patch: Partial<VariantDraft>) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));

  const problems: string[] = [];
  if (!form.name.trim()) problems.push("Ad zorunlu");
  if (!form.slug.trim()) problems.push("Slug zorunlu");
  if (!form.description.trim()) problems.push("Açıklama zorunlu");
  if (!isValidPrice(form.price)) problems.push("Fiyat geçersiz");
  if (form.genders.length === 0) problems.push("En az bir cinsiyet seçin");
  if (!form.categoryId) problems.push("Kategori seçin");
  if (form.variants.some((v) => !v.colorName.trim()))
    problems.push("Her rengin adı olmalı");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (problems.length > 0 || !form.categoryId) return;

    const specs = Object.fromEntries(
      Object.entries(form.specs).filter(([, v]) => v.trim() !== ""),
    );

    onSubmit({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: form.price,
      genders: form.genders,
      categoryId: form.categoryId,
      series: form.series || undefined,
      styleTags: form.styleTags
        ? form.styleTags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      ...specs,
      variants: form.variants.map((v) => ({
        colorName: v.colorName.trim(),
        colorHex: v.colorHex,
        // Her satır bir görsel adresi; boş satırlar atılıyor.
        images: v.imagesText.split("\n").map((l) => l.trim()).filter(Boolean),
        stock: v.stock ?? 0,
        discount: v.discount ?? 0,
      })),
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <section className="rounded-md border border-border-subtle bg-surface shadow-soft p-5">
        <h3 className="mb-4 font-heading text-[15px] font-semibold text-heading">
          Temel bilgiler
        </h3>

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <AdminField
            label="Ad"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({
                ...f,
                name,
                slug: slugTouched ? f.slug : slugify(name),
              }));
            }}
            placeholder="Lunaris"
          />
          <AdminField
            label="Slug (adres)"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            placeholder="lunaris"
          />
          <AdminField
            label="Fiyat"
            prefix="₺"
            value={form.price}
            onChange={(e) => set("price", sanitizePriceInput(e.target.value))}
            error={form.price && !isValidPrice(form.price) ? "Örn. 145000" : null}
            placeholder="145000"
          />
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
              Kategori
            </span>
            <select
              value={form.categoryId ?? ""}
              onChange={(e) => set("categoryId", Number(e.target.value) || null)}
              className="w-full cursor-pointer rounded-sm border border-border-strong/55 bg-surface px-3 py-2 text-small text-heading outline-none focus:border-accent"
            >
              <option value="">Seçin…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
              Seri
            </span>
            <select
              value={form.series}
              onChange={(e) => set("series", e.target.value)}
              className="w-full cursor-pointer rounded-sm border border-border-strong/55 bg-surface px-3 py-2 text-small text-heading outline-none focus:border-accent"
            >
              <option value="">Seri yok</option>
              {SERIES_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <AdminField
            label="Stil etiketleri (virgülle)"
            value={form.styleTags}
            onChange={(e) => set("styleTags", e.target.value)}
            placeholder="Lüks, Dress"
          />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
            Cinsiyet
          </span>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map(({ value, label }) => {
              const on = form.genders.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    set(
                      "genders",
                      on
                        ? form.genders.filter((g) => g !== value)
                        : [...form.genders, value],
                    )
                  }
                  className={cn(
                    "cursor-pointer rounded-sm border px-4 py-1.5 text-small transition-colors",
                    on
                      ? "border-accent bg-accent-soft text-heading"
                      : "border-border-strong/55 text-body hover:border-accent",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
            Açıklama
          </span>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full resize-y rounded-sm border border-border-strong/55 bg-surface px-3 py-2 text-small text-heading outline-none focus:border-accent"
            placeholder="Modelin vitrinde görünen tanıtım metni."
          />
        </label>
      </section>

      <section className="rounded-md border border-border-subtle bg-surface shadow-soft p-5">
        <h3 className="mb-1 font-heading text-[15px] font-semibold text-heading">
          Teknik künye
        </h3>
        <p className="mb-4 text-small text-body">
          Boş bırakılan alanlar ürün sayfasında gösterilmez.
        </p>
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
          {SPEC_FIELDS.map(({ key, label }) => (
            <AdminField
              key={key}
              label={label}
              value={form.specs[key] ?? ""}
              onChange={(e) =>
                set("specs", { ...form.specs, [key]: e.target.value })
              }
            />
          ))}
        </div>
      </section>

      <section className="rounded-md border border-border-subtle bg-surface shadow-soft p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-[15px] font-semibold text-heading">
            Renkler
          </h3>
          <button
            type="button"
            onClick={() =>
              set("variants", [...form.variants, emptyVariant()])
            }
            className="cursor-pointer rounded-sm border border-border-strong/55 px-3 py-1.5 text-small text-body transition-colors hover:border-accent hover:text-accent"
          >
            + Renk ekle
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {form.variants.map((variant, index) => (
            <div
              key={index}
              className="rounded-sm border border-border-subtle bg-page p-4"
            >
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 max-md:grid-cols-1">
                <AdminField
                  label="Renk adı"
                  value={variant.colorName}
                  onChange={(e) =>
                    setVariant(index, { colorName: e.target.value })
                  }
                  placeholder="Rose Gold"
                />
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
                    Renk kodu
                  </span>
                  <input
                    type="color"
                    value={variant.colorHex}
                    onChange={(e) =>
                      setVariant(index, { colorHex: e.target.value })
                    }
                    className="h-[34px] w-16 cursor-pointer rounded-sm border border-border-strong/55 bg-surface"
                  />
                </label>
                <AdminField
                  label="Stok"
                  value={String(variant.stock ?? 0)}
                  onChange={(e) =>
                    setVariant(index, { stock: Number(e.target.value) || 0 })
                  }
                  className="w-24"
                />
              </div>

              <label className="mt-3 flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
                  Görseller — her satıra bir adres
                </span>
                <textarea
                  value={variant.imagesText}
                  onChange={(e) =>
                    setVariant(index, { imagesText: e.target.value })
                  }
                  rows={3}
                  className="w-full resize-y rounded-sm border border-border-strong/55 bg-surface px-3 py-2 font-mono text-[12px] text-heading outline-none focus:border-accent"
                  placeholder={"https://ornek.com/gorsel-1.jpg\nhttps://ornek.com/gorsel-2.jpg"}
                />
              </label>

              {form.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "variants",
                      form.variants.filter((_, i) => i !== index),
                    )
                  }
                  className="mt-3 cursor-pointer text-small text-body underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  Bu rengi kaldır
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {(problems.length > 0 || error) && (
        <div className="rounded-sm border border-[#B3382C]/35 bg-[#B3382C]/8 px-4 py-3 text-small text-[#B3382C]">
          {error ?? problems.join(" · ")}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          variant="accent"
          size="md"
          disabled={problems.length > 0 || saving}
        >
          {saving ? "Kaydediliyor…" : product ? "Değişiklikleri Kaydet" : "Ürünü Oluştur"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-md border border-border-strong/55 px-5 text-small text-body transition-colors hover:border-border-strong hover:text-heading"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
