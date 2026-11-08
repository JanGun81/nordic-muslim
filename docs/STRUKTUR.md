# Projektstruktur – Östafrikansk Butik

Denna fil beskriver hur kodbasen är organiserad, vilka lager som gäller och hur data flödar. Den uppdateras när större delar läggs till (t.ex. order-API, auth).

## Teknikstack (nuläge)

| Område | Val |
|--------|-----|
| Ramverk | Next.js 15 (App Router), React 19 |
| Språk | TypeScript |
| Styling | Tailwind CSS (`src/app/globals.css`) |
| Databas | PostgreSQL via Prisma 6 |
| PWA | `next-pwa` (aktiv i produktion, av i utveckling) |
| Tester | Vitest (unit), Playwright (E2E) |

## Arkitektur i tre lager

1. **Presentation (GUI)** – `src/app/`, `src/components/`. Sidor och komponenter. Ingen direkt databasåtkomst.
2. **Mellanlager** – `src/lib/core/services/`, `src/lib/core/repositories/` (gränssnitt). Affärslogik och abstrakt datalager.
3. **Data** – Prisma-schema `prisma/schema.prisma`, singleton `src/lib/db.ts`, implementation `*.prisma.repository.ts`.

**Regel:** API-routes anropar endast tjänster; Prisma används bara i repositories och `db.ts`.

## Katalogöversikt

```
east-african-shop/
├── docs/                    # Denna dokumentation
├── prisma/
│   ├── schema.prisma        # Category, Product, ProductVariant, Order, OrderItem (PostgreSQL)
│   └── seed.js              # Exempelkategorier och 3 produkter
├── public/                  # Statiska filer, PWA-output (workbox), manifest.json
├── src/
│   ├── app/                 # App Router: sidor + API
│   │   ├── api/categories/  # GET /api/categories
│   │   ├── api/products/    # GET /api/products och GET /api/products/[slug]
│   │   ├── bestall/         # Wizard (placeholder – ej byggd)
│   │   ├── kassa/           # Gästkassa + tacksida
│   │   ├── produkter/       # Produktlista med varukorg
│   │   ├── layout.tsx       # Root: CartProvider, lg:pr-56, CategoryNavRail (Suspense)
│   │   ├── page.tsx         # Startsida
│   │   └── globals.css      # Design tokens / Tailwind
│   ├── components/          # ProductCard, ProductGrid, CartSummary, SiteHeader, CategoryNavRail
│   └── lib/
│       ├── api-contract/    # DTO-typer + validering (t.ex. types.ts, order.ts)
│       ├── core/
│       │   ├── repositories/ # Product + Category repositories + Prisma-implementationer
│       │   ├── services/     # ProductService, CategoryService + factory (index.ts)
│       │   └── types/        # Domänmodell (t.ex. ProductWithCategory)
│       ├── cart-context.tsx  # Client-side varukorg (React Context)
│       ├── db.ts             # Prisma singleton
│       ├── demo-products.ts  # Fallback när DB saknas eller är tom
│       └── demo-categories.ts # Fallback för kategorimeny om /api/categories saknar DB
├── tests/
│   ├── e2e/                 # Playwright (startsida, länkar, API)
│   └── unit/                # Vitest (ProductService, OrderService, order-API-validering m.m.)
├── next.config.ts           # Bilder (Unsplash), PWA-wrapper
└── package.json
```

## Dataflöde: produkter

1. Klienten (`ProductGrid`) hämtar `GET /api/products`.
2. Routen `src/app/api/products/route.ts` anropar `productService.getAllProducts()`.
3. `ProductService` använder `IProductRepository` (implementation: `PrismaProductRepository`).
4. Repository läser via `prisma` från `src/lib/db.ts`.
5. Svar mappas till `ProductDto` (ISO-datumsträngar) enligt `src/lib/api-contract/types.ts`.

Om databasen saknas eller anrop misslyckas returneras tom lista; `ProductGrid` faller då tillbaka på `demo-products.ts`.

## Dataflöde: kategorier (meny)

1. `SiteHeader` (mobil) och `CategoryNavRail` (`lg+`) hämtar `GET /api/categories`.
2. Routen `src/app/api/categories/route.ts` anropar `categoryService.getAllCategories()`.
3. `CategoryService` använder `ICategoryRepository` (`PrismaCategoryRepository`).
4. Vid fel/tom DB används `demo-categories.ts` i API-svaret så menyn alltid har innehåll i utveckling.

## Navigation och layout

