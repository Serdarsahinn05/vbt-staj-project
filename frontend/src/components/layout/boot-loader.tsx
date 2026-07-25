"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui/logo";

/* Siteye ilk girişte görünen marka perdesi.
   Sayfadaki görsellerin tamamı inene kadar (`window.load`) durur, sonra
   çubuğu doldurup açılır.

   İki güvenlik önlemi var:
   - Perde CSS ile de kendini kapatıyor (`z-boot`, 3.6s). JS hiç çalışmasa
     veya hydration patlasa bile site erişilemez hâlde kalmıyor.
   - Yükleme uzarsa 4 saniyede zorla açılıyor; tek yavaş görsel yüzünden
     kullanıcı perdenin arkasında bekletilmiyor.

   Durum React state'inde tutulmuyor: perde her yol değişiminde yeniden
   render edilmesin diye ref üzerinden doğrudan DOM'a yazılıyor. */

const MIN_MS = 420;
const MAX_MS = 4000;

export function BootLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;

    const startedAt = performance.now();
    let finished = false;
    let poll = 0;

    function progress() {
      const images = Array.from(document.images);
      const done = images.filter((img) => img.complete).length;
      // Görsel yoksa da çubuk ilerlesin: geçen süreye göre doluyor.
      const byImages = images.length ? done / images.length : 0;
      const byTime = Math.min(1, (performance.now() - startedAt) / MAX_MS);
      return Math.max(byImages, byTime) * 0.92;
    }

    function paint() {
      bar!.style.transform = `scaleX(${progress()})`;
    }

    function finish() {
      if (finished) return;
      finished = true;
      window.clearInterval(poll);
      const wait = Math.max(0, MIN_MS - (performance.now() - startedAt));
      window.setTimeout(() => {
        bar!.style.transform = "scaleX(1)";
        root!.dataset.state = "done";
      }, wait);
    }

    poll = window.setInterval(paint, 120);
    paint();

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const cap = window.setTimeout(finish, MAX_MS);

    return () => {
      window.clearInterval(poll);
      window.clearTimeout(cap);
      window.removeEventListener("load", finish);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Sayfa yükleniyor"
      className="z-boot fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-graphite-700"
    >
      <Logo className="z-boot-mark h-16" />
      <span
        aria-hidden
        className="block h-px w-40 overflow-hidden bg-white/12"
      >
        <span
          ref={barRef}
          className="block h-full origin-left bg-accent transition-transform duration-[400ms] ease-standard"
          style={{ transform: "scaleX(0)" }}
        />
      </span>
    </div>
  );
}
