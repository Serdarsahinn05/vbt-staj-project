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
  description: string;
  category: string; 
  gender: 'ERKEK' | 'KADIN' | 'UNISEX';
  variants: Variant[];
};


const PRODUCTS: SeedProduct[] = [
  // ---------- Signature Serisi ----------
  {
    name: 'Vesper',
    series: 'Signature',
    description:
      'Ultra ince, zarif dress watch. 39 mm ultra ince yuvarlak kasa, safir kristal, otomatik mekanizma, timsah derisi kayış. Sade ve prestijli duruş.',
    category: 'Dress Saat',
    gender: 'UNISEX',
    variants: [
      { colorName: 'Rose Gold', colorHex: '#B76E79', images: imgs('vesper-gold') },
      { colorName: 'Beyaz Altın', colorHex: '#E5E4E2', images: imgs('vesper-silver') },
    ],
  },
  {
    name: 'Aurelius',
    series: 'Signature',
    description:
      'Klasik ve aristokrat. 40 mm çelik kasa, guilloché desenli gümüş kadran, fırçalı + cilalı metal bilezik. Zamansız bir duruş.',
    category: 'Dress Saat',
    gender: 'UNISEX',
    variants: [
      { colorName: 'Beyaz Altın / Çelik', colorHex: '#E5E4E2', images: imgs('aurelius') },
    ],
  },
  {
    name: 'Orion',
    series: 'Signature',
    description:
      'Güçlü ve erkeksi. 42 mm çelik kasa, koyu lacivert kadran, 3’te tarih penceresi, Super-LumiNova ışıklı ibreler, 100 m su geçirmez.',
    category: 'Lüks Saat',
    gender: 'ERKEK',
    variants: [
      { colorName: 'Lacivert', colorHex: '#1F3A5F', images: imgs('orion') },
    ],
  },
  {
    name: 'Solace',
    series: 'Signature',
    description:
      'Küçük, ince ve mücevhervari. 36 mm çelik kasa, soft sedef (mother-of-pearl) kadran, ince metal bilezik. Belirgin şekilde feminen.',
    category: 'Dress Saat',
    gender: 'KADIN',
    variants: [
      { colorName: 'Sedef (Mother-of-Pearl)', colorHex: '#F0EAD6', images: imgs('solace') },
    ],
  },
  {
    name: 'Lunaris',
    series: 'Signature',
    description:
      'En prestijli model. 40 mm kasa, ay evresi (moon phase) komplikasyonu ve takımyıldızı detaylı gökyüzü temalı kadran, timsah derisi kayış.',
    category: 'Lüks Saat',
    gender: 'UNISEX',
    variants: [
      { colorName: 'Rose Gold', colorHex: '#B76E79', images: imgs('lunaris-gold') },
      { colorName: 'Silver', colorHex: '#C0C0C0', images: imgs('lunaris-silver') },
    ],
  },

  // ---------- Horizon Serisi ----------
  {
    name: 'Nova',
    series: 'Horizon',
    description:
      'Ultra ince titanyum kasa, modern ve minimalist. 38 mm, entegre metal bilezik, safir kristal, otomatik. Çok hafif ve çağdaş.',
    category: 'Casual Saat',
    gender: 'UNISEX',
    variants: [
      { colorName: 'Titanyum', colorHex: '#878681', images: imgs('nova') },
    ],
  },
  {
    name: 'Drift',
    series: 'Horizon',
    description:
      'En rahat, günlük model. 40 mm çelik kasa, değiştirilebilir kumaş (NATO / Canvas) kayış, yüksek okunabilirlik, 100 m su geçirmez.',
    category: 'Casual Saat',
    gender: 'ERKEK',
    variants: [
      { colorName: 'Çelik', colorHex: '#C0C0C0', images: imgs('drift') },
    ],
  },

  // ---------- Apex Serisi ----------
  {
    name: 'Valor',
    series: 'Apex',
    description:
      'Sportif-lüks otomatik kronograf. 42 mm çelik kasa, 3 kovanlı kronograf kadranı, vidalanabilir kurma kolu, 100 m su geçirmez.',
    category: 'Spor Saat',
    gender: 'ERKEK',
    variants: [
      { colorName: 'Çelik', colorHex: '#C0C0C0', images: imgs('valor') },
    ],
  },
  {
    name: 'Void',
    series: 'Apex',
    description:
      'Agresif ve modern. 41 mm tam siyah seramik yapı, mat siyah minimal kadran, siyah kauçuk/seramik bilezik. En teknik ve karanlık model.',
    category: 'Spor Saat',
    gender: 'ERKEK',
    variants: [
      { colorName: 'Siyah Seramik', colorHex: '#1C1C1C', images: imgs('void') },
    ],
  },
  {
    name: 'Iris',
    series: 'Apex',
    description:
      'Sportif-zarif kadın modeli. 37 mm çelik kasa, 3’te tarih penceresi, metal bilezik veya ince kauçuk, temiz ve okunabilir kadran.',
    category: 'Spor Saat',
    gender: 'KADIN',
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
