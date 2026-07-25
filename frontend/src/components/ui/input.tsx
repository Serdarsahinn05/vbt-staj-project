import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* Input — design system'deki Input.jsx ile birebir.
   Etiket + alan + hata metni; hata rengi #B3382C. */

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5">
      {label && (
        <span className="text-small font-medium text-heading">{label}</span>
      )}
      <input
        id={inputId}
        className={cn(
          "rounded-md border bg-surface px-4 py-3 text-[15px] text-body outline-none",
          "transition-colors duration-[var(--duration-fast)] ease-standard",
          // İpucu metni `text-muted` değil: o renk beyaz üstünde 2.5:1 kalıyor.
          "placeholder:text-body/70 focus:border-accent",
          error ? "border-[#B3382C]" : "border-border-strong/55",
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && <span className="text-micro text-[#B3382C]">{error}</span>}
    </label>
  );
}
