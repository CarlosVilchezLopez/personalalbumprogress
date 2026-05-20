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
