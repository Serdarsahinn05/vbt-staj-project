import Link from "next/link";
import { LunarisSequence } from "@/components/home/lunaris-sequence";
import { ApiErrorState } from "@/components/layout/api-error";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductCard } from "@/components/ui/product-card";
import { ProductImage } from "@/components/ui/product-image";
import { loadCatalog } from "@/lib/catalog-api";
import { SERIES_ORDER, defaultVariant, featuredProducts } from "@/lib/catalog";
import { formatPriceOrPending } from "@/lib/format";

export default async function Home() {
  const { products, failed } = await loadCatalog();

  const featured = featuredProducts(products);

  /* Ana sayfanın anlatısı Lunaris üzerine kurulu: kaydırma sekansı da, hero
     ve hikaye görselleri de o modelden geliyor. Lunaris'in sekiz fotoğrafı
     sabit sırada — 7. kadran makrosu, 5. bilek çekimi. Model katalogda yoksa
     ilk ürüne düşülüyor. */
  const lunaris = products.find((p) => p.slug === "lunaris");
  const lunarisImages = lunaris ? defaultVariant(lunaris).images : [];
  const heroImage = lunarisImages[6] ?? products[0]?.variants[0].images[1];
  const storyImage = lunarisImages[4] ?? products[1]?.variants[0].images[2];

  const seriesSummary = SERIES_ORDER.map((name) => ({
    name,
    count: products.filter((p) => p.series === name).length,
  })).filter((s) => s.count > 0);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative flex h-svh min-h-[560px] items-center justify-center overflow-hidden bg-graphite-700">
        <div className="absolute inset-0">
          <div className="z-zoom absolute inset-[-6%]">
            <ProductImage
              src={heroImage}
              alt="Zemrek Lunaris kadranı"
              preload
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Kadran parlak olduğu için tek düz karartma başlığı okunur kılmıyor.
            İki katman: radyal olan başlığın arkasını koyultuyor, dikey olan
            üstte başlığı, altta da bir sonraki koyu bölüme geçişi topluyor. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,rgba(13,13,13,0.82),rgba(13,13,13,0.45)_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(13,13,13,0.75),rgba(13,13,13,0.2)_35%,rgba(13,13,13,0.5)_75%,var(--color-graphite-700))]"
        />

        <div className="relative z-[2] max-w-[760px] px-6 py-30 text-center max-md:px-5 max-md:py-24">
          <div
            className="z-rise mb-6 flex justify-center max-md:mb-4"
            style={{ animationDelay: "0.15s" }}
          >
            <Eyebrow tone="dark">Yeni Koleksiyon · 2026</Eyebrow>
          </div>
          <h1
            className="z-rise mb-6 text-balance font-heading text-[clamp(32px,6vw,68px)] font-semibold leading-[1.15] tracking-[0.02em] text-steel-50 [text-shadow:0_2px_24px_rgba(13,13,13,0.75)]"
            style={{ animationDelay: "0.3s" }}
          >
            Zamanın Ötesinde Zarafet
          </h1>
          <p
            className="z-rise mx-auto mb-10 max-w-[520px] text-[17px] leading-[1.6] text-on-dark max-md:mb-7 max-md:text-[15px]"
            style={{ animationDelay: "0.45s" }}
          >
            El işçiliğiyle üretilen İsviçre mekanizmaları, her ayrıntıda
            hissedilen zamansız bir ustalıkla buluşuyor.
          </p>
          <div
            className="z-rise flex flex-wrap justify-center gap-4 max-md:flex-col max-md:items-stretch max-md:gap-3"
            style={{ animationDelay: "0.6s" }}
          >
            <Link
              href="/koleksiyon"
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              Alışverişe Başla
            </Link>
            <Link
              href={lunaris ? "#lunaris" : "/koleksiyon"}
              className={buttonVariants({ variant: "overlay", size: "lg" })}
            >
              Yeni Model: Lunaris
            </Link>
          </div>
        </div>

        <span
          aria-hidden
          className="z-scroll-hint absolute bottom-8 left-1/2 z-[2] h-9 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent to-transparent max-md:bottom-5"
        />
      </section>

      {/* ---------- Lunaris yakından ----------
          Kaydırmaya bağlı sekans; hero'nun hemen ardından, ürün kartlarından
          önce. Model katalogda yoksa bölüm hiç basılmıyor. */}
      {lunaris && (
        <div id="lunaris">
          <LunarisSequence
            href={`/urun/${lunaris.slug}`}
            priceLabel={formatPriceOrPending(defaultVariant(lunaris).price)}
            colorLabel={lunaris.variants.map((v) => v.colorName).join(" · ")}
          />
        </div>
      )}

      {/* ---------- Öne Çıkan Ürünler ---------- */}
      <section
        id="one-cikanlar"
        className="bg-gradient-to-b from-graphite-700 via-page to-page"
      >
        <div className="mx-auto max-w-[1280px] px-8 pb-22 pt-28 max-md:px-4 max-md:pb-12 max-md:pt-16">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-6 max-md:mb-7">
            <div>
              <Eyebrow tone="dark" className="mb-2.5">
                Seçki
              </Eyebrow>
              <h2 className="font-heading text-h2 font-semibold text-on-dark">
                Öne Çıkan Ürünler
              </h2>
              <p className="mt-2 max-w-[46ch] text-small text-on-dark-muted">
                Her seriden o serinin en üst modeli, kalan yerler fiyatı en
                yüksek modellerle doluyor.
              </p>
            </div>
            <Link
              href="/koleksiyon"
              className="text-[14px] font-semibold text-gold-300 transition-colors duration-[var(--duration-fast)] ease-standard hover:text-accent"
            >
              Tümünü Gör →
            </Link>
          </div>

          {failed ? (
            <ApiErrorState />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 max-sm:grid-cols-1 max-sm:gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Seriler ----------
          Sayfadaki tek yumuşak yeşil alan: emerald-100 zemin, üstünde beyaz
          kartlar. Gold burada yalnızca eyebrow'da kalıyor, vurgu yeşile
          geçiyor — marka rengi vitrinde de görünsün. */}
      {seriesSummary.length > 0 && (
        <section className="border-y border-primary/15 bg-primary-soft">
          <div className="mx-auto max-w-[1280px] px-8 py-20 max-md:px-4 max-md:py-12">
            <div className="mb-9 max-md:mb-6">
              <Eyebrow className="mb-2.5">Koleksiyonlar</Eyebrow>
              <h2 className="font-heading text-h2 font-semibold text-heading">
                Üç Seri, Üç Karakter
              </h2>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
              {seriesSummary.map((series) => (
                <Link
                  key={series.name}
                  href={`/koleksiyon?seri=${series.name}`}
                  className="group rounded-lg border border-primary/15 bg-surface p-7 transition-[border-color,transform,box-shadow] duration-[var(--duration-base)] ease-standard hover:-translate-y-1 hover:border-primary hover:shadow-soft"
                >
                  <div className="font-heading text-h3 font-semibold text-heading">
                    {series.name}
                  </div>
                  <div className="mt-1.5 text-small text-body">
                    {series.count} model
                  </div>
                  <div className="mt-6 text-[14px] font-semibold text-primary">
                    Koleksiyonu gör →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Marka Hikayesi ---------- */}
      <section id="hikaye" className="border-y border-border-subtle bg-page">
        <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-16 px-8 py-24 max-md:gap-9 max-md:px-4 max-md:py-14">
          <div>
            <Eyebrow className="mb-3.5">Hikayemiz</Eyebrow>
            <h2 className="mb-6 text-balance font-heading text-[clamp(26px,3.5vw,38px)] font-semibold leading-[1.25] text-heading">
              Bir Nesilden Diğerine Taşınan Ustalık
            </h2>
            {/* Marka hikayesi mobil uygulamayla ortak — metin
                mobile/lib/screens/landing_screen.dart ile aynı kalmalı.
                Kuruluş yılı 1874 (mobilde 1974 yazıyor, düzeltilecek); buna
                bağlı olarak "yarım asır" değil "bir buçuk asır". */}
            <p className="mb-4 text-[16px] leading-[1.7] text-body">
              1874 yılında İsviçre&apos;nin Cenevre kentinde kurulan Zemrek,
              geleneksel saat ustalığını modern tasarım anlayışıyla buluşturma
              hedefiyle yola çıktı. Kurulduğu günden bu yana her saat, deneyimli
              ustaların titiz işçiliğiyle üretiliyor ve kalite standartlarını
              karşılamak için kapsamlı dayanıklılık testlerinden geçiriliyor.
            </p>
            <p className="mb-4 text-[16px] leading-[1.7] text-body">
              Bir buçuk asrı aşan tecrübemizle her koleksiyonumuzda zarafeti,
              güvenilirliği ve hassas zamanı bir araya getiriyoruz. Zemrek için
              bir saat yalnızca zamanı gösteren bir aksesuar değil; yıllar
              boyunca değerini koruyan ve nesilden nesile aktarılabilecek bir
              mirastır.
            </p>
            <p className="mb-8 text-[16px] leading-[1.7] text-body">
              Zemrek saat olarak, geçmişin ustalığını geleceğin tasarımlarıyla
              buluşturarak her anınıza değer katmaya devam ediyoruz.
            </p>
            <Link
              href="/koleksiyon"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              Koleksiyonu İncele
            </Link>
          </div>

          <div className="relative aspect-[4/5] max-h-[620px] overflow-hidden rounded-lg bg-graphite-700">
            <ProductImage
              src={storyImage}
              alt="Zemrek zanaatkârlığı"
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
