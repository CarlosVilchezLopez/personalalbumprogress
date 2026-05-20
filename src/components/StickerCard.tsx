import type { CollectionEntry, Sticker } from "../domain/types";

type StickerCardProps = {
  sticker: Sticker;
  entry?: CollectionEntry;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
};

function normalizeDuplicates(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

function displayTitle(sticker: Sticker): string {
  if (sticker.category === "Team Badge") {
    const variant = sticker.number === 2 ? " (2)" : "";
    return `${sticker.team} Escudo${variant}`;
  }
  if (sticker.category === "Team Photo") return `${sticker.team} Plantilla`;
  return sticker.name || sticker.code;
}

export function StickerCard({ sticker, entry, onToggleOwned, onSetDuplicates }: StickerCardProps) {
  const duplicates = Math.max(0, entry?.duplicates ?? 0);
  const owned = Boolean(entry?.owned || duplicates > 0);
  const title = displayTitle(sticker);

  return (
    <article className={`sticker-card ${owned ? "is-owned" : ""}`}>
      <div className={`sticker-card__image ${owned ? "has-image" : "is-empty"}`}>
        {owned && sticker.imageUrl ? <img src={sticker.imageUrl} alt={title} loading="lazy" /> : null}
        <span>{sticker.code}</span>
      </div>
      <div className="sticker-card__body">
        <div>
          <strong>{title}</strong>
          <small>
            {sticker.team} · {sticker.category} · {sticker.rarity}
          </small>
        </div>
        {sticker.isCrack ? <span className="sticker-card__crack">Crack</span> : null}
      </div>
      <div className="sticker-card__actions">
        <label>
          <input
            type="checkbox"
            checked={owned}
            onChange={(event) => onToggleOwned(sticker.code, event.target.checked)}
          />
          Tengo
        </label>
        <input
          aria-label={`Repetidas de ${sticker.code}`}
          min={0}
          step={1}
          type="number"
          value={duplicates}
          onChange={(event) => onSetDuplicates(sticker.code, normalizeDuplicates(event.target.value))}
        />
      </div>
    </article>
  );
}
