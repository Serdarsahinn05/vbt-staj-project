import { api } from "@/lib/api";
import type { ServerCart } from "@/types";

/* Oturum sepeti. Hepsi JWT ister; misafir sepeti tarayıcıda tutulur
   (stores/cart-store) ve giriş anında buraya taşınır.

   Backend stok kontrolünü kendisi yapıyor: yetersizse 400 döndürüyor,
   bu yüzden istemcide ayrıca stok doğrulaması yapmıyoruz. */

export function fetchCart(): Promise<ServerCart> {
  return api<ServerCart>("/cart", { auth: true });
}

export function addCartItem(
  variantId: number,
  quantity: number,
): Promise<unknown> {
  return api("/cart/items", {
    method: "POST",
    auth: true,
    body: { variantId, quantity },
  });
}

export function updateCartItem(
  variantId: number,
  quantity: number,
): Promise<unknown> {
  return api(`/cart/items/${variantId}`, {
    method: "PATCH",
    auth: true,
    body: { quantity },
  });
}

export function removeCartItem(variantId: number): Promise<unknown> {
  return api(`/cart/items/${variantId}`, { method: "DELETE", auth: true });
}

export function clearCart(): Promise<unknown> {
  return api("/cart", { method: "DELETE", auth: true });
}
