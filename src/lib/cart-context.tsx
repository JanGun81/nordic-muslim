"use client";

/**
 * Enkel client-side varukorg + kassa (ingen inloggning – gästbeställning).
 * Inloggning kan läggas till senare och kopplas till beställningar.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProductDto } from "@/lib/api-contract/types";

export interface CartItem {
  product: ProductDto;
  quantity: number;
}

export interface LastOrder {
  items: CartItem[];
  totalCents: number;
  orderId: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: ProductDto, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  totalCents: number;
  itemCount: number;
  /** Sparar nuvarande varukorg som lastOrder och tömmer varukorgen. Anropa efter lyckat API-svar, innan redirect till tacksida. */
  submitOrder: (orderId: string) => void;
  /** Senast genomförda beställning (visas på tacksidan). Rensas efter visning. */
  lastOrder: LastOrder | null;
  clearLastOrder: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  const addItem = useCallback((product: ProductDto, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  const totalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0),
    [items]
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const submitOrder = useCallback(
    (orderId: string) => {
      if (items.length === 0) return;
      setLastOrder({ items: [...items], totalCents, orderId });
      setItems([]);
    },
    [items, totalCents],
  );

  const clearLastOrder = useCallback(() => setLastOrder(null), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      totalCents,
      itemCount,
      submitOrder,
      lastOrder,
      clearLastOrder,
    }),
    [items, addItem, removeItem, updateQuantity, totalCents, itemCount, submitOrder, lastOrder, clearLastOrder]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart måste användas inom CartProvider");
  return ctx;
}
