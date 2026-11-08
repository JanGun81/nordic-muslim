import type { CreateOrderInput, OrderItemInput } from "@/lib/core/types/order";

type ValidationResult =
  | { ok: true; value: CreateOrderInput }
  | { ok: false; errors: string[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateItems(items: unknown, errors: string[]): OrderItemInput[] {
  if (!Array.isArray(items) || items.length === 0) {
    errors.push("Order måste innehålla minst en orderrad.");
    return [];
  }

  const normalized: OrderItemInput[] = [];
  items.forEach((item, index) => {
    const row = item as Partial<OrderItemInput>;
    if (!isNonEmptyString(row.productId)) {
      errors.push(`Orderrad ${index + 1}: productId saknas.`);
    }
    if (typeof row.quantity !== "number" || row.quantity <= 0) {
      errors.push(`Orderrad ${index + 1}: quantity måste vara > 0.`);
    }
    if (typeof row.unitPriceCents !== "number" || row.unitPriceCents <= 0) {
      errors.push(`Orderrad ${index + 1}: unitPriceCents måste vara > 0.`);
    }
    if (
      isNonEmptyString(row.productId) &&
      typeof row.quantity === "number" &&
      row.quantity > 0 &&
      typeof row.unitPriceCents === "number" &&
      row.unitPriceCents > 0
    ) {
      normalized.push({
        productId: row.productId,
        productVariantId:
          typeof row.productVariantId === "string" && row.productVariantId.trim().length > 0
            ? row.productVariantId
            : null,
        quantity: row.quantity,
        unitPriceCents: row.unitPriceCents,
      });
    }
  });

  return normalized;
}

export function validateCreateOrderRequest(input: unknown): ValidationResult {
  const errors: string[] = [];
  const body = (input ?? {}) as Partial<CreateOrderInput>;

  if (!isNonEmptyString(body.customerName)) {
    errors.push("customerName är obligatoriskt.");
  }
  if (!isNonEmptyString(body.customerEmail)) {
    errors.push("customerEmail är obligatoriskt.");
  }
  if (!isNonEmptyString(body.customerAddress)) {
    errors.push("customerAddress är obligatoriskt.");
  }

  const items = validateItems(body.items, errors);
  const phone = typeof body.customerPhone === "string" ? body.customerPhone : null;

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      customerName: body.customerName as string,
      customerEmail: body.customerEmail as string,
      customerAddress: body.customerAddress as string,
      customerPhone: phone,
      items,
    },
  };
}
