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

  const count = await prisma.category.count();
  console.log(`Seed tamamlandı: ${count} kategori eklendi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
