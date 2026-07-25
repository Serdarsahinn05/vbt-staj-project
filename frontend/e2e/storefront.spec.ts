import { expect, test } from "@playwright/test";
import { goto } from "./helpers";

/* Misafirin uçtan uca alışverişi: vitrin → ürün → sepet → ödeme → onay.
   Sitenin can damarı bu; kırılırsa başka hiçbir şeyin önemi kalmıyor. */

test("misafir sepete ürün ekleyip siparişi tamamlayabiliyor", async ({
  page,
}) => {
  await goto(page, "/koleksiyon");

  // Katalog API'den geliyor; kartların gelmesini bekle.
  const firstProduct = page.locator('a[href^="/urun/"]').first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: /sepete ekle/i }).first().click();

  // Bildirim, eklemenin gerçekten olduğunu söyleyen tek görsel geri bildirim.
  await expect(page.getByRole("status").getByText("Sepete eklendi")).toBeVisible();

  await goto(page, "/sepet");
  await expect(page.getByText("Sepetiniz boş")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /siparişi tamamla/i })).toBeVisible();

  await page.getByRole("link", { name: /siparişi tamamla/i }).click();
  await expect(page).toHaveURL(/\/odeme/);

  await page.getByLabel("Ad Soyad").fill("Test Alıcı");
  await page.getByLabel("Telefon").fill("05001234567");
  await page.getByLabel("İl", { exact: true }).fill("İstanbul");
  await page.getByLabel("İlçe").fill("Kadıköy");
  await page.getByLabel("Adres").fill("Test mahallesi 1");
  await page.getByLabel("Kart Üzerindeki İsim").fill("Test Alıcı");
  await page.getByLabel("Kart Numarası").fill("4111111111111111");
  await page.getByLabel("Son Kullanma").fill("12/30");
  await page.getByLabel("CVV").fill("123");

  await page.getByRole("button", { name: /siparişi onayla/i }).click();

  await expect(
    page.getByRole("heading", { name: /siparişiniz alındı/i }),
  ).toBeVisible();
  // Sipariş numarası üretiliyor ve sepet boşaltılıyor.
  await expect(page.getByText(/ZMR-\d{4}-\d{6}/)).toBeVisible();
});

test("koleksiyon filtreleri listeyi daraltıyor", async ({ page }) => {
  await goto(page, "/koleksiyon");

  const counter = page.getByText(/^\d+ model$/);
  await expect(counter).toBeVisible();
  const before = await counter.textContent();

  await page.getByRole("button", { name: "Apex", exact: true }).click();

  await expect(counter).not.toHaveText(before ?? "");
  // Apex serisi katalogda üç modelden oluşuyor.
  await expect(counter).toHaveText(/^3 model$/);
});

test("ürün sayfası teknik künyeyi ve seçili rengi gösteriyor", async ({
  page,
}) => {
  await goto(page, "/urun/vesper");

  await expect(page.getByRole("heading", { name: "Vesper" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /teknik özellikler/i }),
  ).toBeVisible();
  await expect(page.getByText("Kristal", { exact: true })).toBeVisible();

  /* Çift renkli modelde künye seçili renge göre daralıyor: iki rengin
     birleştiği ham metin ("(Renk 1) / …") kullanıcıya gösterilmemeli. */
  await expect(page.getByText(/\(Renk \d\)/)).toHaveCount(0);
});
