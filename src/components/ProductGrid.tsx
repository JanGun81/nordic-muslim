"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductDto, ProductsResponse } from "@/lib/api-contract/types";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { ProductCard } from "./ProductCard";
import Link from "next/link";

export interface ProductGridProps {
  /** Filtrerar på `product.category.slug` (t.ex. från `?kategori=dirac`). */
  categorySlug?: string | null;
}

export function ProductGrid({ categorySlug }: ProductGridProps) {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(() => {
    const slug = categorySlug?.trim().toLowerCase();
    if (!slug) return products;
    return products.filter((p) => p.category.slug.toLowerCase() === slug);
  }, [products, categorySlug]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: ProductsResponse) => {
        if (data.products?.length) {
          setProducts(data.products);
        } else {
          setProducts(DEMO_PRODUCTS);
        }
      })
      .catch(() => setProducts(DEMO_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-warm-100 aspect-[4/3] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-gray-600">
        Inga produkter att visa just nu. Kör <code className="bg-warm-100 px-1 rounded">npm run db:seed</code> om du har databas kopplad.
      </p>
    );
  }

  if (filtered.length === 0 && categorySlug?.trim()) {
    return (
      <div className="rounded-xl border border-warm-200 bg-warm-50 p-6 text-gray-700">
        <p className="mb-4">Inga produkter i den här kategorin just nu.</p>
        <Link
          href="/produkter"
          className="nm-btn inline-flex rounded-lg px-4 py-2 text-sm font-medium"
        >
          Visa alla produkter
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
