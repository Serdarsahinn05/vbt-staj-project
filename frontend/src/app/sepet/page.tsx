import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Sepetim",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-24 pt-28 max-md:px-4 max-md:pb-14 max-md:pt-24">
      <h1 className="mb-10 font-heading text-h1 font-semibold text-heading max-md:mb-6 max-md:text-h2">
        Sepetim
      </h1>
      <CartView />
    </div>
  );
}
