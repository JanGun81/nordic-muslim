"use client";

/**
 * Gemensam sidhuvud: hamburger + utfällbar meny på mindre skärmar (<lg).
 * Från lg och uppåt ligger kategorier i vänsterpanelen (`CategoryNavRail` i layout).
 * Utseende följer den statiska showroom-sidan: espresso-panel och logotyp.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { CategoriesResponse, ProductCategoryDto } from "@/lib/api-contract/types";
import { DEMO_CATEGORIES } from "@/lib/demo-categories";

export interface SiteHeaderProps {
  variant: "home" | "page";
  /** Visas i header på undersidor (t.ex. "Alla produkter"). */
  pageTitle?: string;
  /** Tillbaka-länk; utelämnas på startsidan. */
  back?: { href: string; label?: string };
}

export function SiteHeader({ variant, pageTitle, back }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<ProductCategoryDto[]>(DEMO_CATEGORIES);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

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

  const mobileNavLinks = (
    <ul className="flex flex-col gap-1">
      <li>
        <Link
          href="/produkter"
          className="block rounded-lg px-3 py-2 text-[#f5f0e8]/95 hover:bg-white/10 text-sm"
          onClick={closeMenu}
        >
          Alla produkter
        </Link>
      </li>
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={`/produkter?kategori=${encodeURIComponent(c.slug)}`}
            className="block rounded-lg px-3 py-2 text-[#f5f0e8]/95 hover:bg-white/10 text-sm"
            onClick={closeMenu}
          >
            {c.name}
          </Link>
        </li>
      ))}
      <li>
        <Link
          href="/bestall"
          className="block rounded-lg px-3 py-2 text-[#f5f0e8]/95 hover:bg-white/10 text-sm"
          onClick={closeMenu}
        >
          Beställ steg för steg
        </Link>
      </li>
    </ul>
  );

  const isHome = variant === "home";

  return (
    <header
      className={`nm-panel border-b border-[rgba(201,171,110,0.35)] shadow-soft z-30 ${
        isHome ? "" : "sticky top-0"
      }`}
    >
      <div className={`container mx-auto px-4 ${isHome ? "py-8 md:py-10" : "py-3 md:py-4"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            {back && (
              <Link
                href={back.href}
                className="shrink-0 text-[#d4c8b0] hover:text-[#f5f0e8] text-sm whitespace-nowrap"
              >
                ← {back.label ?? "Tillbaka"}
              </Link>
            )}
            {isHome ? (
              <Link href="/" className="block min-w-0">
                <p className="m-0 mb-2 text-sm uppercase tracking-[0.06em] text-[#d4c8b0]">
                  Butik
                </p>
                <img
                  src="/images/nm3.png"
                  alt="Nordic Muslim"
                  width={480}
                  height={160}
                  className="block h-auto w-[min(100%,22rem)]"
                  decoding="async"
                />
              </Link>
            ) : (
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/" className="shrink-0">
                  <img
                    src="/images/nm3.png"
                    alt="Nordic Muslim"
                    width={180}
                    height={60}
                    className="hidden h-8 w-auto sm:block"
                    decoding="async"
                  />
                </Link>
                <h1 className="text-lg font-bold truncate text-[#f5f0e8]">{pageTitle ?? ""}</h1>
              </div>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(201,171,110,0.35)] text-[#f5f0e8] hover:bg-[rgba(201,171,110,0.2)] focus:outline-none focus:ring-2 focus:ring-warm-300"
            aria-expanded={menuOpen}
            aria-controls="site-nav-panel"
            aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">Meny</span>
            <span className="text-2xl font-light leading-none select-none" aria-hidden>
              {menuOpen ? "\u2715" : "\u2630"}
            </span>
          </button>
        </div>

        {isHome && (
          <p className="mt-3 max-w-xl text-base text-[#d4c8b0]">
            Abayas för vardag och fest – enkla modeller, dekor, blomster, guld och mönster.
          </p>
        )}

        <div
          id="site-nav-panel"
          className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ease-out ${
            menuOpen ? "max-h-[28rem] mt-3 pt-3 border-t border-[rgba(201,171,110,0.35)]" : "max-h-0"
          }`}
          aria-hidden={!menuOpen}
        >
          <nav aria-label="Kategorier">{menuOpen ? mobileNavLinks : null}</nav>
        </div>
      </div>
    </header>
  );
}
