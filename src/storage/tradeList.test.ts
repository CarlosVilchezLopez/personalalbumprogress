import { describe, expect, it } from "vitest";
import { parseTradeListJson } from "./tradeList";

const validPayload = {
  type: "panini-2026-trade-list",
  datasetVersion: "v1",
  exportedAt: "2026-05-21T00:00:00.000Z",
  owner: "Carlos",
  repes: ["BRA1"],
  faltantes: ["ARG1"]
};

describe("parseTradeListJson", () => {
  it("accepts a valid payload", () => {
    const result = parseTradeListJson(JSON.stringify(validPayload));
    expect(result.repes).toEqual(["BRA1"]);
    expect(result.faltantes).toEqual(["ARG1"]);
    expect(result.owner).toBe("Carlos");
  });

  it("rejects malformed JSON", () => {
    expect(() => parseTradeListJson("{not json")).toThrow(/Formato inválido/);
  });

  it("rejects payloads with wrong type", () => {
    const bad = { ...validPayload, type: "panini-backup" };
    expect(() => parseTradeListJson(JSON.stringify(bad))).toThrow(/no es lista de intercambio/);
  });

  it("rejects payloads when repes is not string array", () => {
    const bad = { ...validPayload, repes: [1, 2] };
    expect(() => parseTradeListJson(JSON.stringify(bad))).toThrow(/Formato inválido/);
  });

  it("rejects payloads when faltantes is not string array", () => {
    const bad = { ...validPayload, faltantes: "ARG1" };
    expect(() => parseTradeListJson(JSON.stringify(bad))).toThrow(/Formato inválido/);
  });

  it("defaults missing owner to empty string", () => {
    const { owner: _owner, ...rest } = validPayload;
    const result = parseTradeListJson(JSON.stringify(rest));
    expect(result.owner).toBe("");
  });
});
