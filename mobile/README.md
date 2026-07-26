# Mobile — Zemrek App

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=flat-square&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-0175C2?style=flat-square&logo=dart&logoColor=white)

Zemrek e-ticaret markasının Flutter ile geliştirilen mobil uygulaması. Backend
API'sine (`../backend`) karşı çalışır, mock veri kullanmaz.

## Gereksinimler

- Flutter SDK
- Çalışan bir backend (bkz. [../backend/README.md](../backend/README.md))

## Kurulum

```bash
cd mobile
flutter pub get
flutter run
```

### Backend adresini ayarlama

`lib/core/api_config.dart` içindeki `ApiConfig.baseUrl` çalışan backend'i göstermeli:

```dart
class ApiConfig {
  static const String baseUrl = 'http://127.0.0.1:3000';
}
```

| Ortam | Adres |
|---|---|
| Fiziksel cihaz (USB) | `http://127.0.0.1:3000` + `adb reverse tcp:3000 tcp:3000` |
| Android emülatör | `http://10.0.2.2:3000` |
| Fiziksel cihaz (Wi-Fi) | `http://<bilgisayarın-yerel-ipsi>:3000` |

## Özellikler

- **Giriş / Kayıt** — JWT access + refresh token, `shared_preferences` ile cihazda saklama
- **Ana sayfa** — ürün listesi/katalog, indirim rozeti ve eski/yeni fiyat düzeni, koleksiyon etiketi
- **Ürün detayı** — renk varyantı seçimi, fiyat/stok/indirim gösterimi, değerlendirmeler (listeleme + puan/yorum gönderme)
- **Sepet** — varyant bazlı ekleme/güncelleme/çıkarma
- **Favoriler** — varyant bazlı favori listesi, indirim gösterimi
- **Hesap** — profil bilgileri

Alt gezinme çubuğu (`MainShell`): **Ana Sayfa · Favoriler · Sepet · Hesap** (sepet sekmesinde ürün sayısı rozeti).

## Proje yapısı

```text
lib/
├── main.dart              # uygulama girişi, LandingScreen ile başlar
├── core/
│   ├── api_config.dart     # backend base URL
│   ├── api_client.dart     # get/post/patch/delete + otomatik Authorization header
│   └── price_format.dart   # ₺ biçimli fiyat gösterimi (ör. ₺60.000,00)
├── services/
│   ├── auth_service.dart      # login/register/refresh, token saklama
│   ├── product_services.dart
│   ├── cart_service.dart
│   ├── favorites_service.dart
│   └── review_service.dart    # ürün değerlendirmelerini listeleme/ekleme
├── widgets/
│   ├── auth_text_field.dart
│   └── zemrek_app_bar.dart    # tüm ekranlarda ortak AppBar
└── screens/
    ├── landing_screen.dart
    ├── auth_screen.dart      # giriş / kayıt
    ├── main_shell.dart        # alt gezinme çubuğu (bottom nav)
    ├── home_screen.dart
    ├── product_detail.dart
    ├── cart_screen.dart
    ├── favorites_screen.dart
    └── account_screen.dart
```

`ApiClient`, her istekte `AuthService` üzerinden okunan access token'ı otomatik
olarak `Authorization: Bearer <token>` header'ı olarak ekler.

## Mimari notlar

- Veri akışı: `screens/` → `services/` (HTTP çağrıları) → `core/api_client.dart` → backend REST API
- Sepet ve favoriler backend'de olduğu gibi **varyant kimliğiyle** çalışır
- State yönetimi harici bir paket kullanmadan `StatefulWidget` + basit servis katmanı ile yapılır

## Testler

```bash
flutter test
```
