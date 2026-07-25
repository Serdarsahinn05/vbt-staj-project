"use client";

import { useState } from "react";
import { Notice } from "@/components/ui/notice";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";

/* Ödeme adımı arayüz seviyesinde hazır. Backend'de sipariş modülü
   (`/orders`) bulunmadığı için form gönderimi hiçbir yere iletilmiyor. */
export function CheckoutView() {
  const { rows, subtotal, shipping, total, ready } = useCart();
  const [submitted, setSubmitted] = useState(false);

  if (!ready) return <PanelSkeleton rows={2} />;

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sepetiniz boş"
        message="Ödeme adımına geçmek için sepetinize ürün ekleyin."
      />
    );
  }

  return (
    <div className="grid grid-cols-[1fr_360px] items-start gap-10 max-lg:grid-cols-1 max-lg:gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="flex flex-col gap-8"
      >
        <section className="rounded-lg border border-border-subtle bg-surface p-6 max-sm:p-5">
          <h2 className="mb-5 font-heading text-h3 font-semibold text-heading">
            Teslimat Adresi
          </h2>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <Input label="Ad Soyad" name="fullname" required placeholder="Adınız Soyadınız" />
            <Input label="Telefon" name="phone" type="tel" required placeholder="05xx xxx xx xx" />
            <Input label="İl" name="city" required placeholder="İstanbul" />
            <Input label="İlçe" name="district" required placeholder="Kadıköy" />
            <div className="col-span-2 max-sm:col-span-1">
              <Input label="Adres" name="address" required placeholder="Mahalle, sokak, no" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-subtle bg-surface p-6 max-sm:p-5">
          <h2 className="mb-5 font-heading text-h3 font-semibold text-heading">
            Kart Bilgileri
          </h2>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div className="col-span-2 max-sm:col-span-1">
              <Input label="Kart Üzerindeki İsim" name="cardname" required placeholder="Adınız Soyadınız" />
            </div>
            <div className="col-span-2 max-sm:col-span-1">
              <Input label="Kart Numarası" name="cardnumber" required inputMode="numeric" placeholder="0000 0000 0000 0000" />
            </div>
            <Input label="Son Kullanma" name="expiry" required placeholder="AA/YY" />
            <Input label="CVV" name="cvv" required inputMode="numeric" placeholder="123" />
          </div>

          <Notice>
            Bu form yalnızca arayüz denemesidir. Sipariş oluşturma backend
            tarafında henüz yok — girdiğiniz bilgiler hiçbir yere gönderilmez.
          </Notice>
        </section>

        <Button type="submit" variant="accent" size="lg" className="w-full">
          Siparişi Onayla
        </Button>

        {submitted && (
          <Notice>
            Form doğrulandı. Sipariş kaydı, backend sipariş servisi
            eklendiğinde oluşturulacak.
          </Notice>
        )}
      </form>

      <aside className="sticky top-28 rounded-lg border border-border-subtle bg-surface p-6 shadow-soft max-lg:static">
        <h2 className="mb-5 font-heading text-h3 font-semibold text-heading">
          Sipariş Özeti
        </h2>

        <ul className="mb-5 flex flex-col gap-3 border-b border-border-subtle pb-5">
          {rows.map(({ item, product, variant }) => (
            <li
              key={item.variantId}
              className="flex justify-between gap-3 text-small"
            >
              <span className="text-body">
                {product.name}{" "}
                <span className="text-body">
                  · {variant.colorName} × {item.quantity}
                </span>
              </span>
              <span className="shrink-0 text-heading">
                {formatPrice(variant.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

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
      </aside>
    </div>
  );
}
