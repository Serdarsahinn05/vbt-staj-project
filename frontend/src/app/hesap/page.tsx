import type { Metadata } from "next";
import { AccountView } from "@/components/account/account-view";

export const metadata: Metadata = { title: "Hesabım" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-8 pb-24 pt-28 max-md:px-4 max-md:pb-14 max-md:pt-24">
      <h1 className="mb-10 font-heading text-h1 font-semibold text-heading max-md:mb-6 max-md:text-h2">
        Hesabım
      </h1>
      <AccountView />
    </div>
  );
}