- **`SiteHeader`:** gemensamt sidhuvud (accent); **hamburger** under Tailwind-brytpunkt **`lg`** med utfällbar kategorilista.
- **`CategoryNavRail`:** endast **`lg` och större** – fast **högerpanel** i varma toner (inte samma röda som headern), landmark `aria-label="Butiksmenyn"`.
- **`layout.tsx`:** `body` har **`lg:pr-56`** så huvudinnehåll inte skymms av panelen. `CategoryNavRail` ligger i **`Suspense`** p.g.a. `useSearchParams` (aktiv länk för `?kategori=`).
- **`/produkter`:** serverläser `searchParams.kategori` och skickar in i `ProductGrid` för filtrering.

## Datamodell (Prisma – översikt)

| Modell | Syfte |
|--------|--------|
| **`Category`** | Produktkategori i butiken (t.ex. Dirac, Baatis). Varje `Product` har exakt en `categoryId`. |
| **`Product`** | Grundprodukt: namn, slug, pris (öre), kategori, lagerflagga m.m. |
| **`ProductVariant`** | **Variant** av samma produkt för kläd-dimensioner: valfria fält `style`, `color`, `size`, `material`, valfri `sku`, valfritt eget `priceCents` (annars ärvs pris från `Product` i affärslogik). En produkt kan ha **noll eller många** varianter – wizarden (`/bestall`) ska utgå från unika värden i dessa rader när den byggs ut (se `docs/BACKLOG.md`, EA-015). |
| **`Order` / `OrderItem`** | Beställning och orderrader. `OrderItem` har alltid `productId`; **`productVariantId` är valfri** så man kan låsa vilken färg/storlek/stil som köptes. |

**Skilj på:** *kategori* (vad för slags vara det är) vs *variant* (hur just den sälbara raden ser ut).

## Varukorg och beställning (nuläge)

- **Varukorg:** `CartProvider` i `layout.tsx`. Tillstånd endast i minnet (ingen localStorage/DB). Varukorgsrader använder ännu i huvudsak **`ProductDto`** utan variant-id – koppling till `ProductVariant` kommer med wizard/kassa-arbete.
- **Kassa:** Formulär samlar kunduppgifter; **persistens av order i DB** sker när `POST /api/orders` och kassan är kopplade (backlogg EA-002–EA-003).
- **Databas:** `Order`, `OrderItem`, `ProductVariant` finns i schemat; kör `npm run db:push` när PostgreSQL är igång så tabellerna skapas.

## API-kontrakt

Delade typer ligger i `src/lib/api-contract/`. När nya endpoints läggs till: definiera DTO här först, implementera route + tjänst, använd samma typer i klienten.

## Tester

| Plats | Syfte |
|-------|--------|
| `tests/unit/product.service.test.ts` | ProductService mot mockat repository |
| `tests/unit/order.service.test.ts`, `tests/unit/order.api.test.ts` | Orderberäkning och validering av order-payload |
| `tests/unit/category.service.test.ts` | CategoryService mot mockat repository |
| `tests/e2e/home.spec.ts` | Startsida, API products/categories, höger sidopanel på stor skärm |

Kör: `npm run test` respektive `npm run test:e2e` (kräver `npx playwright install` första gången). Playwright startar dev-server på **port 3030** som standard (se `playwright.config.ts`) så den inte krockar med manuell `npm run dev` på 3000.

## Miljövariabler

- `DATABASE_URL` – PostgreSQL-anslutningssträng (se `.env.example`).

---

## Var du står och väg framåt (checklista)

**Redan på plats:** startsida, produktlista med demo/DB-data och **filter via `?kategori=`**, **kategorimeny** (API + hamburger + höger sidopanel på stor skärm), varukorg, gästkassa med tacksida, repository-mönster för produkter och kategorier, GET `/api/products` och GET `/api/categories`, Prisma-modeller för order + produktvarianter (kör `db:push` mot Postgres), order- och kategori-tester, PWA-konfiguration, grundläggande E2E.

**Naturliga nästa steg (prioritera efter behov):**

1. **Order i drift** – `POST /api/orders`, repository som skriver `Order`/`OrderItem`; koppla kassan till API:t (backlogg EA-002–EA-003).
2. **Betalning & leverans** – t.ex. Stripe/Klarna, fraktval (kan vara senare fas).
3. **Produktdetaljsida** – route `app/produkter/[slug]/page.tsx` + `GET /api/products/[slug]` (tjänsten har redan `getProductBySlug`).
4. **Wizard på `/bestall`** – steg-för-steg enligt backlogg EA-008–EA-014.
5. **PWA-ikoner** – `public/icon-192.png` och `public/icon-512.png` (se rot-README).
6. **Auth (valfritt)** – NextAuth/Clerk när orderhistorik krävs.

Uppdatera denna fil när nya mappar eller lager tillkommer.
