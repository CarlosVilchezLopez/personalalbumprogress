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
