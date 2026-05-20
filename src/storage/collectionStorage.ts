import type { CollectionEntry, CollectionState } from "../domain/types";

export const COLLECTION_STORAGE_KEY = "panini-2026-collection";

type ExportedCollection = {
  datasetVersion: string;
  exportedAt: string;
  collection: CollectionState;
};

function now(): string {
  return new Date().toISOString();
}

function emptyEntry(): CollectionEntry {
  return {
    owned: false,
    duplicates: 0,
    notes: "",
    updatedAt: now()
  };
}

function clampDuplicates(duplicates: number): number {
  if (!Number.isFinite(duplicates)) return 0;
  return Math.max(0, Math.floor(duplicates));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCollectionEntry(value: unknown): value is CollectionEntry {
  if (!isRecord(value)) return false;

  return (
    typeof value.owned === "boolean" &&
    typeof value.duplicates === "number" &&
    Number.isFinite(value.duplicates) &&
    value.duplicates >= 0 &&
    Number.isInteger(value.duplicates) &&
    typeof value.notes === "string" &&
    typeof value.updatedAt === "string"
  );
}

function parseCollection(value: unknown): CollectionState | null {
  if (!isRecord(value)) return null;

  const collection: CollectionState = {};

  for (const [code, entry] of Object.entries(value)) {
    if (!isCollectionEntry(entry)) return null;

    collection[code] = {
      ...entry,
      owned: entry.owned || entry.duplicates > 0
    };
  }

  return collection;
}

function saveCollection(collection: CollectionState): void {
  localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collection));
}

export function loadCollection(): CollectionState {
  const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
  if (!stored) return {};

  try {
    const parsed = JSON.parse(stored) as unknown;
    return parseCollection(parsed) ?? {};
  } catch {
    return {};
  }
}

export function toggleOwned(code: string, owned: boolean): CollectionState {
  const collection = loadCollection();
  const current = collection[code] ?? emptyEntry();

  collection[code] = {
    ...current,
    owned,
    duplicates: owned ? current.duplicates : 0,
    updatedAt: now()
  };

  saveCollection(collection);
  return collection;
}

export function setDuplicates(code: string, duplicates: number): CollectionState {
  const collection = loadCollection();
  const current = collection[code] ?? emptyEntry();
  const nextDuplicates = clampDuplicates(duplicates);

  collection[code] = {
    ...current,
    owned: current.owned || nextDuplicates > 0,
    duplicates: nextDuplicates,
    updatedAt: now()
  };

  saveCollection(collection);
  return collection;
}

export function exportCollection(datasetVersion: string): string {
  const exported: ExportedCollection = {
    datasetVersion,
    exportedAt: now(),
    collection: loadCollection()
  };

  return JSON.stringify(exported);
}

export function importCollection(json: string): CollectionState {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error("Formato de colección inválido");
  }

  if (!isRecord(parsed) || typeof parsed.datasetVersion !== "string") {
    throw new Error("Formato de colección inválido");
  }

  const collection = parseCollection(parsed.collection);
  if (!collection) {
    throw new Error("Formato de colección inválido");
  }

  saveCollection(collection);
  return collection;
}

export function clearCollection(): void {
  localStorage.removeItem(COLLECTION_STORAGE_KEY);
}
