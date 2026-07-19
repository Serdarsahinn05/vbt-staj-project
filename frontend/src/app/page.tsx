export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-dark px-6">
      <div className="max-w-2xl py-24 text-center">
        <p className="mb-6 font-heading text-micro font-semibold uppercase tracking-eyebrow text-gold-300">
          Yeni Koleksiyon · 2026
        </p>
        <h1 className="mb-6 text-balance font-heading text-h1 font-semibold text-on-dark">
          Zamanın Ötesinde Zarafet
        </h1>
        <p className="mx-auto max-w-lg text-body-lg text-on-dark-muted">
          Frontend iskeleti hazır — design token&apos;ları, fontlar ve API
          katmanı bağlı. Sayfalar buradan itibaren inşa edilecek.
        </p>
      </div>
    </main>
  );
}
