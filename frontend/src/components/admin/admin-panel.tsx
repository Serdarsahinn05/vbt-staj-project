"use client";

import { AdminDashboard } from "./admin-dashboard";
import { AdminLogin } from "./admin-login";
import { useHydrated } from "@/hooks/use-hydrated";
import { isAdmin, useAuthStore } from "@/stores/auth-store";

/* Panelin kapısı. Token localStorage'da olduğu için sunucuda bilinmiyor —
   hydration tamamlanmadan karar vermiyoruz, yoksa içerik zıplıyor. */

export function AdminPanel() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);

  if (!hydrated) {
    return <div className="min-h-svh bg-dark" aria-hidden />;
  }

  if (!user) return <AdminLogin />;

  if (!isAdmin(user)) {
    return (
      <AdminLogin notice="Bu hesabın yönetici yetkisi yok. Yönetici hesabıyla giriş yapın." />
    );
  }

  return <AdminDashboard />;
}
