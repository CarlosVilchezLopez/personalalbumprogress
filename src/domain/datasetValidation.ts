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

    if (seenCodes.has(sticker.code)) {
      duplicateCodes.add(sticker.code);
    }

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
