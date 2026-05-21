import { describe, expect, it } from "vitest";
import { buildTradeList, matchTrades } from "./trade";
import type { CollectionState, Sticker, TradeListPayload } from "./types";

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
      { id: "6", code: "ARG-BADGE", team: "Argentina", group: "B", number: 1, category: "Team Badge", rarity: "Base", name: "Escudo Argentina", isCrack: false, imageUrl: "", sourceUrl: "" },
      { id: "7", code: "ARG2", team: "Argentina", group: "B", number: 2, category: "Player", rarity: "Base", name: "Di María", isCrack: false, imageUrl: "", sourceUrl: "" }
    ];
    const codes = ["ARG1", "ARG2", "BRA1", "BRA2", "TPH1", "BR1", "ARG-BADGE"];
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
