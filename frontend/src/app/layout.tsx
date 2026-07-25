import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { BootLoader } from "@/components/layout/boot-loader";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RouteProgress } from "@/components/layout/route-progress";
import { StorefrontOnly } from "@/components/layout/storefront-only";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Zemrek — Zamanın Ötesinde Zarafet",
    template: "%s | Zemrek",
  },
  description:
    "El işçiliğiyle üretilen premium saatler. Zemrek koleksiyonlarını keşfedin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${montserrat.variable} ${poppins.variable} h-full scroll-smooth scroll-pt-20 antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <BootLoader />
          <RouteProgress />
          <StorefrontOnly>
            <Header />
          </StorefrontOnly>
          <main className="flex-1">{children}</main>
          <StorefrontOnly>
            <Footer />
          </StorefrontOnly>
        </Providers>
      </body>
    </html>
  );
}
