import { Skeleton } from "@/components/ui/skeleton";

/* Ürün sayfası geçiş iskeleti.
   Ölçüler gerçek sayfayla aynı: geçişte sıçrama olmuyor, kutular yerinde
   duruyor ve yalnızca içerikleri doluyor. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-16 pt-28 max-md:px-4 max-md:pt-24">
      <Skeleton className="mb-8 h-3 w-64" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-14 max-lg:gap-8">
        <div>
          <Skeleton tone="dark" className="aspect-square rounded-lg" />
          <div className="mt-3.5 flex gap-3 max-sm:gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton
                key={i}
                tone="dark"
                className="h-21 w-21 max-sm:h-16 max-sm:w-16"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-3 w-52" />
          <Skeleton className="mt-2 h-8 w-48" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-9/12" />
          <div className="mt-5 flex gap-2.5">
            <Skeleton className="h-11 w-36" />
            <Skeleton className="h-11 w-36" />
          </div>
          <Skeleton className="mt-4 h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
