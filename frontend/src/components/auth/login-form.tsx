"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { CART_KEY, mergeGuestCart } from "@/hooks/use-cart";
import { FAVORITES_KEY, mergeGuestFavorites } from "@/hooks/use-favorites";
import { ApiError, login } from "@/lib/api";

type Errors = { email?: string; password?: string };

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFailure(null);

    const next: Errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Geçerli bir e-posta adresi girin";
    if (password.length < 6) next.password = "Şifre en az 6 karakter olmalı";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await login(email.trim(), password);
      await mergeGuestFavorites();
      await mergeGuestCart();
      await queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
      await queryClient.invalidateQueries({ queryKey: CART_KEY });
      router.push("/hesap");
    } catch (err) {
      setFailure(
        err instanceof ApiError
          ? err.message
          : "Sunucuya ulaşılamadı. Lütfen tekrar deneyin.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="E-posta"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="ornek@zemrek.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        label="Şifre"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={busy}
        className="mt-2 w-full"
      >
        {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
      </Button>

      {failure && <Notice tone="error">{failure}</Notice>}
    </form>
  );
}
