"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { preloadImage } from "@/lib/image-cache";
import {
  SEQUENCE_FRAMES,
  SEQUENCE_STOPS,
  frameAt,
  frameSrc,
  revealAmount,
  stopProgress,
} from "@/lib/sequence";

/* Kaydırmaya bağlı ürün sekansı.
   Bölüm uzun, içindeki katman `sticky` — kullanıcı kaydırdıkça sahne yerinde
   kalır, kareler ilerler ve altı noktada durup parçaları anlatır.

   Kare değişimi ve etiket geçişleri React state'i ÜZERİNDEN GİTMEZ: her
   kaydırma olayında yeniden render etmek 150 karede kare atlamasına yol açar.
   Döngü requestAnimationFrame içinde çalışıp tuvale çizer ve etiketlerin
   stilini doğrudan yazar; React yalnızca yükleme durumunu bilir. */

const LABEL_WIDTH = 300;
const EDGE = 28;
/* Kaydırma ile karenin arası yumuşatılıyor: hedefe her karede yaklaşılıyor.
   1.0 anında takip eder ama sert durur; küçüldükçe hareket ağırlaşıp
   kaydırmanın arkasından süzülerek geliyor. */
const SMOOTHING = 0.1;

interface Layout {
  width: number;
  height: number;
  imgX: number;
  imgY: number;
  imgSize: number;
  /** Dar ekranda etiketler görselin yanına sığmıyor, alt panele iniyor. */
  compact: boolean;
}

function computeLayout(width: number, height: number): Layout {
  const compact = width < 900;
  const imgSize = compact
    ? Math.min(width * 0.96, height * 0.58)
    : Math.min(width * 0.46, height * 0.86);
  return {
    width,
    height,
    imgSize,
    imgX: (width - imgSize) / 2,
    imgY: compact ? height * 0.1 : (height - imgSize) / 2,
    compact,
  };
}

/** Etiket kutusunun ve ona giden çizginin ekrandaki yeri. */
function stopGeometry(layout: Layout, index: number) {
  const stop = SEQUENCE_STOPS[index];
  const ax = layout.imgX + stop.anchor.x * layout.imgSize;
  const ay = layout.imgY + stop.anchor.y * layout.imgSize;

  if (layout.compact) {
    const panelY = layout.height - 200;
    return {
      ax,
      ay,
      labelX: EDGE,
      labelY: panelY,
      labelWidth: layout.width - EDGE * 2,
      points: `${ax},${ay} ${ax},${panelY - 22}`,
    };
  }

  const left = stop.side === "left";
  const labelX = left
    ? layout.imgX - 64 - LABEL_WIDTH
    : layout.imgX + layout.imgSize + 64;
  const labelY = Math.min(
    Math.max(ay - 46, EDGE),
    layout.height - 170 - EDGE,
  );
  // Çizgi: tutamaktan çıkıp dirsekte kırılıyor, sonra etiketin kenarına
  // yatay olarak giriyor — teknik çizim callout'u gibi.
  const edgeX = left ? labelX + LABEL_WIDTH : labelX;
  const elbowX = left ? edgeX + 34 : edgeX - 34;
  const lineY = labelY + 20;

  return {
    ax,
    ay,
    labelX,
    labelY,
    labelWidth: LABEL_WIDTH,
    points: `${ax},${ay} ${elbowX},${lineY} ${edgeX},${lineY}`,
  };
}

