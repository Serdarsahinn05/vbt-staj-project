"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { HeartToggle } from "@/components/ui/heart";
import { CardPending } from "@/components/ui/link-pending";
import { ProductImage } from "@/components/ui/product-image";
import { Stars } from "@/components/ui/stars";
import { useFavorites } from "@/hooks/use-favorites";
import { useReviews } from "@/hooks/use-reviews";
import {
  defaultVariant,
  isNew,
  isNewest,
  type CatalogProduct,
  type CatalogVariant,
} from "@/lib/catalog";
import { formatPrice, formatPriceOrPending } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "@/stores/toast-store";

/* Beyaz yüzey kart, 4:5 görsel. Görsele tıklayınca detaya gider;
   hover'da koyu geçiş üstünde "Sepete Ekle" ve "İncele" belirir.
   Fiyat, stok ve görsel kartın gösterdiği renge aittir; favoriler sayfası
   `variant` vererek favoriye alınan rengi gösterir. */

/* Kart puanı. Ürün listesi ucu ortalama puanı döndürmediği için her kart
   kendi özetini çekiyor; sorgu ürün başına önbelleklendiğinden aynı ürün
   birden çok yerde görünse de tek istek atılıyor. Puanı olmayan üründe
   hiçbir şey basılmıyor — "0 yorum" göstermek boş yer kaplıyor. */
function CardRating({ productId }: { productId: number }) {
  const { average, count } = useReviews(productId);
  if (count === 0) return null;

  return (
    <div className="mt-2 flex items-center gap-2 text-small">
      <Stars value={average} size={13} />
      <span className="font-heading font-semibold text-heading">
        {average.toFixed(1)}
      </span>
      <span className="text-body">({count})</span>
    </div>
  );
}

function BagIcon() {
  return (
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
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function EyeIcon() {
  return (
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ProductCard({
  product,
  variant = defaultVariant(product),
}: {
  product: CatalogProduct;
  variant?: CatalogVariant;
}) {
  const href = `/urun/${product.slug}`;

  const add = useCartStore((s) => s.add);
  const { isFavorite, toggle } = useFavorites();
  const [added, setAdded] = useState(false);

  const fav = isFavorite(variant.id);
  const soldOut = variant.stock === 0;
  const addLabel = added ? "Eklendi ✓" : "Sepete Ekle";

  function handleAdd() {
    add(variant.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    toast({
      title: "Sepete eklendi",
      description:
        product.variants.length > 1
          ? `${product.name} · ${variant.colorName}`
          : product.name,
      action: { label: "Sepete Git", href: "/sepet" },
    });
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-soft transition-[transform,box-shadow] duration-[var(--duration-base)] ease-standard hover:-translate-y-1.5 hover:shadow-elevated">
      <div className="relative aspect-[4/5] bg-graphite-700">
        <ProductImage
          src={variant.images[0]}
          alt={`${product.name} — ${variant.colorName}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
          className="object-cover"
        />

        {/* Bilinçli olarak z-index'siz: yığın bağlamı oluşturmasın ki içindeki
            bekleme göstergesi kalp ve hover butonlarının da üstüne çıkabilsin.
            Konumlandırılmış olduğu için görselin üstünde, DOM sırası gereği
            kendisinden sonraki katmanların altında kalıyor. */}
        <Link
          href={href}
          aria-label={`${product.name} detayına git`}
          className="absolute inset-0"
        >
          <CardPending />
        </Link>

        <div className="absolute left-3 top-3 z-[3] flex flex-col items-start gap-2">
          {/* "En Yeni" tek bir modelde olduğu için emerald ile ayrılıyor;
              gold rozet indirime ayrılmış durumda. */}
          {isNewest(product) ? (
            <Badge tone="emerald">En Yeni</Badge>
          ) : (
            isNew(product) && <Badge tone="emerald">Yeni</Badge>
          )}
          {variant.discount > 0 && <Badge>%{variant.discount} indirim</Badge>}
          {soldOut && <Badge tone="dark">Tükendi</Badge>}
        </div>

        <button
          type="button"
          onClick={() => toggle(variant.id)}
          aria-label={`${product.name} favorilere ${fav ? "eklendi" : "ekle"}`}
          aria-pressed={fav}
          className="absolute right-3.5 top-3.5 z-[5] flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-pill bg-surface shadow-elevated transition-colors duration-[var(--duration-fast)] ease-standard hover:text-primary"
          style={{ color: fav ? "var(--color-primary)" : "var(--text-body)" }}
        >
          <HeartToggle fav={fav} />
        </button>

        {/* Dokunmatik cihazlarda hover yok; orada kartın kendi linki yeterli. */}
        <div className="pointer-events-none absolute inset-0 z-[4] hidden items-end justify-center bg-[linear-gradient(to_top,rgba(13,13,13,0.62),rgba(13,13,13,0)_48%)] opacity-0 transition-opacity duration-[var(--duration-base)] ease-standard group-hover:opacity-100 sm:flex">
          <div className="pointer-events-none flex translate-y-2 gap-2.5 p-4.5 transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:pointer-events-auto group-hover:translate-y-0">
            <Button
              variant="accent"
              size="md"
              onClick={handleAdd}
              disabled={soldOut}
            >
              <BagIcon />
              {soldOut ? "Tükendi" : addLabel}
            </Button>
            <Link href={href} className={buttonVariants({ variant: "overlay" })}>
              <EyeIcon />
              İncele
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 pb-[18px] pt-4">
        <div className="font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body">
          {product.series} Koleksiyonu
        </div>
        <h3 className="mt-1.5 font-heading text-[16px] font-semibold leading-[1.3] text-heading">
          <Link
            href={href}
            className="transition-colors duration-[var(--duration-fast)] ease-standard hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 text-small text-body">
          {product.genders.join(" / ")}
          {product.variants.length > 1 && ` · ${variant.colorName}`}
        </div>

        <CardRating productId={product.id} />

        <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
          <span className="font-heading text-body-lg font-semibold text-heading">
            {formatPriceOrPending(variant.price)}
          </span>
          {variant.discount > 0 && (
            <span className="text-small text-body line-through">
              {formatPrice(variant.listPrice)}
            </span>
          )}
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleAdd}
          disabled={soldOut}
          className="mt-3.5 w-full sm:hidden"
        >
          <BagIcon />
          {soldOut ? "Tükendi" : addLabel}
        </Button>
      </div>
    </article>
  );
}
