# Panini 2026 Album Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first Spanish web app to track the Panini Mundial 2026 album, using a local dataset extracted from `paniniwm2026sticker.com`.

**Architecture:** Vite + React + TypeScript app with a bundled read-only sticker dataset and browser-local personal progress. Data extraction and validation live in `scripts/`; pure progress logic lives in `src/domain/`; persistence lives in `src/storage/`; UI pages compose reusable components.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, localStorage, Node scripts.

---

## File Structure

- `package.json`: npm scripts and dependencies.
- `index.html`, `vite.config.ts`, `tsconfig*.json`: Vite and TypeScript setup.
- `scripts/extractStickers.mjs`: fetches/parses the source site into `src/data/stickers.json`.
- `scripts/validateDataset.ts`: validates dataset counts, duplicate codes, image gaps, and crack links.
- `scripts/fixtures/missing-stickers-list.html`: parser fixture copied from a small source sample.
- `src/data/stickers.json`: generated sticker snapshot.
- `src/data/datasetMeta.ts`: dataset version/source metadata.
- `src/data/cracks.ts`: fixed crack list by team.
- `src/domain/types.ts`: shared domain types.
- `src/domain/progress.ts`: pure progress calculations.
- `src/domain/progress.test.ts`: tests for progress calculations.
- `src/domain/datasetValidation.ts`: dataset validation helpers used by scripts/tests.
- `src/domain/datasetValidation.test.ts`: dataset validation tests.
- `src/storage/collectionStorage.ts`: localStorage import/export and mutation helpers.
- `src/storage/collectionStorage.test.ts`: persistence tests.
- `src/App.tsx`: page shell, navigation, state wiring.
- `src/main.tsx`: React entry.
- `src/styles.css`: app styling.
- `src/components/*.tsx`: reusable dashboard, filters, cards, and tables.
- `src/pages/*.tsx`: Dashboard, Album, Equipo, Repetidas, Faltantes, Ajustes.

---

### Task 1: Scaffold The App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create project metadata and scripts**

Create `package.json`:

```json
{
  "name": "panini-2026-album-tracker",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "extract:data": "node scripts/extractStickers.mjs",
    "validate:data": "tsx scripts/validateDataset.ts"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "typescript": "^5.8.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^26.0.0",
    "tsx": "^4.20.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Add Vite and TypeScript config**

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"]
  }
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: Add the minimal React shell**

Create `index.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Album Panini Mundial 2026</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>Album Panini Mundial 2026</h1>
      <p>Preparando tu tracker local del album.</p>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #18202f;
  background: #f6f7f2;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.app-shell {
  min-height: 100vh;
  padding: 32px;
}
```

- [ ] **Step 4: Install dependencies**

Run: `npm install --cache '.npm-cache'`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 5: Verify scaffold**

Run: `npm --cache '.npm-cache' run build`

Expected: TypeScript and Vite production build pass.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.node.json src
git commit -m "chore: scaffold panini tracker app"
```

---

### Task 2: Add Domain Types And Progress Logic

**Files:**
- Create: `src/test/setup.ts`
- Create: `src/domain/types.ts`
- Create: `src/domain/progress.ts`
- Create: `src/domain/progress.test.ts`

- [ ] **Step 1: Add test setup**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write failing progress tests**

Create `src/domain/progress.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { CollectionState, Sticker } from "./types";
import {
  getDuplicateStickers,
  getMissingStickers,
  getOverallProgress,
  getTeamProgress
} from "./progress";

const stickers: Sticker[] = [
  {
    id: "arg-1",
    code: "ARG01",
    team: "Argentina",
    group: "Grupo J",
    number: 1,
    category: "Player",
    rarity: "Base",
    name: "Lionel Messi",
    isCrack: true,
    imageUrl: "",
    sourceUrl: "https://paniniwm2026sticker.com/"
  },
  {
    id: "arg-2",
    code: "ARG02",
    team: "Argentina",
    group: "Grupo J",
    number: 2,
    category: "Player",
    rarity: "Base",
    name: "Julian Alvarez",
    isCrack: false,
    imageUrl: "",
    sourceUrl: "https://paniniwm2026sticker.com/"
  },
  {
    id: "bra-1",
    code: "BRA01",
    team: "Brasil",
    group: "Grupo C",
    number: 1,
    category: "Player",
    rarity: "Foil",
    name: "Vinicius Junior",
    isCrack: true,
    imageUrl: "",
    sourceUrl: "https://paniniwm2026sticker.com/"
  }
];

const collection: CollectionState = {
  ARG01: { owned: true, duplicates: 2, notes: "", updatedAt: "2026-05-20T12:00:00.000Z" },
  BRA01: { owned: true, duplicates: 0, notes: "", updatedAt: "2026-05-20T12:00:00.000Z" }
};

describe("progress calculations", () => {
  it("calculates overall completion, missing, duplicates, and cracks", () => {
    expect(getOverallProgress(stickers, collection)).toEqual({
      total: 3,
      owned: 2,
      missing: 1,
      duplicates: 2,
      completionPercent: 67,
      cracksTotal: 2,
      cracksOwned: 2,
      cracksCompletionPercent: 100
    });
  });

  it("calculates team progress", () => {
    expect(getTeamProgress(stickers, collection)).toEqual([
      {
        team: "Argentina",
        group: "Grupo J",
        total: 2,
        owned: 1,
        missing: 1,
        duplicates: 2,
        completionPercent: 50,
        cracksTotal: 1,
        cracksOwned: 1,
        cracksCompletionPercent: 100
      },
      {
        team: "Brasil",
        group: "Grupo C",
        total: 1,
        owned: 1,
        missing: 0,
        duplicates: 0,
        completionPercent: 100,
        cracksTotal: 1,
        cracksOwned: 1,
        cracksCompletionPercent: 100
      }
    ]);
  });

  it("returns missing and duplicate sticker lists", () => {
    expect(getMissingStickers(stickers, collection).map((sticker) => sticker.code)).toEqual(["ARG02"]);
    expect(getDuplicateStickers(stickers, collection).map((item) => [item.sticker.code, item.duplicates])).toEqual([
      ["ARG01", 2]
    ]);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run: `npm --cache '.npm-cache' run test -- src/domain/progress.test.ts`

Expected: FAIL because `types.ts` and `progress.ts` do not exist.

- [ ] **Step 4: Add domain types**

Create `src/domain/types.ts`:

```ts
export type StickerRarity = "Base" | "Foil" | "Special" | string;

