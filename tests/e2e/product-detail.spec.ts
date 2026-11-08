/**
 * E2E – produktdetalj med färgvarianter och zoom (EA-005).
 */

import { test, expect } from "@playwright/test";

test.describe("Produktdetalj", () => {
  test("användaren kan öppna en produkt, byta färg och zooma", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/produkter");
    const productLink = page.locator('article a[href="/produkter/abaya-malaysian"]').last();
    await expect(productLink).toBeVisible({ timeout: 20_000 });
    await productLink.scrollIntoViewIfNeeded();
    await productLink.click({ force: true });

    await expect(page).toHaveURL(/\/produkter\/abaya-malaysian/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /abaya malaysian/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("button", { name: /lägg i varukorg/i })).toBeVisible();

    await page.getByRole("button", { name: /färg grön/i }).click();
    await expect(page.getByRole("img", { name: /grön/i }).first()).toBeVisible();

    await page.getByRole("button", { name: /öppna förstoring/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: /^stäng förstoring$/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("GET /api/products/[slug] returnerar produkt med variants", async ({ request }) => {
    const res = await request.get("/api/products/abaya-malaysian");
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as {
      product: { slug: string; variants?: unknown[] } | null;
    };
    expect(data.product?.slug).toBe("abaya-malaysian");
    expect(Array.isArray(data.product?.variants)).toBe(true);
    expect((data.product?.variants ?? []).length).toBeGreaterThan(0);
  });
});
