/**
 * Unit-tester för ProductService – TDD-vänligt.
 * Använder ett mock-repository så att vi inte behöver databas.
 */

import { describe, it, expect, vi } from "vitest";
import { ProductService } from "@/lib/core/services/product.service";
import type { IProductRepository } from "@/lib/core/repositories/product.repository";
import type { ProductWithCategory } from "@/lib/core/types/product";

const mockProduct: ProductWithCategory = {
  id: "1",
  name: "Test Dirac",
  slug: "test-dirac",
  description: "En vacker dirac",
  priceCents: 29900,
  imageUrl: null,
  categoryId: "cat-1",
  inStock: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  category: { id: "cat-1", name: "Dirac", slug: "dirac" },
  variants: [],
};

function createMockRepo(): IProductRepository {
  return {
    findAll: vi.fn().mockResolvedValue([mockProduct]),
    findById: vi.fn().mockResolvedValue(mockProduct),
    findBySlug: vi.fn().mockResolvedValue(mockProduct),
    findByCategoryId: vi.fn().mockResolvedValue([mockProduct]),
  };
}

describe("ProductService", () => {
  it("getAllProducts returnerar alla produkter från repository", async () => {
    const repo = createMockRepo();
    const service = new ProductService(repo);

    const result = await service.getAllProducts();

    expect(repo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test Dirac");
    expect(result[0].priceCents).toBe(29900);
  });

  it("getProductById returnerar produkt eller null", async () => {
    const repo = createMockRepo();
    const service = new ProductService(repo);

    const found = await service.getProductById("1");
    expect(found).not.toBeNull();
    expect(found?.slug).toBe("test-dirac");

    vi.mocked(repo.findById).mockResolvedValueOnce(null);
    const notFound = await service.getProductById("none");
    expect(notFound).toBeNull();
  });

  it("getProductBySlug returnerar produkt via repository", async () => {
    const repo = createMockRepo();
    const service = new ProductService(repo);

    const found = await service.getProductBySlug("test-dirac");
    expect(repo.findBySlug).toHaveBeenCalledWith("test-dirac");
    expect(found?.name).toBe("Test Dirac");
  });

  it("getProductsByCategory anropar repository med categoryId", async () => {
    const repo = createMockRepo();
    const service = new ProductService(repo);

    await service.getProductsByCategory("cat-1");

    expect(repo.findByCategoryId).toHaveBeenCalledWith("cat-1");
  });
});
