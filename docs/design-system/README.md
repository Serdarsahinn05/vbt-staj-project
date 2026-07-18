<div align="center">

<img src="./assets/logo+brand.svg" alt="Zemrek" width="200" />

Premium saat e-ticareti tasarım dili — dark luxury.

[zemrekdesignsystem.vercel.app](https://zemrekdesignsystem.vercel.app)

</div>

---

Burada sadece tokenlar var. Bileşenler, guideline'lar, demo → canlı sitede.

## Renkler

| | | |
|--|--|--|
| ![](https://placehold.co/12/145C45/145C45.png) | `--color-primary` | `#145C45` |
| ![](https://placehold.co/12/C9A66B/C9A66B.png) | `--color-accent` | `#C9A66B` |
| ![](https://placehold.co/12/E8DCC3/E8DCC3.png) | `--color-accent-muted` | `#E8DCC3` |
| ![](https://placehold.co/12/1B4332/1B4332.png) | `--color-secondary` | `#1B4332` |
| ![](https://placehold.co/12/0D0D0D/0D0D0D.png) | `--bg-dark` | `#0D0D0D` |
| ![](https://placehold.co/12/FAFAFA/FAFAFA.png) | `--bg-page` | `#FAFAFA` |

Skalalar → emerald · pine · gold · graphite · steel (100–700)

## Temeller

- **Font** → Montserrat (başlık) · Poppins (metin)
- **Ölçek** → 11 · 13 · 15 · 18 · 22 · 30 · 40 · 56px
- **Spacing** → 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96
- **Radius** → 8 · 12 · 16 · pill
- **Motion** → 150–220ms · `cubic-bezier(.4,0,.2,1)`
- **İçerik** → Türkçe · `₺74.900,00` · `★ 4.9 (128)`

## Dosyalar

| | |
|--|--|
| `tokens.json` | Platform bağımsız kaynak — web + mobil |
| `colors.css` `typography.css` `spacing.css` | Web'e özgü |

**Next.js** → CSS'leri global stile import, `var(--color-accent)`

**Flutter** → `tokens.json`'dan Dart sabiti
- Renk `0xFF` prefix'i ister
- Font `google_fonts` paketi
- Gölge → `BoxShadow`'a elle çevrilir (CSS `hsl()` katmanlı)
