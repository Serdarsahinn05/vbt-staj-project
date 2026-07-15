import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    'Erkek Saat',
    'Kadın Saat',
    'Akıllı Saat',
    'Klasik Saat',
    'Spor Saat',
    'Lüks Saat',
  ];

  await prisma.category.createMany({
    data: categories.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const categoryCount = await prisma.category.count();

  // Kategorileri isimden id'ye çözmek için haritaya al
  const allCategories = await prisma.category.findMany();
  const categoryId = (name: string) => {
    const found = allCategories.find((c) => c.name === name);
    if (!found) throw new Error(`Kategori bulunamadı: ${name}`);
    return found.id;
  };

  // Her ürüne 2 örnek görsel (picsum: gerçek çalışan placeholder görsel servisi)
  const img = (slug: string): string[] => [
    `https://picsum.photos/seed/${slug}-1/600/600`,
    `https://picsum.photos/seed/${slug}-2/600/600`,
  ];

  const products = [
    {
      name: 'Rolex Submariner',
      description: 'Klasik dalgıç saati, otomatik mekanizma, 300m su geçirmez.',
      price: 285000,
      stock: 5,
      category: 'Lüks Saat',
      images: img('submariner'),
    },
    {
      name: 'Omega Seamaster',
      description: 'Deniz temalı ikonik saat, seramik kadran.',
      price: 180000,
      stock: 8,
      category: 'Lüks Saat',
      images: img('seamaster'),
    },
    {
      name: 'Casio G-Shock',
      description: 'Dayanıklı spor saat, şok ve su geçirmez.',
      price: 3500,
      stock: 40,
      category: 'Spor Saat',
      images: img('gshock'),
    },
    {
      name: 'Seiko 5 Automatic',
      description: 'Uygun fiyatlı otomatik saat, günlük kullanım.',
      price: 5000,
      stock: 60,
      category: 'Erkek Saat',
      images: img('seiko5'),
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Akıllı saat, sağlık takibi ve bildirimler.',
      price: 22000,
      stock: 25,
      category: 'Akıllı Saat',
      images: img('applewatch'),
    },
    {
      name: 'Daniel Wellington Petite',
      description: 'Minimalist tasarım, deri kordon, kadın saati.',
      price: 4500,
      stock: 30,
      category: 'Kadın Saat',
      images: img('dwpetite'),
    },
  ];

  // Ürünleri sadece tablo boşsa ekle (idempotent, restart'ta veri silmez/kopyalamaz)
  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    await prisma.product.createMany({
      data: products.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        images: p.images,
        categoryId: categoryId(p.category),
      })),
    });
  }

  const productCount = await prisma.product.count();
  console.log(
    `Seed tamamlandı: ${categoryCount} kategori, ${productCount} ürün.`,
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
