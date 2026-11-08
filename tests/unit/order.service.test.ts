import { describe, it, expect, vi } from "vitest";
import { OrderService } from "@/lib/core/services/order.service";
import type { CreateOrderInput } from "@/lib/core/types/order";
import type { IOrderRepository } from "@/lib/core/repositories/order.repository";
import type { IProductRepository } from "@/lib/core/repositories/product.repository";
import type { ProductWithCategory } from "@/lib/core/types/product";

const baseProduct: ProductWithCategory = {
  id: "p1",
  name: "Test Dirac",
  slug: "test-dirac",
  description: null,
  priceCents: 29900,
  imageUrl: null,
  categoryId: "cat-1",
  inStock: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  category: { id: "cat-1", name: "Dirac", slug: "dirac" },
  variants: [],
};

function createMocks(overrides?: {
  product?: Partial<ProductWithCategory> | null;
  secondProduct?: Partial<ProductWithCategory> | null;
}) {
  const p1: ProductWithCategory | null =
    overrides?.product === undefined
      ? baseProduct
      : overrides.product === null
        ? null
        : { ...baseProduct, ...overrides.product };

  const productRepo: IProductRepository = {
    findAll: vi.fn(),
    findById: vi.fn().mockImplementation(async (id: string) => {
      if (id === "p1") return p1;
      if (id === "p2") {
        if (overrides?.secondProduct === null) return null;
        return {
          ...baseProduct,
          id: "p2",
          name: "Annan",
          slug: "annan",
          priceCents: 12900,
          ...overrides?.secondProduct,
        };
      }
      return null;
    }),
    findBySlug: vi.fn(),
    findByCategoryId: vi.fn(),
  };

  const orderRepo: IOrderRepository = {
    create: vi.fn().mockResolvedValue({
      id: "order-1",
      totalCents: 29900,
      status: "PENDING",
      createdAt: new Date("2025-01-02T12:00:00.000Z"),
    }),
  };

  return { productRepo, orderRepo };
}

const validInput: CreateOrderInput = {
  customerName: "Ali Hassan",
  customerEmail: "ali@example.com",
  customerAddress: "Testgatan 1, 11122 Stockholm",
  customerPhone: null,
  items: [{ productId: "p1", quantity: 1, unitPriceCents: 29900 }],
};

describe("OrderService", () => {
  it("beräknar total i öre från orderrader", () => {
    const { productRepo, orderRepo } = createMocks();
    const service = new OrderService(productRepo, orderRepo);
    const input: CreateOrderInput = {
      customerName: "Ali Hassan",
      customerEmail: "ali@example.com",
      customerAddress: "Testgatan 1, 11122 Stockholm",
      customerPhone: null,
      items: [
        { productId: "p1", quantity: 2, unitPriceCents: 34900 },
        { productId: "p2", quantity: 1, unitPriceCents: 12900 },
      ],
    };

    const total = service.calculateTotalCents(input.items);
    expect(total).toBe(82700);
  });

  it("kastar fel om orderrader saknas", () => {
    const { productRepo, orderRepo } = createMocks();
    const service = new OrderService(productRepo, orderRepo);
    expect(() => service.calculateTotalCents([])).toThrowError(/minst en orderrad/i);
  });

  it("createOrder sparar order när pris och lager stämmer", async () => {
    const { productRepo, orderRepo } = createMocks();
    const service = new OrderService(productRepo, orderRepo);

    const result = await service.createOrder(validInput);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.id).toBe("order-1");
    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "Ali Hassan",
        totalCents: 29900,
        items: [
          expect.objectContaining({
            productId: "p1",
            quantity: 1,
            unitPriceCents: 29900,
            productVariantId: null,
          }),
        ],
      }),
    );
  });

  it("createOrder underkänner okänd produkt", async () => {
    const { productRepo, orderRepo } = createMocks();
    vi.mocked(productRepo.findById).mockResolvedValue(null);
    const service = new OrderService(productRepo, orderRepo);

    const result = await service.createOrder(validInput);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => /hittades inte/i.test(e))).toBe(true);
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("createOrder underkänner fel klientpris jämfört med databas", async () => {
    const { productRepo, orderRepo } = createMocks();
    const service = new OrderService(productRepo, orderRepo);

    const result = await service.createOrder({
      ...validInput,
      items: [{ productId: "p1", quantity: 1, unitPriceCents: 100 }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.join(" ")).toMatch(/priset|varukorgen/i);
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("createOrder sparar productVariantId och variantpris", async () => {
    const { productRepo, orderRepo } = createMocks({
      product: {
        variants: [
          {
            id: "var-1",
            productId: "p1",
            style: null,
            color: "Grön",
            size: null,
            material: null,
            sku: null,
            priceCents: 31000,
            imageUrl: "/images/abaya_green.jpg",
            inStock: true,
          },
        ],
      },
    });
    const service = new OrderService(productRepo, orderRepo);

    const result = await service.createOrder({
      ...validInput,
      items: [{ productId: "p1", productVariantId: "var-1", quantity: 1, unitPriceCents: 31000 }],
    });

    expect(result.ok).toBe(true);
    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ productVariantId: "var-1", unitPriceCents: 31000 })],
      }),
    );
  });

  it("createOrder underkänner okänd variant", async () => {
    const { productRepo, orderRepo } = createMocks();
    const service = new OrderService(productRepo, orderRepo);

    const result = await service.createOrder({
      ...validInput,
      items: [{ productId: "p1", productVariantId: "saknas", quantity: 1, unitPriceCents: 29900 }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.join(" ")).toMatch(/varianten hittades inte/i);
    expect(orderRepo.create).not.toHaveBeenCalled();
  });

  it("createOrder underkänner produkt som inte finns i lager", async () => {
    const { productRepo, orderRepo } = createMocks({
      product: { inStock: false },
    });
    const service = new OrderService(productRepo, orderRepo);

    const result = await service.createOrder(validInput);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.join(" ")).toMatch(/lager/i);
    expect(orderRepo.create).not.toHaveBeenCalled();
  });
});
