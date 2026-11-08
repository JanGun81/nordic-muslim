"use client";

/**
 * Enkel client-side varukorg + kassa (ingen inloggning – gästbeställning).
 * Inloggning kan läggas till senare och kopplas till beställningar.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProductDto } from "@/lib/api-contract/types";
import { findVariant, variantPriceCents } from "@/lib/product-variant";

export interface CartItem {
  product: ProductDto;
  quantity: number;
  variantId: string | null;
}

export interface LastOrder {
  items: CartItem[];
  totalCents: number;
  orderId: string;
}

function lineKey(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? ""}`;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: ProductDto, quantity?: number, variantId?: string | null) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  totalCents: number;
  itemCount: number;
  /** Sparar nuvarande varukorg som lastOrder och tömmer varukorgen. Anropa efter lyckat API-svar, innan redirect till tacksida. */
  submitOrder: (orderId: string) => void;
  /** Senast genomförda beställning (visas på tacksidan). Rensas efter visning. */
  lastOrder: LastOrder | null;
  clearLastOrder: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const LAST_ORDER_KEY = "nm-last-order";

function readStoredLastOrder(): LastOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastOrder;
    if (!parsed?.orderId || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredLastOrder(order: LastOrder | null) {
  if (typeof window === "undefined") return;
  try {
    if (!order) {
      window.sessionStorage.removeItem(LAST_ORDER_KEY);
      return;
    }
    window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {
    /* sessionStorage kan vara avstängt */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    setLastOrder((current) => current ?? readStoredLastOrder());
  }, []);

  const addItem = useCallback(
    (product: ProductDto, quantity = 1, variantId: string | null = null) => {
      setItems((prev) => {
        const key = lineKey(product.id, variantId);
        const existing = prev.find((i) => lineKey(i.product.id, i.variantId) === key);
        if (existing) {
          return prev.map((i) =>
            lineKey(i.product.id, i.variantId) === key
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { product, quantity, variantId }];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, variantId: string | null = null) => {
    const key = lineKey(productId, variantId);
    setItems((prev) => prev.filter((i) => lineKey(i.product.id, i.variantId) !== key));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId: string | null = null) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }
      const key = lineKey(productId, variantId);
      setItems((prev) =>
        prev.map((i) =>
          lineKey(i.product.id, i.variantId) === key ? { ...i, quantity } : i,
        ),
      );
    },
    [removeItem],
  );

  const totalCents = useMemo(
    () =>
      items.reduce((sum, i) => {
        const variant = findVariant(i.product.variants, i.variantId);
        return sum + variantPriceCents(i.product, variant) * i.quantity;
      }, 0),
    [items],
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const submitOrder = useCallback(
    (orderId: string) => {
      if (items.length === 0) return;
      const next: LastOrder = { items: [...items], totalCents, orderId };
      writeStoredLastOrder(next);
      setLastOrder(next);
      setItems([]);
    },
    [items, totalCents],
  );

  const clearLastOrder = useCallback(() => {
    writeStoredLastOrder(null);
    setLastOrder(null);
  }, []);

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
    [items, addItem, removeItem, updateQuantity, totalCents, itemCount, submitOrder, lastOrder, clearLastOrder],
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
