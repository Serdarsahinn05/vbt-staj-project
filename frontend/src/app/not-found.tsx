import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

/* Hem `notFound()` çağrılan yerlerde (ör. olmayan ürün slug'ı) hem de hiçbir
   rotaya uymayan adreslerde çıkar. Kök layout'un içinde render edildiği için
   başlık ve altbilgi yerinde kalıyor. */

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center px-8 pb-28 pt-40 text-center max-md:px-4 max-md:pb-16 max-md:pt-32">
      <Eyebrow className="mb-4">404</Eyebrow>

      <h1 className="mb-4 text-balance font-heading text-[clamp(28px,4.5vw,40px)] font-semibold leading-[1.2] text-heading">
        Aradığınız sayfa yok
      </h1>

      <p className="mb-9 max-w-[46ch] text-[15px] leading-[1.7] text-body">
        Bağlantı eskimiş ya da adres yanlış yazılmış olabilir. Koleksiyondan
        devam edebilirsiniz.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/koleksiyon"
          className={buttonVariants({ variant: "accent", size: "lg" })}
        >
          Koleksiyonu Gör
        </Link>
        <Link
          href="/"
          className={buttonVariants({ variant: "surface", size: "lg" })}
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
