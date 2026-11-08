/**
 * Alla produkter – bläddra i sortimentet, lägg i varukorg.
 * Query `?kategori=<slug>` filtrerar listan (samma slug som i databasen).
 */

import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { CartSummary } from "@/components/CartSummary";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type SearchParams = { kategori?: string };

export default async function ProdukterPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const kategoriSlug = sp.kategori?.trim() || null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        variant="page"
        pageTitle="Alla produkter"
        back={{ href: "/", label: "Tillbaka" }}
      />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          <div className="flex-1 min-w-0">
            {kategoriSlug ? (
              <p className="text-gray-600 mb-6">
                Visar produkter i kategorin <span className="font-medium text-gray-800">{kategoriSlug}</span>.
                {" "}
                <Link href="/produkter" className="text-accent underline hover:text-accent-dark">
                  Visa alla
                </Link>
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                Välj produkter och lägg i varukorg. Använd menyn för att filtrera på kategori.
              </p>
            )}
            <ProductGrid categorySlug={kategoriSlug} />
          </div>
          <aside className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-20">
              <CartSummary />
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
