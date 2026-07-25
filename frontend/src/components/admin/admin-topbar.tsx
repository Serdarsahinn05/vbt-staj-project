"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { logout } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";

const SECTIONS = [
  { label: "Fiyat & Stok", href: "/admin" },
  { label: "Ürünler", href: "/admin/urunler" },
];

export function AdminTopbar() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-dark">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-4 px-8 max-md:h-auto max-md:flex-wrap max-md:gap-3 max-md:px-4 max-md:py-3">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8" />
          <span className="font-heading text-[13px] font-semibold uppercase tracking-[0.14em] text-gold-300">
            Yönetim
          </span>
        </Link>

        <nav aria-label="Panel bölümleri" className="flex items-center gap-1">
          {SECTIONS.map((section) => {
            const active =
              section.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(section.href);
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-sm px-3 py-1.5 font-heading text-[13px] font-medium transition-colors duration-[var(--duration-fast)] ease-standard",
                  active
                    ? "bg-white/10 text-accent"
                    : "text-on-dark-muted hover:text-on-dark",
                )}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>

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
