import { useMemo, useState } from "react";
import { StickerCard } from "../components/StickerCard";
import { StickerFilters, type StickerFilterState } from "../components/StickerFilters";
import type { CollectionState, Sticker } from "../domain/types";

type AlbumPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
};

export function AlbumPage({ stickers, collection, onToggleOwned, onSetDuplicates }: AlbumPageProps) {
  const [filters, setFilters] = useState<StickerFilterState>({ query: "", team: "", status: "all" });
  const teams = useMemo(() => [...new Set(stickers.map((sticker) => sticker.team))].sort(), [stickers]);

  const filtered = stickers.filter((sticker) => {
    const entry = collection[sticker.code];
    const owned = Boolean(entry?.owned || (entry?.duplicates ?? 0) > 0);
    const haystack = `${sticker.code} ${sticker.team} ${sticker.name}`.toLowerCase();
    if (filters.query && !haystack.includes(filters.query.toLowerCase())) return false;
    if (filters.team && sticker.team !== filters.team) return false;
    if (filters.status === "owned" && !owned) return false;
    if (filters.status === "missing" && owned) return false;
    if (filters.status === "duplicates" && (entry?.duplicates ?? 0) === 0) return false;
    if (filters.status === "cracks" && !sticker.isCrack) return false;
    return true;
  });

  return (
    <section className="page-stack">
      <StickerFilters filters={filters} teams={teams} onChange={setFilters} />
      <div className="sticker-grid">
        {filtered.map((sticker) => (
          <StickerCard
            key={sticker.code}
            sticker={sticker}
            entry={collection[sticker.code]}
            onToggleOwned={onToggleOwned}
            onSetDuplicates={onSetDuplicates}
          />
        ))}
      </div>
    </section>
  );
}
