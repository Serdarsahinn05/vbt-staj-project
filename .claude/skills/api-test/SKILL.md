---
name: api-test
description: Çalışan backend API'sindeki TÜM endpoint'leri (GET/POST/PATCH/DELETE) otomatik keşfedip tek tek dener ve sonuçlarını (status kodu, dönen veri, çalışıp çalışmadığı) tablo halinde raporlar. Body isteyen endpoint'ler için şemadan uygun mock veri üretir. Kullanıcı "endpoint'leri test et", "API'yi dene", "hepsini çalıştır" gibi bir şey istediğinde kullan.
---

# API Endpoint Otomatik Test

Amaç: Elle tek tek curl atmak yerine, çalışan API'nin tüm endpoint'lerini otomatik keşfedip test etmek ve okunabilir bir rapor sunmak.

## Ön koşullar

1. **Base URL:** Varsayılan `http://localhost:3000`. Kullanıcı farklı bir port/adres verirse onu kullan.
2. **API ayakta mı kontrol et:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` çalıştır. Bağlanamıyorsan (`000`), kullanıcıya "API çalışmıyor, önce `cd backend && docker compose up` ile başlatın" de ve dur.

## Adım 1 — Endpoint'leri keşfet

Endpoint listesini **elle yazma**, OpenAPI spec'inden otomatik al:

```bash
curl -s http://localhost:3000/api-json
```

Bu JSON'daki `paths` alanı tüm endpoint'leri, HTTP metotlarını ve (varsa) request body şemalarını içerir. Bunu parse et:
- Her `path` + `method` kombinasyonu bir test edilecek endpoint'tir
- `requestBody` varsa → body gönderilmeli (Adım 3'e bak)
- Path'te `{id}` gibi parametre varsa → gerçek bir değerle doldur (Adım 2)

Eğer `/api-json` erişilemezse, ikinci yol olarak `backend/src/**/*.controller.ts` dosyalarındaki `@Get/@Post/@Patch/@Delete` decorator'larını tarayarak endpoint'leri çıkar.

## Adım 2 — Path parametrelerini (`:id`) çöz

`{id}` gibi parametreler için gerçek bir değer gerekir:
- Önce o kaynağın liste endpoint'ine (`GET /kaynak`) istek at, dönen ilk kaydın `id`'sini kullan.
- Liste boşsa veya yoksa, önce bir `POST` ile kayıt oluşturup dönen `id`'yi kullan.
- Hiçbiri olmazsa `1` kullan (ve raporda "varsayılan id" olarak belirt).

## Adım 3 — Body isteyen endpoint'ler için mock veri üret

`requestBody` şemasındaki her alan için tipe/formata göre makul bir değer üret:

| Şema | Örnek değer |
|------|-------------|
| string | `"Test <alanAdı>"` |
| string (format: email) | `"test@example.com"` |
| string (format: password) | `"Test1234!"` |
| integer / number | `1` (fiyat gibi görünüyorsa `99.90`) |
| boolean | `true` |
| enum | listedeki ilk değer |
| array | tek elemanlı örnek dizi |

Sadece `required` alanları doldurman yeterli; opsiyonelleri de eklersen daha iyi. Alan adından anlam çıkar (ör. `name` → `"Test Ürün"`, `email` → geçerli email).

## Adım 4 — Testleri akıllı sırayla çalıştır

Veriyi bozmadan test etmek için, her kaynak (categories, products, ...) için şu sırayı izle:

1. `GET /kaynak` (liste) — okuma
2. `POST /kaynak` — **mock veriyle yeni bir throwaway kayıt oluştur**, dönen `id`'yi sakla
3. `GET /kaynak/{yeni-id}` — tek getir
4. `PATCH /kaynak/{yeni-id}` — güncelle (mock veriyle)
5. `DELETE /kaynak/{yeni-id}` — **oluşturduğun throwaway kaydı sil** (böylece seed verisi bozulmaz)

Böylece test ettiğin veriyi yine kendin temizlemiş olursun; mevcut/seed verilerine dokunma.

Her isteği şu formatta at ve hem status kodunu hem gövdeyi yakala:
```bash
curl -s -w "\n%{http_code}" -X <METOD> <URL> \
  -H "Content-Type: application/json" \
  -d '<mock-json>'
```

## Adım 5 — Raporla

Sonuçları markdown tablosu olarak sun:

| Metot | Endpoint | Status | Sonuç | Dönen (özet) |
|-------|----------|--------|-------|--------------|
| GET | /categories | 200 | ✅ | 6 kayıt |
| POST | /categories | 201 | ✅ | `{id: 7, name: "..."}` |
| GET | /categories/999 | 404 | ✅ | beklenen 404 |
| ... | | | | |

Kurallar:
- **2xx** → ✅ başarılı
- **4xx** → beklenen bir doğrulama/hata senaryosuysa (ör. olmayan id'de 404, geçersiz body'de 400) ✅ olarak işaretle ve "beklenen" yaz; beklenmiyorsa ⚠️
- **5xx** → ❌ hata (muhtemelen kodda bir sorun) — bunları ayrıca vurgula
- Dönen gövdeyi kısa özetle (uzunsa ilk birkaç alan / kayıt sayısı)

Sonunda kısa bir özet ver: kaç endpoint test edildi, kaçı geçti, dikkat edilmesi gereken (❌/⚠️) var mı.

## Notlar

- Auth gerektiren endpoint'ler (ileride JWT eklenince) `401` dönerse, önce `POST /auth/login` ile token alıp `Authorization: Bearer <token>` header'ı eklemeyi dene; başarısız olursa raporda "auth gerekiyor" olarak işaretle.
- Bu skill hiçbir endpoint'i elle listelemez — her şeyi `/api-json`'dan alır, yani yeni modüller (products, cart, orders...) eklendikçe otomatik kapsanır.
