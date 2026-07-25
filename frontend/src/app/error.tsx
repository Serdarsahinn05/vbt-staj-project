"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

/* Render sırasında yakalanmayan bir hata olursa (ör. katalog isteği beklenmedik
   bir yanıt döndürürse) sayfa bembeyaz kalmasın diye. `reset` aynı segmenti
   yeniden render etmeyi dener; sunucu tarafı hata mesajı istemciye
   taşınmadığı için kullanıcıya teknik metin göstermiyoruz. */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center px-8 pb-28 pt-40 text-center max-md:px-4 max-md:pb-16 max-md:pt-32">
      <Eyebrow className="mb-4">Hata</Eyebrow>

      <h1 className="mb-4 text-balance font-heading text-[clamp(26px,4vw,36px)] font-semibold leading-[1.2] text-heading">
        Bir şeyler ters gitti
      </h1>

      <p className="mb-9 max-w-[46ch] text-[15px] leading-[1.7] text-body">
        Sayfa yüklenirken beklenmedik bir sorun oluştu. Tekrar denemek çoğu
        zaman yeterli oluyor.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="accent" size="lg" onClick={reset}>
          Tekrar Dene
        </Button>
        <Link
          href="/"
          className={buttonVariants({ variant: "surface", size: "lg" })}
        >
          Ana Sayfa
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 text-small text-body">Hata kodu: {error.digest}</p>
      )}
    </div>
  );
}
