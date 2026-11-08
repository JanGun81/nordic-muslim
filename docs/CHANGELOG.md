# Ändringslogg

Kort logg över relevanta produkt-/varumärkes- och UI-ändringar (ej full git-historik).

## 2026-11-08

### Order och kassa

- **EA-003 / EA-004:** kassan postar till `POST /api/orders`, visar fel och ordernummer. E2E från varukorg till tacksida.

### Produkt och varianter

- **EA-006:** `GET /api/products/[slug]` med DTO (inkl. `variants`), fallback till demo.
- **EA-005:** produktdetalj `/produkter/[slug]` med färgval, zoom och lägg i varukorg.
- **EA-015:** `ProductVariant.imageUrl`, varianter i API/seed/demo, `productVariantId` i varukorg och order.

### Drift

- `docker-compose.yml` för lokal Postgres (`user`/`password`/`east_african_shop` på port 5432).

## 2026-05-11

### Varumärke och synlig text (Nordic Muslim)

- **`SiteHeader` (startsida):** Rubrik **Nordic Muslim** (utan undertitel-tagline). Underrad: **Baati · Dirac · Macwiis · Khamis · klänningar & mer**.
- **`src/app/layout.tsx`:** `metadata.title` = "Nordic Muslim"; beskrivning uppdaterad till muslimska kläder (Baati, Dirac, Macwiis, Khamis, klänningar och mer).
- **`public/manifest.json`:** `name`, `short_name` ("Nordic Muslim") och `description` justerade.
- **`src/app/page.tsx`:** Hero-text, footer och "Populära kategorier" (Baati, Dirac, Macwiis, Khamis, Klänningar) matchar sortimentsraden. `Baati` länkar till befintlig slug `baatis` så seedade produkter hittas; `khamis` och `klanningar` är nya slugs som DB/seed får komplettera senare.
- **`src/lib/demo-categories.ts`:** Offline-/fallback-menyn speglar samma fem kategorier.
- **`README.md`:** Projektintro pekar på Nordic Muslim (repo kan fortfarande heta `east-african-shop`).

### Navigation

- **`CategoryNavRail`:** Tidigare flytt till vänster (`fixed left-0`, `border-r`, skugga åt höger) återställdes efter revert och är nu på plats igen tillsammans med `lg:pl-56` i `layout.tsx`.

### Backlogg

- **`EA-017`** (re)tillagd i `docs/BACKLOG.md` med uppdaterad beskrivning enligt ovan; `EA-016`-raden återigen justerad till vänsterpanel.

### Tester

- **`tests/e2e/home.spec.ts`:** Förväntad rubrik (`/^nordic muslim$/i`), sortimentsrad, hero-text och sidopanelstext uppdaterade.

### Statisk showroom (GitHub Pages)

- **`showroom/`:** Ren `index.html` + `styles.css`, inget JS, inga API-anrop. Exempelbilder via Unsplash (byt till egna filer/URL:er).
- **`.github/workflows/showroom-pages.yml`:** Publicerar enbart `showroom/` till GitHub Pages när `showroom/` eller workflowen ändras på `main`.
- **`showroom/README.md`:** Steg för att aktivera Pages (GitHub Actions) och lokal förhandsvisning.

## 2026-05-03 (referens)

Tidigare Nordic Muslim-rebrand med tagline "Kläder för alla tillfällen" och kategorierna Abaya/Dirac/Baati/sjalar/Khamis/macwiis. Den varianten revertades innan merge; aktuell text och kategorilista är den ovan (2026-05-11).
