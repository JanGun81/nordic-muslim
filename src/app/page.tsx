/**
 * Startsida – samma guld/espresso-utseende som den statiska showroom-sidan,
 * med två vägar in i butiken.
 */

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="home" />

      <main className="container mx-auto flex-1 px-4 py-8 md:py-12">
        <h2 className="mb-2 text-2xl font-bold text-earth-dark md:text-3xl">Välkommen</h2>
        <p className="mb-8 max-w-xl text-base leading-relaxed text-ink md:text-lg">
          Nordic Muslim samlar muslimska kläder för vardag och fest – baati, dirac,
          macwiis, khamis, klänningar och mer. Enkelt att beställa, steg för steg
          eller genom att bläddra fritt i sortimentet.
        </p>

        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-ink-muted">
          Så beställer du
        </p>

        <div className="grid max-w-3xl gap-6 md:grid-cols-2">
          <Link
            href="/bestall"
            className="group flex flex-col overflow-hidden rounded-2xl border border-warm-300 bg-[#fffdf7] shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(90,70,35,0.16)]"
          >
            <div className="nm-panel px-5 py-4">
              <span className="text-sm font-medium text-[#d4c8b0]">Steg för steg</span>
              <h3 className="mt-1 text-xl font-bold">Börja här</h3>
            </div>
            <div className="flex-1 px-5 py-4">
              <p className="text-sm leading-relaxed text-ink-muted">
                Välj produkt → storlek → tillbehör → granska → lägg i varukorg.
                Som att beställa vid en skärm – enkelt och tydligt.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-earth group-hover:gap-2 transition-all">
                Starta beställning
                <span aria-hidden>→</span>
              </span>
            </div>
          </Link>

          <Link
            href="/produkter"
            className="group flex flex-col overflow-hidden rounded-2xl border border-warm-300 bg-[#fffdf7] shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(90,70,35,0.16)]"
          >
            <div className="bg-warm-100 px-5 py-4 text-ink">
              <span className="text-sm font-medium text-ink-muted">Bläddra</span>
              <h3 className="mt-1 text-xl font-bold text-earth-dark">Se alla produkter</h3>
            </div>
            <div className="flex-1 px-5 py-4">
              <p className="text-sm leading-relaxed text-ink-muted">
                Utforska hela sortimentet. Filtrera och välj det du vill, lägg i
                varukorg när du är redo.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-earth group-hover:gap-2 transition-all">
                Öppna katalogen
                <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        </div>

        <section className="mt-12 border-t border-warm-200 pt-8">
          <h3 className="mb-3 text-lg font-semibold text-earth-dark">Populära kategorier</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Baati", slug: "baatis" },
              { name: "Dirac", slug: "dirac" },
              { name: "Macwiis", slug: "macwiis" },
              { name: "Khamis", slug: "khamis" },
              { name: "Klänningar", slug: "klanningar" },
            ].map(({ name, slug }) => (
              <Link
                key={slug}
                href={`/produkter?kategori=${slug}`}
                className="rounded-full border border-warm-300 bg-warm-50 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-earth hover:text-earth-dark"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
