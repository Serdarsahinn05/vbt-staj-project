"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { logout } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function AdminTopbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-dark">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-4 px-8 max-md:h-auto max-md:flex-wrap max-md:gap-3 max-md:px-4 max-md:py-3">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8" />
          <span className="font-heading text-[13px] font-semibold uppercase tracking-[0.14em] text-gold-300">
            Yönetim
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-5 max-md:ml-0 max-md:w-full max-md:justify-between">
          {user && (
            <span className="text-small text-on-dark-muted max-sm:text-[12px]">
              {user.email}
            </span>
          )}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-small text-on-dark-muted transition-colors duration-[var(--duration-fast)] ease-standard hover:text-accent"
            >
              Mağaza
            </Link>
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer text-small text-on-dark-muted transition-colors duration-[var(--duration-fast)] ease-standard hover:text-accent"
            >
              Çıkış
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
