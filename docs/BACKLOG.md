# Backlogg – Östafrikansk Butik

Levande backlogg för iterativ utveckling. Uppdateras löpande.

## Arbetssätt

- Prioritering: `P1` (högst), `P2`, `P3`.
- Status: `todo`, `in progress`, `done`, `blocked`.
- Testförst: varje post ska börja med tester (unit/API/E2E beroende på typ).
- Branch:
  - `feature/...` för implementation
  - `test/...` för testarbete

## Epics (två spår)

Arbetet delas i **två separata epics**. Kundwebben går först; admin kommer när huvudfunktionaliteten finns på plats. Detaljer under admin-epic **förfines senare**.

### Epic A – Kundwebb (boutique för besökare)

Mål: komplett kundresa i webbappen – produkter, varukorg, beställning, betalning/leverans i den ordning backloggen anger. Alla befintliga tickets `EA-001` och uppåt i tabellerna nedan hör till denna epic så länge inget annat anges.

### Epic B – Admin (administrera webbappen)

Mål: skyddad yta där du kan sköta sortiment och ev. inlägg utan att röra kod. **Startas efter Epic A:s kärna** (orderflöde m.m. enligt din prioritering). Omfattning och uppdelning i mindre stories refinas löpande.

Grovmalad backlogg för Epic B (ersätts eller bryts ned i mindre poster när du tar tag i epicken):

| ID | Prioritet | Typ | Beskrivning | Tester först | Status |
|----|-----------|-----|-------------|--------------|--------|
| ADM-001 | P2 | Auth | Inloggning / session för admin-yta (leverantör väljs senare) | Unit + E2E | todo |
| ADM-002 | P2 | Admin UI | Grundläggande `/admin`-layout och navigation | E2E | todo |
| ADM-003 | P2 | CRUD | Skapa/redigera/ta bort produkter (och ev. kategorier) via API + formulär | API + Unit + E2E | todo |
| ADM-004 | P3 | Innehåll | Ev. blogg/inlägg eller sidtexter – scope bestäms senare | TBD | todo |

## Nuvarande iteration

| ID | Prioritet | Typ | Beskrivning | Tester först | Status |
|----|-----------|-----|-------------|--------------|--------|
| EA-001 | P1 | Backend | Lägg till Prisma-modeller för `Order` och `OrderItem` | Unit + API | done |
| EA-002 | P1 | API | Skapa `POST /api/orders` via service/repository-lager | API + Unit | done |
| EA-003 | P1 | Frontend | Koppla `/kassa` till order-API (ersätt demo-submit) | Unit + E2E | done |
| EA-004 | P1 | E2E | BDD-scenario: lyckad beställning från varukorg till tacksida | Playwright | done |
| EA-017 | P2 | Branding | **Nordic Muslim:** rubrik "Nordic Muslim", sortimentsrad "Baati · Dirac · Macwiis · Khamis · klänningar & mer" i header/metadata/manifest/PWA. Startsida (hero, footer, populära kategorier) och `demo-categories` justerade. README + `docs/CHANGELOG.md`. Kategorirail **vänster** (`lg:pl-56`). E2E `home.spec` följer ny copy. *Nästa steg:* seed/DB-kategorier i linje med nya chips. | E2E + manuell | done |

## Nästa iteration

Fokus efter P1-orderflödet: produktvyer **och** beställningswizarden på `/bestall` (EA-008–EA-015). **EA-016** och **EA-007** (grunden för kategorimeny/filter) är klara – se nedan.

### Wizard `/bestall` – önskat flöde (översikt)

