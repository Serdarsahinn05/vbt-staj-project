-- Product: eski tekil gender ve kullanılmayan stock kolonlarını kaldır
ALTER TABLE "Product" DROP COLUMN "gender",
DROP COLUMN "stock";

-- Gender enum'undan UNISEX değerini kaldır (artık hiçbir kolon kullanmıyor)
ALTER TYPE "Gender" RENAME TO "Gender_old";
CREATE TYPE "Gender" AS ENUM ('ERKEK', 'KADIN');
DROP TYPE "Gender_old";

-- Yeni kolonlar: çoklu cinsiyet (genders) ve slug
ALTER TABLE "Product" ADD COLUMN     "genders" "Gender"[],
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
