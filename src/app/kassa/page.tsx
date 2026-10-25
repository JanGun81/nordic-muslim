/**
 * Kassa – gästbeställning (ingen inloggning).
 * Formulär: namn, e-post, adress. Slutför → tacksida.
 */

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { CartSummary } from "@/components/CartSummary";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { buildCreateOrderInput, postCreateOrder } from "@/lib/checkout-order";
import { useState, FormEvent } from "react";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(cents / 100);
}

export default function KassaPage() {
  const router = useRouter();
  const { items, itemCount, totalCents, submitOrder } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (itemCount === 0) return;
    setSubmitting(true);
    setErrors([]);

    const result = await postCreateOrder(
      buildCreateOrderInput({
        customerName: name,
        customerEmail: email,
        customerAddress: address,
        customerPhone: phone,
        items,
      }),
    );

    if (!result.ok) {
      setErrors(result.errors);
      setSubmitting(false);
      return;
    }

    submitOrder(result.order.id);
    router.push("/kassa/tack");
  };

  if (itemCount === 0 && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader
          variant="page"
          pageTitle="Kassa"
          back={{ href: "/produkter", label: "Tillbaka" }}
        />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-gray-600 mb-4">Din varukorg är tom.</p>
          <Link
            href="/produkter"
            className="nm-btn inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium"
          >
            Se produkter
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        variant="page"
        pageTitle="Kassa"
        back={{ href: "/produkter", label: "Tillbaka" }}
      />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600 mb-6">
            Fyll i dina uppgifter. Ingen inloggning krävs – du beställer som gäst.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl bg-white border border-warm-200 shadow-soft p-4 space-y-4">
              <h2 className="font-semibold text-gray-800">Kontaktuppgifter</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Namn *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-gray-800 focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="För- och efternamn"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-post *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-gray-800 focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="namn@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon (valfritt)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-gray-800 focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="07X XXX XX XX"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Leveransadress *
                </label>
                <textarea
                  id="address"
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-gray-800 focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Gatuadress, postnummer och ort"
                />
              </div>
            </div>

            <div className="rounded-xl bg-warm-50 border border-warm-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Din beställning</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {items.map(({ product, quantity }) => (
                  <li key={product.id}>
                    {product.name} × {quantity} – {formatPrice(product.priceCents * quantity)}
                  </li>
                ))}
              </ul>
              <p className="mt-2 pt-2 border-t border-warm-200 font-semibold text-gray-800">
                Totalt: {formatPrice(totalCents)}
              </p>
            </div>

            <p className="text-xs text-gray-500">
              Betalning och leveransmetod läggs till i ett senare steg. Beställningen sparas när du
              klickar på Slutför beställning.
            </p>

            {errors.length > 0 && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                <ul className="list-disc pl-4 space-y-1">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="nm-btn w-full rounded-lg py-3 text-base font-semibold disabled:opacity-70 transition-colors"
            >
              {submitting ? "Skickar …" : "Slutför beställning"}
            </button>
          </form>

          <div className="mt-8 lg:hidden">
            <CartSummary />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
