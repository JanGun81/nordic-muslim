# Nordic Muslim (webbutik)

Webbutik under varumärket **Nordic Muslim** – muslimska kläder för alla tillfällen (baati, dirac, macwiis, khamis, klänningar m.m.). Byggd med Next.js (App Router), TypeScript, Prisma och Tailwind. Mobilförst, PWA-klar.

## Krav

- Node.js 20+ (rekommenderas LTS)
- PostgreSQL (lokalt, Docker, Supabase, Neon eller annan host)

## Snabbstart

```bash
# Installera beroenden
npm install

# Kopiera miljövariabler och sätt DATABASE_URL
cp .env.example .env
# Redigera .env och ange din PostgreSQL-URL
# Eller starta lokal Postgres: docker compose up -d

# Skapa tabeller (utan migreringar)
npm run db:push

# (Valfritt) Fyll med exempelprodukter
npm run db:seed

# Starta utvecklingsserver
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

Utan databas fungerar sidan fortfarande: startsidan och **Alla produkter** visar då demo-produkter (2–3 st) så att du kan testa layout och varukorg.

## Skript

| Kommando        | Beskrivning                    |
|-----------------|--------------------------------|
| `npm run dev`   | Startar Next.js i utvecklingsläge |
| `npm run build` | Bygger för produktion          |
| `npm run start` | Startar produktionsserver     |
| `npm run lint`  | Kör ESLint                    |
| `npm run db:push`  | Uppdaterar databasen (Prisma) |
| `npm run db:seed`  | Fyller med exempelkategorier och produkter |
| `npm run db:studio` | Öppnar Prisma Studio        |
| `npm run test`     | Unit-tester (Vitest)        |
| `npm run test:e2e` | E2E-tester (Playwright). Kör `npx playwright install` en gång om webbläsare saknas. |

## Projektstruktur

- **`src/app/`** – Next.js App Router (sidor, layout, API-routes)
- **`src/lib/core/`** – affärslogik: services, repositories, typer (ingen Prisma här utom i `*.prisma.repository.ts`)
- **`src/lib/api-contract/`** – delade API-typer (DTOs)
- **`src/lib/db.ts`** – enda platsen som skapar Prisma-klienten
- **`prisma/`** – schema och seed

## PWA-ikoner – vad är det och var hittar jag dem?

**Vad det är:** PWA-ikoner är de bilder som syns när någon sparar sidan som app (t.ex. "Lägg till på hemskärmen" på mobil). Projektet förväntar sig **`public/icon-192.png`** (192×192 px) och **`public/icon-512.png`** (512×512 px).

**Var hittar jag dem?** (1) Egen logotyp – exportera i 192×192 och 512×512 PNG. (2) Nätgeneratorer – [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) eller [Favicon.io](https://favicon.io/); spara filerna i `public/`. (3) Tillfällig placeholder – enkel PNG i rätt storlek. Utan filerna fungerar PWA med standardikon.

## Inloggning

Just nu finns **ingen inloggning** – beställningar görs som gäst. Inloggning kan läggas till senare (t.ex. NextAuth, Clerk) och kopplas till beställningar och orderhistorik.

## Showroom på GitHub Pages

Mappen **`showroom/`** är en statisk one-pager (HTML + CSS, inga köpknappar) som kan publiceras separat från Next.js-butiken. Webbutiken behöver **inte** byggas eller köras för att showroom ska fungera online.

### Vad som publiceras

| Sökväg | Innehåll |
|--------|----------|
| `showroom/index.html` | Sidan |
| `showroom/styles.css` | Stilar |
| `showroom/images/` | Produktbilder |
| `showroom/.nojekyll` | Säkerställer att GitHub Pages inte kör Jekyll på filerna |

Workflowen **`.github/workflows/showroom-pages.yml`** laddar upp **enbart** innehållet i `showroom/` – inte hela repot.

### Första gången (engångsinställning på GitHub)

1. Skapa/pusha repot till GitHub (standardgrenen ska heta **`main`**, annars uppdatera `branches` i workflow-filen).
2. **Settings → Actions → General** – tillåt workflows (vanligtvis redan på).
3. **Settings → Pages → Build and deployment**
   - **Source:** välj **GitHub Actions** (inte "Deploy from a branch" – Pages kan inte peka direkt på undermappen `showroom/`).
4. Pusha en ändring under `showroom/` (eller kör workflow manuellt, se nedan).

Efter första lyckade deploy visas den publika URL:en under **Settings → Pages**, ungefär:

`https://<ditt-github-användarnamn>.github.io/<repo-namn>/`

Exempel: repot `east-african-shop` → `https://jangu.github.io/east-african-shop/`

### Automatisk deploy

Vid **push till `main`** som rör något av följande körs deploy automatiskt:

- filer under `showroom/`
- `.github/workflows/showroom-pages.yml`

Följ status under **Actions** → *Deploy showroom to GitHub Pages*.

**Manuell deploy:** **Actions** → välj workflowen → **Run workflow**.

### Lokal förhandsvisning (innan push)

Från repo-roten:

```bash
npx --yes serve showroom -l 3456
```

Öppna [http://localhost:3456](http://localhost:3456).

Alternativt: öppna `showroom/index.html` direkt i webbläsaren (relativa länkar till `./images/...` fungerar).

### Lägga till eller ändra produkter

1. Lägg bilder i **`showroom/images/`** (beskrivande filnamn utan mellanslag, t.ex. `abaya_brun.jpg`).
2. I **`showroom/index.html`**: ett kort per modelltyp (`<figure class="card">`) med:
   - `src="./images/ditt-filnamn.jpg"` (relativ sökväg – viktigt på Pages)
   - **Storlek**, **Pris**, **Färg** i `<dl class="plagg-meta">` (kopiera struktur från befintliga kort).
3. Stilar i **`showroom/styles.css`** (ren CSS, ingen `npm run build`).

Mer detaljer om bilder: **`showroom/images/README.md`**. Kort översikt av showroom-mappen: **`showroom/README.md`**.

### Felsökning

| Problem | Åtgärd |
|---------|--------|
| Workflow körs inte | Kontrollera att ändringen ligger under `showroom/` eller workflow-filen, och att du pushat till `main`. |
| Pages visar README från root | **Source** ska vara **GitHub Actions**, inte branch `/ (root)`. |
| Bilder syns lokalt men inte online | Använd `./images/...`, inte absoluta sökvägar. Committa och pusha bildfilerna. |
| 404 på CSS/bilder | Filnamn skiftlägeskänsliga på Pages – matcha exakt som i `index.html`. |
| Gammal version syns | Vänta 1–2 min efter grön workflow; prova hård omladdning (Ctrl+F5). |
| Osnygg sida, jättebild / zoom i vägen | Ofta fel deploy (rot-HTML eller CSS som inte laddas). Källa ska vara **GitHub Actions**; öppna rot-URL, inte `/showroom/`. |
| Först trasig sida, sedan 404 | Vanligt vid byte till Actions om deploy misslyckades – kör workflow manuellt under **Actions** efter push till `main`. |

**Obs:** GitHub **Codespaces** är för utveckling i molnet – inte hosting. För publik showroom är **GitHub Pages** rätt val.

## Licens

Privat projekt.
