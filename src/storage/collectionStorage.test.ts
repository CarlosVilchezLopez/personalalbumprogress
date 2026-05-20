import { beforeEach, describe, expect, it } from "vitest";
import {
  clearCollection,
  COLLECTION_STORAGE_KEY,
  exportCollection,
  importCollection,
  loadCollection,
  setDuplicates,
  toggleOwned
} from "./collectionStorage";

describe("collectionStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists owned toggles", () => {
    toggleOwned("ARG01", true);

    expect(loadCollection()).toMatchObject({
      ARG01: { owned: true, duplicates: 0, notes: "" }
    });

    toggleOwned("ARG01", false);

    expect(loadCollection().ARG01).toMatchObject({
      owned: false,
      duplicates: 0,
      notes: ""
    });
  });

  it("clamps duplicates and treats duplicate stickers as owned", () => {
    setDuplicates("BRA02", 2.8);

    expect(loadCollection().BRA02).toMatchObject({
      owned: true,
      duplicates: 2,
      notes: ""
    });

    setDuplicates("BRA02", -4);

    expect(loadCollection().BRA02).toMatchObject({
      owned: true,
      duplicates: 0,
      notes: ""
    });
  });

  it("exports and imports collection JSON round trip", () => {
    toggleOwned("ARG01", true);
    setDuplicates("BRA02", 3);

    const exported = exportCollection("dataset-2026-a");
    clearCollection();
    expect(loadCollection()).toEqual({});

    const imported = importCollection(exported);

    expect(imported).toEqual(loadCollection());
    expect(JSON.parse(exported)).toMatchObject({
      datasetVersion: "dataset-2026-a",
      collection: {
        ARG01: { owned: true, duplicates: 0, notes: "" },
        BRA02: { owned: true, duplicates: 3, notes: "" }
      }
    });
  });

  it("rejects invalid imports without overwriting existing progress", () => {
    toggleOwned("ARG01", true);
    const before = localStorage.getItem(COLLECTION_STORAGE_KEY);

    expect(() => importCollection("{\"collection\":[]}")).toThrow("Formato de colección inválido");

    expect(localStorage.getItem(COLLECTION_STORAGE_KEY)).toBe(before);
    expect(loadCollection().ARG01).toMatchObject({ owned: true });
  });
});
