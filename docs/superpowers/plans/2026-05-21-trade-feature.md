# Intercambios entre coleccionistas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/intercambios` page that exports own dupes+missing as JSON and imports a friend's JSON to suggest bidirectional trades grouped by priority buckets.

**Architecture:** Pure domain functions in `src/domain/trade.ts` (buildTradeList, matchTrades), I/O helpers in `src/storage/tradeList.ts`, page component in `src/pages/IntercambiosPage.tsx`, reusable bucket component in `src/components/TradeBucket.tsx`. Wire new page into `src/App.tsx` navigation. No persistence of friend lists (session-only state).

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, localStorage (via existing `collectionStorage.ts`).

**Spec:** `docs/superpowers/specs/2026-05-21-trade-feature-design.md`

---

## File Structure

- Create: `src/domain/trade.ts` — pure `buildTradeList`, `matchTrades`.
- Create: `src/domain/trade.test.ts` — unit tests for both.
- Create: `src/storage/tradeList.ts` — `exportTradeListJson`, `parseTradeListJson`.
- Create: `src/storage/tradeList.test.ts` — unit tests for parser.
- Create: `src/components/TradeBucket.tsx` — collapsible bucket section.
- Create: `src/pages/IntercambiosPage.tsx` — main UI.
- Create: `src/pages/IntercambiosPage.test.tsx` — page test.
- Modify: `src/domain/types.ts` — add `TradeListPayload`, `TradeBucket`, `TradeMatchResult`.
- Modify: `src/App.tsx` — register `"intercambios"` page + nav button.

---

### Task 1: Add domain types

**Files:**
- Modify: `src/domain/types.ts`

- [ ] **Step 1: Append types to file**

Append at end of `src/domain/types.ts`:

```ts
export const TRADE_LIST_TYPE = "panini-2026-trade-list" as const;

export type TradeListPayload = {
  type: typeof TRADE_LIST_TYPE;
  datasetVersion: string;
  exportedAt: string;
  owner: string;
  repes: string[];
  faltantes: string[];
};

export type TradeBucketKey =
  | "cracks"
  | "escudos"
  | "fotos"
  | `players:${string}`
  | "brand";

export type TradeBucket = {
  key: TradeBucketKey;
  label: string;
  stickers: Sticker[];
};

export type TradeMatchResult = {
  iGive: TradeBucket[];
  iReceive: TradeBucket[];
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/domain/types.ts
git commit -m "feat: add trade list domain types"
```

---

### Task 2: Implement `buildTradeList`

**Files:**
- Create: `src/domain/trade.ts`
- Test: `src/domain/trade.test.ts`

- [ ] **Step 1: Create test file with failing tests**

Create `src/domain/trade.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildTradeList } from "./trade";
import type { CollectionState, Sticker } from "./types";

const stickers: Sticker[] = [
  { id: "1", code: "BRA1", team: "Brasil", group: "A", number: 1, category: "Team Badge", rarity: "Base", name: "Escudo Brasil", isCrack: false, imageUrl: "", sourceUrl: "" },
  { id: "2", code: "BRA2", team: "Brasil", group: "A", number: 2, category: "Player", rarity: "Base", name: "Jugador 1", isCrack: false, imageUrl: "", sourceUrl: "" },
  { id: "3", code: "ARG1", team: "Argentina", group: "B", number: 1, category: "Player", rarity: "Base", name: "Messi", isCrack: true, imageUrl: "", sourceUrl: "" }
];

const ts = "2026-05-21T00:00:00.000Z";

function entry(owned: boolean, duplicates: number): CollectionState[string] {
  return { owned, duplicates, notes: "", updatedAt: ts };
}

describe("buildTradeList", () => {
  it("includes codes with duplicates >= 1 in repes", () => {
    const collection: CollectionState = {
      BRA1: entry(true, 2),
      BRA2: entry(true, 0),
      ARG1: entry(true, 1)
    };

    const result = buildTradeList(stickers, collection, "v1", "Carlos");

    expect(result.repes.sort()).toEqual(["ARG1", "BRA1"]);
  });

  it("includes codes not owned in faltantes", () => {
    const collection: CollectionState = {
      BRA1: entry(true, 0),
      ARG1: entry(false, 0)
    };

    const result = buildTradeList(stickers, collection, "v1", "Carlos");

    expect(result.faltantes.sort()).toEqual(["ARG1", "BRA2"]);
  });

  it("sets type, datasetVersion, owner, exportedAt", () => {
    const result = buildTradeList(stickers, {}, "v1", "Carlos");

    expect(result.type).toBe("panini-2026-trade-list");
    expect(result.datasetVersion).toBe("v1");
    expect(result.owner).toBe("Carlos");
    expect(typeof result.exportedAt).toBe("string");
    expect(Number.isNaN(Date.parse(result.exportedAt))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/trade.test.ts`
