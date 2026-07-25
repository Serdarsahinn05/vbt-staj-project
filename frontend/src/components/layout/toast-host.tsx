"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useToastStore, type Toast } from "@/stores/toast-store";

/* Bildirim alanı. Ekranın sağ üstünde, başlığın hemen altında duruyor —
   sepet simgesi de orada olduğu için göz zaten o tarafta. Mobilde tam
   genişlik alıyor. `aria-live` ile ekran okuyucuya da düşüyor. */

const LIFETIME = 5000;
/** Çıkış animasyonu süresi; kart bu kadar sonra listeden düşüyor. */
const EXIT = 260;

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-6 top-24 z-[60] flex flex-col gap-3 max-lg:top-20 max-sm:inset-x-4 max-sm:right-4"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const [leaving, setLeaving] = useState(false);

  /* Kapanış iki adımlı: önce çıkış animasyonu oynuyor, kart listeden ancak
     animasyon bitince düşüyor. Doğrudan kaldırılırsa bildirim aniden yok
     oluyor ve nereye gittiği anlaşılmıyor. */
  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => dismiss(toast.id), EXIT);
  }, [toast.id, dismiss]);

  useEffect(() => {
    const timer = setTimeout(close, LIFETIME);
    return () => clearTimeout(timer);
  }, [close]);

  return (
    <div
      className={cn(
        "pointer-events-auto w-[340px] rounded-lg border border-primary/25 bg-surface p-4 shadow-elevated max-sm:w-full",
        leaving ? "z-toast-out" : "z-toast-in",
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-pill bg-primary-soft"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m4 12.5 5.2 5.2L20 7" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-heading text-[15px] font-semibold text-heading">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-0.5 truncate text-small text-body">
              {toast.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Bildirimi kapat"
          className="-mr-1 -mt-1 shrink-0 cursor-pointer rounded-sm p-1 text-body transition-colors hover:text-heading"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      {toast.action && (
        <Link
          href={toast.action.href}
          onClick={close}
          className={buttonVariants({
            variant: "primary",
            size: "sm",
            className: "mt-3 w-full",
          })}
        >
          {toast.action.label}
        </Link>
      )}
    </div>
  );
}
