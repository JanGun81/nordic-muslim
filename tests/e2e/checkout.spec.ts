/**
 * E2E – BDD: lyckad gästbeställning från varukorg till tacksida (EA-004).
 *
 * Om GET /api/products är tomt (ingen DB) används demo-produkterna i UI.
 * Då stubbas POST /api/orders så att kassans anrop fortfarande verifieras.
 * När produkter finns i API:t går beställningen hela vägen mot backend.
 */

import { test, expect } from "@playwright/test";

test.describe("Kassa – gästbeställning", () => {
  test("användaren kan lägga i varukorg, slutföra kassan och se tacksida", async ({
    page,
    request,
  }) => {
    const productsRes = await request.get("/api/products");
    expect(productsRes.ok()).toBeTruthy();
    const { products } = (await productsRes.json()) as { products: unknown[] };
    const useLiveApi = products.length > 0;

    if (!useLiveApi) {
      await page.route("**/api/orders", async (route) => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        const body = route.request().postDataJSON() as {
          customerName?: string;
          customerEmail?: string;
          items?: unknown[];
        };
        expect(body.customerName).toBe("Amina Noor");
        expect(body.customerEmail).toBe("amina@example.com");
        expect(Array.isArray(body.items)).toBe(true);
        expect((body.items ?? []).length).toBeGreaterThan(0);
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            order: {
              id: "e2e-demo-order",
              totalCents: 34900,
              status: "PENDING",
              createdAt: new Date().toISOString(),
            },
          }),
        });
      });
    }

    await page.goto("/produkter");
    await expect(page.getByRole("button", { name: /lägg i varukorg/i }).first()).toBeVisible();
    await page.getByRole("button", { name: /lägg i varukorg/i }).first().click();

    await expect(page.getByRole("link", { name: /till kassan/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /till kassan/i }).first().click();
    await expect(page).toHaveURL(/\/kassa$/);

    await page.getByLabel(/^namn/i).fill("Amina Noor");
    await page.getByLabel(/e-post/i).fill("amina@example.com");
    await page.getByLabel(/leveransadress/i).fill("Exempelvägen 10, 12345 Uppsala");
    await page.getByLabel(/telefon/i).fill("0701234567");

    const orderResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/orders") && res.request().method() === "POST",
    );

    await page.getByRole("button", { name: /slutför beställning/i }).click();

    const orderResponse = await orderResponsePromise;
    expect(orderResponse.status()).toBe(201);

    await expect(page).toHaveURL(/\/kassa\/tack/);
    await expect(page.getByRole("heading", { name: /tack för din beställning/i })).toBeVisible();
    await expect(page.getByText(/vi har tagit emot din beställning/i)).toBeVisible();
    await expect(page.getByText(/beställt/i)).toBeVisible();
  });
});
