"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/cn";

/* Ürün galerisi — 1:1 ana görsel + küçük görsel şeridi.
   Aktif indeks dışarıdan gelir; böylece renk değiştirildiğinde aynı sıradaki
   fotoğrafta kalınabilir.

   Fotoğraflar üst üste duruyor ve yalnızca saydamlıkları değişiyor. Sebebi
   hız: küçük görsele tıklandığında büyük hâli yeniden indirilmiyor, zaten
   yüklenmiş katman öne geçiyor — geçiş anında oluyor.

   İlk fotoğraf ekrana gelene kadar diğerleri mount edilmiyor; hepsi birlikte
   inseydi açılıştaki en büyük görsel bandı paylaşmak zorunda kalırdı. */
export function ProductGallery({
  images,
  alt,
  activeIndex,
  onSelect,
  warmSources = [],
}: {
  images: string[];
  alt: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Diğer renklerin ilk fotoğrafı; renk değişimi de beklemesiz olsun diye. */
  warmSources?: string[];
}) {
  const safeIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));
  const [warm, setWarm] = useState(false);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border-subtle bg-sunken">
        {images.map((src, i) => {
          if (i !== 0 && i !== safeIndex && !warm) return null;
          const active = i === safeIndex;
          return (
            <span
              key={src}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 block transition-opacity duration-300 ease-standard",
                active ? "opacity-100" : "opacity-0",
              )}
            >
              <ProductImage
                src={src}
                alt={active ? alt : ""}
                preload={i === 0}
                sizes="(max-width: 768px) 92vw, 45vw"
                className="object-cover"
                onReady={i === 0 ? () => setWarm(true) : undefined}
              />
            </span>
          );
        })}

        {warm &&
          warmSources.map((src) => (
            <span key={src} aria-hidden className="absolute inset-0 opacity-0">
              <ProductImage
                src={src}
                alt=""
                sizes="(max-width: 768px) 92vw, 45vw"
                className="object-cover"
              />
            </span>
          ))}
      </div>

      {images.length > 1 && (
        <div className="mt-3.5 flex flex-wrap gap-3 max-sm:gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`${alt} — görsel ${i + 1}`}
              aria-pressed={i === safeIndex}
              className={cn(
                "relative h-21 w-21 cursor-pointer overflow-hidden rounded-md border-2 bg-sunken max-sm:h-16 max-sm:w-16",
                "transition-[border-color,transform] duration-[var(--duration-fast)] ease-standard",
                "hover:border-accent active:scale-[0.98]",
                i === safeIndex ? "border-accent" : "border-border-strong/35",
              )}
            >
              <ProductImage
                src={src}
                alt=""
                sizes="84px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
