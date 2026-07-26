---
name: mobil-lokal
description: Zemrek Flutter mobil uygulamasını lokal backend'e bağlama, telefon testi (adb reverse), ürün kartı UI kuralları ve sık tekrarlanan mobil iş akışlarını yürütür. Kullanıcı "backend bağla", "adb reverse", "telefonu bağla", "kart tasarımı", "mobil lokal", "sunucuya bağlanılamadı" gibi bir şey istediğinde kullan. Backend koduna dokunma.
---

# Mobil Lokal Geliştirme

Amaç: Tekrarlayan mobil kurulum / bağlanma / kart UI işlerini tek seferde doğru yapmak.
**Sadece `mobile/` klasörüne dokun.** Backend dosyalarını (`backend/`, seed, Docker compose dosyaları) değiştirme; Docker'ı sadece çalıştırabilirsin.

## 1) Backend ayakta mı?

```powershell
cd C:\Users\Basari\Desktop\vbt-staj-project\backend
docker compose up --build
```

Çakışma olursa (`container name already in use`):
```powershell
docker rm -f vbt-ecommerce-api
docker compose up --build
```

DB'yi sıfırlamak **gerekirse** (fiyat/stok 0, eski seed):
```powershell
docker compose down -v
docker compose up --build
```
`down -v` hesapları siler; kullanıcıya haber ver.

Kontrol: tarayıcı / curl → `http://localhost:3000/products`

## 2) Telefon USB + adb reverse

Fiziksel telefonda API adresi `http://127.0.0.1:3000` (`mobile/lib/core/api_config.dart`).
USB çıkınca reverse düşer → "Sunucuya bağlanılamadı".

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb devices
& $adb reverse tcp:3000 tcp:3000
& $adb reverse --list
```

`adb devices` boşsa: kablo, USB hata ayıklama, "İzin ver", dosya aktarımı / MTP.

Uygulama:
```powershell
cd C:\Users\Basari\Desktop\vbt-staj-project\mobile
flutter run
```

Kurulum çakışırsa:
```powershell
& $adb uninstall com.example.mobile
flutter run
```

## 3) Giriş / kayıt notları

- `down -v` sonrası eski kayıtlar yok → yeniden **Kayıt ol** veya seed admin:
  - E-posta: `admin@zemrek.com`
  - Şifre: `Admin123!`
- Mobil e-postayı `trim` + lowercase ile gönderir (`AuthService`).

## 4) Ürün kartı UI kuralları (home)

Dosya: `mobile/lib/screens/home_screen.dart`

- Grid: `childAspectRatio: 0.58`, 2 sütun
- Sıra (metin bloğu dikey ortalı, aralar eşit ~5px):
  1. Koleksiyon → `HORIZON KOLEKSİYONU` (`$series Koleksiyonu`.toUpperCase())
  2. Ürün adı
  3. Yıldız + yorum
  4. **İndirimli fiyat** (büyük, gold-dark)
  5. Varsa üstü çizili **eski fiyat** (indirimsiz) — indirimli fiyatın **altında**
- `%X İndirim` rozeti: görselin **sol üstünde**, gold (`_gold`), siyah yazı
- Fiyat formatı: `formatTryPrice` → `₺60.000,00` (`mobile/lib/core/price_format.dart`)
- Detay ekranında indirim rozeti de gold + `%X İndirim` metni

## 5) Yapma listesi

- `backend/` kaynak kodunu düzenleme
- seed / Prisma / SQL elle oynama (kullanıcı mobil ekibi)
- Kullanıcı istemeden commit / push
- Kartlarda kırmızı indirim rozeti kullanma (gold olsun)

## Hızlı teşhis

| Belirti | Muhtemel neden | Çözüm |
|---------|----------------|-------|
| Sunucuya bağlanılamadı | Docker kapalı veya USB/reverse yok | `docker compose up` + `adb reverse` |
| E-posta/şifre hatalı (doğru yazıyor) | DB sıfırlandı | Kayıt ol veya admin hesabı |
| ADB install failed | Eski imza / yer yok | `adb uninstall com.example.mobile` |
| Kartta sarı overflow | Aspect ratio / metin sığmıyor | 0.58 + eşit boşluk + ortalı blok |
