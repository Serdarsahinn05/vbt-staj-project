import { expect, test } from "@playwright/test";
import { goto } from "./helpers";

/* Galeri fotoğrafları üst üste duran katmanlar. Görünmeyen katmanlar fareye
   kapalı olmalı: aksi halde "resmi yeni sekmede aç" seçili olanı değil, en
   üstteki katmanı veriyor. */

test("galeride yalnızca seçili fotoğraf fareye açık", async ({ page }) => {
  await goto(page, "/urun/aurelius");

  const stage = page.locator("div.aspect-square").first();
  const clickable = stage.locator("span:not(.pointer-events-none) img");

  // Başlangıçta ilk fotoğraf.
  await expect(clickable).toHaveCount(1);
  await expect(clickable).toHaveAttribute("src", /aurelius-1/);

  // Üçüncü küçük görsele geçince fareye açık olan da onunla değişiyor.
  await page.getByRole("button", { name: /görsel 3$/ }).click();
  await expect(clickable).toHaveCount(1);
  await expect(clickable).toHaveAttribute("src", /aurelius-3/);
});
