import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { ApiErrorState } from "@/components/layout/api-error";
import { ProductCard } from "@/components/ui/product-card";
import { defaultVariant, getBySlug } from "@/lib/catalog";
import { loadCatalog } from "@/lib/catalog-api";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await loadCatalog();
  const product = getBySlug(products, slug);
  if (!product) return { title: "Ürün bulunamadı" };

  /* Paylaşım kartında ürünün kendi fotoğrafı çıksın. Cloudinary adresine
     kare bir dönüşüm ekleniyor: ham görsel 900 px ve sosyal medya önizlemesi
     için gereğinden büyük. */
  const cover = defaultVariant(product).images[0];
  const image = cover?.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto,w_1200,h_1200,c_fill/",
  );

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/urun/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — ${product.series} Koleksiyonu`,
      description: product.description,
      url: `/urun/${product.slug}`,
      images: image ? [{ url: image, width: 1200, height: 1200 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const { products, failed } = await loadCatalog();

  if (failed) {
    return (
      <div className="mx-auto max-w-[1280px] px-8 pb-16 pt-28 max-md:px-4 max-md:pt-24">
        <ApiErrorState />
      </div>
    );
  }

  const product = getBySlug(products, slug);
  if (!product) notFound();

  const others = products.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-16 pt-28 max-md:px-4 max-md:pt-24">
      <nav
        aria-label="Sayfa yolu"
        className="z-rise mb-8 flex flex-wrap items-center gap-2 text-small text-body"
      >
        <Link href="/" className="text-body transition-colors hover:text-primary">
          Ana Sayfa
        </Link>
        <span aria-hidden>/</span>
        <Link
          href="/koleksiyon"
          className="text-body transition-colors hover:text-primary"
        >
          Koleksiyon
        </Link>
        <span aria-hidden>/</span>
        <span className="text-heading">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {others.length > 0 && (
        <section className="mt-20 max-md:mt-12">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-heading text-h3 font-semibold text-heading">
              Diğer Modeller
            </h2>
            <Link
              href="/koleksiyon"
              className="text-[14px] font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Tüm Koleksiyon →
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5 max-md:grid-cols-1">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
