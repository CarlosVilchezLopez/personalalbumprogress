import type { CollectionState, Sticker, TradeBucket, TradeBucketKey, TradeListPayload, TradeMatchResult } from "./types";
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
