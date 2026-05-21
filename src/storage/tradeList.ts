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
