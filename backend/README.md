# Backend — Zemrek E-Ticaret API

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

NestJS + Prisma + PostgreSQL ile geliştirilen, JWT tabanlı yetkilendirmeye
sahip e-ticaret backend API'si. Renk varyantlı ürün kataloğu, varyant bazlı
sepet/favoriler, ürün değerlendirmeleri ve admin koruması içerir.

## Gereksinimler

Sadece **Docker Desktop** yeterli. Node.js, PostgreSQL vb. host makinenize kurmanıza gerek yok — her şey container içinde çalışır.

## Kurulum

```bash
cd backend
cp .env.example .env
docker compose up --build
```

Bu komut tek başına:
- PostgreSQL veritabanını ayağa kaldırır
- Mevcut migration'ları otomatik uygular (`prisma migrate deploy`)
- Prisma Client'ı üretir
- Seed verisini otomatik yükler (kategoriler, renk varyantlı ürünler, admin kullanıcı) — tekrar tekrar çalışsa da mevcut veriyi (örn. panelden girilen fiyat/stok) silmez/kopyalamaz
- API'yi hot-reload modunda başlatır (`nest start --watch`)

İlk kurulumdan sonra tekrar çalıştırmak için `--build` gerekmez, sadece:

```bash
docker compose up
```

## Test etme

