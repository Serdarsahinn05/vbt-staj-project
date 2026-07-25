"use client";

import { useState } from "react";
import { HeartToggle } from "@/components/ui/heart";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/cn";
import { useCartActions } from "@/hooks/use-cart";
import { toast } from "@/stores/toast-store";

/* Detay sayfasının eylem butonları: Sepete Ekle (gold) + Favorilere Ekle.
   İkisi de seçili rengin varyant kimliğiyle çalışır. */
export function ProductActions({
  variantId,
  name,
  colorName,
  stock,
}: {
  variantId: number;
  name: string;
  colorName?: string;
  stock: number;
}) {
  const { add } = useCartActions();
  const { isFavorite, toggle } = useFavorites();
  const [added, setAdded] = useState(false);

  const fav = isFavorite(variantId);
  const soldOut = stock === 0;

  function handleAdd() {
    add(variantId, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    toast({
      title: "Sepete eklendi",
      description: colorName ? `${name} · ${colorName}` : name,
      action: { label: "Sepete Git", href: "/sepet" },
    });
  }

  return (
    <div className="mb-3 flex flex-wrap gap-3.5 max-sm:flex-col">
      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        aria-pressed={added}
        className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-md bg-accent px-7 py-4 text-[15px] font-medium text-graphite-700 transition-all duration-[var(--duration-fast)] ease-standard hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          width="17"
          height="17"
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
        {soldOut ? "Tükendi" : added ? "Sepete Eklendi ✓" : "Sepete Ekle"}
      </button>

      <button
        type="button"
        onClick={() => toggle(variantId)}
        aria-pressed={fav}
        aria-label={`${name} favorilere ${fav ? "eklendi" : "ekle"}`}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-md border bg-surface px-7 py-4 text-[15px] font-medium",
          "transition-all duration-[var(--duration-fast)] ease-standard active:scale-[0.98]",
          "hover:border-primary hover:text-primary",
          fav ? "border-primary text-primary" : "border-border-subtle text-body",
        )}
      >
        <HeartToggle fav={fav} size={17} />
        {fav ? "Favorilerde" : "Favorilere Ekle"}
      </button>
    </div>
  );
}
