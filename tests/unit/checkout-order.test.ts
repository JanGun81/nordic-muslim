import { describe, it, expect, vi } from "vitest";
import type { ProductDto } from "@/lib/api-contract/types";
import {
  buildCreateOrderInput,
  parseCreateOrderResponse,
  postCreateOrder,
} from "@/lib/checkout-order";

const product: ProductDto = {
  id: "prod-1",
  name: "Dirac – färgstark",
  slug: "dirac-fargstark",
  description: null,
  priceCents: 34900,
  imageUrl: null,
  categoryId: "cat-1",
  category: { id: "cat-1", name: "Dirac", slug: "dirac" },
  inStock: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("buildCreateOrderInput", () => {
  it("mappar varukorg och kunduppgifter till CreateOrderInput", () => {
    const input = buildCreateOrderInput({
      customerName: " Amina Noor ",
      customerEmail: "amina@example.com",
      customerAddress: "Exempelvägen 10, 12345 Uppsala",
      customerPhone: "0701234567",
      items: [{ product, quantity: 2 }],
    });

    expect(input).toEqual({
      customerName: "Amina Noor",
      customerEmail: "amina@example.com",
      customerAddress: "Exempelvägen 10, 12345 Uppsala",
      customerPhone: "0701234567",
      items: [{ productId: "prod-1", quantity: 2, unitPriceCents: 34900 }],
    });
  });

  it("sätter tom telefon till null", () => {
    const input = buildCreateOrderInput({
      customerName: "Amina",
      customerEmail: "a@b.se",
      customerAddress: "Gatan 1",
      customerPhone: "   ",
      items: [{ product, quantity: 1 }],
    });

    expect(input.customerPhone).toBeNull();
  });
});

describe("parseCreateOrderResponse", () => {
  it("tolkar 201 som lyckad order", () => {
    const result = parseCreateOrderResponse(201, {
      order: {
        id: "ord-1",
        totalCents: 34900,
        status: "PENDING",
        createdAt: "2026-10-10T08:00:00.000Z",
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.id).toBe("ord-1");
    }
  });

  it("tolkar 400 med errors-lista", () => {
    const result = parseCreateOrderResponse(400, {
      errors: ["Produkten hittades inte: prod-1."],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toMatch(/hittades inte/i);
    }
  });

  it("ger fallback-fel vid oväntat svar", () => {
    const result = parseCreateOrderResponse(500, { message: "boom" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});

describe("postCreateOrder", () => {
  it("POSTar till /api/orders och returnerar skapad order", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      json: async () => ({
        order: {
          id: "ord-99",
          totalCents: 34900,
          status: "PENDING",
          createdAt: "2026-10-10T08:00:00.000Z",
        },
      }),
    });

    const input = buildCreateOrderInput({
      customerName: "Amina",
      customerEmail: "a@b.se",
      customerAddress: "Gatan 1",
      customerPhone: "",
      items: [{ product, quantity: 1 }],
    });

    const result = await postCreateOrder(input, fetchMock as unknown as typeof fetch);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/orders");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({
      customerName: "Amina",
      items: [{ productId: "prod-1", quantity: 1, unitPriceCents: 34900 }],
    });
    expect(result.ok).toBe(true);
  });

  it("returnerar fel när fetch kastar", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("nätverk"));
    const result = await postCreateOrder(
      buildCreateOrderInput({
        customerName: "Amina",
        customerEmail: "a@b.se",
        customerAddress: "Gatan 1",
        customerPhone: "",
        items: [{ product, quantity: 1 }],
      }),
      fetchMock as unknown as typeof fetch,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join(" ")).toMatch(/kunde inte skicka/i);
    }
  });
});
