---
name: gunluk-ozet
description: O gün yapılan tüm değişiklikleri (git commit'leri + commit'lenmemiş değişiklikler) toplayıp, başkalarının anlayabileceği sade bir Türkçe özet olarak markdown dosyasına yazar. Dosya isimleri değil, NE yapıldığını ve NEDEN yapıldığını anlatır. Kullanıcı "günlük özet", "bugün ne yaptım", "gün sonu raporu", "değişiklikleri md yap" gibi bir şey istediğinde kullan.
---

# Günlük Değişiklik Özeti

Amaç: Bir günün sonunda yapılan işleri, teknik olmayan biri bile anlayabilecek şekilde
özetleyip paylaşılabilir bir markdown dosyasına yazmak. Ham git çıktısı değil, **insan dili**.

## Adım 1 — O günün değişikliklerini topla

Bugünün commit'lerini al:
```bash
git log --since="00:00" --until="now" --pretty=format:"%h %s" --stat
```

Commit'lenmemiş (henüz devam eden) değişiklikleri de dahil et:
```bash
git status --short
git diff --stat
```

Değişikliklerin ne olduğunu **gerçekten anlamak için** ilgili diff'lere bak (sadece dosya
adına bakma):
```bash
git log --since="00:00" -p        # bugünkü commit'lerin içeriği
git diff                          # commit'lenmemiş değişiklikler
```

Not: Eğer bugün hiç değişiklik yoksa, kullanıcıya bildir ve son değişiklik gününü öner
(`git log -1 --format=%cd`), o günü özetlemeyi teklif et.

## Adım 2 — Anlamlı grupla ve sadeleştir

Değişiklikleri **konuya göre grupla**, dosya dosya listeleme:
- Yeni özellikler / endpoint'ler
- Düzeltmeler (bug fix)
- Altyapı / yapılandırma (Docker, migration, config)
- Dokümantasyon

Her madde için:
- **Ne** yapıldığını sade dille yaz (ör. "Kategoriler için tam CRUD API'si eklendi")
- Gerekiyorsa **neden** yapıldığını ekle (ör. "aynı isimde kategori engellensin diye unique kısıtı eklendi")
- Teknik jargonu minimuma indir; kullanılan teknoloji adı gerekliyse parantezle ver

Yapma:
- `app.module.ts değiştirildi` gibi dosya-seviyesi ifadeler (bunun yerine "modül sisteme bağlandı")
- Ham commit hash'leri listesi
- İç içe teknik ayrıntı yığını

## Adım 3 — Markdown dosyasına yaz

Dosyayı `docs/gunluk/YYYY-MM-DD.md` yoluna yaz (klasör yoksa oluştur). Tarihi bugünün
gerçek tarihinden al.

Şablon:

```markdown
# Günlük Özet — <GG.AA.YYYY>

## Özet
<2-3 cümlelik, o günün en önemli çıktısı>

## Yapılanlar

### ✨ Yeni Özellikler
- ...

### 🐛 Düzeltmeler
- ...

### 🔧 Altyapı / Yapılandırma
- ...

### 📄 Dokümantasyon
- ...

## Notlar / Sıradaki İşler
- <varsa yarım kalan işler veya bir sonraki adım>
```

Boş olan bölümleri (o gün o kategoride iş yoksa) şablondan çıkar — sadece dolu başlıklar kalsın.

## Adım 4 — Kullanıcıya bildir

Dosyayı oluşturduktan sonra:
- Dosyanın yolunu ver
- Özetin markdown önizlemesini sohbete de yaz ki kullanıcı hemen görsün
- İstenirse PR açıklamasına / issue yorumuna yapıştırılabilir formatta olduğunu belirt

## Notlar

- Tek bir kişinin o günkü işini özetliyorsun; "biz" yerine sade, nötr bir dil kullan.
- Tarih/gün belirsizse bugünü varsay; kullanıcı "dün" veya belirli bir tarih derse
  `--since`/`--until` aralığını ona göre ayarla.
- Amaç ekip içi paylaşım — okuyan kişi kodu görmeden ne olduğunu anlayabilmeli.
