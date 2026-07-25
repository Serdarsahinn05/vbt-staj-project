import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CLOUDINARY_BASE = 'https://res.cloudinary.com/d5pgexxe/image/upload/';
const cloud = (path: string): string => `${CLOUDINARY_BASE}${path}`;

const imgs = (slug: string): string[] =>
  Array.from({ length: 8 }, (_, i) => cloud(`${slug}-${i + 1}`));

// ---------- Sahte değerlendirme (review) seed'i için yardımcılar ----------
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function toAscii(s: string): string {
  return s
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
    .toLowerCase();
}


function ratingsForTarget(n: number, targetAvg: number): number[] {
  const totalTarget = Math.round(targetAvg * n);
  const ratings = new Array(n).fill(4);
  const diff = totalTarget - 4 * n;
  if (diff > 0) {
    for (let i = 0; i < Math.min(diff, n); i++) ratings[i] = 5;
  } else if (diff < 0) {
    for (let i = 0; i < Math.min(-diff, n); i++) ratings[i] = 3;
  }
  return shuffle(ratings);
}

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Mustafa', 'Elif', 'Emre', 'Zeynep', 'Can', 'Deniz',
  'Burak', 'Ece', 'Kerem', 'Selin', 'Onur', 'Gizem', 'Umut', 'Merve', 'Berk', 'Aylin',
  'Tolga', 'Nazlı', 'Barış', 'İrem', 'Cem', 'Buse', 'Serkan', 'Pınar', 'Kaan', 'Ceren',
  'Furkan', 'Yasemin', 'Emir', 'Sude', 'Arda', 'Melis', 'Batuhan', 'Su', 'Yusuf', 'Beren',
];
const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Arslan',
  'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özdemir', 'Şimşek', 'Erdoğan',
  'Türk', 'Aksoy', 'Güneş', 'Polat', 'Bulut', 'Aktaş', 'Karaca', 'Acar', 'Ünal', 'Tekin',
];

const REVIEW_COMMENTS = [
  'Kutudan çıkar çıkmaz kalitesini hissettim, çok memnun kaldım.',
  'Zarif ve şık, beklediğimden bile güzel geldi.',
  'Kayış çok rahat, günlük kullanımda hiç sorun yaşamadım.',
  'Kargo hızlıydı, paketleme özenliydi.',
  'Fiyatına göre kalitesi gerçekten çok iyi.',
  'Ailem ve arkadaşlarımdan çok beğeni aldım.',
  'Mekanizması sessiz ve düzgün çalışıyor.',
  'Hediye olarak aldım, çok beğenildi.',
  'Kadranın okunabilirliği harika.',
  'Bir kusur bulamadım, tam istediğim gibi.',
  'Biraz beklediğimden büyük geldi ama yine de memnunum.',
  'Renk fotoğraftakiyle birebir aynıydı, çok şık duruyor.',
];


const REVIEW_PLAN: Record<string, { count: number; avg: number; onlyCurrentYear?: boolean }> = {
  vesper: { count: 52, avg: 4.8 },
  aurelius: { count: 22, avg: 4.8, onlyCurrentYear: true },
  orion: { count: 45, avg: 4.7 },
  solace: { count: 38, avg: 4.7 },
  lunaris: { count: 20, avg: 4.9, onlyCurrentYear: true },
  nova: { count: 33, avg: 4.7 },
  drift: { count: 60, avg: 4.6 },
  valor: { count: 41, avg: 4.7 },
  void: { count: 27, avg: 4.7 },
  iris: { count: 24, avg: 4.625 },
};

const CATEGORIES = [
  'Akıllı Saat',
  'Klasik Saat',
  'Spor Saat',
  'Lüks Saat',
  'Dress Saat',
  'Casual Saat',
];

type Gender = 'ERKEK' | 'KADIN';

type Variant = {
  colorName: string;
  colorHex: string;
  images: string[];
  stock: number; // stok renk bazında
  discount?: number; // yüzde (model bazlı; verilmezse 0)
};

type SeedProduct = {
  name: string;
  slug: string;
  series: 'Signature' | 'Horizon' | 'Apex';
  description: string; // "Görünüm"
  category: string; // birincil stil (CATEGORIES içinden)
  styleTags: string[]; // "Kategori" satırındaki stiller
  genders: Gender[]; // bir ürün birden fazla cinsiyete ait olabilir
  price: string; // model bazlı fiyat (tüm renkler aynı), Decimal → string
  caseSize: string;
  material: string;
  bezel: string;
  crown: string;
  crystal: string;
  waterResistance: string;
  movement: string;
  strap: string;
  dial: string;
  variants: Variant[];
};

