/**
 * Domänmodell för produkt – ramverksoberoende.
 * Används av tjänstelagret och API-kontraktet.
 */

export interface Product {
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
}

export interface ProductVariant {
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
}

export interface ProductWithCategory extends Product {
  category: { id: string; name: string; slug: string };
  variants: ProductVariant[];
}
