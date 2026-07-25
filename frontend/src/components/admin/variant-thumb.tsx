"use client";

import { useState } from "react";
import { CldImage } from "@/components/ui/cld-image";

/* Varyantın kapak görseli. Seed henüz yüklenmemiş modeller için de link
   ürettiğinden (nova, drift, valor, void, iris → 404) kırık görseli
   yakalayıp yerine uyarı gösteriyoruz. */

export function VariantThumb({
  src,
  alt,
  onMissing,
}: {
  src?: string;
  alt: string;
  onMissing?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const broken = !src || failed;

  return (
    <div
      className={
        "relative size-14 shrink-0 overflow-hidden rounded-sm border " +
        (broken
          ? "flex items-center justify-center border-[#B3382C]/40 bg-[#B3382C]/10"
          : "border-border-subtle bg-sunken")
      }
    >
      {broken ? (
        <span className="px-1 text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.04em] text-[#B3382C]">
          Görsel
          <br />
          yok
        </span>
      ) : (
        <CldImage
          src={src}
          alt={alt}
          fill
          sizes="56px"
          className="object-cover"
          onError={() => {
            setFailed(true);
            onMissing?.();
          }}
        />
      )}
    </div>
  );
}
