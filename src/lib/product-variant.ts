import type { ProductVariantDto } from "@/lib/api-contract/types";

export function variantPriceCents(
  product: { priceCents: number },
  variant?: { priceCents: number | null } | null,
): number {
  return variant?.priceCents ?? product.priceCents;
}

export function variantImageUrl(
  product: { imageUrl: string | null },
  variant?: { imageUrl: string | null } | null,
): string | null {
  return variant?.imageUrl ?? product.imageUrl;
}

export function findVariant(
  variants: ProductVariantDto[] | undefined,
  id: string | null | undefined,
): ProductVariantDto | null {
  if (!id || !variants?.length) return null;
  return variants.find((v) => v.id === id) ?? null;
}
