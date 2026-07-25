import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Bilgi kutusu. `tone="error"` sunucudan dönen hata mesajları için. */
export function Notice({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: "info" | "error";
  className?: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "mt-5 rounded-md border px-4 py-3 text-small leading-[1.6]",
        tone === "error"
          ? "border-[#B3382C]/30 bg-[#B3382C]/10 text-[#B3382C]"
          : "border-border-subtle bg-sunken text-body",
        className,
      )}
    >
      {children}
    </p>
  );
}
