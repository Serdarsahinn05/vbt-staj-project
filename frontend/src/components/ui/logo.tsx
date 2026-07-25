import Image from "next/image";
import { cn } from "@/lib/cn";

/* Resmi marka logosu (docs/design-system/assets/logo.svg → public/logo.svg).
   Mini-demo koyu zeminde beyaza çeviriyor: filter brightness(0) invert(1).
   Wordmark YOK — sadece mark. Görünen boyut className ile verilir (örn. h-12). */

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
