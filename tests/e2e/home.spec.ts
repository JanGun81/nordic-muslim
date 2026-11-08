/**
 * E2E-tester med Playwright – BDD-inspirerad.
 * Scenario: Användaren besöker startsidan och ser butikens budskap.
 */

import { test, expect } from "@playwright/test";

test.describe("Startsida", () => {
  test("visar butikens namn och välkomsttext", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("img", { name: /^nordic muslim$/i }).first()).toBeVisible();
    await expect(page.getByText(/abayas för vardag och fest/i)).toBeVisible();
    await expect(page.getByText(/välkommen/i)).toBeVisible();
    await expect(page.getByText(/nordic muslim samlar/i)).toBeVisible();
  });

  test("har länk till steg-för-steg beställning och till alla produkter", async ({ page }) => {
    await page.goto("/");

    const borjaHär = page.getByRole("link", { name: /börja här|starta beställning/i });
    await expect(borjaHär.first()).toBeVisible();
    await expect(borjaHär.first()).toHaveAttribute("href", "/bestall");

    const allaProdukter = page.getByRole("link", { name: /se alla produkter|öppna katalogen/i });
    await expect(allaProdukter.first()).toBeVisible();
    await expect(allaProdukter.first()).toHaveAttribute("href", "/produkter");
  });

  test("API /api/products returnerar JSON med products-array", async ({ request }) => {
    const res = await request.get("/api/products");
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty("products");
    expect(Array.isArray(data.products)).toBe(true);
  });

  test("API /api/categories returnerar JSON med categories-array", async ({ request }) => {
    const res = await request.get("/api/categories");
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty("categories");
    expect(Array.isArray(data.categories)).toBe(true);
  });

  test("på stor skärm visas kategorilänkar i vänster sidopanel", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const rail = page.getByRole("complementary", { name: /butiksmenyn/i });
    await expect(rail.getByRole("link", { name: /^dirac$/i })).toBeVisible();
    await expect(rail.getByRole("link", { name: /alla produkter/i })).toBeVisible();
  });
});