0. **Tomt sortiment (EA-014):** om det **inte finns några produkter alls** (ingen rader i utbudet som wizarden kan bygga på): visa endast meddelandet **"Väntar på fler produkter"** och en **Tillbaka**-knapp som leder till **startsidan** (`/`). Ingen wizard-steglista i det läget.
1. **Steg 1 (EA-008):** arrangemang (t.ex. Vardag, Festligt, Natt, Bön); valbart endast om utbud finns, annars utgråat + t.ex. "Kommer snart".
2. **Steg 2 (EA-012):** val som beror på utbud – data hämtas från **`ProductVariant`** (EA-015): i första hand **stil** om det finns i data, annars **färg**; därefter **storlek**; **material** (eller fler dimensioner) kan läggas till senare. Exakt ordning och hoppade steg styrs av tillgängliga värden per produkt/arrangemang.
3. **Avslut (EA-013):** när sista obligatoriska valet är gjort: **Lägg i varukorg** → wizarden **stängs** / nollställs → användaren tillbaka till **början** (samma ingång som innan wizard, t.ex. tom wizard på `/bestall` eller redirect enligt slutlig UX – förfines).

| ID | Prioritet | Typ | Beskrivning | Tester först | Status |
|----|-----------|-----|-------------|--------------|--------|
| EA-005 | P2 | Frontend | Produktdetaljsida `produkter/[slug]` | Unit + E2E | done |
| EA-016 | P2 | Frontend | **Kategorimeny / navigation (klar):** `GET /api/categories`, `CategoryService` + repository. **Mindre än lg:** hamburger i `SiteHeader` med kategorilänkar. **lg och uppåt:** **vänster** sidopanel (`CategoryNavRail`, varma toner) – `layout.tsx` reserverar `lg:pl-56` (uppdaterat i EA-017). Startsidans "Populära kategorier" länkar till `/produkter?kategori=`. | E2E + Unit | done |
| EA-006 | P2 | API | `GET /api/products/[slug]` med DTO-kontrakt | API + Unit | done |
| EA-007 | P2 | Frontend | **Kategorifilter (klar i grunden):** `ProductGrid` filtrerar på `?kategori=<slug>`; meny driver valet. Ev. komplettering: filterchips/rad på själva produktsidan senare. | E2E + Unit | done |
| EA-008 | P2 | UX | Wizard **steg 1**: arrangemang (t.ex. Vardag, Festligt, Natt, Bön). Aktiv endast om kopplat utbud finns; annars utgråat + sekundärtext ("Kommer snart"). Produkt↔arrangemang i datamodell föreslås vid implementation. | E2E + Unit | todo |
| EA-012 | P2 | UX | Wizard **steg 2**: dynamiska val utifrån **`ProductVariant`** – **stil** om tillgänglig (annars nästa dimension), **färg**, **storlek**, ev. **material**. Endast värden som faktiskt finns i utbud ska vara valbara; övriga utgråade enligt samma princip som steg 1. | E2E + Unit | todo |
| EA-013 | P2 | UX | Wizard **avslut**: efter sista valet – lägg konfigurerad rad i **varukorg**, stäng/nollställ wizard, användaren till **början** av flödet. | E2E + Unit | todo |
| EA-014 | P2 | UX | `/bestall` vid **helt tomt produktutbud**: visa **"Väntar på fler produkter"** + **Tillbaka** till `/` (startsida). Gäller när API/demo saknar alla produkter. | E2E | todo |
| EA-015 | P2 | Backend | **`ProductVariant`**: rader per produkt med valfria fält `style`, `color`, `size`, `material`, `imageUrl` (+ valfri `sku`, eget `priceCents` eller ärvt från `Product`). **`OrderItem.productVariantId`** valfri FK för att låsa köpt variant. API, seed och varukorg kopplade; wizard återstår. | Unit + API | done |

## Senare

| ID | Prioritet | Typ | Beskrivning | Tester först | Status |
|----|-----------|-----|-------------|--------------|--------|
| EA-009 | P3 | PWA | Lägg till `icon-192.png` och `icon-512.png` | N/A | todo |
| EA-010 | P3 | Payments | Förstudie betalning (Stripe/Klarna) | API-kontraktstester | todo |
| EA-011 | P3 | Auth | Förstudie inloggning/orderhistorik | Unit + E2E | todo |

## Definition of Done (DoD)

En backloggpost är klar när:

1. Tester har skrivits före implementation.
2. Relevanta tester är gröna lokalt.
3. Kod följer arkitekturreglerna (API -> service -> repository).
4. Dokumentation/backlogg är uppdaterad vid behov.
5. Ändringen är pushad i rätt branch och redo för PR.