const PRODUCTS: SeedProduct[] = [
  // ---------- Signature Serisi ----------
  {
    name: 'Vesper',
    slug: 'vesper',
    series: 'Signature',
    description: 'Ultra ince, zarif ve temiz dress watch. Çok sade ve prestijli duruş.',
    category: 'Dress Saat',
    styleTags: ['Lüks', 'Dress'],
    genders: ['ERKEK', 'KADIN'],
    price: '118000',
    caseSize: '39 mm, ultra ince yuvarlak kasa',
    material: 'Rose Gold (Renk 1) / 316L Paslanmaz Çelik – Beyaz Altın tonu (Renk 2)',
    bezel: 'Cilalı',
    crown: 'Vidalanmayan, klasik',
    crystal: 'Safir kristal',
    waterResistance: '50 metre',
    movement: 'Otomatik',
    strap: 'Timsah derisi + katlanır toka',
    dial: 'Temiz fırçalanmış, sade 3 ibreli',
    variants: [
      { colorName: 'Beyaz Altın', colorHex: '#E5E4E2', images: imgs('vesper-silver'), stock: 7 },
      { colorName: 'Rose Gold', colorHex: '#B76E79', images: imgs('vesper-gold'), stock: 5 },
    ],
  },
  {
    name: 'Aurelius',
    slug: 'aurelius',
    series: 'Signature',
    description: 'Klasik ve aristokrat. Guilloché desenli kadran + metal bilezik ile zamansız bir duruş.',
    category: 'Dress Saat',
    styleTags: ['Lüks', 'Dress'],
    genders: ['ERKEK', 'KADIN'],
    price: '96000',
    caseSize: '40 mm, klasik yuvarlak kasa',
    material: '316L Paslanmaz Çelik – Beyaz Altın tonu',
    bezel: 'Cilalı',
    crown: 'Vidalanmayan, düz yüzeyli',
    crystal: 'Safir kristal',
    waterResistance: '50 metre',
    movement: 'Otomatik',
    strap: 'Metal bilezik (fırçalı + cilalı baklalar)',
    dial: 'Gümüş ton, ince guilloché desenli',
    variants: [
      { colorName: 'Beyaz Altın / Çelik', colorHex: '#E5E4E2', images: imgs('aurelius'), stock: 9 },
    ],
  },
  {
    name: 'Orion',
    slug: 'orion',
    series: 'Signature',
    description: 'Güçlü ve erkeksi. Koyu lacivert kadran, tarih penceresi ve ışıklı ibrelerle net karakter.',
    category: 'Lüks Saat',
    styleTags: ['Lüks'],
    genders: ['ERKEK'],
    price: '84000',
    caseSize: '42 mm, güçlü kasa, belirgin lug’lar',
    material: '316L Paslanmaz Çelik',
    bezel: 'Cilalı, hafif kalınlaştırılmış',
    crown: 'Vidalanmayan, daha büyük',
    crystal: 'Safir kristal',
    waterResistance: '100 metre',
    movement: 'Otomatik',
    strap: 'Siyah timsah derisi + çelik toka',
    dial: 'Koyu lacivert, 3’te tarih penceresi, Super-LumiNova ışıklı ibre ve indeksler',
    variants: [
      { colorName: 'Lacivert', colorHex: '#1F3A5F', images: imgs('orion'), stock: 11 },
    ],
  },
  {
    name: 'Solace',
    slug: 'solace',
    series: 'Signature',
    description: 'Küçük, çok ince ve mücevhervari. Soft mother-of-pearl kadran ve ince metal bilezik ile belirgin şekilde feminen.',
    category: 'Dress Saat',
    styleTags: ['Lüks', 'Dress'],
    genders: ['KADIN'],
    price: '88000',
    caseSize: '36 mm, çok ince ve yumuşak hatlı',
    material: '316L Paslanmaz Çelik',
    bezel: 'Cilalı',
    crown: 'Klasik, küçük',
    crystal: 'Safir kristal',
    waterResistance: '30 metre',
    movement: 'Otomatik',
    strap: 'İnce metal bilezik',
    dial: 'Soft mother-of-pearl (sedef), minimal ve feminen',
    variants: [
      { colorName: 'Sedef (Mother-of-Pearl)', colorHex: '#F0EAD6', images: imgs('solace'), stock: 8 },
    ],
  },
  {
    name: 'Lunaris',
    slug: 'lunaris',
    series: 'Signature',
    description: 'En prestijli model. Ay evresi ve takımyıldızı detayıyla gökyüzü temalı.',
    category: 'Lüks Saat',
    styleTags: ['Lüks'],
    genders: ['ERKEK', 'KADIN'],
    price: '145000',
    caseSize: '40 mm',
    material: 'Rose Gold (Renk 1) / Silver (Renk 2)',
    bezel: 'Cilalı',
    crown: 'Klasik',
    crystal: 'Safir kristal',
    waterResistance: '50 metre',
    movement: 'Otomatik, ay evresi komplikasyonlu',
    strap: 'Timsah derisi',
    dial: 'Ay evresi + takımyıldızı detaylı',
    variants: [
      { colorName: 'Rose Gold', colorHex: '#B76E79', images: imgs('lunaris-gold'), stock: 4 },
      { colorName: 'Silver', colorHex: '#C0C0C0', images: imgs('lunaris-silver'), stock: 6 },
    ],
  },

  // ---------- Horizon Serisi ----------
  {
    name: 'Nova',
    slug: 'nova',
    series: 'Horizon',
    description: 'Ultra ince titanyum kasa, modern ve minimalist. Çok hafif ve çağdaş.',
    category: 'Casual Saat',
    styleTags: ['Lüks', 'Casual'],
    genders: ['ERKEK', 'KADIN'],
    price: '46000',
    caseSize: '38 mm, ultra ince',
    material: 'Titanyum',
    bezel: 'Cilalı',
    crown: 'Klasik',
    crystal: 'Safir kristal',
    waterResistance: '50 metre',
    movement: 'Otomatik',
    strap: 'Entegre metal bilezik',
    dial: 'Minimalist',
    variants: [
      { colorName: 'Titanyum', colorHex: '#878681', images: imgs('nova'), stock: 18 },
    ],
  },
  {
    name: 'Drift',
    slug: 'drift',
    series: 'Horizon',
    description: 'En rahat ve günlük model. Kumaş kayış seçenekleriyle sportif-casual duruş.',
    category: 'Casual Saat',
    styleTags: ['Casual', 'Spor'],
    genders: ['ERKEK'],
    price: '38000',
    caseSize: '40 mm',
    material: '316L Paslanmaz Çelik',
    bezel: 'Cilalı',
    crown: 'Klasik',
    crystal: 'Safir kristal',
    waterResistance: '100 metre',
    movement: 'Otomatik',
    strap: 'Kumaş (NATO / Canvas) – değiştirilebilir',
    dial: 'Temiz ve yüksek okunabilirlik',
    variants: [
      { colorName: 'Çelik', colorHex: '#C0C0C0', images: imgs('drift'), stock: 22, discount: 15 },
    ],
  },

  // ---------- Apex Serisi ----------
  {
    name: 'Valor',
    slug: 'valor',
    series: 'Apex',
    description: 'Sportif-lüks kronograf. 3 kovanlı kadran ile fonksiyonel ve güçlü duruş.',
    category: 'Spor Saat',
    styleTags: ['Spor', 'Lüks'],
    genders: ['ERKEK'],
    price: '72000',
    caseSize: '42 mm',
    material: '316L Paslanmaz Çelik',
    bezel: 'Cilalı veya seramik',
    crown: 'Vidalanabilir',
    crystal: 'Safir kristal',
    waterResistance: '100 metre',
    movement: 'Otomatik kronograf',
    strap: 'Metal bilezik veya kauçuk',
    dial: 'Kronograf kadranı (3 kovanlı)',
    variants: [
      { colorName: 'Çelik', colorHex: '#C0C0C0', images: imgs('valor'), stock: 12 },
    ],
  },
  {
    name: 'Void',
    slug: 'void',
    series: 'Apex',
    description: 'Agresif ve modern. Tamamen siyah seramik yapı ile en teknik ve karanlık model.',
    category: 'Spor Saat',
    styleTags: ['Spor'],
    genders: ['ERKEK'],
    price: '65000',
    caseSize: '41 mm',
    material: 'Tam siyah seramik',
    bezel: 'Seramik',
    crown: 'Seramik',
    crystal: 'Safir kristal',
    waterResistance: '100 metre',
    movement: 'Otomatik',
    strap: 'Siyah kauçuk veya seramik bilezik',
    dial: 'Mat siyah, minimal',
    variants: [
      { colorName: 'Siyah Seramik', colorHex: '#1C1C1C', images: imgs('void'), stock: 14 },
    ],
  },
  {
    name: 'Iris',
    slug: 'iris',
    series: 'Apex',
    description: 'Sportif-zarif. Tarih pencereli, daha aktif ve modern kadın modeli.',
    category: 'Spor Saat',
    styleTags: ['Spor'],
    genders: ['KADIN'],
    price: '58000',
    caseSize: '37 mm',
    material: '316L Paslanmaz Çelik',
    bezel: 'Cilalı',
    crown: 'Klasik',
    crystal: 'Safir kristal',
    waterResistance: '50 metre',
    movement: 'Otomatik',
    strap: 'Metal bilezik veya ince kauçuk',
    dial: 'Temiz, 3’te tarih penceresi, modern ve okunabilir',
    variants: [
      { colorName: 'Çelik', colorHex: '#C0C0C0', images: imgs('iris'), stock: 10, discount: 10 },
    ],
  },
];


