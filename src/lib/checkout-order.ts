/**
 * Klienthjälp för kassan: mappar varukorg → POST /api/orders och tolkar svaret.
 * Anropar bara API-kontraktet – ingen Prisma här.
 */

import type { CreateOrderInput } from "@/lib/core/types/order";
import type { CreatedOrderDto, CreateOrderErrorBody, CreateOrderResponse, ProductDto } from "@/lib/api-contract/types";

export interface CheckoutCartItem {
  product: ProductDto;
  quantity: number;
}

export type PostCreateOrderResult =
  | { ok: true; order: CreatedOrderDto }
  | { ok: false; errors: string[] };

const FALLBACK_ERROR = "Kunde inte slutföra beställningen. Försök igen.";
const NETWORK_ERROR = "Kunde inte skicka beställningen. Kontrollera nätverket och försök igen.";

export function buildCreateOrderInput(params: {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  items: CheckoutCartItem[];
}): CreateOrderInput {
  const phone = params.customerPhone.trim();
  return {
    customerName: params.customerName.trim(),
    customerEmail: params.customerEmail.trim(),
    customerAddress: params.customerAddress.trim(),
    customerPhone: phone.length > 0 ? phone : null,
    items: params.items.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
      unitPriceCents: product.priceCents,
    })),
  };
}

export function parseCreateOrderResponse(status: number, body: unknown): PostCreateOrderResult {
  if (status === 201) {
    const order = (body as Partial<CreateOrderResponse> | null)?.order;
    if (order && typeof order.id === "string" && typeof order.totalCents === "number") {
      return { ok: true, order: order as CreatedOrderDto };
    }
  }

  const errors = (body as Partial<CreateOrderErrorBody> | null)?.errors;
  if (Array.isArray(errors) && errors.length > 0 && errors.every((e) => typeof e === "string")) {
    return { ok: false, errors };
  }

  return { ok: false, errors: [FALLBACK_ERROR] };
}

export async function postCreateOrder(
  input: CreateOrderInput,
  fetchImpl: typeof fetch = fetch,
): Promise<PostCreateOrderResult> {
  try {
    const response = await fetchImpl("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return parseCreateOrderResponse(response.status, body);
  } catch {
    return { ok: false, errors: [NETWORK_ERROR] };
  }
}
