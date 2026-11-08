import type { ProductDto, ProductVariantDto } from "@/lib/api-contract/types";
import type { ProductVariant, ProductWithCategory } from "@/lib/core/types/product";

function toVariantDto(v: ProductVariant): ProductVariantDto {
  return {
    id: v.id,
    style: v.style,
    color: v.color,
    size: v.size,
    material: v.material,
    sku: v.sku,
    priceCents: v.priceCents,
    imageUrl: v.imageUrl,
    inStock: v.inStock,
  };
}

export function toProductDto(p: ProductWithCategory): ProductDto {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    priceCents: p.priceCents,
    imageUrl: p.imageUrl,
    categoryId: p.categoryId,
    category: p.category,
    inStock: p.inStock,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    variants: p.variants.map(toVariantDto),
  };
}
