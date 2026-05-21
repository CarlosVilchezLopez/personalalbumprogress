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
