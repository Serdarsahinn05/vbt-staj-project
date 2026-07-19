# VBT Staj 2026 – E-Ticaret Projesi

Bu repo, [VB10 Staj 2026 E-Ticaret ödevi](https://github.com/VB10/staj-2026-intern-assignments) kapsamında geliştirilen çok bileşenli e-ticaret uygulamasını barındırır. Her ekip kendi klasöründe çalışır.

## Klasör Yapısı

- `backend/` — NestJS + Prisma API (JWT auth, ürün/sepet/sipariş/kullanıcı kaynakları). Kurulum ve çalıştırma talimatları için [backend/README.md](./backend/README.md).
- `frontend/` — Next.js + Tailwind web arayüzü. Kurulum ve çalıştırma talimatları için [frontend/README.md](./frontend/README.md).
- `mobile/` — Mobil uygulama (henüz eklenmedi).

## Katkı Kuralları

- Her ekip yalnızca kendi klasörüne (`backend/`, `frontend/`, `mobile/`) dokunur.
- Değişiklikler `backend/*`, `frontend/*`, `mobile/*` önekli branch'lerden PR ile `main`'e alınır.
- Backend API varsayılan olarak `http://localhost:3000` üzerinde çalışır (bkz. `backend/docker-compose.yml`).

## Claude Code Skill'leri

Bu repoda, Claude Code (VSCode eklentisi) ile kullanılabilen paylaşımlı skill'ler var. Repoyu klonlayan herkes bunları kullanabilir.

| Skill | Ne yapar |
|-------|----------|
| `/api-test` | Çalışan backend API'sindeki tüm endpoint'leri otomatik keşfedip test eder, sonuçları (status kodu, dönen veri) tablo halinde raporlar. Body isteyen endpoint'lere uygun mock veri üretir. |
| `/gunluk-ozet` | O gün yapılan değişiklikleri, herkesin anlayabileceği sade bir özet olarak `docs/gunluk/YYYY-MM-DD.md` dosyasına yazar. |

**Kullanım:**
1. Projeyi VSCode'da aç.
2. Claude Code panelinde `/api-test` veya `/gunluk-ozet` yaz (ya da doğal dille "endpoint'leri test et", "günlük özet çıkar" de).
3. Skill görünmüyorsa yeni bir Claude oturumu aç veya `/reload-skills` çalıştır.