async function seedFakeReviews() {
  const existingReviews = await prisma.review.count();
  if (existingReviews > 0) {
    console.log(
      `Değerlendirme tablosu dolu (${existingReviews} kayıt) — sahte değerlendirme seed'i atlandı.`,
    );
    return;
  }

  const products = await prisma.product.findMany({ select: { id: true, slug: true } });
  if (products.length === 0) return;


  const USER_COUNT = 260;
  const fakeUserInputs = Array.from({ length: USER_COUNT }, (_, i) => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    return {
      email: `${toAscii(first)}.${toAscii(last)}${i}@ornekmail.com`,
      name: `${first} ${last}`,
    };
  });
  const fakePasswordHash = await bcrypt.hash('FakeKullanici123!', 10);
  await prisma.user.createMany({
    data: fakeUserInputs.map((u) => ({ ...u, password: fakePasswordHash })),
    skipDuplicates: true,
  });
  const fakeUsers = await prisma.user.findMany({
    where: { email: { in: fakeUserInputs.map((u) => u.email) } },
    select: { id: true },
  });
  const fakeUserIds = fakeUsers.map((u) => u.id);


  const now = new Date();
  const y2020 = new Date('2020-01-01T00:00:00Z');
  const y2026 = new Date('2026-01-01T00:00:00Z');

  const allReviews: {
    userId: number;
    productId: number;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }[] = [];

  for (const product of products) {
    const plan = REVIEW_PLAN[product.slug];
    if (!plan) continue;

    const reviewerIds = shuffle(fakeUserIds).slice(0, plan.count);
    const ratings = ratingsForTarget(plan.count, plan.avg);
    const dateStart = plan.onlyCurrentYear ? y2026 : y2020;

    reviewerIds.forEach((userId, idx) => {
      const hasComment = Math.random() < 0.1;
      allReviews.push({
        userId,
        productId: product.id,
        rating: ratings[idx],
        comment: hasComment ? pick(REVIEW_COMMENTS) : null,
        createdAt: randomDate(dateStart, now),
      });
    });
  }

  await prisma.review.createMany({ data: allReviews, skipDuplicates: true });
  console.log(
    `Sahte veri eklendi: ${fakeUserIds.length} kullanıcı, ${allReviews.length} değerlendirme.`,
  );
}

