"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { findVariant, variantPriceCents } from "@/lib/product-variant";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(cents / 100);
}

export function CartSummary() {
  const { items, itemCount, totalCents, removeItem } = useCart();

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-warm-300 bg-[#fffdf7] p-4 shadow-card">
      <h3 className="mb-2 font-semibold text-earth-dark">
        Varukorg ({itemCount} {itemCount === 1 ? "produkt" : "produkter"})
      </h3>
      <ul className="space-y-2 text-sm">
        {items.map(({ product, quantity, variantId }) => {
          const variant = findVariant(product.variants, variantId);
          const label = variant?.color ? `${product.name} (${variant.color})` : product.name;
          return (
            <li
              key={`${product.id}:${variantId ?? ""}`}
              className="flex justify-between items-center gap-2"
            >
              <span className="text-gray-700 truncate">
                {label} × {quantity}
              </span>
              <span className="text-earth font-medium shrink-0">
                {formatPrice(variantPriceCents(product, variant) * quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(product.id, variantId)}
                className="text-ink-muted hover:text-earth text-xs shrink-0"
                aria-label={`Ta bort ${label}`}
              >
                Ta bort
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex justify-between border-t border-warm-200 pt-3 font-semibold text-ink">
        <span>Totalt</span>
        <span className="text-earth">{formatPrice(totalCents)}</span>
      </p>
      <Link
        href="/kassa"
        className="nm-btn mt-3 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors"
      >
        Till kassan
      </Link>
    </div>
  );
}
