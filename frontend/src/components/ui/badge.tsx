import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Badge — design system'deki Badge.jsx ile birebir.
   Yumuşak zemin + koyu accent metin (dolu gold DEĞİL), pill, 4/12 padding. */

export type BadgeTone = "gold" | "emerald" | "dark";

const tones: Record<BadgeTone, string> = {
  gold: "bg-accent-soft text-heading",
  emerald: "bg-primary-soft text-primary",
  dark: "bg-graphite-700 text-on-dark",
};

export function Badge({
  children,
  tone = "gold",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1",
        "text-micro font-semibold uppercase tracking-[0.06em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
