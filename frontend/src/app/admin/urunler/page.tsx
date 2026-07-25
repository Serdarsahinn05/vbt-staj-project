import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin/admin-guard";
import { ProductManager } from "@/components/admin/product-manager";

export const metadata: Metadata = {
  title: "Ürün Yönetimi",
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <ProductManager />
    </AdminGuard>
  );
}
