/**
 * Prisma-implementation av IProductRepository.
 * Här är den enda platsen som importerar Prisma-modeller.
 */

import { prisma } from "@/lib/db";
import type { IProductRepository } from "./product.repository";
import type { ProductVariant, ProductWithCategory } from "@/lib/core/types/product";

const categorySelect = { id: true, name: true, slug: true } as const;

const includeProduct = {
  category: { select: categorySelect },
  variants: { orderBy: { color: "asc" as const } },
};

function mapVariant(row: {
  id: string;
  productId: string;
  style: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  sku: string | null;
  priceCents: number | null;
  imageUrl: string | null;
  inStock: boolean;
}): ProductVariant {
  return {
    id: row.id,
    productId: row.productId,
    style: row.style,
    color: row.color,
    size: row.size,
    material: row.material,
    sku: row.sku,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    inStock: row.inStock,
  };
}

function mapRow(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  categoryId: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string };
  variants: Parameters<typeof mapVariant>[0][];
}): ProductWithCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    categoryId: row.categoryId,
    inStock: row.inStock,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: { id: row.category.id, name: row.category.name, slug: row.category.slug },
    variants: row.variants.map(mapVariant),
  };
}

export class PrismaProductRepository implements IProductRepository {
  async findAll(): Promise<ProductWithCategory[]> {
    const rows = await prisma.product.findMany({
      include: includeProduct,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<ProductWithCategory | null> {
    const row = await prisma.product.findUnique({
      where: { id },
      include: includeProduct,
    });
    return row ? mapRow(row) : null;
  }

  async findBySlug(slug: string): Promise<ProductWithCategory | null> {
    const row = await prisma.product.findUnique({
      where: { slug },
      include: includeProduct,
    });
    return row ? mapRow(row) : null;
  }

  async findByCategoryId(categoryId: string): Promise<ProductWithCategory[]> {
    const rows = await prisma.product.findMany({
      where: { categoryId },
      include: includeProduct,
      orderBy: { name: "asc" },
    });
    return rows.map(mapRow);
  }
}
