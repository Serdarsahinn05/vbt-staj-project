import { cn } from "@/lib/cn";

/* Favori kalbi — tıklanınca "pop" yapar ve çevresinden halka açılır
   (mini-demodaki zHeartPop + zHeartRing). */

export function HeartIcon({
  filled,
  size = 18,
  className,
}: {
  filled: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

export function HeartToggle({
  fav,
  size = 18,
}: {
  fav: boolean;
  size?: number;
}) {
  return (
    <span className="relative inline-flex items-center justify-center">
      {fav && <span aria-hidden className="z-heart-ring" />}
      <HeartIcon
        key={fav ? "on" : "off"}
        filled={fav}
        size={size}
        className={cn(fav && "z-heart-pop")}
      />
    </span>
  );
}