async function main() {

  const adminEmail = 'admin@zemrek.com';
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', password: adminPasswordHash, name: 'Zemrek Admin' },
    create: {
      email: adminEmail,
      name: 'Zemrek Admin',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });


  await prisma.category.createMany({
    data: CATEGORIES.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {

    await prisma.category.deleteMany({ where: { name: { notIn: CATEGORIES } } });

    const allCategories = await prisma.category.findMany();
    const categoryId = (name: string): number => {
      const found = allCategories.find((c) => c.name === name);
      if (!found) throw new Error(`Kategori bulunamadı: ${name}`);
      return found.id;
    };

    for (const p of PRODUCTS) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price, 
          genders: p.genders,
          series: p.series,
          styleTags: p.styleTags,
          caseSize: p.caseSize,
          material: p.material,
          bezel: p.bezel,
          crown: p.crown,
          crystal: p.crystal,
          waterResistance: p.waterResistance,
          movement: p.movement,
          strap: p.strap,
          dial: p.dial,
          categoryId: categoryId(p.category),
          variants: {
            create: p.variants.map((v) => ({
              colorName: v.colorName,
              colorHex: v.colorHex,
              images: v.images,
              price: p.price,
              stock: v.stock,
              discount: v.discount ?? 0,
            })),
          },
        },
      });
    }
  } else {
    console.log(
      `Ürün tablosu dolu (${existingProducts} ürün) — ürün seed'i atlandı, mevcut fiyat/stok/indirim korundu.`,
    );
  }

  // 3) Sahte kullanıcılar + değerlendirmeler (yalnızca tablo boşsa)
  await seedFakeReviews();

  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();
  console.log(
    `Seed tamamlandı: ${categoryCount} kategori, ${productCount} ürün, ${variantCount} varyant.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
