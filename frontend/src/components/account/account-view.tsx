"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { PanelSkeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { ApiError, logout } from "@/lib/api";
import {
  addAddress,
  changePassword,
  deleteAddress,
  fetchProfile,
  updateProfileName,
} from "@/lib/user-api";
import { useAuthStore } from "@/stores/auth-store";

const PROFILE_KEY = ["profile"] as const;

function errorText(err: unknown): string {
  return err instanceof ApiError
    ? err.message
    : "Sunucuya ulaşılamadı. Lütfen tekrar deneyin.";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-6 max-sm:p-5">
      <h2 className="mb-5 font-heading text-h3 font-semibold text-heading">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function AccountView() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);

  if (!hydrated) return <PanelSkeleton rows={2} />;
  if (!user) return <SignedOut />;
  return <SignedIn />;
}

function SignedOut() {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface px-6 py-16 text-center shadow-soft">
      <p className="mb-2 font-heading text-h3 font-semibold text-heading">
        Giriş yapmadınız
      </p>
      <p className="mb-7 text-body">
        Hesabınıza giriş yaparak favorilerinizi ve adreslerinizi yönetin.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/giris"
          className={buttonVariants({ variant: "accent", size: "lg" })}
        >
          Giriş Yap
        </Link>
        <Link
          href="/kayit"
          className={buttonVariants({ variant: "surface", size: "lg" })}
        >
          Kayıt Ol
        </Link>
      </div>
    </div>
  );
}

function SignedIn() {
  const queryClient = useQueryClient();
  const { data: profile, isPending, isError, error } = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: fetchProfile,
  });

  if (isPending) return <PanelSkeleton rows={3} />;

  if (isError) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface p-8">
        <Notice tone="error">{errorText(error)}</Notice>
        <Button className="mt-5" variant="surface" onClick={logout}>
          Çıkış Yap
        </Button>
      </div>
    );
  }

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: PROFILE_KEY });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border-subtle bg-surface p-6 shadow-soft">
        <div>
          <div className="font-heading text-h3 font-semibold text-heading">
            {profile.name}
          </div>
          <div className="mt-1 text-small text-body">{profile.email}</div>
          <div className="mt-1 text-small text-body">
            Üyelik:{" "}
            {new Date(profile.createdAt).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <Button variant="surface" onClick={logout}>
          Çıkış Yap
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        <NameForm currentName={profile.name} onSaved={invalidate} />
        <PasswordForm />
      </div>

      <AddressSection
        addresses={profile.addresses ?? []}
        onChanged={invalidate}
      />
    </div>
  );
}

function NameForm({
  currentName,
  onSaved,
}: {
  currentName: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState(currentName);
  const [message, setMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => updateProfileName(name.trim()),
    onSuccess: () => {
      setFailure(null);
      setMessage("Adınız güncellendi.");
      onSaved();
    },
    onError: (err) => {
      setMessage(null);
      setFailure(errorText(err));
    },
  });

  return (
    <Section title="Profil Bilgilerim">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length >= 2) mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <Input
          label="Ad Soyad"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={
            name.trim().length < 2 ? "İsim en az 2 karakter olmalı" : undefined
          }
        />
        <Button
          type="submit"
          variant="primary"
          disabled={mutation.isPending || name.trim() === currentName}
        >
          {mutation.isPending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        {message && <Notice>{message}</Notice>}
        {failure && <Notice tone="error">{failure}</Notice>}
      </form>
    </Section>
  );
}

function PasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => changePassword(oldPassword, newPassword),
    onSuccess: (result) => {
      setFailure(null);
      setMessage(result.message);
      setOldPassword("");
      setNewPassword("");
    },
    onError: (err) => {
      setMessage(null);
      setFailure(errorText(err));
    },
  });

  const valid = oldPassword.length >= 6 && newPassword.length >= 6;

  return (
    <Section title="Şifre Değiştir">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <Input
          label="Mevcut Şifre"
          name="oldPassword"
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <Input
          label="Yeni Şifre"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="En az 6 karakter"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!valid || mutation.isPending}
        >
          {mutation.isPending ? "Güncelleniyor…" : "Şifreyi Güncelle"}
        </Button>
        {message && <Notice>{message}</Notice>}
        {failure && <Notice tone="error">{failure}</Notice>}
      </form>
    </Section>
  );
}

const EMPTY_ADDRESS = { title: "", city: "", district: "", detail: "" };

function AddressSection({
  addresses,
  onChanged,
}: {
  addresses: { id: number; title: string; city: string; district: string; detail: string }[];
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState(EMPTY_ADDRESS);
  const [failure, setFailure] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => addAddress(draft),
    onSuccess: () => {
      setFailure(null);
      setDraft(EMPTY_ADDRESS);
      onChanged();
    },
    onError: (err) => setFailure(errorText(err)),
  });

  const destroy = useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: onChanged,
    onError: (err) => setFailure(errorText(err)),
  });

  const complete = Object.values(draft).every((v) => v.trim().length > 0);

  return (
    <Section title="Adreslerim">
      {addresses.length > 0 ? (
        <ul className="mb-7 flex flex-col gap-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-md border border-border-subtle px-5 py-4"
            >
              <div>
                <div className="font-heading text-[15px] font-semibold text-heading">
                  {address.title}
                </div>
                <div className="mt-1 text-small text-body">
                  {address.detail} · {address.district} / {address.city}
                </div>
              </div>
              <button
                type="button"
                onClick={() => destroy.mutate(address.id)}
                disabled={destroy.isPending}
                className="cursor-pointer text-small text-body underline-offset-4 transition-colors hover:text-primary hover:underline disabled:opacity-50"
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-7 text-body">
          Kayıtlı adresiniz yok. Aşağıdan ekleyebilirsiniz.
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (complete) create.mutate();
        }}
        className="grid grid-cols-2 gap-4 max-sm:grid-cols-1"
      >
        <Input
          label="Başlık"
          name="title"
          placeholder="Ev, İş…"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <Input
          label="İl"
          name="city"
          placeholder="İstanbul"
          value={draft.city}
          onChange={(e) => setDraft({ ...draft, city: e.target.value })}
        />
        <Input
          label="İlçe"
          name="district"
          placeholder="Kadıköy"
          value={draft.district}
          onChange={(e) => setDraft({ ...draft, district: e.target.value })}
        />
        <Input
          label="Adres"
          name="detail"
          placeholder="Mahalle, sokak, no"
          value={draft.detail}
          onChange={(e) => setDraft({ ...draft, detail: e.target.value })}
        />
        <div className="col-span-2 max-sm:col-span-1">
          <Button
            type="submit"
            variant="primary"
            disabled={!complete || create.isPending}
          >
            {create.isPending ? "Ekleniyor…" : "Adres Ekle"}
          </Button>
        </div>
      </form>

      {failure && <Notice tone="error">{failure}</Notice>}
    </Section>
  );
}
