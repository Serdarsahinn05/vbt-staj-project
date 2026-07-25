import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Giriş Yap" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Giriş Yap"
      subtitle="Hesabınıza giriş yaparak siparişlerinizi takip edin."
      footer={
        <>
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover">
            Kayıt olun
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
