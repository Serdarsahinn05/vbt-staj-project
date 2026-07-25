import { cn } from "@/lib/cn";

/* İskelet yer tutucu. `tone="dark"` ürün görselleri gibi koyu zeminlerde
   kullanılır; parlama oradan geçen açık bir bant olarak görünür. */
export function Skeleton({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block overflow-hidden rounded-md",
        tone === "dark" ? "z-shimmer-dark bg-graphite-500" : "z-shimmer bg-sunken",
        className,
      )}
    />
  );
}

/** Koleksiyon ve favori ızgaralarının bekleme kartı; kart ölçüleriyle aynı. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-soft">
      <Skeleton tone="dark" className="aspect-[4/5] rounded-none" />
      <div className="flex flex-col gap-2.5 px-4 pb-5 pt-4">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="mt-1 h-5 w-32" />
      </div>
    </div>
  );
}

/* Sepet, hesap ve panel gibi liste görünümlerinin bekleme hâli.
   "Yükleniyor…" yazısı yerine sayfanın kendi ritmini taklit ediyor. */
export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface p-5"
        >
          <Skeleton className="h-16 w-16 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-24 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 max-sm:grid-cols-1 max-sm:gap-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
