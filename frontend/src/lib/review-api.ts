import { api } from "@/lib/api";
import type { Review, ReviewSummary } from "@/types";

/* Yorum uçları. Liste herkese açık; yazma ve silme JWT istiyor.
   Backend ürün başına tek yorum tutuyor, ikinci deneme 409 dönüyor. */

export function fetchReviews(productId: number): Promise<ReviewSummary> {
  return api<ReviewSummary>(`/products/${productId}/reviews`);
}

export function addReview(
  productId: number,
  rating: number,
  comment: string,
): Promise<Review> {
  return api<Review>(`/products/${productId}/reviews`, {
    method: "POST",
    auth: true,
    body: { rating, comment },
  });
}

export function deleteReview(reviewId: number): Promise<void> {
  return api<void>(`/reviews/${reviewId}`, { method: "DELETE", auth: true });
}
