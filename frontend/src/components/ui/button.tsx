import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* Zemrek Button — design system'deki Button.jsx ile birebir.
   Ölçüler: sm 8/16·13px · md 12/20·14px · lg 14/28·15px, radius-md, 150ms.
   Link'i buton gibi göstermek için buttonVariants()'ı <Link className=...>'de kullan. */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "accentMuted"
  | "surface"
  | "overlay"
  | "ghost"
  | "dark";

export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md border border-transparent " +
  "font-medium tracking-[0.01em] whitespace-nowrap cursor-pointer select-none " +
  "transition-all duration-[var(--duration-fast)] ease-standard " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

/* Kontrol kenarlıkları `border-strong` kullanıyor: `border-subtle` (#E5E5E5)
   beyazla 1.3:1 kalıyor, ayırıcı çizgi için yeterli ama buton kenarı için
   değil — beyaz zeminde buton olduğu seçilmiyor. */
const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-inverse hover:bg-primary-hover",
  secondary:
    "bg-primary-soft text-primary border-primary hover:bg-primary hover:text-inverse",
  accent: "bg-accent text-graphite-700 hover:bg-accent-hover",
  accentMuted: "bg-accent-muted text-graphite-700 hover:bg-accent-soft",
  surface:
    "bg-surface text-heading border-border-strong/55 shadow-soft hover:border-border-strong hover:bg-sunken",
  overlay:
    "bg-surface text-graphite-700 shadow-elevated hover:bg-sunken",
  ghost: "bg-transparent text-heading hover:bg-sunken",
  dark: "bg-dark text-on-dark hover:bg-dark-elevated",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-small",
  md: "px-5 py-3 text-[14px]",
  lg: "px-7 py-3.5 text-[15px]",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
