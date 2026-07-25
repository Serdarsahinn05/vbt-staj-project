import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Monorepo kökünde de bir package-lock.json var; Turbopack kökü oradan
     tahmin edip uyarı basıyordu. Frontend kendi başına bir proje. */
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    /* Ürün görselleri Cloudinary'de (bkz. src/components/ui/cld-image.tsx).
       CldImage kendi `loader`'ını verdiği için istekler `/_next/image`
       üzerinden geçmiyor ve bu liste şu an devrede değil; özel loader
       kaldırılırsa gereken izin burada hazır dursun. */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/d5pgexxe/**",
      },
    ],
  },
};

export default nextConfig;
