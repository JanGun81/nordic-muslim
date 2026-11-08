/**
 * API-kontrakt – typer som både backend och frontend använder.
 * Ändra här om ni byter API-format; frontend behöver bara uppdatera anropen.
 */

export interface ProductCategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariantDto {
  id: string;
  style: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  sku: string | null;
  priceCents: number | null;
  imageUrl: string | null;
  inStock: boolean;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  categoryId: string;
  category: ProductCategoryDto;
  inStock: boolean;
  createdAt: string; // ISO
  updatedAt: string;
  variants?: ProductVariantDto[];
}

export interface ProductsResponse {
  products: ProductDto[];
}

/** GET /api/categories – lista kategorier för meny (samma form som ProductDto.category). */
export interface CategoriesResponse {
  categories: ProductCategoryDto[];
}

export interface ProductResponse {
  product: ProductDto | null;
}

/** POST /api/orders – lyckad skapad order (DTO med ISO-datum). */
export interface CreatedOrderDto {
  id: string;
  totalCents: number;
  status: string;
  createdAt: string;
}

export interface CreateOrderResponse {
  order: CreatedOrderDto;
}

/** POST /api/orders – validerings- eller affärsfel. */
export interface CreateOrderErrorBody {
  errors: string[];
}
