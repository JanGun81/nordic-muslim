import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/products/[slug]/route";

const { getProductBySlugMock } = vi.hoisted(() => ({
  getProductBySlugMock: vi.fn(),
}));

vi.mock("@/lib/core/services", () => ({
  productService: {
    getProductBySlug: getProductBySlugMock,
  },
}));

function makeContext(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /api/products/[slug]", () => {
  beforeEach(() => {
    getProductBySlugMock.mockReset();
  });

  it("returnerar 200 och produkt-DTO när slug finns", async () => {
    getProductBySlugMock.mockResolvedValue({
      id: "p1",
      name: "Test Dirac",
      slug: "test-dirac",
      description: null,
      priceCents: 29900,
      imageUrl: null,
      categoryId: "cat-1",
      inStock: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      category: { id: "cat-1", name: "Dirac", slug: "dirac" },
      variants: [
        {
          id: "v1",
          productId: "p1",
          style: null,
          color: "Grön",
          size: null,
          material: null,
          sku: null,
          priceCents: null,
          imageUrl: "/images/abaya_green.jpg",
          inStock: true,
        },
      ],
    });

    const res = await GET(new Request("http://localhost/api/products/test-dirac"), makeContext("test-dirac"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      product: { slug: string; variants: { imageUrl: string | null }[] };
    };
    expect(json.product.slug).toBe("test-dirac");
    expect(json.product.variants[0]?.imageUrl).toBe("/images/abaya_green.jpg");
  });

  it("returnerar demo-produkt när databasen är tom men slug matchar demo", async () => {
    getProductBySlugMock.mockResolvedValue(null);

    const res = await GET(
      new Request("http://localhost/api/products/abaya-malaysian"),
      makeContext("abaya-malaysian"),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { product: { slug: string } | null };
    expect(json.product?.slug).toBe("abaya-malaysian");
  });

  it("returnerar 404 när slug saknas", async () => {
    getProductBySlugMock.mockResolvedValue(null);

    const res = await GET(
      new Request("http://localhost/api/products/finns-inte"),
      makeContext("finns-inte"),
    );
    expect(res.status).toBe(404);
    const json = (await res.json()) as { product: null };
    expect(json.product).toBeNull();
  });
});
