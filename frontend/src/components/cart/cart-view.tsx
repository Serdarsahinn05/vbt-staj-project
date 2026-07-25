"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { EmptyState } from "@/components/ui/empty-state";
import { TrashIcon } from "@/components/ui/icons";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";

export function CartView() {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const { rows, subtotal, shipping, total, ready } = useCart();

  if (!ready) return <PanelSkeleton />;

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sepetiniz boş"
        message="Koleksiyonu keşfedip beğendiğiniz modeli ekleyin."
      />
    );
  }

  return (
    <div className="grid grid-cols-[1fr_360px] items-start gap-10 max-lg:grid-cols-1 max-lg:gap-6">
      <div className="flex flex-col gap-4">
        {rows.map(({ item, product, variant }) => (
          <div
            key={item.variantId}
            className="flex gap-5 rounded-lg border border-border-subtle bg-surface p-4 max-sm:gap-3"
          >
            <Link
              href={`/urun/${product.slug}`}
              className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-md bg-graphite-700 max-sm:w-20"
            >
              <ProductImage
                src={variant.images[0]}
                alt={product.name}
                sizes="112px"
                className="object-cover"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body">
                {product.series} Koleksiyonu
              </div>
              <Link
                href={`/urun/${product.slug}`}
                className="mt-1 font-heading text-[16px] font-semibold text-heading transition-colors hover:text-primary"
              >
                {product.name}
              </Link>
              <div className="mt-1 flex items-center gap-2 text-small text-body">
                <span
                  aria-hidden
                  className="size-3 rounded-full border border-border-strong/25"
                  style={{ backgroundColor: variant.colorHex }}
                />
                {variant.colorName}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-4 pt-3">
                <div className="inline-flex items-center rounded-md border border-border-strong/55">
                  <button
                    type="button"
                    aria-label="Adet azalt"
                    onClick={() =>
                      setQuantity(item.variantId, item.quantity - 1)
                    }
                    className="h-9 w-9 cursor-pointer text-body transition-colors hover:text-primary"
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-small font-medium text-heading">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Adet artır"
                    onClick={() =>
                      setQuantity(item.variantId, item.quantity + 1)
                    }
                    disabled={
                      variant.stock > 0 && item.quantity >= variant.stock
                    }
                    className="h-9 w-9 cursor-pointer text-body transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => remove(item.variantId)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-small text-body underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  <TrashIcon size={15} />
                  Kaldır
                </button>

                <div className="ml-auto font-heading text-body-lg font-semibold text-heading">
                  {formatPrice(variant.price * item.quantity)}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={clear}
          className="inline-flex cursor-pointer items-center gap-1.5 self-start text-small text-body underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          <TrashIcon size={15} />
          Sepeti boşalt
        </button>
      </div>

      <aside className="sticky top-28 rounded-lg border border-border-subtle bg-surface p-6 shadow-soft max-lg:static">
        <h2 className="mb-5 font-heading text-h3 font-semibold text-heading">
          Sipariş Özeti
        </h2>

        <dl className="flex flex-col gap-3 text-body">
          <div className="flex justify-between">
            <dt className="text-body">Ara Toplam</dt>
            <dd className="text-heading">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-body">Kargo</dt>
            <dd className="text-heading">
              {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
            </dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-border-subtle pt-4">
            <dt className="font-heading font-semibold text-heading">Toplam</dt>
            <dd className="font-heading text-body-lg font-semibold text-heading">
              {formatPrice(total)}
            </dd>
          </div>
        </dl>

        <Link
          href="/odeme"
          className={buttonVariants({
            variant: "accent",
            size: "lg",
            className: "mt-6 w-full",
          })}
        >
          Siparişi Tamamla
        </Link>
        <Link
          href="/koleksiyon"
          className={buttonVariants({
            variant: "surface",
            size: "md",
            className: "mt-3 w-full",
          })}
        >
          Alışverişe Devam Et
        </Link>
      </aside>
    </div>
  );
}
