import type { Page } from "@playwright/test";

/* Testlerin ortak yardımcıları. */

/** Seed'deki yönetici hesabı (backend/prisma/seed.ts). */
export const ADMIN = {
  email: "admin@zemrek.com",
  password: "Admin123!",
};

/** Her koşuda benzersiz bir kullanıcı; testler birbirinin verisine karışmasın. */
export function newUser() {
  const stamp = Date.now();
  return {
    name: "Test Kullanıcı",
    email: `e2e-${stamp}@test.local`,
    password: "Test1234!",
  };
}

/* Açılış perdesi kendini kapatana kadar tıklamalar ona gidiyor.
   Perde `data-state="done"` alınca ya da tamamen kalkınca devam ediyoruz. */
export async function waitForBoot(page: Page): Promise<void> {
  const curtain = page.locator(".z-boot");
  if ((await curtain.count()) === 0) return;
  await curtain
    .first()
    .waitFor({ state: "hidden", timeout: 15_000 })
    .catch(() => {
      // Perde CSS ile de kapanıyor; görünür kalsa bile testi burada tıkamayalım.
    });
}

export async function goto(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitForBoot(page);
}

/** Girişli oturum açar ve hesabına yönlenmesini bekler. */
export async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await goto(page, "/giris");
  await page.getByLabel("E-posta").fill(email);
  await page.getByLabel("Şifre", { exact: true }).fill(password);
  await page.getByRole("button", { name: /giriş yap/i }).click();
}