Expected: FAIL with "Failed to load url ./trade" or similar (module missing).

- [ ] **Step 3: Implement `buildTradeList`**

Create `src/domain/trade.ts`:

```ts
import type { CollectionState, Sticker, TradeListPayload } from "./types";
import { TRADE_LIST_TYPE } from "./types";

export function buildTradeList(
  stickers: Sticker[],
  collection: CollectionState,
  datasetVersion: string,
  owner: string
): TradeListPayload {
  const repes: string[] = [];
  const faltantes: string[] = [];

  for (const sticker of stickers) {
    const entry = collection[sticker.code];
    const duplicates = Math.max(0, entry?.duplicates ?? 0);
    const owned = Boolean(entry?.owned || duplicates > 0);

    if (duplicates >= 1) repes.push(sticker.code);
    if (!owned) faltantes.push(sticker.code);
  }

  return {
    type: TRADE_LIST_TYPE,
    datasetVersion,
    exportedAt: new Date().toISOString(),
    owner,
    repes,
    faltantes
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/trade.test.ts`
Expected: PASS (3 tests green).

- [ ] **Step 5: Commit**

```bash
git add src/domain/trade.ts src/domain/trade.test.ts
git commit -m "feat: add buildTradeList domain function"
```

---

### Task 3: Implement `matchTrades`

**Files:**
- Modify: `src/domain/trade.ts`
- Modify: `src/domain/trade.test.ts`

- [ ] **Step 1: Append failing tests for matchTrades**

Append to `src/domain/trade.test.ts`:

