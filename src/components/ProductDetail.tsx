"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductDto, ProductResponse } from "@/lib/api-contract/types";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { useCart } from "@/lib/cart-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartSummary } from "@/components/CartSummary";
import { findVariant, variantImageUrl, variantPriceCents } from "@/lib/product-variant";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(cents / 100);
}

export function ProductDetail({ slug }: { slug: string }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: ProductResponse) => {
        if (data.product) {
          setProduct(data.product);
          setSelectedId(data.product.variants?.[0]?.id ?? null);
        } else {
          const demo = DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
          setProduct(demo);
          setSelectedId(demo?.variants?.[0]?.id ?? null);
        }
      })
      .catch(() => {
        const demo = DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
        setProduct(demo);
        setSelectedId(demo?.variants?.[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const variant = useMemo(
    () => findVariant(product?.variants, selectedId),
    [product, selectedId],
  );
  const imageUrl = product ? variantImageUrl(product, variant) : null;
  const price = product ? variantPriceCents(product, variant) : 0;
  const colorLabel = variant?.color ?? null;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader variant="page" pageTitle="Produkt" back={{ href: "/produkter", label: "Tillbaka" }} />
        <main className="container mx-auto flex-1 px-4 py-8">
          <div className="h-64 animate-pulse rounded-2xl bg-warm-100" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader variant="page" pageTitle="Produkt" back={{ href: "/produkter", label: "Tillbaka" }} />
        <main className="container mx-auto flex-1 px-4 py-8">
          <p className="mb-4 text-ink-muted">Produkten hittades inte.</p>
          <Link href="/produkter" className="nm-btn inline-flex rounded-lg px-4 py-2 text-sm font-medium">
            Till alla produkter
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const swatches = product.variants?.filter((v) => v.color) ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        variant="page"
        pageTitle={product.name}
        back={{ href: "/produkter", label: "Tillbaka" }}
      />
      <main className="container mx-auto flex-1 px-4 py-6 md:py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <article className="rounded-2xl border border-warm-300 bg-[#fffdf7] p-4 shadow-card md:p-6">
            <button
              type="button"
              className="relative mx-auto flex h-[min(62vh,28rem)] w-full max-w-lg cursor-zoom-in items-center justify-center rounded-xl bg-warm-50"
              onClick={() => imageUrl && setZoomOpen(true)}
              aria-label="Öppna förstoring av vald färg"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={colorLabel ? `${product.name}, ${colorLabel}` : product.name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, 512px"
                  unoptimized
                />
              ) : (
                <span className="text-ink-muted">Ingen bild</span>
              )}
            </button>
            <p className="mt-2 text-center text-xs uppercase tracking-wide text-earth">
              Tryck på bilden för förstoring
            </p>

            <h2 className="mt-4 text-xl font-semibold text-earth-dark">{product.name}</h2>
            {product.description && (
              <p className="mt-1 text-sm text-ink-muted">{product.description}</p>
            )}
            <p className="mt-3 text-lg font-bold text-ink">{formatPrice(price)}</p>
            {variant?.size && (
              <p className="mt-1 text-sm text-ink-muted">Storlek: {variant.size}</p>
            )}

            {swatches.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-earth">
                  Färgvarianter · klicka för att byta färg
                </p>
                <div className="flex flex-wrap gap-2">
                  {swatches.map((item) => {
                    const active = item.id === selectedId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        aria-pressed={active}
                        aria-label={`Färg ${item.color}`}
                        className={`flex w-20 flex-col items-center gap-1 rounded-lg border-2 p-1 text-[0.65rem] ${
                          active
                            ? "border-warm-300 bg-warm-100"
                            : "border-transparent bg-warm-50 hover:bg-warm-100"
                        }`}
                      >
                        {item.imageUrl && (
                          <span className="relative block h-16 w-full">
                            <Image
                              src={item.imageUrl}
                              alt=""
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </span>
                        )}
                        <span>{item.color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => addItem(product, 1, selectedId)}
              disabled={!product.inStock || (variant ? !variant.inStock : false)}
              className="nm-btn mt-6 w-full rounded-lg py-3 text-base font-semibold disabled:opacity-50"
            >
              Lägg i varukorg
            </button>
          </article>

          <aside className="lg:sticky lg:top-20 h-fit">
            <CartSummary />
          </aside>
        </div>
      </main>

      {zoomOpen && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Stäng förstoring via bakgrund"
            onClick={() => setZoomOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="zoom-title"
            className="nm-panel relative z-10 w-full max-w-3xl rounded-2xl p-4 shadow-soft"
          >
            <p id="zoom-title" className="mb-2 pr-10 text-sm font-semibold">
              {colorLabel ? `${product.name} · ${colorLabel}` : product.name}
            </p>
            <button
              type="button"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(201,171,110,0.35)]"
              aria-label="Stäng förstoring"
              onClick={() => setZoomOpen(false)}
            >
              ×
            </button>
            <div className="relative h-[min(70vh,36rem)] w-full">
              <Image
                src={imageUrl}
                alt={colorLabel ? `${product.name}, ${colorLabel}` : product.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
      <SiteFooter />
    </div>
  );
}
