"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* Rota geçişlerinde üstte akan ince çubuk.
   Next'in router olayları için genel bir API'si yok; bu yüzden tıklama
   yakalama aşamasında dinleniyor ve `usePathname` değişince kapatılıyor.

   Çubuk state tutmuyor — geçiş sırasında sitenin tamamını yeniden render
   etmenin anlamı yok, doğrudan DOM'a yazıyor. */

export function RouteProgress() {
  const barRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const clearTimers = () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
    const later = (fn: () => void, ms: number) => {
      timersRef.current.push(window.setTimeout(fn, ms));
    };

    function finish() {
      if (!activeRef.current) return;
      activeRef.current = false;
      clearTimers();
      bar!.style.transitionDuration = "160ms";
      bar!.style.transform = "scaleX(1)";
      later(() => {
        bar!.style.opacity = "0";
      }, 200);
      later(() => {
        bar!.style.transitionDuration = "0ms";
        bar!.style.transform = "scaleX(0)";
      }, 460);
    }

    function start() {
      clearTimers();
      activeRef.current = true;
      bar!.style.transitionDuration = "0ms";
      bar!.style.transform = "scaleX(0)";
      bar!.style.opacity = "1";
      requestAnimationFrame(() => {
        bar!.style.transitionDuration = "900ms";
        // %80'e kadar ilerliyor; kalanı sayfa gerçekten geldiğinde kapanıyor.
        bar!.style.transform = "scaleX(0.8)";
      });
      // Aynı rotada arama parametresi değişen geçişlerde yol adı sabit kalır,
      // çubuk asılı kalmasın diye üst sınır.
      later(finish, 2600);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }
      start();
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, []);

  // Yeni sayfa geldi: çubuğu tamamla.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || !activeRef.current) return;
    activeRef.current = false;
    bar.style.transitionDuration = "160ms";
    bar.style.transform = "scaleX(1)";
    const fade = window.setTimeout(() => {
      bar.style.opacity = "0";
    }, 200);
    const reset = window.setTimeout(() => {
      bar.style.transitionDuration = "0ms";
      bar.style.transform = "scaleX(0)";
    }, 460);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(reset);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[150] h-[2px]"
    >
      <span
        ref={barRef}
        className="block h-full origin-left bg-accent shadow-[0_0_10px_rgba(201,166,107,0.7)] transition-transform ease-out"
        style={{ transform: "scaleX(0)", opacity: 0 }}
      />
    </div>
  );
}
