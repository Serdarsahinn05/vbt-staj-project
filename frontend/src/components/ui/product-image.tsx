"use client";

import { useState } from "react";
import { CldImage } from "@/components/ui/cld-image";
import { cn } from "@/lib/cn";

/* Ürün görseli — üç durumu var:
   - inerken altında parlayan iskelet duruyor, görsel gelince yumuşak geçiyor,
   - dosya yüklenmemişse (Cloudinary 404) marka dokusuna düşüyor,
   - kaynak hiç yoksa doğrudan marka dokusu.

   Backend katalogda her varyant için bağlantı üretiyor ama beş modelin
   dosyaları henüz yüklenmedi; kırık resim ikonu göstermemek için yedek şart. */

function Placeholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-graphite-700">
      <span className="font-heading text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-300/70">
        Zemrek
      </span>
    </div>
  );
}

export function ProductImage({
  src,
  alt,
  sizes,
  className,
  preload,
  onReady,
}: {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
  /** Görsel ekrana geldiğinde haber verir — galeri kalan fotoğrafları bununla ısıtıyor. */
  onReady?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <Placeholder />;

  return (
    <>
      {!loaded && (
        <span
          aria-hidden
          className="z-shimmer-dark absolute inset-0 block bg-graphite-500"
        />
      )}
      <CldImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className={cn(
          "transition-opacity duration-500 ease-standard",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={() => {
          setLoaded(true);
          onReady?.();
        }}
        onError={() => setFailed(true)}
      />
    </>
  );
}
