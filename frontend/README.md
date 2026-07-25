# Frontend — Zemrek Web

Zemrek e-ticaret sitesinin web arayüzü. Tasarım kaynağı: [Zemrek Design System](https://zemrekdesignsystem.vercel.app).

Veri tamamen backend API'sinden geliyor; mock veri yok, backend'de karşılığı olmayan alan uydurulmuyor.

## Stack

Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, TanStack Query, Zustand, Playwright.

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
| `npm run test:e2e` | Playwright uçtan uca testler |
| `npm run test:e2e:ui` | Testleri görsel modda çalıştır |
| `npm run gen:api` | Swagger'dan tip üretimi |

## Özellikler

**Vitrin**
- Ana sayfa: hero, Lunaris kaydırma sekansı (150 kare, canvas), öne çıkan ürünler, yeni gelenler, sezon indirimi, seriler, marka hikayesi
- Koleksiyon: seri / cinsiyet / stil filtreleri, sıralama, arama
- Ürün detayı: renk varyantı seçimi (galeri, fiyat ve stok birlikte değişir), teknik künye, değerlendirmeler

**Alışveriş**
- Sepet: girişliyse sunucuda (`/cart`), misafirken tarayıcıda; girişte misafir sepeti hesaba taşınır
- Favoriler: aynı desen, varyant bazlı
- Ödeme: kayıtlı adresten seçim, sipariş onay ekranı
- Sepete eklemede "Sepete Git" kestirmeli bildirim

**Değerlendirmeler**
- Ürün sayfasında ortalama puan, yorum listesi ve puanlı yorum formu
- Ürün başına tek yorum (backend kuralı); kendi yorumunu silebilirsin
- Ürün kartlarında yıldız + puan + yorum sayısı

**Hesap ve yönetim**
- Giriş, kayıt, profil, adres yönetimi
- `/admin` — fiyat, stok ve indirim düzenleme; ADMIN rolüne kapalı

## Mimari notlar

- **Veri akışı tek yönlü:** `lib/api.ts` → `lib/catalog.ts` (backend modelini arayüz modeline çevirir) → `hooks/` → bileşenler
- **Katalog sayfaları dinamik render ediliyor** (`cache: "no-store"`); panelden girilen fiyat siteye anında yansır
- **Sepet ve favoriler varyant kimliğiyle çalışır:** aynı modelin iki rengi iki ayrı satırdır. Ürün adı, görseli ve güncel fiyatı her açılışta katalogdan okunur
- **Filtreleme ve sıralama istemcide:** katalog 10 ürün olduğu için tamamı tek istekte geliyor
- **Görseller Cloudinary'den,** özel `next/image` loader'ı ile (`f_auto,q_auto,w_<width>`)

## Klasörler

```text
src/
├── app/            # rotalar, layout, globals.css, sitemap.ts, robots.ts
├── components/     # ui/ (Button, ProductCard...), layout/ (Header, Footer)
│                   # ve sayfa bileşenleri (product/, cart/, admin/...)
├── hooks/          # katalog, sepet, favoriler, değerlendirmeler
├── lib/            # api istemcileri, katalog dönüşümü, fiyat/biçim yardımcıları
├── stores/         # Zustand (sepet, oturum, favoriler, bildirimler)
├── styles/tokens/  # design token CSS'leri
└── types/          # API tipleri
e2e/                # Playwright testleri
```

Rotalar: `/` · `/koleksiyon` · `/urun/[slug]` · `/sepet` · `/odeme` · `/favoriler` · `/giris` · `/kayit` · `/hesap` · `/admin`

Token dosyaları `docs/design-system/tokens`'ın kopyası (Vercel sadece bu klasörü deploy ettiği için). Kaynak değişirse: `cp ../docs/design-system/tokens/*.css src/styles/tokens/`

## Testler

`e2e/` altında üç akış: misafirin uçtan uca alışverişi (ürün → sepet → ödeme → onay), hesap akışı (kayıt, favori, misafir sepetinin taşınması) ve yönetim paneli yetkilendirmesi.

Testler gerçek backend'e karşı çalışır; çalıştırmadan önce backend ayakta olmalı.
