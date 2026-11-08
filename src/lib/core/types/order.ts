export interface OrderItemInput {
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  unitPriceCents: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string | null;
  items: OrderItemInput[];
}