export type Sticker = {
  id: string;
  code: string;
  team: string;
  group: string;
  number: number;
  category: string;
  rarity: StickerRarity;
  name: string;
  isCrack: boolean;
  imageUrl: string;
  sourceUrl: string;
};

export type CollectionEntry = {
  owned: boolean;
  duplicates: number;
  notes: string;
  updatedAt: string;
};

export type CollectionState = Record<string, CollectionEntry>;

export type OverallProgress = {
  total: number;
  owned: number;
  missing: number;
  duplicates: number;
  completionPercent: number;
  cracksTotal: number;
  cracksOwned: number;
  cracksCompletionPercent: number;
};

export type TeamProgress = OverallProgress & {
  team: string;
  group: string;
};
```

- [ ] **Step 5: Implement progress functions**

Create `src/domain/progress.ts`:

```ts
import type { CollectionState, OverallProgress, Sticker, TeamProgress } from "./types";

function isOwned(sticker: Sticker, collection: CollectionState): boolean {
  const entry = collection[sticker.code];
  return Boolean(entry?.owned || (entry?.duplicates ?? 0) > 0);
}

function percent(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function countDuplicates(stickers: Sticker[], collection: CollectionState): number {
  return stickers.reduce((sum, sticker) => sum + Math.max(0, collection[sticker.code]?.duplicates ?? 0), 0);
}

export function getOverallProgress(stickers: Sticker[], collection: CollectionState): OverallProgress {
  const owned = stickers.filter((sticker) => isOwned(sticker, collection)).length;
  const cracks = stickers.filter((sticker) => sticker.isCrack);
  const cracksOwned = cracks.filter((sticker) => isOwned(sticker, collection)).length;

  return {
    total: stickers.length,
    owned,
    missing: stickers.length - owned,
    duplicates: countDuplicates(stickers, collection),
    completionPercent: percent(owned, stickers.length),
    cracksTotal: cracks.length,
    cracksOwned,
    cracksCompletionPercent: percent(cracksOwned, cracks.length)
  };
}

export function getTeamProgress(stickers: Sticker[], collection: CollectionState): TeamProgress[] {
  const byTeam = new Map<string, Sticker[]>();

  for (const sticker of stickers) {
    byTeam.set(sticker.team, [...(byTeam.get(sticker.team) ?? []), sticker]);
  }

  return [...byTeam.entries()]
    .map(([team, teamStickers]) => ({
      team,
      group: teamStickers[0]?.group ?? "",
      ...getOverallProgress(teamStickers, collection)
    }))
    .sort((a, b) => a.team.localeCompare(b.team, "es"));
}

export function getMissingStickers(stickers: Sticker[], collection: CollectionState): Sticker[] {
  return stickers.filter((sticker) => !isOwned(sticker, collection));
}

export function getDuplicateStickers(stickers: Sticker[], collection: CollectionState) {
  return stickers
    .map((sticker) => ({
      sticker,
      duplicates: Math.max(0, collection[sticker.code]?.duplicates ?? 0)
    }))
    .filter((item) => item.duplicates > 0);
}
```

- [ ] **Step 6: Run progress tests**

Run: `npm --cache '.npm-cache' run test -- src/domain/progress.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/test/setup.ts src/domain
git commit -m "feat: add album progress calculations"
```

---

### Task 3: Add Dataset Validation And Crack Linking

**Files:**
- Create: `src/data/cracks.ts`
- Create: `src/data/stickers.json`
- Create: `src/data/datasetMeta.ts`
- Create: `src/domain/datasetValidation.ts`
- Create: `src/domain/datasetValidation.test.ts`
- Create: `scripts/validateDataset.ts`

- [ ] **Step 1: Write failing dataset validation tests**

Create `src/domain/datasetValidation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Sticker } from "./types";
import { linkCracks, validateDataset } from "./datasetValidation";

const stickers: Sticker[] = [
  {
    id: "arg-1",
    code: "ARG01",
    team: "Argentina",
    group: "Grupo J",
    number: 1,
    category: "Player",
    rarity: "Base",
    name: "Lionel Messi",
    isCrack: false,
    imageUrl: "https://example.com/messi.jpg",
    sourceUrl: "https://paniniwm2026sticker.com/"
  },
  {
    id: "arg-1-copy",
    code: "ARG01",
    team: "Argentina",
    group: "Grupo J",
    number: 2,
    category: "Player",
    rarity: "Base",
    name: "",
    isCrack: false,
    imageUrl: "",
    sourceUrl: "https://paniniwm2026sticker.com/"
  }
];

