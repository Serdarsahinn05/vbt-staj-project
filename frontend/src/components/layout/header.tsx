"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { useFavorites } from "@/hooks/use-favorites";
import { useCartStore, cartCount } from "@/stores/cart-store";
import { isAdmin, useAuthStore } from "@/stores/auth-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Koleksiyon", href: "/koleksiyon" },
  { label: "Erkek", href: "/koleksiyon?cinsiyet=Erkek" },
  { label: "Kadın", href: "/koleksiyon?cinsiyet=Kadın" },
  { label: "Hikayemiz", href: "/#hikaye" },
];

const iconBtn =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-pill text-on-dark " +
  "transition-all duration-[var(--duration-fast)] ease-standard hover:bg-white/10 hover:text-accent active:scale-[0.98]";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-bold text-graphite-700"
    >
      {n}
    </span>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();

  const items = useCartStore((s) => s.items);
  const { ids: favIds } = useFavorites();
  const user = useAuthStore((s) => s.user);
  const count = cartCount(items);

  // Ana sayfada koyu hero var → şeffaf başlar. Diğer sayfalarda baştan opak.
  const solid = scrolled || menuOpen || pathname !== "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/koleksiyon?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-[14px] transition-[background-color,border-color] duration-[var(--duration-base)] ease-standard"
      style={{
        backgroundColor: solid ? "rgba(13,13,13,0.88)" : "rgba(13,13,13,0.30)",
        borderBottomColor: solid ? "rgba(255,255,255,0.08)" : "transparent",
      }}
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-6 px-8 py-3.5 max-lg:gap-2 max-lg:px-4 max-lg:py-3">
        <Link href="/" aria-label="Zemrek ana sayfa" className="inline-flex">
          <Logo className="h-12 max-lg:h-9" />
        </Link>

        <nav
          aria-label="Ana menü"
          className="hidden justify-center gap-9 lg:flex"
        >
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="whitespace-nowrap font-heading text-[13px] font-medium tracking-[0.06em] text-on-dark/85 transition-colors duration-[var(--duration-fast)] ease-standard hover:text-accent"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1.5 max-lg:gap-0.5">
          {/* Sola doğru açılan arama */}
          <form onSubmit={submitSearch} className="flex items-center">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => !query && setSearchOpen(false)}
              placeholder="Model ara…"
              aria-label="Ürün ara"
              aria-hidden={!searchOpen}
              tabIndex={searchOpen ? 0 : -1}
              className={cn(
                "h-10 rounded-pill border border-white/15 bg-white/10 text-small text-on-dark outline-none",
                "placeholder:text-on-dark-muted focus:border-accent",
                "transition-[width,opacity,padding] duration-[var(--duration-base)] ease-standard",
                searchOpen
                  ? "w-56 px-4 opacity-100 max-sm:w-40"
                  : "w-0 border-transparent px-0 opacity-0",
              )}
            />
            <button
              type={searchOpen && query ? "submit" : "button"}
              onClick={() => {
                if (!searchOpen) setSearchOpen(true);
                else if (!query) setSearchOpen(false);
              }}
              aria-label="Ara"
              aria-expanded={searchOpen}
              className={iconBtn}
            >
              <Icon>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </Icon>
            </button>
          </form>

          <div className="relative">
            <Link href="/favoriler" aria-label="Favoriler" className={iconBtn}>
              <Icon>
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7Z" />
              </Icon>
            </Link>
            {hydrated && favIds.length > 0 && <CountBadge n={favIds.length} />}
          </div>

          {hydrated && isAdmin(user) && (
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-pill border border-accent/40 px-3 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.1em] text-accent transition-colors duration-[var(--duration-fast)] ease-standard hover:bg-accent hover:text-graphite-700 max-lg:hidden"
            >
              Panel
            </Link>
          )}

          <Link
            href="/hesap"
            aria-label={hydrated && user ? `Hesabım — ${user.email}` : "Hesabım"}
            className={cn(iconBtn, "max-sm:hidden")}
          >
            <Icon>
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </Icon>
          </Link>

          <div className="relative">
            <Link
              href="/sepet"
              aria-label={`Sepet${count > 0 ? ` (${count} ürün)` : ""}`}
              className={iconBtn}
            >
              <Icon>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </Icon>
            </Link>
            {hydrated && count > 0 && <CountBadge n={count} />}
          </div>

          <button
            type="button"
            aria-label="Menü"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(iconBtn, "lg:hidden")}
          >
            <Icon>
              {menuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </Icon>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-t border-white/10 px-4 pb-3 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 font-heading text-[13px] font-medium tracking-[0.06em] text-on-dark/85 transition-colors hover:text-accent"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/hesap"
            onClick={() => setMenuOpen(false)}
            className="py-2.5 font-heading text-[13px] font-medium tracking-[0.06em] text-on-dark/85 transition-colors hover:text-accent sm:hidden"
          >
            Hesabım
          </Link>
          {hydrated && isAdmin(user) && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 font-heading text-[13px] font-medium tracking-[0.06em] text-accent transition-colors hover:text-accent-hover"
            >
              Yönetim Paneli
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
