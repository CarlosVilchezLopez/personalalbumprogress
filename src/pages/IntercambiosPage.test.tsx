import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IntercambiosPage } from "./IntercambiosPage";
import type { CollectionState, Sticker } from "../domain/types";

const stickers: Sticker[] = [
  { id: "1", code: "BRA1", team: "Brasil", group: "A", number: 1, category: "Team Badge", rarity: "Base", name: "Escudo Brasil", isCrack: false, imageUrl: "", sourceUrl: "" },
  { id: "2", code: "ARG1", team: "Argentina", group: "B", number: 1, category: "Player", rarity: "Base", name: "Messi", isCrack: true, imageUrl: "", sourceUrl: "" }
];

const myCollection: CollectionState = {
  BRA1: { owned: true, duplicates: 2, notes: "", updatedAt: "2026-05-21T00:00:00.000Z" }
};

const friendPayload = {
  type: "panini-2026-trade-list",
  datasetVersion: "v1",
  exportedAt: "2026-05-21T00:00:00.000Z",
  owner: "Juan",
  repes: ["ARG1"],
  faltantes: ["BRA1"]
};

describe("IntercambiosPage", () => {
  it("renders my list counters", () => {
    render(<IntercambiosPage stickers={stickers} collection={myCollection} datasetVersion="v1" />);
    expect(screen.getByText(/Repes:\s*1/)).toBeInTheDocument();
    expect(screen.getByText(/Faltantes:\s*1/)).toBeInTheDocument();
  });

  it("renders matches after pasting friend JSON", () => {
    render(<IntercambiosPage stickers={stickers} collection={myCollection} datasetVersion="v1" />);

    fireEvent.change(screen.getByPlaceholderText(/Pega aquí el JSON/i), {
      target: { value: JSON.stringify(friendPayload) }
    });
    fireEvent.click(screen.getByText("Cargar lista"));

    expect(screen.getByText(/Amigo:\s*Juan/)).toBeInTheDocument();
    expect(screen.getByText(/Escudos/)).toBeInTheDocument();
    expect(screen.getByText(/Cracks/)).toBeInTheDocument();
  });

  it("shows error on invalid JSON", () => {
    render(<IntercambiosPage stickers={stickers} collection={myCollection} datasetVersion="v1" />);

    fireEvent.change(screen.getByPlaceholderText(/Pega aquí el JSON/i), {
      target: { value: "{not json" }
    });
    fireEvent.click(screen.getByText("Cargar lista"));

    expect(screen.getByRole("alert")).toHaveTextContent(/Formato inválido/);
  });

  it("warns when dataset version differs", () => {
    render(<IntercambiosPage stickers={stickers} collection={myCollection} datasetVersion="v2" />);

    fireEvent.change(screen.getByPlaceholderText(/Pega aquí el JSON/i), {
      target: { value: JSON.stringify(friendPayload) }
    });
    fireEvent.click(screen.getByText("Cargar lista"));

    expect(screen.getByRole("status")).toHaveTextContent(/dataset distinto/);
  });
});