describe("dataset validation", () => {
  it("reports duplicate codes and missing fields", () => {
    expect(validateDataset(stickers, [{ team: "Argentina", name: "Lionel Messi" }])).toEqual({
      total: 2,
      byTeam: { Argentina: 2 },
      duplicateCodes: ["ARG01"],
      missingNames: ["ARG01"],
      missingImageUrls: ["ARG01"],
      unlinkedCracks: []
    });
  });

  it("links crack definitions by normalized team and name", () => {
    const linked = linkCracks(stickers, [{ team: "Argentina", name: "lionel messi" }]);
    expect(linked[0].isCrack).toBe(true);
    expect(linked[1].isCrack).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm --cache '.npm-cache' run test -- src/domain/datasetValidation.test.ts`

Expected: FAIL because `datasetValidation.ts` does not exist.

- [ ] **Step 3: Add crack definitions and seed dataset**

Create `src/data/cracks.ts`:

```ts
export type CrackDefinition = {
  team: string;
  name: string;
  code?: string;
};

export const cracks: CrackDefinition[] = [
  { team: "Argentina", name: "Lionel Messi" },
  { team: "Brasil", name: "Vinicius Junior" },
  { team: "Estados Unidos", name: "Christian Pulisic" },
  { team: "Egipto", name: "Mohamed Salah" },
  { team: "Francia", name: "Kylian Mbappe" },
  { team: "Inglaterra", name: "Harry Kane" },
  { team: "Noruega", name: "Erling Haaland" },
  { team: "Portugal", name: "Cristiano Ronaldo" },
  { team: "Espana", name: "Lamine Yamal" },
  { team: "Uruguay", name: "Federico Valverde" }
];
```

Create `src/data/stickers.json`:

```json
[
  {
    "id": "arg-1",
    "code": "ARG01",
    "team": "Argentina",
    "group": "Grupo J",
    "number": 1,
    "category": "Player",
    "rarity": "Base",
    "name": "Lionel Messi",
    "isCrack": true,
    "imageUrl": "",
    "sourceUrl": "https://paniniwm2026sticker.com/"
  }
]
```

Create `src/data/datasetMeta.ts`:

```ts
export const datasetMeta = {
  version: "2026-05-20-initial",
  sourceUrl: "https://paniniwm2026sticker.com/",
  generatedAt: "2026-05-20"
};
```

- [ ] **Step 4: Implement dataset validation**

Create `src/domain/datasetValidation.ts`:

```ts
import type { CrackDefinition } from "../data/cracks";
import type { Sticker } from "./types";

export type DatasetValidationReport = {
  total: number;
  byTeam: Record<string, number>;
  duplicateCodes: string[];
  missingNames: string[];
  missingImageUrls: string[];
  unlinkedCracks: CrackDefinition[];
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function crackMatches(sticker: Sticker, crack: CrackDefinition): boolean {
  if (crack.code && sticker.code === crack.code) return true;
  return normalize(sticker.team) === normalize(crack.team) && normalize(sticker.name) === normalize(crack.name);
}

export function linkCracks(stickers: Sticker[], cracks: CrackDefinition[]): Sticker[] {
  return stickers.map((sticker) => ({
    ...sticker,
    isCrack: cracks.some((crack) => crackMatches(sticker, crack))
  }));
}

export function validateDataset(stickers: Sticker[], cracks: CrackDefinition[]): DatasetValidationReport {
  const seenCodes = new Set<string>();
  const duplicateCodes = new Set<string>();
  const byTeam: Record<string, number> = {};

  for (const sticker of stickers) {
    byTeam[sticker.team] = (byTeam[sticker.team] ?? 0) + 1;
    if (seenCodes.has(sticker.code)) duplicateCodes.add(sticker.code);
    seenCodes.add(sticker.code);
  }

  return {
    total: stickers.length,
    byTeam,
    duplicateCodes: [...duplicateCodes].sort(),
    missingNames: stickers.filter((sticker) => !sticker.name.trim()).map((sticker) => sticker.code),
    missingImageUrls: stickers.filter((sticker) => !sticker.imageUrl.trim()).map((sticker) => sticker.code),
    unlinkedCracks: cracks.filter((crack) => !stickers.some((sticker) => crackMatches(sticker, crack)))
  };
}
```

- [ ] **Step 5: Add validation script**

Create `scripts/validateDataset.ts`:

```ts
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { cracks } from "../src/data/cracks";
import { validateDataset } from "../src/domain/datasetValidation";
import type { Sticker } from "../src/domain/types";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const stickersPath = path.join(root, "src", "data", "stickers.json");

const stickers = JSON.parse(await readFile(stickersPath, "utf8")) as Sticker[];
const report = validateDataset(stickers, cracks);

console.log(JSON.stringify(report, null, 2));

if (report.total === 0 || report.duplicateCodes.length > 0) {
  process.exitCode = 1;
}
```

- [ ] **Step 6: Run dataset tests**

Run: `npm --cache '.npm-cache' run test -- src/domain/datasetValidation.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data src/domain/datasetValidation.ts src/domain/datasetValidation.test.ts scripts/validateDataset.ts
git commit -m "feat: add dataset validation and crack linking"
```

---

### Task 4: Build Source Extraction Script

**Files:**
- Create: `scripts/extractStickers.mjs`
- Create: `scripts/fixtures/missing-stickers-list.html`
- Create: `scripts/extractStickers.test.mjs`
- Modify: `src/data/stickers.json`

- [ ] **Step 1: Create parser fixture**

Create `scripts/fixtures/missing-stickers-list.html`:

```html
<html>
  <body>
    <main>
      <p>ARG01 Argentina Player Base Lionel Messi</p>
      <p>ARG02 Argentina Player Base Julian Alvarez</p>
      <p>BRA01 Brasil Player Foil Vinicius Junior</p>
    </main>
  </body>
</html>
```

- [ ] **Step 2: Add extraction script with exported parser**

Create `scripts/extractStickers.mjs`:

```js
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourceUrl = "https://paniniwm2026sticker.com/missing-stickers-list";

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function parseStickerText(text) {
  const lines = text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const stickers = [];
  const pattern = /^([A-Z]{2,4}\d{1,3})\s+(.+?)\s+(Player|Team Badge|Team Photo|Special)\s+(Base|Foil|Special)\s+(.+)$/i;

  for (const line of lines) {
    const match = line.match(pattern);
    if (!match) continue;

    const [, code, team, category, rarity, name] = match;
    const numberMatch = code.match(/(\d+)$/);

    stickers.push({
      id: slug(code),
      code,
      team: team.trim(),
      group: "",
      number: numberMatch ? Number(numberMatch[1]) : stickers.length + 1,
      category,
      rarity,
      name: name.trim(),
      isCrack: false,
      imageUrl: "",
      sourceUrl
    });
  }

  return stickers;
}

export async function extractFromSource(fetchImpl = fetch) {
  const response = await fetchImpl(sourceUrl);
  if (!response.ok) {
    throw new Error(`No se pudo leer la fuente: ${response.status} ${response.statusText}`);
  }
  return parseStickerText(await response.text());
}

async function main() {
  const stickers = await extractFromSource();
  const target = path.join(root, "src", "data", "stickers.json");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(stickers, null, 2)}\n`, "utf8");
  console.log(`Generated ${stickers.length} stickers at ${target}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
```

- [ ] **Step 3: Add parser smoke test**

Create `scripts/extractStickers.test.mjs`:

```js
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseStickerText } from "./extractStickers.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

describe("extractStickers parser", () => {
  it("parses checklist-like text into stickers", async () => {
    const html = await readFile(path.join(root, "scripts", "fixtures", "missing-stickers-list.html"), "utf8");
    const stickers = parseStickerText(html);
    expect(stickers.map((sticker) => sticker.code)).toEqual(["ARG01", "ARG02", "BRA01"]);
    expect(stickers[0]).toMatchObject({
      team: "Argentina",
      category: "Player",
      rarity: "Base",
      name: "Lionel Messi"
    });
  });
});
```

- [ ] **Step 4: Run parser test**

Run: `npm --cache '.npm-cache' run test -- scripts/extractStickers.test.mjs`

Expected: PASS.

- [ ] **Step 5: Run real extraction**

Run: `npm run extract:data`

Expected: `src/data/stickers.json` is regenerated from the source and the console prints the generated count. If network access is blocked, rerun with approval or use a saved source snapshot in `scripts/fixtures/`.

- [ ] **Step 6: Run dataset validation**

Run: `npm run validate:data`

Expected: validation report prints JSON. Duplicate codes should be empty. Missing images can be non-empty for MVP.

- [ ] **Step 7: Commit**

```bash
git add scripts src/data/stickers.json
git commit -m "feat: extract sticker dataset from source"
```

---

### Task 5: Add Local Collection Storage

**Files:**
- Create: `src/storage/collectionStorage.ts`
- Create: `src/storage/collectionStorage.test.ts`

- [ ] **Step 1: Write failing storage tests**

Create `src/storage/collectionStorage.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import {
  COLLECTION_STORAGE_KEY,
  clearCollection,
  exportCollection,
  importCollection,
  loadCollection,
  setDuplicates,
  toggleOwned
} from "./collectionStorage";

beforeEach(() => {
  localStorage.clear();
});

describe("collectionStorage", () => {
  it("toggles owned state and persists it", () => {
    toggleOwned("ARG01", true);
    expect(loadCollection().ARG01.owned).toBe(true);

    toggleOwned("ARG01", false);
    expect(loadCollection().ARG01.owned).toBe(false);
  });

  it("infers owned when duplicates are above zero", () => {
    setDuplicates("ARG01", 2);
    expect(loadCollection().ARG01).toMatchObject({ owned: true, duplicates: 2 });
  });

  it("exports and imports collection JSON", () => {
    setDuplicates("ARG01", 1);
    const exported = exportCollection("dataset-v1");
    clearCollection();
    importCollection(exported);
    expect(loadCollection().ARG01.duplicates).toBe(1);
    expect(JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY) ?? "{}").datasetVersion).toBe("dataset-v1");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm --cache '.npm-cache' run test -- src/storage/collectionStorage.test.ts`

Expected: FAIL because `collectionStorage.ts` does not exist.

- [ ] **Step 3: Implement storage module**

Create `src/storage/collectionStorage.ts`:

```ts
import type { CollectionEntry, CollectionState } from "../domain/types";

export const COLLECTION_STORAGE_KEY = "panini-2026-collection";

type StoredCollection = {
  datasetVersion: string;
  entries: CollectionState;
};

function now(): string {
  return new Date().toISOString();
}

function emptyEntry(): CollectionEntry {
  return {
    owned: false,
    duplicates: 0,
    notes: "",
    updatedAt: now()
  };
}

function loadStored(): StoredCollection {
  const raw = localStorage.getItem(COLLECTION_STORAGE_KEY);
  if (!raw) return { datasetVersion: "", entries: {} };

  try {
    const parsed = JSON.parse(raw) as StoredCollection;
    return {
      datasetVersion: parsed.datasetVersion ?? "",
      entries: parsed.entries ?? {}
    };
  } catch {
    return { datasetVersion: "", entries: {} };
  }
}

function saveStored(stored: StoredCollection): void {
  localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(stored));
}

export function loadCollection(): CollectionState {
  return loadStored().entries;
}

export function toggleOwned(code: string, owned: boolean): CollectionState {
  const stored = loadStored();
  const current = stored.entries[code] ?? emptyEntry();
  stored.entries[code] = {
    ...current,
    owned,
    updatedAt: now()
  };
  saveStored(stored);
  return stored.entries;
}

export function setDuplicates(code: string, duplicates: number): CollectionState {
  const stored = loadStored();
  const current = stored.entries[code] ?? emptyEntry();
  const safeDuplicates = Math.max(0, Math.floor(duplicates));
  stored.entries[code] = {
    ...current,
    owned: current.owned || safeDuplicates > 0,
    duplicates: safeDuplicates,
    updatedAt: now()
  };
  saveStored(stored);
  return stored.entries;
}

export function exportCollection(datasetVersion: string): string {
  const stored = loadStored();
  return JSON.stringify({ ...stored, datasetVersion }, null, 2);
}

export function importCollection(json: string): CollectionState {
  const parsed = JSON.parse(json) as StoredCollection;
  if (!parsed || typeof parsed !== "object" || !parsed.entries) {
    throw new Error("El respaldo no tiene el formato esperado.");
  }
  saveStored({
    datasetVersion: parsed.datasetVersion ?? "",
    entries: parsed.entries
  });
  return parsed.entries;
}

export function clearCollection(): void {
  localStorage.removeItem(COLLECTION_STORAGE_KEY);
}
```

- [ ] **Step 4: Run storage tests**

Run: `npm --cache '.npm-cache' run test -- src/storage/collectionStorage.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/storage
git commit -m "feat: add local collection storage"
```

---

### Task 6: Build Reusable UI Components

**Files:**
- Create: `src/components/StickerCard.tsx`
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/TeamProgressTable.tsx`
- Create: `src/components/StickerFilters.tsx`
- Create: `src/components/StatTile.tsx`

- [ ] **Step 1: Add progress and stat components**

Create `src/components/ProgressBar.tsx`:

```tsx
type ProgressBarProps = {
  value: number;
  label: string;
};

export function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="progress-bar" aria-label={`${label}: ${value}%`}>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <span>{value}%</span>
    </div>
  );
}
```

Create `src/components/StatTile.tsx`:

```tsx
type StatTileProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <section className="stat-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </section>
  );
}
```

- [ ] **Step 2: Add sticker card**

Create `src/components/StickerCard.tsx`:

```tsx
import type { CollectionEntry, Sticker } from "../domain/types";

type StickerCardProps = {
  sticker: Sticker;
  entry?: CollectionEntry;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
};

export function StickerCard({ sticker, entry, onToggleOwned, onSetDuplicates }: StickerCardProps) {
  const owned = Boolean(entry?.owned || (entry?.duplicates ?? 0) > 0);
  const duplicates = entry?.duplicates ?? 0;

  return (
    <article className={`sticker-card ${owned ? "is-owned" : ""}`}>
      <div className="sticker-card__image">
        {sticker.imageUrl ? <img src={sticker.imageUrl} alt={sticker.name || sticker.code} loading="lazy" /> : null}
        <span>{sticker.code}</span>
      </div>
      <div className="sticker-card__body">
        <div>
          <strong>{sticker.name || sticker.code}</strong>
          <small>{sticker.team} · {sticker.category} · {sticker.rarity}</small>
        </div>
        {sticker.isCrack ? <span className="sticker-card__crack">Crack</span> : null}
      </div>
      <div className="sticker-card__actions">
        <label>
          <input type="checkbox" checked={owned} onChange={(event) => onToggleOwned(sticker.code, event.target.checked)} />
          Tengo
        </label>
        <input
          aria-label={`Repetidas de ${sticker.code}`}
          min={0}
          type="number"
          value={duplicates}
          onChange={(event) => onSetDuplicates(sticker.code, Number(event.target.value))}
        />
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Add table and filters**

Create `src/components/TeamProgressTable.tsx`:

```tsx
import type { TeamProgress } from "../domain/types";
import { ProgressBar } from "./ProgressBar";

type TeamProgressTableProps = {
  teams: TeamProgress[];
  onSelectTeam: (team: string) => void;
};

export function TeamProgressTable({ teams, onSelectTeam }: TeamProgressTableProps) {
  return (
    <table className="team-table">
      <thead>
        <tr>
          <th>Equipo</th>
          <th>Album</th>
          <th>Cracks</th>
          <th>Repetidas</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <tr key={team.team} onClick={() => onSelectTeam(team.team)}>
            <td>{team.team}</td>
            <td><ProgressBar value={team.completionPercent} label={`Avance de ${team.team}`} /></td>
            <td>{team.cracksOwned}/{team.cracksTotal}</td>
            <td>{team.duplicates}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Create `src/components/StickerFilters.tsx`:

```tsx
export type StickerFilterState = {
  query: string;
  team: string;
  status: "all" | "owned" | "missing" | "duplicates" | "cracks";
};

type StickerFiltersProps = {
  filters: StickerFilterState;
  teams: string[];
  onChange: (filters: StickerFilterState) => void;
};

export function StickerFilters({ filters, teams, onChange }: StickerFiltersProps) {
  return (
    <form className="filters">
      <input
        aria-label="Buscar sticker"
        placeholder="Buscar por codigo, jugador o equipo"
        value={filters.query}
        onChange={(event) => onChange({ ...filters, query: event.target.value })}
      />
      <select
        aria-label="Filtrar por equipo"
        value={filters.team}
        onChange={(event) => onChange({ ...filters, team: event.target.value })}
      >
        <option value="">Todos los equipos</option>
        {teams.map((team) => <option key={team} value={team}>{team}</option>)}
      </select>
      <select
        aria-label="Filtrar por estado"
        value={filters.status}
        onChange={(event) => onChange({ ...filters, status: event.target.value as StickerFilterState["status"] })}
      >
        <option value="all">Todos</option>
        <option value="owned">Tengo</option>
        <option value="missing">Faltantes</option>
        <option value="duplicates">Repetidas</option>
        <option value="cracks">Cracks</option>
      </select>
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components
git commit -m "feat: add reusable album components"
```

---

### Task 7: Build Pages And App State

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/DashboardPage.tsx`
- Create: `src/pages/AlbumPage.tsx`
- Create: `src/pages/TeamPage.tsx`
- Create: `src/pages/RepetidasPage.tsx`
- Create: `src/pages/FaltantesPage.tsx`
- Create: `src/pages/AjustesPage.tsx`

- [ ] **Step 1: Implement Dashboard page**

Create `src/pages/DashboardPage.tsx`:

```tsx
import { StatTile } from "../components/StatTile";
import { TeamProgressTable } from "../components/TeamProgressTable";
import type { CollectionState, Sticker, TeamProgress as TeamProgressType } from "../domain/types";
import { getOverallProgress } from "../domain/progress";

type DashboardPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  teams: TeamProgressType[];
  onSelectTeam: (team: string) => void;
};

export function DashboardPage({ stickers, collection, teams, onSelectTeam }: DashboardPageProps) {
  const progress = getOverallProgress(stickers, collection);

  return (
    <section className="page-stack">
      <div className="stats-grid">
        <StatTile label="Avance" value={`${progress.completionPercent}%`} detail={`${progress.owned}/${progress.total} stickers`} />
        <StatTile label="Faltantes" value={progress.missing} />
        <StatTile label="Repetidas" value={progress.duplicates} />
        <StatTile label="Cracks" value={`${progress.cracksOwned}/${progress.cracksTotal}`} detail={`${progress.cracksCompletionPercent}%`} />
      </div>
      <TeamProgressTable teams={teams} onSelectTeam={onSelectTeam} />
    </section>
  );
}
```

- [ ] **Step 2: Implement Album and Team pages**

Create `src/pages/AlbumPage.tsx`:

```tsx
import { useMemo, useState } from "react";
import { StickerCard } from "../components/StickerCard";
import { StickerFilters, type StickerFilterState } from "../components/StickerFilters";
import type { CollectionState, Sticker } from "../domain/types";

type AlbumPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
};

export function AlbumPage({ stickers, collection, onToggleOwned, onSetDuplicates }: AlbumPageProps) {
  const [filters, setFilters] = useState<StickerFilterState>({ query: "", team: "", status: "all" });
  const teams = useMemo(() => [...new Set(stickers.map((sticker) => sticker.team))].sort(), [stickers]);

  const filtered = stickers.filter((sticker) => {
    const entry = collection[sticker.code];
    const owned = Boolean(entry?.owned || (entry?.duplicates ?? 0) > 0);
    const haystack = `${sticker.code} ${sticker.team} ${sticker.name}`.toLowerCase();
    if (filters.query && !haystack.includes(filters.query.toLowerCase())) return false;
    if (filters.team && sticker.team !== filters.team) return false;
    if (filters.status === "owned" && !owned) return false;
    if (filters.status === "missing" && owned) return false;
    if (filters.status === "duplicates" && (entry?.duplicates ?? 0) === 0) return false;
    if (filters.status === "cracks" && !sticker.isCrack) return false;
    return true;
  });

  return (
    <section className="page-stack">
      <StickerFilters filters={filters} teams={teams} onChange={setFilters} />
      <div className="sticker-grid">
        {filtered.map((sticker) => (
          <StickerCard
            key={sticker.code}
            sticker={sticker}
            entry={collection[sticker.code]}
            onToggleOwned={onToggleOwned}
            onSetDuplicates={onSetDuplicates}
          />
        ))}
      </div>
    </section>
  );
}
```

Create `src/pages/TeamPage.tsx`:

```tsx
import { StickerCard } from "../components/StickerCard";
import { StatTile } from "../components/StatTile";
import { getOverallProgress } from "../domain/progress";
import type { CollectionState, Sticker } from "../domain/types";

type TeamPageProps = {
  team: string;
  stickers: Sticker[];
  collection: CollectionState;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
};

export function TeamPage({ team, stickers, collection, onToggleOwned, onSetDuplicates }: TeamPageProps) {
  const teamStickers = stickers.filter((sticker) => sticker.team === team);
  const progress = getOverallProgress(teamStickers, collection);

  return (
    <section className="page-stack">
      <div className="stats-grid">
        <StatTile label={team} value={`${progress.completionPercent}%`} detail={`${progress.owned}/${progress.total}`} />
        <StatTile label="Cracks" value={`${progress.cracksOwned}/${progress.cracksTotal}`} />
        <StatTile label="Repetidas" value={progress.duplicates} />
      </div>
      <div className="sticker-grid">
        {teamStickers.map((sticker) => (
          <StickerCard
            key={sticker.code}
            sticker={sticker}
            entry={collection[sticker.code]}
            onToggleOwned={onToggleOwned}
            onSetDuplicates={onSetDuplicates}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Implement list and settings pages**

Create `src/pages/RepetidasPage.tsx`:

```tsx
import { StickerCard } from "../components/StickerCard";
import { getDuplicateStickers } from "../domain/progress";
import type { CollectionState, Sticker } from "../domain/types";

type RepetidasPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
};

export function RepetidasPage({ stickers, collection, onToggleOwned, onSetDuplicates }: RepetidasPageProps) {
  const duplicates = getDuplicateStickers(stickers, collection);
  return (
    <section className="sticker-grid">
      {duplicates.map(({ sticker }) => (
        <StickerCard key={sticker.code} sticker={sticker} entry={collection[sticker.code]} onToggleOwned={onToggleOwned} onSetDuplicates={onSetDuplicates} />
      ))}
    </section>
  );
}
```

Create `src/pages/FaltantesPage.tsx`:

```tsx
import { StickerCard } from "../components/StickerCard";
import { getMissingStickers } from "../domain/progress";
import type { CollectionState, Sticker } from "../domain/types";

type FaltantesPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
};

export function FaltantesPage({ stickers, collection, onToggleOwned, onSetDuplicates }: FaltantesPageProps) {
  const missing = getMissingStickers(stickers, collection);
  return (
    <section className="sticker-grid">
      {missing.map((sticker) => (
        <StickerCard key={sticker.code} sticker={sticker} entry={collection[sticker.code]} onToggleOwned={onToggleOwned} onSetDuplicates={onSetDuplicates} />
      ))}
    </section>
  );
}
```

Create `src/pages/AjustesPage.tsx`:

```tsx
import { useState } from "react";
import { datasetMeta } from "../data/datasetMeta";

type AjustesPageProps = {
  onExport: () => string;
  onImport: (json: string) => void;
  onReset: () => void;
};

export function AjustesPage({ onExport, onImport, onReset }: AjustesPageProps) {
  const [backup, setBackup] = useState("");
  const [message, setMessage] = useState("");

  return (
    <section className="settings-panel">
      <p>Dataset: {datasetMeta.version}</p>
      <button type="button" onClick={() => setBackup(onExport())}>Generar respaldo</button>
      <textarea value={backup} onChange={(event) => setBackup(event.target.value)} rows={10} />
      <button
        type="button"
        onClick={() => {
          try {
            onImport(backup);
            setMessage("Respaldo importado.");
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "No se pudo importar el respaldo.");
          }
        }}
      >
        Importar respaldo
      </button>
      <button type="button" onClick={onReset}>Reiniciar progreso</button>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
```

- [ ] **Step 4: Wire pages in App**

Replace `src/App.tsx`:

```tsx
import { useMemo, useState } from "react";
import stickersData from "./data/stickers.json";
import { datasetMeta } from "./data/datasetMeta";
import { getTeamProgress } from "./domain/progress";
import type { CollectionState, Sticker } from "./domain/types";
import { clearCollection, exportCollection, importCollection, loadCollection, setDuplicates, toggleOwned } from "./storage/collectionStorage";
import { AjustesPage } from "./pages/AjustesPage";
import { AlbumPage } from "./pages/AlbumPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FaltantesPage } from "./pages/FaltantesPage";
import { RepetidasPage } from "./pages/RepetidasPage";
import { TeamPage } from "./pages/TeamPage";

type Page = "dashboard" | "album" | "team" | "repetidas" | "faltantes" | "ajustes";

const stickers = stickersData as Sticker[];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedTeam, setSelectedTeam] = useState(stickers[0]?.team ?? "");
  const [collection, setCollection] = useState<CollectionState>(() => loadCollection());
  const teams = useMemo(() => getTeamProgress(stickers, collection), [collection]);

  function handleToggleOwned(code: string, owned: boolean) {
    setCollection(toggleOwned(code, owned));
  }

  function handleSetDuplicates(code: string, duplicates: number) {
    setCollection(setDuplicates(code, duplicates));
  }

  function openTeam(team: string) {
    setSelectedTeam(team);
    setPage("team");
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span>Album personal</span>
          <h1>Panini Mundial 2026</h1>
        </div>
        <nav>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button onClick={() => setPage("album")}>Album</button>
          <button onClick={() => setPage("repetidas")}>Repetidas</button>
          <button onClick={() => setPage("faltantes")}>Faltantes</button>
          <button onClick={() => setPage("ajustes")}>Ajustes</button>
        </nav>
      </header>

      {page === "dashboard" ? <DashboardPage stickers={stickers} collection={collection} teams={teams} onSelectTeam={openTeam} /> : null}
      {page === "album" ? <AlbumPage stickers={stickers} collection={collection} onToggleOwned={handleToggleOwned} onSetDuplicates={handleSetDuplicates} /> : null}
      {page === "team" ? <TeamPage team={selectedTeam} stickers={stickers} collection={collection} onToggleOwned={handleToggleOwned} onSetDuplicates={handleSetDuplicates} /> : null}
      {page === "repetidas" ? <RepetidasPage stickers={stickers} collection={collection} onToggleOwned={handleToggleOwned} onSetDuplicates={handleSetDuplicates} /> : null}
      {page === "faltantes" ? <FaltantesPage stickers={stickers} collection={collection} onToggleOwned={handleToggleOwned} onSetDuplicates={handleSetDuplicates} /> : null}
      {page === "ajustes" ? (
        <AjustesPage
          onExport={() => exportCollection(datasetMeta.version)}
          onImport={(json) => setCollection(importCollection(json))}
          onReset={() => {
            clearCollection();
            setCollection({});
          }}
        />
      ) : null}
    </main>
  );
}
```

- [ ] **Step 5: Run build**

Run: `npm --cache '.npm-cache' run build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/pages
git commit -m "feat: add album tracker pages"
```

---

### Task 8: Polish Styling And Verify MVP

**Files:**
- Modify: `src/styles.css`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Add app smoke test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the dashboard as the first screen", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Panini Mundial 2026/i })).toBeInTheDocument();
    expect(screen.getByText("Avance")).toBeInTheDocument();
    expect(screen.getByText("Faltantes")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Replace CSS with polished responsive styles**

Replace `src/styles.css` with:

```css
:root {
  color: #1d2433;
  background: #f5f4ee;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  border: 1px solid #cfd5dc;
  border-radius: 6px;
  background: #ffffff;
  color: #1d2433;
  cursor: pointer;
  padding: 8px 12px;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.app-header {
  align-items: center;
  border-bottom: 1px solid #d8d8cf;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 18px;
}

.app-header span {
  color: #667085;
  font-size: 0.9rem;
}

.app-header h1 {
  font-size: 1.7rem;
  margin: 0;
}

.app-header nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page-stack {
  display: grid;
  gap: 20px;
}

.stats-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.stat-tile {
  background: #ffffff;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  display: grid;
  gap: 4px;
  padding: 16px;
}

.stat-tile span,
.stat-tile small {
  color: #667085;
}

.stat-tile strong {
  font-size: 1.7rem;
}

.team-table {
  background: #ffffff;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.team-table th,
.team-table td {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
  text-align: left;
}

.team-table tr {
  cursor: pointer;
}

.progress-bar {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr auto;
}

.progress-bar__track {
  background: #e8ecef;
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
}

.progress-bar__fill {
  background: #217a65;
  height: 100%;
}

.filters {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(220px, 1fr) minmax(160px, auto) minmax(160px, auto);
}

.filters input,
.filters select,
.settings-panel textarea {
  border: 1px solid #cfd5dc;
  border-radius: 6px;
  padding: 10px 12px;
}

.sticker-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.sticker-card {
  background: #ffffff;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  display: grid;
  gap: 10px;
  padding: 12px;
}

.sticker-card.is-owned {
  border-color: #217a65;
}

.sticker-card__image {
  align-items: center;
  aspect-ratio: 4 / 3;
  background: #eef1f3;
  border-radius: 6px;
  display: grid;
  justify-items: center;
  overflow: hidden;
  position: relative;
}

.sticker-card__image img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.sticker-card__image span {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  bottom: 8px;
  font-weight: 700;
  left: 8px;
  padding: 4px 6px;
  position: absolute;
}

.sticker-card__body {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.sticker-card__body strong,
.sticker-card__body small {
  display: block;
}

.sticker-card__body small {
  color: #667085;
}

.sticker-card__crack {
  background: #f2c94c;
  border-radius: 4px;
  height: fit-content;
  padding: 4px 6px;
}

.sticker-card__actions {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.sticker-card__actions input[type="number"] {
  width: 72px;
}

.settings-panel {
  display: grid;
  gap: 12px;
  max-width: 760px;
}

@media (max-width: 720px) {
  .app-shell {
    padding: 16px;
  }

  .app-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Run full tests**

Run: `npm --cache '.npm-cache' run test`

Expected: PASS.

- [ ] **Step 4: Run production build**

Run: `npm --cache '.npm-cache' run build`

Expected: PASS.

- [ ] **Step 5: Start local app for manual verification**

Run: `npm run dev`

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`. Open it in the browser and confirm the dashboard, album, toggles, duplicate fields, import/export, missing list, repeated list, and team drill-down work.

- [ ] **Step 6: Commit**

```bash
git add src/styles.css src/App.test.tsx
git commit -m "style: polish tracker interface"
```

---

## Self-Review

- Spec coverage: covered local-first app, source extraction, dataset snapshot, fixed cracks, external image URLs, local persistence, dashboard, album, team, duplicate, missing, settings, import/export, tests, and production build.
- Script execution: dataset validation uses `tsx`, already included in dev dependencies, so TypeScript imports work in `npm run validate:data`.
- Known extraction risk: the source parser may need adjustment after inspecting the live page format. The parser task includes a fixture and real extraction step so this is caught before UI work depends on the final dataset.
- Placeholder scan: no open-ended TODO/TBD items remain; image placeholders are an explicit runtime behavior.