- API: [http://localhost:3000](http://localhost:3000)
- Swagger (API dokümantasyonu): [http://localhost:3000/api](http://localhost:3000/api)
- PostgreSQL: `localhost:5432` (kullanıcı: `postgres`, şifre: `postgres`, db: `ecommerce_db`) — DBeaver/QueryArk gibi bir araçla bağlanabilirsiniz.

### Demo hesap

Seed, admin rolüyle bir kullanıcı oluşturur:

| E-posta | Şifre |
|---|---|
| `admin@zemrek.com` | `Admin123!` |

## Kod değiştirmek

`src/` altında bir dosyayı değiştirdiğinizde container'ı yeniden başlatmanıza **gerek yok** — hot-reload otomatik devreye girer. Yalnızca `package.json`'a yeni bir bağımlılık eklerseniz `docker compose up --build` ile yeniden build almanız gerekir.

## Faydalı komutlar

```bash
# Container loglarını izle
docker compose logs api -f

# Container içinde komut çalıştır (örn. yeni migration oluşturmak)
docker compose exec api npx prisma migrate dev --name <isim>

# Container içinde paket kurmak
docker compose exec api npm install <paket>

# Testleri çalıştır
docker compose exec api npm run test

# Her şeyi durdur
docker compose down

# Durdur ve veritabanını da sıfırla
docker compose down -v
```

## Proje yapısı

```text
src/
├── auth/         # kayıt/giriş/refresh, JWT strategy, rol tabanlı guard (@Roles)
├── users/        # profil, şifre değiştirme, adres yönetimi
├── products/     # ürün + renk varyantı CRUD, arama/filtreleme/sayfalama
├── categories/   # ürün kategorileri (stil bazlı: Akıllı/Klasik/Spor/Lüks vb.)
├── cart/         # varyant bazlı sepet (ekle/güncelle/çıkar, stok kontrolü)
├── favorites/    # kullanıcı ↔ varyant favori listesi
└── reviews/      # ürün başına tek puanlı değerlendirme (yorum opsiyonel)
```

Veri modelleri için bkz. [prisma/schema.prisma](./prisma/schema.prisma).

## Veri modeli (özet)

- **Product** — model bazlı sabit fiyat, çoklu cinsiyet (`ERKEK`/`KADIN`, `Product.genders`), seri, stil etiketleri, teknik künye alanları (kasa, malzeme, mekanizma vb.), tek kategoriye bağlı, `slug` ile URL-uyumlu.
- **ProductVariant** — rengin taşıdığı gerçek veri: `colorName`, `colorHex`, görseller, **stok** ve **indirim yüzdesi** (`discount`, 0-100). Etkin fiyat: `price × (1 - discount/100)`.
- **User / Address** — kullanıcı profili, `role` alanı (JWT payload'ına da yazılır), kayıtlı teslimat adresleri.
- **Cart / CartItem** — `CartItem.variantId` ile varyanta bağlı satırlar.
- **Favorite** — `@@unique([userId, variantId])`, cascade silme.
- **Review** — `@@unique([userId, productId])`, `rating` 1-5, `comment` opsiyonel.

## Hazır endpoint'ler

Tüm endpoint'ler Swagger üzerinden test edilebilir: [http://localhost:3000/api](http://localhost:3000/api)

### Auth (`/auth`)

| Metot | Yol | Açıklama |
|-------|-----|----------|
| POST | `/auth/register` | Yeni kullanıcı kaydı |
| POST | `/auth/login` | Giriş — access + refresh token döner |
| POST | `/auth/refresh` | Refresh token ile yeni access token alır |

JWT payload'ı `userId` ve `role` içerir; rol token'dan okunduğu için **rol değişince yeniden login gerekir**.

### Users (`/users`) — giriş gerekli

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/users/profile` | Kendi profilini getirir |
| PATCH | `/users/profile` | Profil bilgilerini günceller |
| PATCH | `/users/change-password` | Şifre değiştirir |
| POST | `/users/addresses` | Yeni adres ekler |
| DELETE | `/users/addresses/:id` | Adres siler |

### Categories (`/categories`)

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/categories` | Tüm kategorileri listeler |
| GET | `/categories/:id` | Tek kategori getirir (yoksa `404`) |
| POST | `/categories` | Yeni kategori oluşturur (aynı isim varsa `409`) |
| PATCH | `/categories/:id` | Kategori günceller (yoksa `404`) |
| DELETE | `/categories/:id` | Kategori siler (yoksa `404`) |

### Products (`/products`)

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/products` | Ürünleri listeler (arama, filtreleme, sayfalama — aşağıya bakın) |
| GET | `/products/:id` | Tek ürün getirir, kategori ve varyantlarıyla birlikte (yoksa `404`) |
| POST | `/products` | Yeni ürün oluşturur — **sadece ADMIN** (geçersiz kategori → `400`) |
| PATCH | `/products/:id` | Ürün günceller — **sadece ADMIN** (yoksa `404`) |
| DELETE | `/products/:id` | Ürün siler — **sadece ADMIN** (yoksa `404`) |
| PATCH | `/products/variants/:variantId` | Varyantın fiyat/stok/indirimini günceller — **sadece ADMIN**, body: `{ price?, stock?, discount? }` |

**`GET /products` query parametreleri** (hepsi opsiyonel, birlikte kullanılabilir):

| Parametre | Örnek | Ne yapar |
|-----------|-------|----------|
| `search` | `?search=vesper` | İsim ve açıklamada arar (kısmi, harf duyarsız) |
| `categoryId` | `?categoryId=1` | Kategoriye (stil) göre filtreler |
| `gender` | `?gender=ERKEK` | Cinsiyete göre filtreler — `ERKEK` / `KADIN` (bir ürün ikisine de ait olabilir) |
| `series` | `?series=Signature` | Seriye göre filtreler |
| `minPrice` / `maxPrice` | `?minPrice=1000&maxPrice=5000` | Fiyat aralığı |
| `sortBy` / `sortOrder` | `?sortBy=price&sortOrder=asc` | Sıralama alanı (`price` / `name`) ve yönü |
| `page` / `limit` | `?page=2&limit=10` | Sayfalama (varsayılan `page=1`, `limit=10`) |

`categoryId` ve `gender` birbirinden bağımsız iki eksendir, birlikte kullanılabilir — örn. `?gender=ERKEK&categoryId=2` "erkek + klasik saat" sonucunu verir.

Yanıt formatı: `{ "data": [...], "meta": { total, page, limit, totalPages } }`

### Cart (`/cart`) — giriş gerekli

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/cart` | Kullanıcının sepetini getirir (yoksa otomatik boş sepet oluşturur) |
| POST | `/cart/items` | Sepete varyant ekler — body: `{ variantId, quantity }`. Varyant zaten sepetteyse miktar birleşir |
| PATCH | `/cart/items/:variantId` | Sepetteki bir varyantın miktarını günceller — body: `{ quantity }` |
| DELETE | `/cart/items/:variantId` | Sepetten tek bir varyantı çıkarır |
| DELETE | `/cart` | Sepeti tamamen boşaltır |

İstenen miktar varyantın stoğunu aşarsa `400`, varyant ya da sepet bulunamazsa `404` döner. Sepet yanıtı, satırların indirimli fiyat × miktar toplamı olan `total` alanını da içerir.

### Favorites (`/favorites`) — giriş gerekli

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/favorites` | Kullanıcının favori varyantlarını listeler |
| POST | `/favorites` | Bir varyantı favorilere ekler — body: `{ variantId }` (idempotent) |
| DELETE | `/favorites/:variantId` | Bir varyantı favorilerden çıkarır |

### Reviews

| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/products/:productId/reviews` | Ürünün yorumlarını ve ortalama puanını listeler (herkese açık) |
| POST | `/products/:productId/reviews` | Ürüne yorum + puan ekler — **giriş gerekli**, body: `{ rating, comment? }` |
| DELETE | `/reviews/:id` | Kendi yorumunu siler — **giriş gerekli** |

## Testler

```bash
npm run test        # birim testler (Jest)
npm run test:cov     # coverage raporu
npm run test:e2e     # e2e testler
```

Mevcut birim testler: `auth.service`, `auth.controller`, `users.service`, `users.controller`.

## Durum

Tamamlananlar:
- Docker altyapısı (tek komutla ayağa kalkma, hot-reload, otomatik migration + seed)
- Prisma veri modeli (User, Address, Category, Product, ProductVariant, Cart, CartItem, Favorite, Review)
- Swagger / OpenAPI dokümantasyonu
- Global validasyon (class-validator) + tutarlı hata yönetimi (`400` / `404` / `409`)
- **Auth** — JWT (access + refresh), rol tabanlı yetkilendirme (`@Roles('ADMIN')` + `RolesGuard`)
- **Users** — profil, şifre değiştirme, adres yönetimi
- **Categories** modülü — tam CRUD
- **Products** modülü — tam CRUD + renk varyantları + görseller + arama/filtreleme/sayfalama, admin korumalı yazma işlemleri
- **Cart** modülü — varyant bazlı ekle/güncelle/çıkar/sepeti boşalt, stok kontrolü, otomatik sepet oluşturma
- **Favorites** modülü — varyant bazlı favori ekle/listele/çıkar
- **Reviews** modülü — ürün başına tek puanlı değerlendirme, opsiyonel yorum
- Seed: kategoriler, renk varyantlı örnek ürünler ve admin kullanıcı (idempotent)
- Auth ve Users için birim testleri

> Not: İlk sürümde planlanan `orders` (sipariş) modülü kapsamdan çıkarıldı; sipariş akışı frontend tarafında ödeme onay ekranı ile simüle ediliyor.
