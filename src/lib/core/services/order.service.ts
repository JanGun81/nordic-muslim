import type {
  CreatedOrderRecord,
  IOrderRepository,
} from "@/lib/core/repositories/order.repository";
import type { IProductRepository } from "@/lib/core/repositories/product.repository";
import type { CreateOrderInput, OrderItemInput } from "@/lib/core/types/order";

export type CreateOrderResult =
  | { ok: true; order: CreatedOrderRecord }
  | { ok: false; errors: string[] };

export class OrderService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly orderRepository: IOrderRepository,
  ) {}

  calculateTotalCents(items: OrderItemInput[]): number {
    if (!items.length) {
      throw new Error("Order måste innehålla minst en orderrad.");
    }

    return items.reduce((sum, item) => {
      if (item.quantity <= 0) {
        throw new Error("Orderrad måste ha quantity > 0.");
      }
      if (item.unitPriceCents <= 0) {
        throw new Error("Orderrad måste ha unitPriceCents > 0.");
      }
      return sum + item.quantity * item.unitPriceCents;
    }, 0);
  }

  /**
   * Validerar mot databaspris/lager och sparar order.
   * unitPriceCents i indata måste stämma med aktuellt produktpris (skydd mot manipulerade priser).
   */
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const errors: string[] = [];
    const resolvedLines: OrderItemInput[] = [];

    for (const line of input.items) {
      const product = await this.productRepository.findById(line.productId);
      if (!product) {
        errors.push(`Produkten hittades inte: ${line.productId}.`);
        continue;
      }

      const variantId = line.productVariantId ?? null;
      const variant = variantId
        ? product.variants.find((v) => v.id === variantId) ?? null
        : null;

      if (variantId && !variant) {
        errors.push(`Varianten hittades inte: ${variantId}.`);
        continue;
      }

      const inStock = variant ? variant.inStock : product.inStock;
      if (!inStock) {
        errors.push(`Produkten är slut i lager: ${product.name}.`);
        continue;
      }

      const expectedPrice = variant?.priceCents ?? product.priceCents;
      if (line.unitPriceCents !== expectedPrice) {
        errors.push(
          `Priset för "${product.name}" stämmer inte längre. Uppdatera varukorgen och försök igen.`,
        );
        continue;
      }
      resolvedLines.push({
        productId: line.productId,
        productVariantId: variant ? variant.id : null,
        quantity: line.quantity,
        unitPriceCents: expectedPrice,
      });
    }

    if (errors.length > 0) {
      return { ok: false, errors };
    }

    let totalCents: number;
    try {
      totalCents = this.calculateTotalCents(resolvedLines);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ogiltig order.";
      return { ok: false, errors: [message] };
    }

    const order = await this.orderRepository.create({
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      customerAddress: input.customerAddress.trim(),
      customerPhone:
        input.customerPhone && input.customerPhone.trim().length > 0
          ? input.customerPhone.trim()
          : null,
      totalCents,
      items: resolvedLines.map((line) => ({
        productId: line.productId,
        productVariantId: line.productVariantId ?? null,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
      })),
    });

    return { ok: true, order };
  }
}
