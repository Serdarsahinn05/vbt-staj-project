# Frontend — Zemrek Web

Zemrek e-ticaret sitesinin web arayüzü. Tasarım kaynağı: [Zemrek Design System](https://zemrekdesignsystem.vercel.app).

## Stack

Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, TanStack Query, Zustand.

Ödevin React için önerdiği kombinasyon. Tailwind'i seçtik çünkü design token'ları `@theme` ile utility'lere bağlanıyor (`bg-primary`, `text-accent`, `font-heading` vb.), böylece tasarım sistemi dışına çıkmak zorlaşıyor. Tipler `npm run gen:api` ile backend Swagger'ından üretilebiliyor.

## Kurulum

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3001
```

Backend'in çalışıyor olması gerekir (varsayılan `http://localhost:3000`, farklıysa `.env.local`'dan değiştir).

## Komutlar

| Komut | Açıklama |
| ----- | -------- |
| `npm run dev` | Dev sunucu (3001) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run gen:api` | Swagger'dan tip üretimi |

## Klasörler

```text
src/
├── app/            # rotalar, layout, globals.css
├── components/     # ui/ (Button, ProductCard...), layout/ (Header, Footer)
│                   # ve sayfa bileşenleri (product/, cart/, admin/...)
├── hooks/          # katalog, sepet, favoriler
├── lib/            # api istemcisi, katalog dönüşümü, fiyat/biçim yardımcıları
├── stores/         # Zustand (sepet, oturum, favoriler)
├── styles/tokens/  # design token CSS'leri
└── types/          # API tipleri
```

Rotalar: `/` · `/koleksiyon` · `/urun/[slug]` · `/sepet` · `/odeme` · `/favoriler` · `/giris` · `/kayit` · `/hesap` · `/admin`

Token dosyaları `docs/design-system/tokens`'ın kopyası (Vercel sadece bu klasörü deploy ettiği için). Kaynak değişirse: `cp ../docs/design-system/tokens/*.css src/styles/tokens/`
