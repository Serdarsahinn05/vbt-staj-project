import Image from "next/image";
import { cn } from "@/lib/cn";

/* Resmi marka varlıkları (docs/design-system/assets → public/).
   Koyu zeminde beyaza çevriliyor: filter brightness(0) invert(1).
   Görünen boyut className ile verilir (örn. h-12). */

export function Logo({
  invert = true,
  className,
}: {
  invert?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="/logo.svg"
      alt="Zemrek"
      width={64}
      height={64}
      unoptimized
      className={cn(
        "block h-12 w-auto",
        invert && "[filter:brightness(0)_invert(1)]",
        className,
      )}
    />
  );
}

/* Yazılı logo (wordmark). Amblemin yanında kullanılıyor; ikisi birlikte tek
   bir bağlantı oluşturduğu için `alt` boş — okuyucuya "Zemrek"i amblem
   söylüyor, wordmark onu tekrar etmesin. */
export function Wordmark({
  invert = true,
  className,
}: {
  invert?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="/brand.svg"
      alt=""
      width={1200}
      height={400}
      unoptimized
      aria-hidden
      className={cn(
        "block h-6 w-auto",
        invert && "[filter:brightness(0)_invert(1)]",
        className,
      )}
    />
  );
}
