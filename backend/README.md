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
├── products/     # ürün listeleme/arama/detay — geliştiriliyor
├── categories/   # ürün kategorileri — geliştiriliyor
├── cart/         # sepet işlemleri — geliştiriliyor
└── orders/       # sipariş oluşturma/geçmiş — geliştiriliyor
```

Veri modelleri için bkz. [prisma/schema.prisma](./prisma/schema.prisma).

## Durum

Şu an Docker altyapısı, Prisma veri modeli ve Swagger dokümantasyonu hazır. Auth ve kaynak (resource) modüllerinin içi henüz doldurulmadı.