```ts
import { matchTrades } from "./trade";
import type { TradeListPayload } from "./types";

function list(repes: string[], faltantes: string[]): TradeListPayload {
  return {
    type: "panini-2026-trade-list",
    datasetVersion: "v1",
    exportedAt: ts,
    owner: "test",
    repes,
    faltantes
  };
}

describe("matchTrades", () => {
  it("returns empty buckets when no intersections", () => {
    const mine = list(["BRA1"], ["ARG1"]);
    const friend = list(["BRA2"], ["BRA2"]);

    const result = matchTrades(mine, friend, stickers);

    expect(result.iGive).toEqual([]);
    expect(result.iReceive).toEqual([]);
  });

  it("computes iGive from mine.repes ∩ friend.faltantes", () => {
    const mine = list(["BRA1"], []);
    const friend = list([], ["BRA1"]);

    const result = matchTrades(mine, friend, stickers);

    expect(result.iGive).toHaveLength(1);
    expect(result.iGive[0].key).toBe("escudos");
    expect(result.iGive[0].stickers.map((s) => s.code)).toEqual(["BRA1"]);
    expect(result.iReceive).toEqual([]);
  });

  it("computes iReceive from friend.repes ∩ mine.faltantes", () => {
    const mine = list([], ["ARG1"]);
    const friend = list(["ARG1"], []);

    const result = matchTrades(mine, friend, stickers);

    expect(result.iReceive).toHaveLength(1);
    expect(result.iReceive[0].key).toBe("cracks");
    expect(result.iReceive[0].stickers.map((s) => s.code)).toEqual(["ARG1"]);
  });

  it("places cracks in cracks bucket regardless of category", () => {
    const argCrack = stickers.find((s) => s.code === "ARG1")!;
    expect(argCrack.category).toBe("Player");
    expect(argCrack.isCrack).toBe(true);

    const mine = list(["ARG1"], []);
    const friend = list([], ["ARG1"]);

    const result = matchTrades(mine, friend, stickers);

    expect(result.iGive[0].key).toBe("cracks");
  });

  it("groups Player stickers by team", () => {
    const mine = list(["BRA2"], []);
    const friend = list([], ["BRA2"]);

    const result = matchTrades(mine, friend, stickers);

    expect(result.iGive[0].key).toBe("players:Brasil");
    expect(result.iGive[0].label).toContain("Brasil");
  });

  it("orders buckets: cracks, escudos, fotos, players (alpha by team), brand", () => {
    const extra: Sticker[] = [
      ...stickers,
      { id: "4", code: "TPH1", team: "Brasil", group: "A", number: 9, category: "Team Photo", rarity: "Base", name: "Plantilla", isCrack: false, imageUrl: "", sourceUrl: "" },
      { id: "5", code: "BR1", team: "Global", group: "Z", number: 1, category: "Brand / Emblem", rarity: "Base", name: "Logo", isCrack: false, imageUrl: "", sourceUrl: "" },
      { id: "6", code: "ARG-BADGE", team: "Argentina", group: "B", number: 1, category: "Team Badge", rarity: "Base", name: "Escudo Argentina", isCrack: false, imageUrl: "", sourceUrl: "" }
    ];
    const codes = ["ARG1", "BRA1", "BRA2", "TPH1", "BR1", "ARG-BADGE"];
    const mine = list(codes, []);
    const friend = list([], codes);

    const result = matchTrades(mine, friend, extra);

    expect(result.iGive.map((b) => b.key)).toEqual([
      "cracks",
      "escudos",
      "fotos",
      "players:Argentina",
      "players:Brasil",
      "brand"
    ]);
  });

  it("filters codes not in dataset silently", () => {
    const mine = list(["UNKNOWN"], []);
    const friend = list([], ["UNKNOWN"]);

    const result = matchTrades(mine, friend, stickers);

    expect(result.iGive).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/domain/trade.test.ts`
Expected: FAIL with "matchTrades is not a function".

- [ ] **Step 3: Implement `matchTrades`**

Append to `src/domain/trade.ts`:

```ts
function bucketKeyFor(sticker: Sticker): TradeBucketKey {
  if (sticker.isCrack) return "cracks";
  if (sticker.category === "Team Badge") return "escudos";
  if (sticker.category === "Team Photo") return "fotos";
  if (sticker.category === "Player") return `players:${sticker.team}`;
  return "brand";
}

function bucketLabelFor(key: TradeBucketKey): string {
  if (key === "cracks") return "Cracks";
  if (key === "escudos") return "Escudos";
  if (key === "fotos") return "Fotos de equipo";
  if (key === "brand") return "Brand / Emblem";
  return `Jugadores ${key.slice("players:".length)}`;
}

function sortBuckets(a: TradeBucket, b: TradeBucket): number {
  const rank = (key: TradeBucketKey) => {
    if (key === "cracks") return 0;
    if (key === "escudos") return 1;
    if (key === "fotos") return 2;
    if (key.startsWith("players:")) return 3;
    return 4;
  };

  const diff = rank(a.key) - rank(b.key);
  if (diff !== 0) return diff;
  return a.label.localeCompare(b.label, "es");
}

function groupIntoBuckets(codes: string[], byCode: Map<string, Sticker>): TradeBucket[] {
  const buckets = new Map<TradeBucketKey, Sticker[]>();

  for (const code of codes) {
    const sticker = byCode.get(code);
    if (!sticker) continue;
    const key = bucketKeyFor(sticker);
    const list = buckets.get(key) ?? [];
    list.push(sticker);
    buckets.set(key, list);
  }

  return [...buckets.entries()]
    .map(([key, items]) => ({
      key,
      label: bucketLabelFor(key),
      stickers: items.sort((a, b) => a.code.localeCompare(b.code, "es"))
    }))
    .sort(sortBuckets);
}

export function matchTrades(
  mine: TradeListPayload,
  friend: TradeListPayload,
  stickers: Sticker[]
): TradeMatchResult {
  const byCode = new Map(stickers.map((s) => [s.code, s]));
  const friendFaltantes = new Set(friend.faltantes);
  const friendRepes = new Set(friend.repes);
  const myFaltantes = new Set(mine.faltantes);

  const iGiveCodes = mine.repes.filter((code) => friendFaltantes.has(code));
  const iReceiveCodes = [...friendRepes].filter((code) => myFaltantes.has(code));

  return {
    iGive: groupIntoBuckets(iGiveCodes, byCode),
    iReceive: groupIntoBuckets(iReceiveCodes, byCode)
  };
}
```

