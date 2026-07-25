import { cn } from "@/lib/cn";

/* Bölüm üstü küçük etiket ("Seçki", "Koleksiyonlar"…).
   Açık zeminde marka rengi metinde değil yanındaki kısa çizgide: gold-700
   beyaz üstünde 2.9:1 veriyor, 11px büyük harf için yetersiz. Yazı graphite,
   kontrast 14:1. Koyu zeminde gold-300 11:1 verdiği için yazı gold kalıyor. */
export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span aria-hidden className="h-px w-7 shrink-0 bg-accent" />
      <span
        className={cn(
          "font-heading text-micro font-semibold uppercase tracking-eyebrow",
          tone === "dark" ? "text-gold-300" : "text-heading",
        )}
      >
        {children}
      </span>
    </div>
  );
}
