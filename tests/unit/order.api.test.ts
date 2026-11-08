import { describe, it, expect } from "vitest";
import { validateCreateOrderRequest } from "@/lib/api-contract/order";

describe("Order API validation", () => {
  it("accepterar giltig create-order payload", () => {
    const result = validateCreateOrderRequest({
      customerName: "Amina Noor",
      customerEmail: "amina@example.com",
      customerAddress: "Exempelvagen 10, 12345 Uppsala",
      customerPhone: "0701234567",
      items: [{ productId: "p1", quantity: 1, unitPriceCents: 29900 }],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.items[0].productVariantId).toBeNull();
    }
  });

  it("behåller productVariantId på orderrad", () => {
    const result = validateCreateOrderRequest({
      customerName: "Amina Noor",
      customerEmail: "amina@example.com",
      customerAddress: "Exempelvagen 10, 12345 Uppsala",
      customerPhone: "0701234567",
      items: [{ productId: "p1", productVariantId: "var-9", quantity: 1, unitPriceCents: 29900 }],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.items[0].productVariantId).toBe("var-9");
    }
  });

  it("underkanner payload utan items", () => {
    const result = validateCreateOrderRequest({
      customerName: "Amina Noor",
      customerEmail: "amina@example.com",
      customerAddress: "Exempelvagen 10, 12345 Uppsala",
      customerPhone: null,
      items: [],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join(" ")).toMatch(/minst en orderrad/i);
    }
  });
});
