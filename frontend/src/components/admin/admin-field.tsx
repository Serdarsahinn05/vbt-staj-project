"use client";

import { cn } from "@/lib/cn";

/* Panelin kompakt sayı alanı. Vitrindeki Input'tan daha küçük ve
   ön/son ekli (₺ ... %) olduğu için ayrı duruyor. */

export function AdminField({
  label,
  prefix,
  suffix,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  prefix?: string;
  suffix?: string;
  error?: string | null;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body">
        {label}
      </span>
      <span className="relative flex items-center">
        {prefix && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 text-small text-body"
          >
            {prefix}
          </span>
        )}
        <input
          inputMode="decimal"
          autoComplete="off"
          className={cn(
            "w-full rounded-sm border bg-surface py-2 text-small tabular-nums text-heading outline-none",
            "transition-colors duration-[var(--duration-fast)] ease-standard focus:border-accent",
            prefix ? "pl-7" : "pl-3",
            suffix ? "pr-7" : "pr-3",
            error ? "border-[#B3382C]" : "border-border-strong/55",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {suffix && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 text-small text-body"
          >
            {suffix}
          </span>
        )}
      </span>
      {error && (
        <span className="text-[10px] text-[#B3382C]">{error}</span>
      )}
    </label>
  );
}
