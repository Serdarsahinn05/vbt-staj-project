"use client";

import { useLinkStatus } from "next/link";

/* Tıklanan bağlantının hedefi gelene kadar kartın üstünü karartıp halka
   döndürür. `<Link>`in içinde çalışmak zorunda — durumu oradan okuyor.

   Gecikme bilinçli: rota önceden çekilmişse geçiş anında olur ve gösterge hiç
   görünmez. Yalnızca gerçekten beklenen durumda ortaya çıkıyor, her tıklamada
   göz kırpması yapmıyor. */
export function CardPending() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      data-pending={pending || undefined}
      className={
        "pointer-events-none absolute inset-0 z-[6] flex items-center justify-center " +
        "bg-graphite-700/55 opacity-0 backdrop-blur-[2px] " +
        "transition-opacity duration-200 ease-standard " +
        "data-[pending]:opacity-100 data-[pending]:delay-150"
      }
    >
      <span className="z-spin block h-9 w-9 rounded-pill border-2 border-white/25 border-t-accent" />
    </span>
  );
}
