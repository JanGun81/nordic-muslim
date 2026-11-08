"use client";

import Image from "next/image";
import type { ProductDto } from "@/lib/api-contract/types";
import { useCart } from "@/lib/cart-context";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(cents / 100);
}

export function ProductCard({ product }: { product: ProductDto }) {
  const { addItem } = useCart();

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-warm-300 bg-[#fffdf7] shadow-card transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(90,70,35,0.16)]">
      <div className="relative flex h-[clamp(14rem,42vw,18rem)] items-center justify-center bg-warm-50 p-1.5">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 320px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-ink-muted">
            Ingen bild
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="font-medium text-[#f5f0e8]">Slutsåld</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-earth">
          {product.category.name}
        </span>
        <h3 className="mt-1 text-[0.95rem] font-semibold text-earth-dark">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{product.description}</p>
        )}
        <p className="mt-2 font-bold text-ink">{formatPrice(product.priceCents)}</p>
        <button
          type="button"
          onClick={() => addItem(product)}
          disabled={!product.inStock}
          className="nm-btn mt-4 w-full rounded-lg py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Lägg i varukorg
        </button>
      </div>
    </article>
  );
}
