import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decodeJwt } from "@/lib/jwt";
import type { AuthTokens } from "@/types";

/* Oturum — access + refresh token localStorage'da.
   Kullanıcı bilgisi ayrı tutulmuyor, access token'ın içinden okunuyor
   (backend'in /users/profile ucu `role` döndürmediği için rol de buradan). */

export interface SessionUser {
  id: number;
  email: string;
  role: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  setSession: (tokens: AuthTokens) => void;
  clear: () => void;
}

function userFromToken(accessToken: string): SessionUser | null {
  const payload = decodeJwt(accessToken);
  if (!payload) return null;
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role ?? null,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (tokens) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          user: userFromToken(tokens.access_token),
        }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "zemrek-auth", version: 1 },
  ),
);

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "ADMIN";
}
