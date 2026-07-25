import { cn } from "@/lib/cn";

/* Puan göstergesi. Yarım yıldız yok: ortalama en yakın yarıma değil, dolu
   yıldız sayısına yuvarlanıyor ve sayısal değer zaten yanında yazıyor. */

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "var(--color-star-gold)" : "none"}
      stroke={filled ? "var(--color-star-gold)" : "currentColor"}
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden
      className={filled ? undefined : "opacity-45"}
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z" />
    </svg>
  );
}

export function Stars({
  value,
  size = 15,
  className,
}: {
  /** 0–5 arası puan. */
  value: number;
  size?: number;
  className?: string;
}) {
  const filled = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= filled} size={size} />
      ))}
    </span>
  );
}
