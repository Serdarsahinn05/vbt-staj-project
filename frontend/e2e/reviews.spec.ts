import { expect, test } from "@playwright/test";
import { goto, newUser } from "./helpers";

/* Değerlendirmeler. Yorum metni isteğe bağlı: kullanıcı tek başına puan
   verebiliyor ve listede bu kayıtlar boş paragrafla görünmemeli. */

async function register(page: Parameters<typeof goto>[0]) {
  const user = newUser();
  await goto(page, "/kayit");
  await page.getByLabel("Ad Soyad").fill(user.name);
  await page.getByLabel("E-posta").fill(user.email);
  await page.getByLabel("Şifre", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: /hesap oluştur/i }).click();
  await expect(page).toHaveURL(/\/hesap/);
  return user;
}

test("yorum yazmadan yalnızca puan verilebiliyor", async ({ page }) => {
  await register(page);
  await goto(page, "/urun/solace");

  await page.getByRole("button", { name: "4 yıldız" }).click();

  // Metin boşken buton "Puanı Gönder" diyor ve etkin olmalı.
  const submit = page.getByRole("button", { name: "Puanı Gönder" });
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(page.getByText("Değerlendirmeniz")).toBeVisible();
});

test("puan verilmeden gönderilemiyor", async ({ page }) => {
  await register(page);
  await goto(page, "/urun/orion");

  // Yıldıza dokunulmadan buton kapalı; metin yazmak da yetmiyor.
  await expect(page.getByRole("button", { name: "Puanı Gönder" })).toBeDisabled();
  await page.getByRole("textbox").fill("Sadece metin yazdım");
  await expect(
    page.getByRole("button", { name: "Değerlendirmeyi Gönder" }),
  ).toBeDisabled();
});

test("yorumsuz değerlendirmeler listede boş satır bırakmıyor", async ({
  page,
}) => {
  // Seed'de bu ürünün değerlendirmelerinin çoğu yalnızca puan.
  await goto(page, "/urun/aurelius");

  const cards = page.locator("#degerlendirmeler li");
  await expect(cards.first()).toBeVisible();

  // Her kartta ya dolu bir yorum var ya da hiç paragraf yok.
  const emptyParagraphs = await page
    .locator("#degerlendirmeler li p:empty")
    .count();
  expect(emptyParagraphs).toBe(0);
});
