import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/* Sepet, favoriler ve ödeme sayfalarının ortak boş durumu. */
export function EmptyState({
  title,
  message,
  actionLabel = "Koleksiyonu Keşfet",
  actionHref = "/koleksiyon",
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface px-6 py-20 text-center">
      <p className="mb-2 font-heading text-h3 font-semibold text-heading">
        {title}
      </p>
      <p className="mb-7 text-body">{message}</p>
      <Link
        href={actionHref}
        className={buttonVariants({ variant: "accent", size: "lg" })}
      >
        {actionLabel}
      </Link>
    </div>
  );
}
