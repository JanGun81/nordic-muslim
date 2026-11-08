/**
 * API: GET /api/products – lista alla produkter.
 * Använder tjänstelagret (ingen Prisma/DB här direkt).
 */

import { NextResponse } from "next/server";
import { productService } from "@/lib/core/services";
import type { ProductWithCategory } from "@/lib/core/types/product";
import type { ProductsResponse } from "@/lib/api-contract/types";
import { toProductDto } from "@/lib/product-dto";

export async function GET() {
  let products: ProductWithCategory[] = [];
  try {
    products = await productService.getAllProducts();
  } catch (error) {
    console.error("GET /api/products (DB eller nätverk – använder tom lista):", error);
  }
  try {
    const response: ProductsResponse = {
      products: products.map(toProductDto),
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ products: [] } satisfies ProductsResponse);
  }
}
