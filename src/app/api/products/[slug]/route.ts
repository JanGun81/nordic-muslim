/**
 * API: GET /api/products/[slug] – en produkt med varianter.
 */

import { NextResponse } from "next/server";
import { productService } from "@/lib/core/services";
import type { ProductResponse } from "@/lib/api-contract/types";
import { toProductDto } from "@/lib/product-dto";
import { DEMO_PRODUCTS } from "@/lib/demo-products";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  try {
    const product = await productService.getProductBySlug(slug);
    if (product) {
      const response: ProductResponse = { product: toProductDto(product) };
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error("GET /api/products/[slug] (DB – försöker demo):", error);
  }

  const demo = DEMO_PRODUCTS.find((p) => p.slug === slug);
  if (demo) {
    const response: ProductResponse = { product: demo };
    return NextResponse.json(response);
  }

  const notFound: ProductResponse = { product: null };
  return NextResponse.json(notFound, { status: 404 });
}
