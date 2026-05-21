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
