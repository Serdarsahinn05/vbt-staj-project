import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Kayıt Ol" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Kayıt Ol"
      subtitle="Zemrek hesabı oluşturun, koleksiyonu takip edin."
      footer={
        <>
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover">
            Giriş yapın
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
