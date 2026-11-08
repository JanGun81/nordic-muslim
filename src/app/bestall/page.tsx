/**
 * Steg-för-steg beställning (wizard) – start.
 * Flöde: välj produkt → storlek → tillbehör → granska → lägg i varukorg.
 */

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function BestallPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader
        variant="page"
        pageTitle="Steg-för-steg beställning"
        back={{ href: "/", label: "Tillbaka" }}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <p className="text-gray-600 mb-6">
            Här bygger vi snart wizard-flödet: först väljer du produkt, sedan storlek,
            tillbehör, granskar och lägger i varukorg – som vid en självbetjäningsskärm.
          </p>
          <p className="text-sm text-gray-500">
            Steg 1 (välj produkt) kommer här. Länken &quot;Börja här&quot; på startsidan
            leder hit.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
