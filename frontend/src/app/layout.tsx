import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { BootLoader } from "@/components/layout/boot-loader";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RouteProgress } from "@/components/layout/route-progress";
import { StorefrontOnly } from "@/components/layout/storefront-only";
import { ToastHost } from "@/components/layout/toast-host";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

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

const title = "Zemrek — Zamanın Ötesinde Zarafet";

export const metadata: Metadata = {
  /* Paylaşım önizlemeleri ve sitemap mutlak adres istiyor; bu olmadan
     göreli görsel yolları sosyal medyada çözülmüyor. */
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: SITE_NAME,
    title,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      /* `data-scroll-behavior` olmadan Next, rota geçişinde sayfayı başa
         alırken CSS'in yumuşak kaydırmasıyla çakışıyor ve geçiş takılıyor. */
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${poppins.variable} h-full scroll-smooth scroll-pt-20 antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Klavyeyle gezinende ilk durak: menüyü atlayıp içeriğe geçirir.
            Odaklanmadıkça görünmüyor. */}
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-5 focus:py-3 focus:font-heading focus:text-small focus:font-semibold focus:text-heading focus:shadow-elevated focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring"
        >
          İçeriğe geç
        </a>
        <Providers>
          <BootLoader />
          <RouteProgress />
          <StorefrontOnly>
            <Header />
          </StorefrontOnly>
          <main id="icerik" className="flex-1">
            {children}
          </main>
          <StorefrontOnly>
            <Footer />
          </StorefrontOnly>
          <ToastHost />
        </Providers>
      </body>
    </html>
  );
}
