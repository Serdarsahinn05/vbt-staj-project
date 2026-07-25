"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addReview, deleteReview, fetchReviews } from "@/lib/review-api";
import { useAuthStore } from "@/stores/auth-store";
import { useHydrated } from "@/hooks/use-hydrated";

export const reviewsKey = (productId: number) =>
  ["reviews", productId] as const;

/* Bir ürünün yorumları. Liste herkese açık, yazma girişli kullanıcıya.
   Backend ürün başına tek yoruma izin verdiği için kullanıcının kendi yorumu
   ayrıca döndürülüyor: form yerine "yorumunuz" görünümü gösteriliyor. */
export function useReviews(productId: number) {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: reviewsKey(productId),
    queryFn: () => fetchReviews(productId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: reviewsKey(productId) });

  const create = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      addReview(productId, rating, comment),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: invalidate,
  });

  const reviews = data?.data ?? [];
  const signedIn = hydrated && Boolean(user);
  const mine = signedIn ? reviews.find((r) => r.userId === user?.id) : undefined;

  return {
    reviews,
    average: data?.average ?? 0,
    count: data?.count ?? 0,
    isPending,
    signedIn,
    /** Kullanıcının bu üründeki yorumu; varsa yeniden yazamaz. */
    mine,
    create,
    remove,
  };
}
