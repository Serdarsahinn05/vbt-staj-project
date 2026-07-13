# VBT Staj 2026 – E-Ticaret Projesi

Bu repo, [VB10 Staj 2026 E-Ticaret ödevi](https://github.com/VB10/staj-2026-intern-assignments) kapsamında geliştirilen çok bileşenli e-ticaret uygulamasını barındırır. Her ekip kendi klasöründe çalışır.

## Klasör Yapısı

- `backend/` — NestJS + Prisma API (JWT auth, ürün/sepet/sipariş/kullanıcı kaynakları). Kurulum ve çalıştırma talimatları için [backend/README.md](./backend/README.md).
- `frontend/` — Web arayüzü (henüz eklenmedi).
- `mobile/` — Mobil uygulama (henüz eklenmedi).

## Katkı Kuralları

- Her ekip yalnızca kendi klasörüne (`backend/`, `frontend/`, `mobile/`) dokunur.
- Değişiklikler `backend/*`, `frontend/*`, `mobile/*` önekli branch'lerden PR ile `main`'e alınır.
- Backend API varsayılan olarak `http://localhost:3000` üzerinde çalışır (bkz. `backend/docker-compose.yml`).
