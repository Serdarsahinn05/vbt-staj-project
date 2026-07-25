import { expect, test } from "@playwright/test";
import { ADMIN, goto, newUser } from "./helpers";

/* Yönetim paneli. Panel fiyat ve stok yazan tek yer, yetki kontrolü de
   burada görünür olmalı. */

test("panel yetkisiz kullanıcıya kapalı", async ({ page }) => {
  await goto(page, "/admin");
  // Girişsizken panel yerine yönetici girişi çıkıyor.
  await expect(page.getByText(/fiyat & stok yönetimi/i)).toHaveCount(0);
});

test("normal kullanıcı panele giremiyor", async ({ page }) => {
  const user = newUser();

  await goto(page, "/kayit");
  await page.getByLabel("Ad Soyad").fill(user.name);
  await page.getByLabel("E-posta").fill(user.email);
  await page.getByLabel("Şifre", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: /hesap oluştur/i }).click();
  await expect(page).toHaveURL(/\/hesap/);

  await goto(page, "/admin");
  await expect(page.getByText(/fiyat & stok yönetimi/i)).toHaveCount(0);
});

test("yönetici fiyat ve stok görüntüleyebiliyor", async ({ page }) => {
  await goto(page, "/admin");

  await page.getByLabel("E-posta").fill(ADMIN.email);
  await page.getByLabel("Şifre", { exact: true }).fill(ADMIN.password);
  await page.getByRole("button", { name: /giriş/i }).click();

  await expect(page.getByText(/fiyat & stok yönetimi/i)).toBeVisible();

  // Özet kartları katalog verisinden hesaplanıyor.
  await expect(page.getByText("Model", { exact: true })).toBeVisible();
  await expect(page.getByText("Stok değeri")).toBeVisible();

  // En az bir ürün satırı ve düzenlenebilir fiyat alanı gelmiş olmalı.
  await expect(page.getByText("Vesper").first()).toBeVisible();
});

/* Ürün yönetimi ayrı bölümde: oluşturma, listede görünme ve silme.
   Test kendi ürününü açıp yine kendisi siliyor, katalogda iz bırakmıyor. */
test("yönetici ürün oluşturup silebiliyor", async ({ page }) => {
  await goto(page, "/admin/urunler");

  await page.getByLabel("E-posta").fill(ADMIN.email);
  await page.getByLabel("Şifre", { exact: true }).fill(ADMIN.password);
  await page.getByRole("button", { name: /giriş/i }).click();

  await expect(page.getByRole("heading", { name: "Ürünler" })).toBeVisible();

  const name = `E2E Model ${Date.now()}`;
  await page.getByRole("button", { name: "Yeni ürün" }).click();
  await expect(page.getByRole("heading", { name: "Yeni Ürün" })).toBeVisible();

  await page.getByPlaceholder("Lunaris", { exact: true }).fill(name);
  await page.getByPlaceholder("145000").fill("42000");
  await page.getByPlaceholder(/vitrinde görünen/i).fill("Uçtan uca test ürünü.");
  await page.getByLabel("Kategori").selectOption({ index: 1 });
  await page.getByPlaceholder("Rose Gold").fill("Çelik");

  // Slug addan türetiliyor; oluşturma düğmesi ancak zorunlular dolunca açılıyor.
  const submit = page.getByRole("button", { name: "Ürünü Oluştur" });
  await expect(submit).toBeEnabled();
  await submit.click();

  const row = page.locator("li", { hasText: name });
  await expect(row).toBeVisible();

  await row.getByRole("button", { name: /ürününü sil/i }).click();
  await row.getByRole("button", { name: "Evet, sil" }).click();
  await expect(page.locator("li", { hasText: name })).toHaveCount(0);
});
