"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons";
import { Notice } from "@/components/ui/notice";
import { Star, Stars } from "@/components/ui/stars";
import { useReviews } from "@/hooks/use-reviews";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types";

/* Ürün değerlendirmeleri: ortalama, yorum listesi ve yazma formu.
   Bir kullanıcı aynı ürüne yalnızca bir kez yorum yazabiliyor (backend kuralı),
   bu yüzden kendi yorumu varsa form yerine o yorum ve silme düğmesi çıkıyor. */

/** Liste açılmadan önce gösterilen değerlendirme sayısı. */
const PREVIEW_COUNT = 4;
/** Katlanma animasyonunun süresi; kaydırma bunun bitmesini bekliyor. */
const COLLAPSE_MS = 220;

export function ProductReviews({
  productId,
  productName,
}: {
  productId: number;
  productName: string;
}) {
  const { reviews, average, count, isPending, signedIn, mine, create, remove } =
    useReviews(productId);

  // Kendi yorumu yukarıda ayrı kutuda duruyor; listede tekrar etmesin.
  const others = mine ? reviews.filter((r) => r.id !== mine.id) : reviews;

  /* Popüler modellerde onlarca değerlendirme birikiyor ve sayfanın altını
     kapatıyor. Başlangıçta bir tutam gösterip gerisini tek düğmeye alıyoruz. */
  const [expanded, setExpanded] = useState(false);
  const preview = others.slice(0, PREVIEW_COUNT);
  const rest = others.slice(PREVIEW_COUNT);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function toggleList() {
    const collapsing = expanded;
    setExpanded(!expanded);

    /* Liste kapanırken düğme sayfanın yukarısına fırlıyor ve kullanıcı boşlukta
       kalıyor; onu görünür alana geri getiriyoruz. Kaydırma katlanma bitince
       başlıyor: animasyon sürerken düğmenin yeri hâlâ değiştiği için erken
       hesaplanan hedef şaşıyor. Açarken kaydırmıyoruz — yeni gelen
       değerlendirmeler baştan okunacak. */
    if (collapsing) {
      setTimeout(() => {
        toggleRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, COLLAPSE_MS);
    }
  }

  return (
    <section id="degerlendirmeler" className="mt-16 max-md:mt-10">
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-heading text-h3 font-semibold text-heading">
          Değerlendirmeler
        </h2>
        {count > 0 && (
          <span className="flex items-center gap-2.5 text-small text-body">
            <Stars value={average} />
            <span className="font-heading font-semibold text-heading">
              {average.toFixed(1)}
            </span>
            <span>· {count} değerlendirme</span>
          </span>
        )}
      </div>

      {signedIn ? (
        mine ? (
          <MyReview
            review={mine}
            onDelete={() => remove.mutate(mine.id)}
            deleting={remove.isPending}
            error={remove.error}
          />
        ) : (
          <ReviewForm
            productName={productName}
            onSubmit={(rating, comment) => create.mutate({ rating, comment })}
            sending={create.isPending}
            error={create.error}
          />
        )
      ) : (
        <p className="mb-9 rounded-lg border border-border-subtle bg-surface px-6 py-5 text-[15px] text-body">
          Değerlendirme yapmak için{" "}
          <Link
            href="/giris"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            giriş yapın
          </Link>
          .
        </p>
      )}

      {isPending ? (
        <p className="text-small text-body">Değerlendirmeler yükleniyor…</p>
      ) : others.length === 0 ? (
        <p className="rounded-lg border border-border-subtle bg-surface px-6 py-8 text-center text-[15px] text-body">
          {mine
            ? "Bu modeli değerlendiren ilk kişisiniz."
            : "Bu model için henüz değerlendirme yok."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {preview.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ul>

          {/* Katlanan bölüm: satır yüksekliği 0fr↔1fr arasında geçiyor.
              İçeriğin yüksekliğini önceden bilmek gerekmiyor, `max-height`
              tahminine göre daha doğru açılıp kapanıyor. */}
          {rest.length > 0 && (
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-[220ms] ease-standard",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <ul
                aria-hidden={!expanded}
                className={cn(
                  "flex flex-col gap-4 overflow-hidden transition-opacity duration-[180ms] ease-standard",
                  expanded ? "mt-4 opacity-100" : "opacity-0",
                )}
              >
                {rest.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </ul>
            </div>
          )}

          {others.length > PREVIEW_COUNT && (
            <button
              type="button"
              ref={toggleRef}
              onClick={toggleList}
              aria-expanded={expanded}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border-strong/45 bg-surface py-3.5 font-heading text-small font-semibold text-heading transition-colors duration-[var(--duration-fast)] ease-standard hover:border-primary hover:text-primary"
            >
              {expanded
                ? "Daha az göster"
                : `${rest.length} değerlendirme daha göster`}
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className={cn(
                  "transition-transform duration-[var(--duration-base)] ease-standard",
                  expanded && "rotate-180",
                )}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
        </>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <li className="rounded-lg border border-border-subtle bg-surface p-6 max-sm:p-5">
      <ReviewHead review={review} />
      {review.comment && (
        <p className="mt-3 text-[15px] leading-[1.7] text-body">
          {review.comment}
        </p>
      )}
    </li>
  );
}

function ReviewHead({ review }: { review: Review }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="font-heading text-[15px] font-semibold text-heading">
        {review.user?.name ?? "Zemrek müşterisi"}
      </span>
      <Stars value={review.rating} size={14} />
      <span className="text-small text-body">
        {formatDate(review.createdAt)}
      </span>
    </div>
  );
}

function MyReview({
  review,
  onDelete,
  deleting,
  error,
}: {
  review: Review;
  onDelete: () => void;
  deleting: boolean;
  error: unknown;
}) {
  return (
    <div className="mb-9 rounded-lg border border-primary/25 bg-primary-soft/40 p-6 max-sm:p-5">
      <div className="mb-2 font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body">
        Değerlendirmeniz
      </div>
      <ReviewHead review={review} />
      {review.comment && (
        <p className="mt-3 text-[15px] leading-[1.7] text-body">
          {review.comment}
        </p>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-small text-body underline-offset-4 transition-colors hover:text-primary hover:underline disabled:opacity-50"
      >
        <TrashIcon size={15} />
        {deleting ? "Siliniyor…" : "Değerlendirmemi sil"}
      </button>
      {error ? <Notice tone="error">{errorText(error)}</Notice> : null}
    </div>
  );
}

function ReviewForm({
  productName,
  onSubmit,
  sending,
  error,
}: {
  productName: string;
  onSubmit: (rating: number, comment?: string) => void;
  sending: boolean;
  error: unknown;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Yorum metni isteğe bağlı; göndermek için puan yeterli.
  const ready = rating > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onSubmit(rating, comment.trim() || undefined);
      }}
      className="mb-9 rounded-lg border border-border-subtle bg-surface p-6 max-sm:p-5"
    >
      <h3 className="mb-4 font-heading text-[16px] font-semibold text-heading">
        {productName} modelini değerlendirin
      </h3>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="font-heading text-micro font-semibold uppercase tracking-[0.14em] text-body">
          Puanınız
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} yıldız`}
              aria-pressed={rating === value}
              className={cn(
                "cursor-pointer rounded-sm p-0.5 transition-transform",
                "hover:scale-110 active:scale-95",
              )}
            >
              <Star filled={value <= rating} size={26} />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <span className="text-small text-body">{rating} / 5</span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={600}
        placeholder="İsterseniz birkaç cümle yazın — zorunlu değil."
        className="w-full resize-y rounded-md border border-border-strong/55 bg-surface px-4 py-3 text-[15px] text-body outline-none transition-colors placeholder:text-body/70 focus:border-accent"
      />

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!ready || sending}
        >
          {sending
            ? "Gönderiliyor…"
            : comment.trim()
              ? "Değerlendirmeyi Gönder"
              : "Puanı Gönder"}
        </Button>
        <span className="text-small text-body">{comment.length} / 600</span>
      </div>

      {error ? <Notice tone="error">{errorText(error)}</Notice> : null}
    </form>
  );
}

function errorText(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "İşlem tamamlanamadı, tekrar deneyin.";
}
