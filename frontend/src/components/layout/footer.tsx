import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { SERIES_ORDER } from "@/lib/catalog";

/* Footer — graphite-700 zemin, logo 64px, gold-300 kolon başlıkları. */

const COLUMNS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Koleksiyonlar",
    links: [
      { label: "Tüm Modeller", href: "/koleksiyon" },
      ...SERIES_ORDER.map((series) => ({
        label: series,
        href: `/koleksiyon?seri=${series}`,
      })),
    ],
  },
  {
    title: "Destek",
    links: [
      { label: "Sıkça Sorulan Sorular", href: "#" },
      { label: "Kargo ve Teslimat", href: "#" },
      { label: "İade ve Değişim", href: "#" },
      { label: "Garanti", href: "#" },
    ],
  },
  {
    title: "Hesap",
    links: [
      { label: "Giriş Yap", href: "/giris" },
      { label: "Kayıt Ol", href: "/kayit" },
      { label: "Hesabım", href: "/hesap" },
      { label: "Favorilerim", href: "/favoriler" },
    ],
  },
  {
    title: "Sosyal Medya",
    links: [
      { label: "Instagram", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "Pinterest", href: "#" },
      { label: "X", href: "#" },
    ],
  },
];

const linkCls =
  "text-small text-on-dark-muted transition-colors duration-[var(--duration-fast)] ease-standard hover:text-accent";

export function Footer() {
  return (
    <footer className="bg-graphite-700 text-on-dark">
      <div className="mx-auto max-w-[1280px] px-8 pb-8 pt-18 max-md:px-4 max-md:pt-12">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-10 max-md:grid-cols-2 max-[480px]:grid-cols-1">
          <div>
            <Logo className="h-16 max-md:h-12" />
            <p className="mt-4 max-w-[220px] text-small leading-[1.6] text-on-dark-muted">
              Zamansız zarafeti keşfedin.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} className="flex flex-col gap-3">
              <div className="mb-1 font-heading text-[12px] font-semibold uppercase tracking-[0.14em] text-gold-300">
                {col.title}
              </div>
              {col.links.map((link) => (
                <Link key={link.label} href={link.href} className={linkCls}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-[12px] text-on-dark-muted max-md:mt-10">
          <span>© {new Date().getFullYear()} Zemrek. Tüm hakları saklıdır.</span>
          <div className="flex flex-wrap gap-6 max-sm:gap-4">
            <Link href="#" className="text-[12px] text-on-dark-muted transition-colors hover:text-accent">
              KVKK
            </Link>
            <Link href="#" className="text-[12px] text-on-dark-muted transition-colors hover:text-accent">
              Gizlilik
            </Link>
            <Link href="#" className="text-[12px] text-on-dark-muted transition-colors hover:text-accent">
              Çerez Politikası
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
