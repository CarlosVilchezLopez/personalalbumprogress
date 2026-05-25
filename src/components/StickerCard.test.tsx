import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StickerCard } from "./StickerCard";
import type { Sticker } from "../domain/types";

const sticker: Sticker = {
  id: "arg-1",
  code: "ARG1",
  team: "Argentina",
  group: "Grupo J",
  number: 1,
  category: "Player",
  rarity: "Base",
  name: "Lionel Messi",
  isCrack: true,
  imageUrl: "",
  sourceUrl: "https://paniniwm2026sticker.com/"
};

describe("StickerCard duplicates controls", () => {
  it("increments duplicates when + button clicked", () => {
    const onSetDuplicates = vi.fn();
    render(
      <StickerCard
        sticker={sticker}
        entry={{ owned: true, duplicates: 2, notes: "", updatedAt: "2026-05-21T00:00:00.000Z" }}
        onToggleOwned={vi.fn()}
        onSetDuplicates={onSetDuplicates}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: `Sumar repetida de ${sticker.code}` }));

    expect(onSetDuplicates).toHaveBeenCalledWith(sticker.code, 3);
  });

  it("decrements duplicates when - button clicked", () => {
    const onSetDuplicates = vi.fn();
    render(
      <StickerCard
        sticker={sticker}
        entry={{ owned: true, duplicates: 2, notes: "", updatedAt: "2026-05-21T00:00:00.000Z" }}
        onToggleOwned={vi.fn()}
        onSetDuplicates={onSetDuplicates}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: `Restar repetida de ${sticker.code}` }));

    expect(onSetDuplicates).toHaveBeenCalledWith(sticker.code, 1);
  });

  it("does not decrement below zero", () => {
    const onSetDuplicates = vi.fn();
    render(
      <StickerCard
        sticker={sticker}
        entry={{ owned: true, duplicates: 0, notes: "", updatedAt: "2026-05-21T00:00:00.000Z" }}
        onToggleOwned={vi.fn()}
        onSetDuplicates={onSetDuplicates}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: `Restar repetida de ${sticker.code}` }));

    expect(onSetDuplicates).not.toHaveBeenCalled();
  });

  it("increments from zero when no entry exists", () => {
    const onSetDuplicates = vi.fn();
    render(
      <StickerCard
        sticker={sticker}
        onToggleOwned={vi.fn()}
        onSetDuplicates={onSetDuplicates}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: `Sumar repetida de ${sticker.code}` }));

    expect(onSetDuplicates).toHaveBeenCalledWith(sticker.code, 1);
  });
});
