import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseStickerText } from "./extractStickers.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fixturePath = path.join(root, "scripts", "fixtures", "missing-stickers-list.html");

describe("parseStickerText", () => {
  it("parses checklist-like sticker rows from stripped HTML", async () => {
    const stickers = parseStickerText(await readFile(fixturePath, "utf8"));

    expect(stickers.map(({ code, team, category, rarity, name, isCrack }) => ({ code, team, category, rarity, name, isCrack }))).toEqual([
      {
        code: "ARG1",
        team: "Argentina",
        category: "Team Badge",
        rarity: "Foil",
        name: "Team Logo",
        isCrack: false
      },
      {
        code: "ARG17",
        team: "Argentina",
        category: "Player",
        rarity: "Base",
        name: "Lionel Messi",
        isCrack: true
      },
      {
        code: "BRA17",
        team: "Brazil",
        category: "Player",
        rarity: "Base",
        name: "Vinicius Junior",
        isCrack: true
      }
    ]);
  });
});
