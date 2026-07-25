import { defineConfig, devices } from "@playwright/test";

/* Uçtan uca testler. Çalışan bir backend gerekiyor (varsayılan
   http://localhost:3005) çünkü mağazanın tamamı API verisiyle çalışıyor;
   veriyi taklit etmek testin değerini düşürürdü.

   `webServer` dev sunucusunu kendisi başlatıyor, zaten açıksa yeniden
   kullanıyor. */

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    locale: "tr-TR",
    // Hata ayıklamayı kolaylaştırır, başarılı koşuda dosya bırakmaz.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