export function LunarisSequence({
  href,
  priceLabel,
  colorLabel,
}: {
  href: string;
  priceLabel: string;
  colorLabel: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGPolylineElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const [loadedPct, setLoadedPct] = useState(0);

  /* ---- kareleri indir ---- */
  useEffect(() => {
    let cancelled = false;
    framesRef.current = new Array(SEQUENCE_FRAMES + 1).fill(null);

    // Önce durak kareleri: onlar gelir gelmez sahne açılabilir, kalanı
    // arkadan dolarken en yakın yüklü kare çizilir.
    const priority = [1, ...SEQUENCE_STOPS.map((s) => s.frame)];
    const rest = Array.from({ length: SEQUENCE_FRAMES }, (_, i) => i + 1).filter(
      (f) => !priority.includes(f),
    );

    async function run() {
      await Promise.all(
        priority.map(async (frame) => {
          framesRef.current[frame] = await preloadImage(frameSrc(frame)).catch(
            () => null,
          );
        }),
      );
      if (cancelled) return;
      setReady(true);

      let done = priority.length;
      let cursor = 0;
      let shown = 0;

      async function worker() {
        while (cursor < rest.length && !cancelled) {
          const frame = rest[cursor++];
          framesRef.current[frame] = await preloadImage(frameSrc(frame)).catch(
            () => null,
          );
          done++;
          const pct = Math.round((done / (SEQUENCE_FRAMES + 1)) * 100);
          // Her karede setState etmek gereksiz render üretir; yüzde belirgin
          // değişince güncelleniyor.
          if (pct - shown >= 4 || done === SEQUENCE_FRAMES) {
            shown = pct;
            setLoadedPct(pct);
          }
        }
      }

      await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]);
      if (!cancelled) setLoadedPct(100);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- çizim döngüsü ---- */
  useEffect(() => {
    if (!ready) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let layout = computeLayout(stage.clientWidth, stage.clientHeight);
    let smoothed = -1;
    let lastFrame = -1;
    let raf = 0;
    /* Kenar maskesi ölçüye bağlı, kareye değil: her çizimde yeniden üretmek
       yerine ölçü değiştikçe bir kez kuruluyor. */
    let mask: CanvasGradient | null = null;
    /* Etiketlerin son görünürlüğü. Kaydırmanın büyük bölümünde altı etiketin
       beşi 0'da duruyor; değişmeyene stil yazmıyoruz. */
    const lastAmount = new Array<number>(SEQUENCE_STOPS.length).fill(-1);

    function applyLayout() {
      layout = computeLayout(stage!.clientWidth, stage!.clientHeight);
      /* Tavan 1.5: kaynak kareler 900 px ve tuval bundan genişlediğinde kare
         büyütülerek çiziliyor — hem bulanıklaşıyor hem boşuna piksel boyanıyor.
         1.5'te tuval kaynak çözünürlüğe denk düşüyor. */
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(layout.width * dpr);
      canvas!.height = Math.round(layout.height * dpr);
      canvas!.style.width = `${layout.width}px`;
      canvas!.style.height = `${layout.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (let i = 0; i < SEQUENCE_STOPS.length; i++) {
        const geo = stopGeometry(layout, i);
        const label = labelRefs.current[i];
        if (label) {
          label.style.left = `${geo.labelX}px`;
          label.style.top = `${geo.labelY}px`;
          label.style.width = `${geo.labelWidth}px`;
        }
        const line = lineRefs.current[i];
        if (line) {
          line.setAttribute("points", geo.points);
          const length = line.getTotalLength();
          line.style.strokeDasharray = `${length}`;
          line.style.strokeDashoffset = `${length}`;
          line.dataset.length = `${length}`;
        }
        const dot = dotRefs.current[i];
        if (dot) {
          dot.setAttribute("cx", `${geo.ax}`);
          dot.setAttribute("cy", `${geo.ay}`);
        }
      }
      const cx = layout.imgX + layout.imgSize / 2;
      const cy = layout.imgY + layout.imgSize / 2;
      mask = ctx!.createRadialGradient(
        cx,
        cy,
        layout.imgSize * 0.34,
        cx,
        cy,
        layout.imgSize * 0.56,
      );
      mask.addColorStop(0, "rgba(0,0,0,0)");
      mask.addColorStop(1, "rgba(0,0,0,1)");

      lastFrame = -1; // yeni ölçülerle yeniden çiz
      lastAmount.fill(-1);
    }

    /** Henüz inmemiş kareler için en yakın yüklü kareye düş. */
    function resolveFrame(frame: number): HTMLImageElement | null {
      for (let i = frame; i >= 1; i--) {
        const img = framesRef.current[i];
        if (img) return img;
      }
      for (let i = frame + 1; i <= SEQUENCE_FRAMES; i++) {
        const img = framesRef.current[i];
        if (img) return img;
      }
      return null;
    }

    function drawFrame(frame: number) {
      if (frame === lastFrame) return;
      const img = resolveFrame(frame);
      if (!img) return;
      lastFrame = frame;

      const { imgX, imgY, imgSize, width, height } = layout;
      ctx!.clearRect(0, 0, width, height);
      ctx!.drawImage(img, imgX, imgY, imgSize, imgSize);

      // Karelerin arka planı bölümün zemininden açık; kare kenarları belli
      // olmasın diye kenarları yumuşak bir maskeyle siliyoruz.
      if (!mask) return;
      ctx!.globalCompositeOperation = "destination-out";
      ctx!.fillStyle = mask;
      ctx!.fillRect(imgX, imgY, imgSize, imgSize);
      ctx!.globalCompositeOperation = "source-over";
    }

    function paint(progress: number) {
      drawFrame(Math.min(Math.max(Math.round(frameAt(progress)), 1), SEQUENCE_FRAMES));

      for (let i = 0; i < SEQUENCE_STOPS.length; i++) {
        const amount = revealAmount(stopProgress(progress, i));
        /* Kaydırmanın büyük bölümünde altı durağın beşi 0'da sabit; değişmeyene
           stil yazmak her karede boşuna stil geçersizleştirmesi demek. */
        if (Math.abs(amount - lastAmount[i]) < 0.001) continue;
        lastAmount[i] = amount;

        const label = labelRefs.current[i];
        if (label) {
          label.style.opacity = `${amount}`;
          label.style.transform = `translateY(${(1 - amount) * 14}px)`;
          /* Kartın `backdrop-blur`'ü, saydamlığı 0 olsa bile GPU'da katman
             olarak duruyor ve altı kart birden kaydırmayı ağırlaştırıyor.
             Görünmeyeni tamamen render dışına alıyoruz. */
          label.style.visibility = amount === 0 ? "hidden" : "visible";
        }
        const line = lineRefs.current[i];
        if (line) {
          const length = Number(line.dataset.length ?? 0);
          // Çizgi tutamaktan etikete doğru "çiziliyor".
          const drawn = Math.min(1, amount * 1.6);
          line.style.strokeDashoffset = `${length * (1 - drawn)}`;
          line.style.opacity = `${amount}`;
        }
        const dot = dotRefs.current[i];
        if (dot) dot.style.opacity = `${amount}`;
        const rail = railRefs.current[i];
        if (rail) {
          rail.style.opacity = `${0.3 + amount * 0.7}`;
          rail.style.transform = `scaleX(${0.4 + amount * 0.6})`;
        }
      }

      if (introRef.current) {
        introRef.current.style.opacity = `${Math.max(0, 1 - progress / 0.05)}`;
      }
      if (outroRef.current) {
        const t = Math.max(0, (progress - 0.94) / 0.05);
        outroRef.current.style.opacity = `${Math.min(1, t)}`;
        outroRef.current.style.transform = `translateY(${(1 - Math.min(1, t)) * 16}px)`;
        outroRef.current.style.pointerEvents = t > 0.6 ? "auto" : "none";
      }
    }

    function tick() {
      const rect = section!.getBoundingClientRect();
      const scrollable = rect.height - layout.height;
      const target =
        scrollable <= 0 ? 0 : Math.min(Math.max(-rect.top / scrollable, 0), 1);

      if (smoothed < 0 || reduced) smoothed = target;
      else {
        smoothed += (target - smoothed) * SMOOTHING;
        if (Math.abs(target - smoothed) < 0.0004) smoothed = target;
      }
      paint(smoothed);
      raf = requestAnimationFrame(tick);
    }

    /* Döngü yalnızca bölüm ekrandayken dönüyor: çizimi atlayıp kendini yeniden
       planlamak da sayfanın geri kalanında boşuna iş demek. */
    function play() {
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function pause() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    applyLayout();
    paint(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else pause();
      },
      { rootMargin: "10% 0px" },
    );
    observer.observe(section);

    const resize = new ResizeObserver(applyLayout);
    resize.observe(stage);

    return () => {
      pause();
      observer.disconnect();
      resize.disconnect();
    };
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      aria-label="Lunaris yakından"
      /* Bölümün yüksekliği sekansın hızıdır: ne kadar uzunsa aynı kare o kadar
         çok kaydırmaya yayılır. Bu değerin altında saat elde kalmayacak kadar
         hızlı dönüyor. */
      className="relative bg-graphite-700 h-[900vh] max-md:h-[720vh]"
    >
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        {/* Saatin arkasındaki sıcak ışık — kareler karanlıkta duruyor gibi. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[76vmin] w-[76vmin] -translate-x-1/2 -translate-y-1/2 rounded-pill bg-[radial-gradient(circle,rgba(201,166,107,0.16),transparent_68%)]"
        />

        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 transition-opacity duration-700 ease-standard"
          style={{ opacity: ready ? 1 : 0 }}
        />

        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {SEQUENCE_STOPS.map((stop, i) => (
            <g key={stop.frame}>
              <polyline
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0 }}
              />
              <circle
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                r="3.5"
                fill="var(--color-accent)"
                style={{ opacity: 0 }}
              />
            </g>
          ))}
        </svg>

        {SEQUENCE_STOPS.map((stop, i) => (
          <div
            key={stop.frame}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            /* Her boyutta yarı saydam kart: konumu JS ile ayarlanıyor (dar
               ekranda alta iniyor), kart stili sabit kalıyor ki callout
               çizgisinin ucundaki metin kare üstünde her zaman okunsun. */
            className="absolute z-20 rounded-lg border border-white/10 bg-graphite-700/72 p-5 backdrop-blur-md"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <h3 className="font-heading text-[19px] font-semibold leading-[1.25] text-on-dark">
              {stop.title}
            </h3>
            <p className="mt-2 text-small leading-[1.65] text-on-dark-muted">
              {stop.body}
            </p>
          </div>
        ))}

        {/* Giriş yazısı — ilk kaydırmada silinir. */}
        <div
          ref={introRef}
          className="pointer-events-none absolute inset-x-0 bottom-16 z-30 flex flex-col items-center gap-3 px-6 text-center max-md:bottom-10"
        >
          <span className="font-heading text-micro font-semibold uppercase tracking-eyebrow text-accent">
            Signature · Lunaris
          </span>
          <p className="max-w-[420px] text-body text-on-dark-muted">
            Kaydırın — saati birlikte çevirip parçalarına bakalım.
          </p>
          <span aria-hidden className="z-scroll-hint mt-1 h-8 w-px bg-gradient-to-b from-accent to-transparent" />
        </div>

        {/* Kaç durak geçildiğini gösteren ince ray. */}
        <div
          aria-hidden
          className="absolute right-7 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2.5 max-md:hidden"
        >
          {SEQUENCE_STOPS.map((stop, i) => (
            <span
              key={stop.frame}
              ref={(el) => {
                railRefs.current[i] = el;
              }}
              className="block h-px w-7 origin-right bg-accent"
              style={{ opacity: 0.3, transform: "scaleX(0.4)" }}
            />
          ))}
        </div>

        {/* Sekans biterken çıkan kapanış. */}
        <div
          ref={outroRef}
          className="absolute inset-x-0 bottom-0 top-auto z-30 flex flex-col items-center gap-5 px-6 pb-20 pt-28 text-center max-md:pb-12"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          {/* Kapanış yazısı kadranın parlak kısmına denk geliyor; alttan yukarı
              açılan karartma olmadan ne başlık ne fiyat okunuyor. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 top-0 -z-10 bg-[linear-gradient(to_top,var(--color-graphite-700)_20%,rgba(13,13,13,0.85)_55%,transparent)]"
          />
          <div>
            <div className="font-heading text-[clamp(26px,4vw,40px)] font-semibold text-on-dark [text-shadow:0_2px_18px_rgba(13,13,13,0.8)]">
              Lunaris
            </div>
            <div className="mt-2 text-[15px] font-medium text-on-dark [text-shadow:0_1px_12px_rgba(13,13,13,0.9)]">
              {priceLabel} · {colorLabel}
            </div>
          </div>
          <Link href={href} className={buttonVariants({ variant: "accent", size: "lg" })}>
            Lunaris&apos;i İncele
          </Link>
        </div>

        {/* Kareler inerken: önce marka halkası, sonra alttaki ince çubuk. */}
        {!ready && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-graphite-700">
            <SequenceLoader />
          </div>
        )}
        {ready && loadedPct < 100 && (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-30 h-px bg-white/10"
          >
            <span
              className="block h-full bg-accent transition-[width] duration-300 ease-standard"
              style={{ width: `${loadedPct}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function SequenceLoader() {
  return (
    <div className="flex flex-col items-center gap-4">
      <span
        aria-hidden
        className="z-spin block h-10 w-10 rounded-pill border-2 border-white/12 border-t-accent"
      />
      <span className="font-heading text-micro font-semibold uppercase tracking-eyebrow text-on-dark-muted">
        Lunaris hazırlanıyor
      </span>
    </div>
  );
}
