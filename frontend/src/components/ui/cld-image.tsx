"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

/* Cloudinary görselleri için next/image sarmalayıcısı.
   src = backend'in verdiği TAM taban URL, örn:
     https://res.cloudinary.com/<cloud>/image/upload/lunaris-silver-1
   Loader, "/upload/" sonrasına responsive dönüşümü (f_auto,q_auto,w_<width>)
   enjekte eder. Cloud adı frontend'de gömülü DEĞİL — sadece gelen URL'i
   dönüştürür. Böylece görselin kaynağı tamamen backend'in sorumluluğunda. */

const UPLOAD = "/image/upload/";

function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const i = src.indexOf(UPLOAD);
  if (i === -1) return src; // Cloudinary teslimat URL'i değilse dokunma
  const transform = `f_auto,q_${quality ?? "auto"},w_${width}`;
  const head = src.slice(0, i + UPLOAD.length);
  const tail = src.slice(i + UPLOAD.length);
  return `${head}${transform}/${tail}`;
}

export function CldImage({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image loader={cloudinaryLoader} alt={alt} {...props} />;
}
