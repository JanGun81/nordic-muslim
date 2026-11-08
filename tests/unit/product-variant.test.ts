import { describe, it, expect } from "vitest";
import type { ProductDto, ProductVariantDto } from "@/lib/api-contract/types";
import {
  findVariant,
  variantImageUrl,
  variantPriceCents,
} from "@/lib/product-variant";

const variant: ProductVariantDto = {
  id: "var-green",
  style: null,
  color: "Grön",
  size: "56",
  material: null,
  sku: null,
  priceCents: 65000,
  imageUrl: "/images/abaya_green.jpg",
  inStock: true,
};

const product: ProductDto = {
  id: "demo-1",
  name: "Typ 1: Abaya malaysian",
  slug: "abaya-malaysian",
  description: null,
  priceCents: 60000,
  imageUrl: "/images/abaya_brun.jpg",
  categoryId: "cat-1",
  category: { id: "cat-1", name: "Klänningar", slug: "klanningar" },
  inStock: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  variants: [variant],
};

describe("variantPriceCents", () => {
  it("använder variantpris när det finns", () => {
    expect(variantPriceCents(product, variant)).toBe(65000);
  });

  it("faller tillbaka till produktpris", () => {
    expect(variantPriceCents(product, { ...variant, priceCents: null })).toBe(60000);
    expect(variantPriceCents(product, null)).toBe(60000);
  });
});

describe("variantImageUrl", () => {
  it("använder variantens bild när den finns", () => {
    expect(variantImageUrl(product, variant)).toBe("/images/abaya_green.jpg");
  });

  it("faller tillbaka till produktens bild", () => {
    expect(variantImageUrl(product, { ...variant, imageUrl: null })).toBe(
      "/images/abaya_brun.jpg",
    );
  });
});

describe("findVariant", () => {
  it("hittar variant på id", () => {
    expect(findVariant(product.variants, "var-green")?.color).toBe("Grön");
  });

  it("returnerar null när id saknas", () => {
    expect(findVariant(product.variants, "nope")).toBeNull();
    expect(findVariant(undefined, "var-green")).toBeNull();
  });
});
