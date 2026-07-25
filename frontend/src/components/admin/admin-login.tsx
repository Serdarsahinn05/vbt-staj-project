"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, login, logout } from "@/lib/api";
import { isAdmin, useAuthStore } from "@/stores/auth-store";

/* Panel girişi. Yetki kararını backend veriyor (RolesGuard); buradaki rol
   kontrolü sadece yönetici olmayanı boş bir panele sokmamak için. */

export function AdminLogin({ notice }: { notice?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      if (!isAdmin(useAuthStore.getState().user)) {
        logout();
        setError("Bu hesabın yönetici yetkisi yok.");
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Sunucuya ulaşılamadı. Backend çalışıyor mu?",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-dark px-5 py-16">
      <div className="w-full max-w-[420px]">
        <div className="z-rise mb-9 flex flex-col items-center text-center">
          <Logo className="h-14" />
          <div className="mt-5 font-heading text-micro font-semibold uppercase tracking-eyebrow text-gold-300">
            Yönetim Paneli
          </div>
          <h1 className="mt-2 font-heading text-h2 font-semibold text-steel-50">
            Giriş Yap
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="z-rise flex flex-col gap-5 rounded-lg bg-surface p-8 shadow-elevated max-sm:p-6"
          style={{ animationDelay: "0.1s" }}
        >
          {notice && (
            <p className="rounded-sm bg-accent-soft px-4 py-3 text-small text-heading">
              {notice}
            </p>
          )}

          <Input
            label="E-posta"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@zemrek.com"
          />
          <Input
            label="Şifre"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="text-small text-[#B3382C]">
              {error}
            </p>
          )}

          <Button type="submit" variant="dark" size="lg" disabled={busy}>
            {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
          </Button>
        </form>

        <p className="mt-6 text-center text-small text-on-dark-muted">
          Bu sayfa yalnızca yöneticiler içindir.
        </p>
      </div>
    </div>
  );
}
