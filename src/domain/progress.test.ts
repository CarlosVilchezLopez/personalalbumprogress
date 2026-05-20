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
