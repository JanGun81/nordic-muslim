"use client";

/**
 * Vänster sidopanel (endast lg+): kategorilänkar i samma visuella språk som showroom.
 * Mobil använder SiteHeader-hamburgaren.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { CategoriesResponse, ProductCategoryDto } from "@/lib/api-contract/types";
import { DEMO_CATEGORIES } from "@/lib/demo-categories";

function linkClass(active: boolean) {
  return [
    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border",
    active
      ? "bg-[rgba(201,171,110,0.18)] text-[#f5f0e8] border-warm-300"
      : "text-[#d4c8b0] border-transparent hover:bg-white/10 hover:text-[#f5f0e8]",
  ].join(" ");
}

export function CategoryNavRail() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("kategori")?.toLowerCase() ?? null;

  const [categories, setCategories] = useState<ProductCategoryDto[]>(DEMO_CATEGORIES);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: CategoriesResponse) => {
        if (data.categories?.length) {
          setCategories(data.categories);
        }
      })
      .catch(() => setCategories(DEMO_CATEGORIES));
  }, []);

  const allProductsActive = pathname === "/produkter" && !activeCategory;

  return (
    <aside
      className="nm-panel fixed left-0 top-0 z-20 hidden h-svh w-56 flex-col border-r border-[rgba(201,171,110,0.35)] shadow-soft lg:flex"
      aria-label="Butiksmenyn"
    >
      <div className="shrink-0 border-b border-[rgba(201,171,110,0.35)] px-4 pb-3 pt-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-warm-300">
          Utforska
        </p>
        <p className="mt-0.5 text-base font-semibold text-[#f5f0e8]">Sortiment</p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Kategorier">
        <ul className="space-y-1">
          <li>
            <Link href="/" className={linkClass(pathname === "/")}>
              Startsida
            </Link>
          </li>
          <li>
            <Link href="/produkter" className={linkClass(allProductsActive)}>
              Alla produkter
            </Link>
          </li>
          {categories.map((c) => {
            const active = pathname === "/produkter" && activeCategory === c.slug.toLowerCase();
            return (
              <li key={c.id}>
                <Link
                  href={`/produkter?kategori=${encodeURIComponent(c.slug)}`}
                  className={linkClass(active)}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
          <li className="mt-2 border-t border-[rgba(201,171,110,0.35)] pt-2">
            <Link href="/bestall" className={linkClass(pathname === "/bestall")}>
              Beställ steg för steg
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
