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


const CATEGORIES = [
  'Akıllı Saat',
  'Klasik Saat',
  'Spor Saat',
  'Lüks Saat',
  'Dress Saat',
  'Casual Saat',
];

type Variant = {
  colorName: string;
  colorHex: string;
  images: string[];
};

type SeedProduct = {
  name: string;
  series: 'Signature' | 'Horizon' | 'Apex';
  description: string; // "Görünüm"
  category: string; // birincil stil (CATEGORIES içinden)
  styleTags: string[]; // "Kategori" satırındaki stiller
  gender: 'ERKEK' | 'KADIN' | 'UNISEX';

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
    series: 'Signature',
    description: 'Ultra ince, zarif ve temiz dress watch. Çok sade ve prestijli duruş.',
    category: 'Dress Saat',
    styleTags: ['Lüks', 'Dress'],
    gender: 'UNISEX',
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
      { colorName: 'Rose Gold', colorHex: '#B76E79', images: imgs('vesper-gold') },
      { colorName: 'Beyaz Altın', colorHex: '#E5E4E2', images: imgs('vesper-silver') },
    ],
  },
  {
    name: 'Aurelius',
    series: 'Signature',
    description: 'Klasik ve aristokrat. Guilloché desenli kadran + metal bilezik ile zamansız bir duruş.',
    category: 'Dress Saat',
    styleTags: ['Lüks', 'Dress'],
    gender: 'UNISEX',
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
      { colorName: 'Beyaz Altın / Çelik', colorHex: '#E5E4E2', images: imgs('aurelius') },
    ],
  },
  {
    name: 'Orion',
    series: 'Signature',
    description: 'Güçlü ve erkeksi. Koyu lacivert kadran, tarih penceresi ve ışıklı ibrelerle net karakter.',
    category: 'Lüks Saat',
    styleTags: ['Lüks'],
    gender: 'ERKEK',
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
      { colorName: 'Lacivert', colorHex: '#1F3A5F', images: imgs('orion') },
    ],
  },
  {
    name: 'Solace',
    series: 'Signature',
    description: 'Küçük, çok ince ve mücevhervari. Soft mother-of-pearl kadran ve ince metal bilezik ile belirgin şekilde feminen.',
    category: 'Dress Saat',
    styleTags: ['Lüks', 'Dress'],
    gender: 'KADIN',
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
      { colorName: 'Sedef (Mother-of-Pearl)', colorHex: '#F0EAD6', images: imgs('solace') },
    ],
  },
  {
    name: 'Lunaris',
    series: 'Signature',
    description: 'En prestijli model. Ay evresi ve takımyıldızı detayıyla gökyüzü temalı.',
    category: 'Lüks Saat',
    styleTags: ['Lüks'],
    gender: 'UNISEX',
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
      { colorName: 'Rose Gold', colorHex: '#B76E79', images: imgs('lunaris-gold') },
      { colorName: 'Silver', colorHex: '#C0C0C0', images: imgs('lunaris-silver') },
    ],
  },

  // ---------- Horizon Serisi ----------
  {
    name: 'Nova',
    series: 'Horizon',
    description: 'Ultra ince titanyum kasa, modern ve minimalist. Çok hafif ve çağdaş.',
    category: 'Casual Saat',
    styleTags: ['Lüks', 'Casual'],
    gender: 'UNISEX',
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
      { colorName: 'Titanyum', colorHex: '#878681', images: imgs('nova') },
    ],
  },
  {
    name: 'Drift',
    series: 'Horizon',
    description: 'En rahat ve günlük model. Kumaş kayış seçenekleriyle sportif-casual duruş.',
    category: 'Casual Saat',
    styleTags: ['Casual', 'Spor'],
    gender: 'ERKEK',
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
      { colorName: 'Çelik', colorHex: '#C0C0C0', images: imgs('drift') },
    ],
  },

  // ---------- Apex Serisi ----------
  {
    name: 'Valor',
    series: 'Apex',
    description: 'Sportif-lüks kronograf. 3 kovanlı kadran ile fonksiyonel ve güçlü duruş.',
    category: 'Spor Saat',
    styleTags: ['Spor', 'Lüks'],
    gender: 'ERKEK',
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
      { colorName: 'Çelik', colorHex: '#C0C0C0', images: imgs('valor') },
    ],
  },
  {
    name: 'Void',
    series: 'Apex',
    description: 'Agresif ve modern. Tamamen siyah seramik yapı ile en teknik ve karanlık model.',
    category: 'Spor Saat',
    styleTags: ['Spor'],
    gender: 'ERKEK',
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
      { colorName: 'Siyah Seramik', colorHex: '#1C1C1C', images: imgs('void') },
    ],
  },
  {
    name: 'Iris',
    series: 'Apex',
    description: 'Sportif-zarif. Tarih pencereli, daha aktif ve modern kadın modeli.',
    category: 'Spor Saat',
    styleTags: ['Spor'],
    gender: 'KADIN',
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
      { colorName: 'Çelik', colorHex: '#C0C0C0', images: imgs('iris') },
    ],
  },
];

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

  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany(); 

  await prisma.category.deleteMany({
    where: { name: { notIn: CATEGORIES } },
  });


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
        description: p.description,
        gender: p.gender,
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
          })),
        },
      },
    });
  }

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
