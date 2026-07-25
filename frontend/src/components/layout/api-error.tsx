import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/* Katalog backend'den geldiği için API kapalıyken sayfa çökmesin diye
   gösterilen durum. */
export function ApiErrorState({
  title = "Katalog yüklenemedi",
  message = "Ürün servisine şu anda ulaşılamıyor. Lütfen birazdan tekrar deneyin.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="mx-auto max-w-[520px] rounded-lg border border-border-subtle bg-surface px-6 py-16 text-center shadow-soft">
      <p className="mb-2 font-heading text-h3 font-semibold text-heading">
        {title}
      </p>
      <p className="mb-7 text-body">{message}</p>
      <Link href="/" className={buttonVariants({ variant: "surface" })}>
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
