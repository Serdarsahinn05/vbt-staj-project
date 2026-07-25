"use client";

import { usePathname } from "next/navigation";

/* Mağaza başlığı/altbilgisi yönetim panelinde görünmesin. Panelin kendi
   üst çubuğu var; vitrin navigasyonu orada kafa karıştırıyor. */

export function StorefrontOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
