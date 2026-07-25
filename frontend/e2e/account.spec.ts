import { expect, test } from "@playwright/test";
import { goto, login, newUser } from "./helpers";

/* Hesap akışı: kayıt, favori ve misafir sepetinin hesaba taşınması.
   Taşıma özellikle kırılgan — iki ayrı kaynak (tarayıcı / sunucu) arasında
   geçiş yapıyor ve sessizce bozulursa kullanıcı sepetini kaybediyor. */

test("kayıt olan kullanıcı favori ekleyip listesinde görüyor", async ({
  page,
}) => {
  const user = newUser();

  await goto(page, "/kayit");
  await page.getByLabel("Ad Soyad").fill(user.name);
  await page.getByLabel("E-posta").fill(user.email);
  await page.getByLabel("Şifre", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: /hesap oluştur/i }).click();

  await expect(page).toHaveURL(/\/hesap/);
  await expect(page.getByText(user.email)).toBeVisible();

  await goto(page, "/urun/vesper");
  /* Buton erişilebilir adını `aria-label`'dan alıyor ("Vesper favorilere ekle");
     alttaki "Diğer Modeller" kartlarında da aynı desen var ama o kartlar bu
     ürünü dışarıda bıraktığı için ad benzersiz. */
  await page
    .getByRole("button", { name: /^vesper favorilere ekle$/i })
    .click();
  await expect(
    page.getByRole("button", { name: /^vesper favorilere eklendi$/i }),
  ).toBeVisible();

  await goto(page, "/favoriler");
  await expect(page.getByText("Henüz favoriniz yok")).toHaveCount(0);
  await expect(page.locator('a[href="/urun/vesper"]').first()).toBeVisible();
});

test("misafirken eklenen sepet giriş sonrası hesaba taşınıyor", async ({
  page,
}) => {
  const user = newUser();

  // Önce hesabı aç, sonra çık: taşımayı temiz bir sepetle sınayalım.
  await goto(page, "/kayit");
  await page.getByLabel("Ad Soyad").fill(user.name);
  await page.getByLabel("E-posta").fill(user.email);
  await page.getByLabel("Şifre", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: /hesap oluştur/i }).click();
  await expect(page).toHaveURL(/\/hesap/);

  await page.getByRole("button", { name: /çıkış/i }).click();

  // Misafirken sepete ekle.
  await goto(page, "/urun/orion");
  await page.getByRole("button", { name: /sepete ekle/i }).first().click();
  await expect(page.getByRole("status").getByText("Sepete eklendi")).toBeVisible();

  await login(page, user.email, user.password);
  await expect(page).toHaveURL(/\/hesap/);

  // Sepet sunucuya taşındı; satır korunmuş olmalı.
  await goto(page, "/sepet");
  await expect(page.getByText("Sepetiniz boş")).toHaveCount(0);
  await expect(page.locator('a[href="/urun/orion"]').first()).toBeVisible();
});
