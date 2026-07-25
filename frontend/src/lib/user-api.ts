import { api } from "@/lib/api";
import type { Address, UserProfile } from "@/types";

/* Oturum açmış kullanıcıya ait uçlar. Hepsi JWT ister; `auth: true` ile
   Authorization başlığı eklenir ve süresi dolan token bir kez yenilenir. */

export interface FavoriteRow {
  id: number;
  createdAt: string;
  userId: number;
  variantId: number;
}

export function register(
  name: string,
  email: string,
  password: string,
): Promise<UserProfile> {
  return api<UserProfile>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export function fetchProfile(): Promise<UserProfile> {
  return api<UserProfile>("/users/profile", { auth: true });
}

export function updateProfileName(name: string): Promise<UserProfile> {
  return api<UserProfile>("/users/profile", {
    method: "PATCH",
    auth: true,
    body: { name },
  });
}

export function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return api<{ message: string }>("/users/change-password", {
    method: "PATCH",
    auth: true,
    body: { oldPassword, newPassword },
  });
}

export function addAddress(
  address: Omit<Address, "id" | "userId" | "createdAt">,
): Promise<Address> {
  return api<Address>("/users/addresses", {
    method: "POST",
    auth: true,
    body: address,
  });
}

export function deleteAddress(id: number): Promise<void> {
  return api<void>(`/users/addresses/${id}`, { method: "DELETE", auth: true });
}

/* Favoriler varyant bazlı: aynı modelin farklı rengi ayrı favoridir. */

export function fetchFavorites(): Promise<FavoriteRow[]> {
  return api<FavoriteRow[]>("/favorites", { auth: true });
}

export function addFavorite(variantId: number): Promise<FavoriteRow> {
  return api<FavoriteRow>("/favorites", {
    method: "POST",
    auth: true,
    body: { variantId },
  });
}

export function removeFavorite(variantId: number): Promise<void> {
  return api<void>(`/favorites/${variantId}`, {
    method: "DELETE",
    auth: true,
  });
}
