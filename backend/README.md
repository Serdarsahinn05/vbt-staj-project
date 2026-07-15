# Backend — VBT E-Ticaret API

NestJS + Prisma + PostgreSQL ile geliştirilen e-ticaret backend API'si.

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
- Seed verisini otomatik yükler (örnek kategoriler ve görselli ürünler) — tekrar tekrar çalışsa da veri silmez/kopyalamaz
- API'yi hot-reload modunda başlatır (`nest start --watch`)

İlk kurulumdan sonra tekrar çalıştırmak için `--build` gerekmez, sadece:

```bash
docker compose up
```

## Test etme

- API: [http://localhost:3000](http://localhost:3000)
- Swagger (API dokümantasyonu): [http://localhost:3000/api](http://localhost:3000/api)
- PostgreSQL: `localhost:5432` (kullanıcı: `postgres`, şifre: `postgres`, db: `ecommerce_db`) — DBeaver/QueryArk gibi bir araçla bağlanabilirsiniz.

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

# Her şeyi durdur
docker compose down

# Durdur ve veritabanını da sıfırla
docker compose down -v
```

## Proje yapısı

```
src/
├── auth/         # kimlik doğrulama (JWT) — geliştiriliyor
├── users/        # kullanıcı profilleri — geliştiriliyor
├── products/     # ürün listeleme/arama/filtreleme/detay — ✅ hazır (CRUD + görseller)
├── categories/   # ürün kategorileri — ✅ hazır (CRUD)
├── cart/         # sepet işlemleri — geliştiriliyor
└── orders/       # sipariş oluşturma/geçmiş — geliştiriliyor
```

Veri modelleri için bkz. [prisma/schema.prisma](./prisma/schema.prisma).

## Hazır endpoint'ler

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
| GET | `/products/:id` | Tek ürün getirir, kategorisiyle birlikte (yoksa `404`) |
| POST | `/products` | Yeni ürün oluşturur (geçersiz kategori → `400`) |
| PATCH | `/products/:id` | Ürün günceller (yoksa `404`) |
| DELETE | `/products/:id` | Ürün siler (yoksa `404`) |

**`GET /products` query parametreleri** (hepsi opsiyonel, birlikte kullanılabilir):

| Parametre | Örnek | Ne yapar |
|-----------|-------|----------|
| `search` | `?search=rolex` | İsim ve açıklamada arar (kısmi, harf duyarsız) |
| `categoryId` | `?categoryId=1` | Kategoriye göre filtreler |
| `minPrice` / `maxPrice` | `?minPrice=1000&maxPrice=5000` | Fiyat aralığı |
| `sortBy` | `?sortBy=price` | Sıralama alanı (`price` / `name`) |
| `page` / `limit` | `?page=2&limit=10` | Sayfalama (varsayılan `page=1`, `limit=10`) |

Yanıt formatı: `{ "data": [...], "meta": { total, page, limit, totalPages } }`

Tüm endpoint'ler Swagger üzerinden test edilebilir: [http://localhost:3000/api](http://localhost:3000/api)

## Durum

Tamamlananlar:
- Docker altyapısı (tek komutla ayağa kalkma, hot-reload, otomatik migration + seed)
- Prisma veri modeli (User, Category, Product, Cart, CartItem, Order, OrderItem)
- Swagger / OpenAPI dokümantasyonu
- Global validasyon (class-validator) + tutarlı hata yönetimi (`400` / `404` / `409`)
- **Categories** modülü — tam CRUD
- **Products** modülü — tam CRUD + görseller + arama/filtreleme/sayfalama
- Seed: örnek kategoriler ve görselli ürünler (idempotent)

Sıradaki işler: Auth (JWT), Users, Cart, Orders modülleri ve RFC 9457 standart hata formatı.