Replace imports at top of `src/domain/trade.ts` with this single block (merging with Task 2's imports):

```ts
import type { CollectionState, Sticker, TradeBucket, TradeBucketKey, TradeListPayload, TradeMatchResult } from "./types";
import { TRADE_LIST_TYPE } from "./types";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/domain/trade.test.ts`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add src/domain/trade.ts src/domain/trade.test.ts
git commit -m "feat: add matchTrades with priority buckets"
```

---

### Task 4: Implement `exportTradeListJson` + `parseTradeListJson`

**Files:**
- Create: `src/storage/tradeList.ts`
- Test: `src/storage/tradeList.test.ts`

- [ ] **Step 1: Create test file**

Create `src/storage/tradeList.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseTradeListJson } from "./tradeList";

const validPayload = {
  type: "panini-2026-trade-list",
  datasetVersion: "v1",
  exportedAt: "2026-05-21T00:00:00.000Z",
  owner: "Carlos",
  repes: ["BRA1"],
  faltantes: ["ARG1"]
};

describe("parseTradeListJson", () => {
  it("accepts a valid payload", () => {
    const result = parseTradeListJson(JSON.stringify(validPayload));
    expect(result.repes).toEqual(["BRA1"]);
    expect(result.faltantes).toEqual(["ARG1"]);
    expect(result.owner).toBe("Carlos");
  });

  it("rejects malformed JSON", () => {
    expect(() => parseTradeListJson("{not json")).toThrow(/Formato inválido/);
  });

  it("rejects payloads with wrong type", () => {
    const bad = { ...validPayload, type: "panini-backup" };
    expect(() => parseTradeListJson(JSON.stringify(bad))).toThrow(/no es lista de intercambio/);
  });

  it("rejects payloads when repes is not string array", () => {
    const bad = { ...validPayload, repes: [1, 2] };
    expect(() => parseTradeListJson(JSON.stringify(bad))).toThrow(/Formato inválido/);
  });

  it("rejects payloads when faltantes is not string array", () => {
    const bad = { ...validPayload, faltantes: "ARG1" };
    expect(() => parseTradeListJson(JSON.stringify(bad))).toThrow(/Formato inválido/);
  });

  it("defaults missing owner to empty string", () => {
    const { owner: _owner, ...rest } = validPayload;
    const result = parseTradeListJson(JSON.stringify(rest));
    expect(result.owner).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/storage/tradeList.test.ts`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement storage helpers**

Create `src/storage/tradeList.ts`:

```ts
import { loadCollection } from "./collectionStorage";
import { buildTradeList } from "../domain/trade";
import type { Sticker, TradeListPayload } from "../domain/types";
import { TRADE_LIST_TYPE } from "../domain/types";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function exportTradeListJson(
  stickers: Sticker[],
  datasetVersion: string,
  owner: string
): string {
  const payload = buildTradeList(stickers, loadCollection(), datasetVersion, owner);
  return JSON.stringify(payload, null, 2);
}

export function parseTradeListJson(json: string): TradeListPayload {
  let raw: unknown;

  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error("Formato inválido");
  }

  if (!isRecord(raw)) {
    throw new Error("Formato inválido");
  }

  if (raw.type !== TRADE_LIST_TYPE) {
    throw new Error("Archivo no es lista de intercambio Panini 2026");
  }

  if (
    typeof raw.datasetVersion !== "string" ||
    typeof raw.exportedAt !== "string" ||
    !isStringArray(raw.repes) ||
    !isStringArray(raw.faltantes)
  ) {
    throw new Error("Formato inválido");
  }

  return {
    type: TRADE_LIST_TYPE,
    datasetVersion: raw.datasetVersion,
    exportedAt: raw.exportedAt,
    owner: typeof raw.owner === "string" ? raw.owner : "",
    repes: raw.repes,
    faltantes: raw.faltantes
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/storage/tradeList.test.ts`
Expected: PASS (6 tests green).

- [ ] **Step 5: Commit**

```bash
git add src/storage/tradeList.ts src/storage/tradeList.test.ts
git commit -m "feat: add trade list export/import JSON helpers"
```

---

### Task 5: Build `TradeBucket` component

**Files:**
- Create: `src/components/TradeBucket.tsx`

- [ ] **Step 1: Create component**

Create `src/components/TradeBucket.tsx`:

```tsx
import type { TradeBucket as TradeBucketModel } from "../domain/types";

type TradeBucketProps = {
  bucket: TradeBucketModel;
};

export function TradeBucket({ bucket }: TradeBucketProps) {
  return (
    <details className="trade-bucket" open>
      <summary>
        {bucket.label} ({bucket.stickers.length})
      </summary>
      <ul className="trade-bucket__list">
        {bucket.stickers.map((sticker) => (
          <li key={sticker.code} className="trade-bucket__item">
            {sticker.imageUrl ? (
              <img src={sticker.imageUrl} alt={sticker.name || sticker.code} loading="lazy" />
            ) : null}
            <span>
              <strong>{sticker.code}</strong> · {sticker.name || sticker.team}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/TradeBucket.tsx
git commit -m "feat: add TradeBucket presentational component"
```

---

### Task 6: Build `IntercambiosPage`

**Files:**
- Create: `src/pages/IntercambiosPage.tsx`

- [ ] **Step 1: Create page**

Create `src/pages/IntercambiosPage.tsx`:

```tsx
import { useMemo, useState } from "react";
import { TradeBucket } from "../components/TradeBucket";
import { matchTrades } from "../domain/trade";
import type { CollectionState, Sticker, TradeListPayload } from "../domain/types";
import { exportTradeListJson, parseTradeListJson } from "../storage/tradeList";
import { buildTradeList } from "../domain/trade";

type IntercambiosPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  datasetVersion: string;
};

export function IntercambiosPage({ stickers, collection, datasetVersion }: IntercambiosPageProps) {
  const [owner, setOwner] = useState("");
  const [friendJson, setFriendJson] = useState("");
  const [friendList, setFriendList] = useState<TradeListPayload | null>(null);
  const [error, setError] = useState("");
  const [copyMsg, setCopyMsg] = useState("");

  const myList = useMemo(
    () => buildTradeList(stickers, collection, datasetVersion, owner),
    [stickers, collection, datasetVersion, owner]
  );

  const matches = useMemo(
    () => (friendList ? matchTrades(myList, friendList, stickers) : null),
    [myList, friendList, stickers]
  );

  function handleDownload() {
    const json = exportTradeListJson(stickers, datasetVersion, owner);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `intercambio-${owner || "anon"}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    const json = exportTradeListJson(stickers, datasetVersion, owner);
    try {
      await navigator.clipboard.writeText(json);
      setCopyMsg("Copiado al portapapeles.");
    } catch {
      setCopyMsg("No se pudo copiar. Usa Descargar JSON.");
    }
  }

  function handleLoad() {
    setError("");
    try {
      const parsed = parseTradeListJson(friendJson);
      setFriendList(parsed);
    } catch (e) {
      setFriendList(null);
      setError(e instanceof Error ? e.message : "Formato inválido");
    }
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setFriendJson(text);
  }

  const datasetMismatch = friendList && friendList.datasetVersion !== datasetVersion;

  return (
    <section className="intercambios-page">
      <h2>Intercambios</h2>

      <section className="intercambios-page__mine">
        <h3>Mi lista</h3>
        <p>
          Repes: {myList.repes.length} · Faltantes: {myList.faltantes.length}
        </p>
        <label>
          Mi nombre (opcional):
          <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Carlos" />
        </label>
        <div className="intercambios-page__actions">
          <button type="button" onClick={handleDownload}>Descargar JSON</button>
          <button type="button" onClick={() => void handleCopy()}>Copiar al portapapeles</button>
        </div>
        {copyMsg ? <p>{copyMsg}</p> : null}
      </section>

      <section className="intercambios-page__friend">
        <h3>Lista de amigo</h3>
        <textarea
          value={friendJson}
          onChange={(e) => setFriendJson(e.target.value)}
          rows={8}
          placeholder='Pega aquí el JSON de tu amigo'
        />
        <div className="intercambios-page__actions">
          <button type="button" onClick={handleLoad}>Cargar lista</button>
          <input type="file" accept="application/json,.json" onChange={(e) => void handleFile(e)} />
        </div>
        {error ? <p role="alert" className="intercambios-page__error">{error}</p> : null}
      </section>

      {matches && friendList ? (
        <section className="intercambios-page__matches">
          <h3>Intercambios sugeridos</h3>
          <p>
            Amigo: {friendList.owner || "anon"} · Dataset {friendList.datasetVersion}{" "}
            {datasetMismatch ? "(distinto al tuyo)" : "(coincide)"}
          </p>
          {datasetMismatch ? (
            <p role="status" className="intercambios-page__warning">
              Aviso: el amigo usa un dataset distinto. Algunos códigos podrían no coincidir.
            </p>
          ) : null}

          <h4>Le doy ({matches.iGive.reduce((sum, b) => sum + b.stickers.length, 0)})</h4>
          {matches.iGive.length === 0 ? <p>Sin coincidencias.</p> : null}
          {matches.iGive.map((bucket) => (
            <TradeBucket key={`give-${bucket.key}`} bucket={bucket} />
          ))}

          <h4>Recibo ({matches.iReceive.reduce((sum, b) => sum + b.stickers.length, 0)})</h4>
          {matches.iReceive.length === 0 ? <p>Sin coincidencias.</p> : null}
          {matches.iReceive.map((bucket) => (
            <TradeBucket key={`recv-${bucket.key}`} bucket={bucket} />
          ))}
        </section>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/IntercambiosPage.tsx
git commit -m "feat: add IntercambiosPage UI"
```

---

### Task 7: Write IntercambiosPage test

**Files:**
- Test: `src/pages/IntercambiosPage.test.tsx`

- [ ] **Step 1: Create test**

Create `src/pages/IntercambiosPage.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IntercambiosPage } from "./IntercambiosPage";
import type { CollectionState, Sticker } from "../domain/types";

const stickers: Sticker[] = [
  { id: "1", code: "BRA1", team: "Brasil", group: "A", number: 1, category: "Team Badge", rarity: "Base", name: "Escudo Brasil", isCrack: false, imageUrl: "", sourceUrl: "" },
  { id: "2", code: "ARG1", team: "Argentina", group: "B", number: 1, category: "Player", rarity: "Base", name: "Messi", isCrack: true, imageUrl: "", sourceUrl: "" }
];

const myCollection: CollectionState = {
  BRA1: { owned: true, duplicates: 2, notes: "", updatedAt: "2026-05-21T00:00:00.000Z" }
};

const friendPayload = {
  type: "panini-2026-trade-list",
  datasetVersion: "v1",
  exportedAt: "2026-05-21T00:00:00.000Z",
  owner: "Juan",
  repes: ["ARG1"],
  faltantes: ["BRA1"]
};

describe("IntercambiosPage", () => {
  it("renders my list counters", () => {
    render(<IntercambiosPage stickers={stickers} collection={myCollection} datasetVersion="v1" />);
    expect(screen.getByText(/Repes:\s*1/)).toBeInTheDocument();
    expect(screen.getByText(/Faltantes:\s*1/)).toBeInTheDocument();
  });

  it("renders matches after pasting friend JSON", () => {
    render(<IntercambiosPage stickers={stickers} collection={myCollection} datasetVersion="v1" />);

    fireEvent.change(screen.getByPlaceholderText(/Pega aquí el JSON/i), {
      target: { value: JSON.stringify(friendPayload) }
    });
    fireEvent.click(screen.getByText("Cargar lista"));

    expect(screen.getByText(/Amigo:\s*Juan/)).toBeInTheDocument();
    expect(screen.getByText(/Escudos/)).toBeInTheDocument();
    expect(screen.getByText(/Cracks/)).toBeInTheDocument();
  });

  it("shows error on invalid JSON", () => {
    render(<IntercambiosPage stickers={stickers} collection={myCollection} datasetVersion="v1" />);

    fireEvent.change(screen.getByPlaceholderText(/Pega aquí el JSON/i), {
      target: { value: "{not json" }
    });
    fireEvent.click(screen.getByText("Cargar lista"));

    expect(screen.getByRole("alert")).toHaveTextContent(/Formato inválido/);
  });

  it("warns when dataset version differs", () => {
    render(<IntercambiosPage stickers={stickers} collection={myCollection} datasetVersion="v2" />);

    fireEvent.change(screen.getByPlaceholderText(/Pega aquí el JSON/i), {
      target: { value: JSON.stringify(friendPayload) }
    });
    fireEvent.click(screen.getByText("Cargar lista"));

    expect(screen.getByRole("status")).toHaveTextContent(/dataset distinto/);
  });
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/pages/IntercambiosPage.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 3: Commit**

```bash
git add src/pages/IntercambiosPage.test.tsx
git commit -m "test: add IntercambiosPage component tests"
```

---

### Task 8: Wire route into App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx**

Edits in `src/App.tsx`:

**A.** Add import (alphabetical with existing page imports):

```ts
import { IntercambiosPage } from "./pages/IntercambiosPage";
```

**B.** Replace the `Page` type:

```ts
type Page = "dashboard" | "album" | "team" | "repetidas" | "faltantes" | "intercambios" | "ajustes";
```

**C.** Add nav button between "faltantes" and "ajustes" buttons:

```tsx
<button onClick={() => setPage("intercambios")}>Intercambios</button>
```

**D.** Add page render block (immediately before the `ajustes` block):

```tsx
{page === "intercambios" ? (
  <IntercambiosPage
    stickers={stickers}
    collection={collection}
    datasetVersion={datasetMeta.version}
  />
) : null}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b`
Expected: No errors.

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `built in ...` success line, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire Intercambios page into navigation"
```

---

### Task 9: Final manual verification

**Files:** none (manual)

- [ ] **Step 1: Run dev server and smoke test**

Run: `npm run dev`

In browser at `http://127.0.0.1:5173/`:
1. Click "Intercambios" in nav. Page renders with "Mi lista" counters.
2. Type a name in "Mi nombre".
3. Click "Descargar JSON". File downloads.
4. Open the downloaded file, copy contents, paste into the friend textarea.
5. Click "Cargar lista". "Intercambios sugeridos" section appears (matches self → empty buckets, no error).
6. Now hand-craft a friend payload with at least one of YOUR repes in `faltantes` and one of YOUR faltantes in `repes`. Paste and load. Confirm at least one bucket renders with correct sticker.
7. Paste `{not json` and click Cargar. Error shows.

Stop server (`Ctrl+C`).

- [ ] **Step 2: No commit needed — manual gate only**

---

## Spec Coverage Check

- ✅ JSON payload shape with `type` discriminator → Task 1, 4.
- ✅ `datasetVersion` warning on mismatch → Task 6.
- ✅ Bidirectional match logic → Task 3.
- ✅ Priority buckets (cracks, escudos, fotos, players-by-team, brand) → Task 3.
- ✅ Players grouped by team → Task 3.
- ✅ UI: Mi lista + Lista amigo + Matches → Task 6.
- ✅ Download + clipboard → Task 6.
- ✅ Error handling (bad JSON, wrong type) → Tasks 4, 7.
- ✅ Dataset codes filtered silently → Task 3.
- ✅ No persistence of friend list → Task 6 (in-memory only).
- ✅ Domain unit tests → Tasks 2, 3, 4.
- ✅ Page test → Task 7.
