"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { fetchProfile } from "@/lib/user-api";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import type { Address } from "@/types";

/* Ödeme akışı arayüzde tamamlanıyor: form doğrulandığında sipariş numarası
   üretilip sepet boşaltılıyor ve onay ekranı gösteriliyor. Girilen kart
   bilgisi hiçbir yere gönderilmiyor, saklanmıyor. */

interface PlacedOrder {
  number: string;
  total: number;
}

function newOrderNumber(): string {
  const serial = Math.floor(100000 + Math.random() * 900000);
  return `ZMR-${new Date().getFullYear()}-${serial}`;
}

export function CheckoutView() {
  const { rows, subtotal, shipping, total, ready } = useCart();
  const clearCart = useCartStore((s) => s.clear);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Onaydan sonra sepet boşaldığı için bu kontrol diğerlerinden önce geliyor;
  // yoksa sipariş verilir verilmez "sepetiniz boş" ekranı açılır.
  if (placed) return <OrderPlaced order={placed} />;

  if (!ready) return <PanelSkeleton rows={2} />;

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Sepetiniz boş"
        message="Ödeme adımına geçmek için sepetinize ürün ekleyin."
      />
    );
  }

  function placeOrder(event: React.FormEvent) {
    event.preventDefault();
    setPlaced({ number: newOrderNumber(), total });
    clearCart();
  }

  return (
    <div className="grid grid-cols-[1fr_360px] items-start gap-10 max-lg:grid-cols-1 max-lg:gap-6">
      <form onSubmit={placeOrder} className="flex flex-col gap-8">
        <AddressSection />

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
        </section>

        <Button type="submit" variant="accent" size="lg" className="w-full">
          Siparişi Onayla
        </Button>
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

/* Teslimat adresi. Giriş yapmış kullanıcının kayıtlı adresleri varsa önce
   onlar listeleniyor; seçilen adres alanları dolduruyor, "Yeni adres" ile
   elle giriş yapılabiliyor. */
function AddressSection() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const signedIn = hydrated && Boolean(user);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: signedIn,
  });

  const saved = profile?.addresses ?? [];
  const [selectedId, setSelectedId] = useState<number | "yeni">("yeni");

  // Adresler sonradan geldiği için ilk kayıtlı adres bir kez seçiliyor.
  const [applied, setApplied] = useState(false);
  if (!applied && saved.length > 0) {
    setApplied(true);
    setSelectedId(saved[0].id);
  }

  const selected = saved.find((a) => a.id === selectedId);

  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-6 max-sm:p-5">
      <h2 className="mb-5 font-heading text-h3 font-semibold text-heading">
        Teslimat Adresi
      </h2>

      {saved.length > 0 && (
        <div className="mb-6 flex flex-col gap-2.5">
          {saved.map((address) => (
            <AddressOption
              key={address.id}
              address={address}
              selected={selectedId === address.id}
              onSelect={() => setSelectedId(address.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => setSelectedId("yeni")}
            aria-pressed={selectedId === "yeni"}
            className={cn(
              "cursor-pointer rounded-md border px-4 py-3 text-left text-small font-medium transition-colors",
              selectedId === "yeni"
                ? "border-primary bg-primary-soft/50 text-heading"
                : "border-border-strong/40 text-body hover:border-primary",
            )}
          >
            Yeni adres gireceğim
          </button>
        </div>
      )}

      {/* Kayıtlı adres seçiliyse alanlar onunla doluyor; `key` değiştiği için
          seçim değişince input'lar yeni değerlerle kuruluyor. */}
      <div
        key={selected?.id ?? "yeni"}
        className="grid grid-cols-2 gap-4 max-sm:grid-cols-1"
      >
        <Input
          label="Ad Soyad"
          name="fullname"
          required
          placeholder="Adınız Soyadınız"
          defaultValue={profile?.name ?? ""}
        />
        <Input label="Telefon" name="phone" type="tel" required placeholder="05xx xxx xx xx" />
        <Input
          label="İl"
          name="city"
          required
          placeholder="İstanbul"
          defaultValue={selected?.city ?? ""}
        />
        <Input
          label="İlçe"
          name="district"
          required
          placeholder="Kadıköy"
          defaultValue={selected?.district ?? ""}
        />
        <div className="col-span-2 max-sm:col-span-1">
          <Input
            label="Adres"
            name="address"
            required
            placeholder="Mahalle, sokak, no"
            defaultValue={selected?.detail ?? ""}
          />
        </div>
      </div>

      {!signedIn && (
        <p className="mt-4 text-small text-body">
          <Link
            href="/giris"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Giriş yaparsanız
          </Link>{" "}
          kayıtlı adresleriniz burada listelenir.
        </p>
      )}
    </section>
  );
}

function AddressOption({
  address,
  selected,
  onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "cursor-pointer rounded-md border px-4 py-3 text-left transition-colors",
        selected
          ? "border-primary bg-primary-soft/50"
          : "border-border-strong/40 hover:border-primary",
      )}
    >
      <div className="font-heading text-small font-semibold text-heading">
        {address.title}
      </div>
      <div className="mt-0.5 text-small text-body">
        {address.detail} · {address.district}/{address.city}
      </div>
    </button>
  );
}

/* Onay ekranı. Marka rengi burada tek başına taşıyıcı: gold vurgu yerine
   emerald, çünkü bu ekran satın almanın tamamlandığını söylüyor. */
function OrderPlaced({ order }: { order: PlacedOrder }) {
  return (
    <div className="mx-auto max-w-[560px] rounded-lg border border-primary/20 bg-surface px-10 py-14 text-center shadow-soft max-sm:px-5 max-sm:py-10">
      <span
        aria-hidden
        className="z-rise mx-auto mb-7 flex size-16 items-center justify-center rounded-pill bg-primary-soft"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m4 12.5 5.2 5.2L20 7" />
        </svg>
      </span>

      <h2 className="mb-3 font-heading text-h2 font-semibold text-heading">
        Siparişiniz alındı
      </h2>
      <p className="mx-auto mb-8 max-w-[42ch] text-[15px] leading-[1.7] text-body">
        Zemrek&apos;i tercih ettiğiniz için teşekkür ederiz. Siparişiniz
        hazırlanmaya başlandı.
      </p>

      <dl className="mb-9 flex flex-col gap-3 rounded-md border border-border-subtle bg-page px-6 py-5 text-left">
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-small text-body">Sipariş Numarası</dt>
          <dd className="font-heading text-small font-semibold text-heading">
            {order.number}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-border-subtle pt-3">
          <dt className="text-small text-body">Ödenen Tutar</dt>
          <dd className="font-heading text-body-lg font-semibold text-heading">
            {formatPrice(order.total)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/koleksiyon"
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          Alışverişe Devam Et
        </Link>
        <Link
          href="/hesap"
          className={buttonVariants({ variant: "secondary", size: "lg" })}
        >
          Hesabım
        </Link>
      </div>
    </div>
  );
}
