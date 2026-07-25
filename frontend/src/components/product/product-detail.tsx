"use client";

import { useState } from "react";
import { ProductActions } from "@/components/product/product-actions";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductReviews } from "@/components/product/product-reviews";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Stars } from "@/components/ui/stars";
import { useReviews } from "@/hooks/use-reviews";
import { cn } from "@/lib/cn";
import { formatPrice, formatPriceOrPending } from "@/lib/format";
import { SPEC_FIELDS, specForVariant, type CatalogProduct } from "@/lib/catalog";

const BENEFITS = [
  "Ücretsiz sigortalı kargo",
  "5 yıl uluslararası garanti",
  "30 gün içinde iade ve değişim",
];

/* Detay sayfasının renge bağlı tüm kısmı.
   Renk seçimi galeriyi, fiyatı ve stoğu değiştirir; fotoğraf sırası korunur —
   5. fotoğraftayken renk değiştirilirse yine 5. fotoğrafta kalınır. */
export function ProductDetail({ product }: { product: CatalogProduct }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [imageIndex, setImageIndex] = useState(0);
  // Aynı sorgu aşağıdaki yorum bölümüyle paylaşılıyor; tek istek atılıyor.
  const { average, count } = useReviews(product.id);

  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const multiVariant = product.variants.length > 1;

  /* Diğer renklerin kapak fotoğrafı arka planda ısıtılıyor; renk düğmesine
     basıldığında görsel tarayıcının önbelleğinden gelsin diye. */
  const warmSources = product.variants
    .filter((v) => v.id !== variant.id)
    .map((v) => v.images[0])
    .filter(Boolean);

  /* Künye ürünün tarifi; boş gelen alan hiç basılmıyor. Çift renkli modellerde
     bazı alanlar iki rengi birden anlattığı için seçili renge indirgeniyor.
     Stil etiketleri de aynı listede, onlar da ürünün sabit tarifi. */
  const specs = SPEC_FIELDS.flatMap(({ key, label }) => {
    const value = product[key];
    return value
      ? [{ label, value: specForVariant(value, variant.colorName) }]
      : [];
  });
  if (product.styleTags.length > 0) {
    specs.push({ label: "Stil", value: product.styleTags.join(", ") });
  }

  // Bunlar seçili renge göre değişiyor, künyeden ayrı duruyorlar.
  const details: { label: string; value: string }[] = [
    { label: "Seri", value: `${product.series} Koleksiyonu` },
    { label: "Kategori", value: product.category },
    { label: "Cinsiyet", value: product.genders.join(" / ") },
    { label: "Renk", value: variant.colorName },
    {
      label: "Stok Durumu",
      value: variant.stock > 0 ? `${variant.stock} adet` : "Tükendi",
    },
    { label: "Ürün Kodu", value: `ZMR-${product.id}-${variant.id}` },
  ].filter((d) => d.value);

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-14 max-lg:gap-8">
        <div className="z-rise" style={{ animationDelay: "0.1s" }}>
          <ProductGallery
            images={variant.images}
            alt={`${product.name} ${variant.colorName}`}
            activeIndex={imageIndex}
            onSelect={setImageIndex}
            warmSources={warmSources}
          />
        </div>

        <div className="z-rise" style={{ animationDelay: "0.2s" }}>
          <Eyebrow className="mb-3">{product.series} Koleksiyonu</Eyebrow>
          <h1 className="mb-3.5 text-balance font-heading text-[clamp(26px,3.4vw,38px)] font-semibold leading-[1.2] text-heading">
            {product.name}
          </h1>

          {count > 0 && (
            <a
              href="#degerlendirmeler"
              className="mb-3 inline-flex items-center gap-2.5 text-small text-body transition-colors hover:text-heading"
            >
              <Stars value={average} />
              <span className="font-heading font-semibold text-heading">
                {average.toFixed(1)}
              </span>
              <span>({count} değerlendirme)</span>
            </a>
          )}

          <div className="mb-5 flex flex-wrap items-center gap-2.5 text-small text-body">
            <span>{product.genders.join(" / ")}</span>
            {product.category && <span>· {product.category}</span>}
            {variant.discount > 0 && <Badge>%{variant.discount} indirim</Badge>}
          </div>

          <div className="mb-6 flex flex-wrap items-baseline gap-3">
            <span className="font-heading text-h2 font-semibold text-heading">
              {formatPriceOrPending(variant.price)}
            </span>
            {variant.discount > 0 && (
              <span className="text-body-lg text-body line-through">
                {formatPrice(variant.listPrice)}
              </span>
            )}
          </div>

          <p className="mb-7 max-w-[52ch] text-[15px] leading-[1.7] text-body">
            {product.description}
          </p>

          {multiVariant && (
            <div className="mb-7">
              <div className="mb-2.5 font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body">
                Renk:{" "}
                <span className="normal-case tracking-normal text-heading">
                  {variant.colorName}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    aria-pressed={v.id === variant.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-md border-2 px-4 py-2 text-small font-medium",
                      "transition-[border-color,color] duration-[var(--duration-fast)] ease-standard",
                      "hover:border-accent active:scale-[0.98]",
                      v.id === variant.id
                        ? "border-accent bg-accent-soft text-heading"
                        : "border-border-strong/45 text-body hover:text-heading",
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-4 rounded-full border border-border-strong/25"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    {v.colorName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ProductActions
            variantId={variant.id}
            name={product.name}
            colorName={multiVariant ? variant.colorName : undefined}
            stock={variant.stock}
          />

          <div className="mb-7 text-small text-body">
            {variant.stock > 0
              ? `Stokta ${variant.stock} adet kaldı`
              : "Bu renk şu an tükendi"}
          </div>

          <ul className="flex flex-col gap-2.5 border-t border-border-subtle pt-5 text-[14px] text-body">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2.5">
                <span aria-hidden className="text-accent">
                  —
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {specs.length > 0 && (
        <section className="mt-20 max-md:mt-12">
          <Eyebrow className="mb-3">Künye</Eyebrow>
          <h2 className="mb-7 font-heading text-h3 font-semibold text-heading">
            Teknik Özellikler
          </h2>
          {/* Uzun künye iki sütuna bölünüyor; dar ekranda tek sütuna iniyor ki
              etiket ve değer aynı satırda okunabilsin. */}
          <dl className="grid grid-cols-2 gap-x-14 max-md:grid-cols-1 max-md:gap-x-0">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-6 border-b border-border-subtle py-4"
              >
                <dt className="shrink-0 font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body">
                  {spec.label}
                </dt>
                <dd className="text-right text-[15px] leading-[1.5] text-heading">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-16 max-md:mt-10">
        <h2 className="mb-7 font-heading text-h3 font-semibold text-heading">
          Ürün Bilgileri
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 max-[480px]:grid-cols-1">
          {details.map((d) => (
            <div
              key={d.label}
              className="rounded-lg border border-border-subtle bg-surface px-6 py-5"
            >
              <div className="mb-2 font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body">
                {d.label}
              </div>
              <div className="text-body font-medium text-heading">
                {d.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProductReviews productId={product.id} productName={product.name} />
    </>
  );
}
