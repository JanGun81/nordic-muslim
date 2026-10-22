/**
 * Tacksida efter genomförd beställning (gästkassa).
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { SiteHeader } from "@/components/SiteHeader";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(cents / 100);
}

export default function TackPage() {
  const { lastOrder, clearLastOrder } = useCart();

  useEffect(() => {
    return () => clearLastOrder();
  }, [clearLastOrder]);

  const order = lastOrder;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        variant="page"
        pageTitle="Tack för din beställning"
        back={{ href: "/", label: "Tillbaka" }}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xl text-gray-800 mb-6">
            Vi har tagit emot din beställning. Du får en bekräftelse till din e-post när
            betalning och leverans är kopplade.
          </p>

          {order && order.items.length > 0 && (
            <div className="rounded-xl bg-warm-50 border border-warm-200 p-4 text-left mb-8">
              <h2 className="font-semibold text-gray-800 mb-2">Beställt</h2>
              <p className="text-sm text-gray-600 mb-2">Ordernummer: {order.orderId}</p>
              <ul className="space-y-1 text-sm text-gray-700">
                {order.items.map(({ product, quantity }) => (
                  <li key={product.id}>
                    {product.name} × {quantity} – {formatPrice(product.priceCents * quantity)}
                  </li>
                ))}
              </ul>
              <p className="mt-2 pt-2 border-t border-warm-200 font-semibold text-gray-800">
                Totalt: {formatPrice(order.totalCents)}
              </p>
            </div>
          )}

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-white font-medium hover:bg-accent-dark transition-colors"
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </main>
    </div>
  );
}
