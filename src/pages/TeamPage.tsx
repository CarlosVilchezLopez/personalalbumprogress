import { StickerCard } from "../components/StickerCard";
import { StatTile } from "../components/StatTile";
import { getOverallProgress } from "../domain/progress";
import type { CollectionState, Sticker } from "../domain/types";

type TeamPageProps = {
  team: string;
  stickers: Sticker[];
  collection: CollectionState;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
};

export function TeamPage({ team, stickers, collection, onToggleOwned, onSetDuplicates }: TeamPageProps) {
  const teamStickers = stickers.filter((sticker) => sticker.team === team);
  const progress = getOverallProgress(teamStickers, collection);

  return (
    <section className="page-stack">
      <div className="stats-grid">
        <StatTile label={team} value={`${progress.completionPercent}%`} detail={`${progress.owned}/${progress.total}`} />
        <StatTile label="Cracks" value={`${progress.cracksOwned}/${progress.cracksTotal}`} />
        <StatTile label="Repetidas" value={progress.duplicates} />
      </div>
      <div className="sticker-grid">
        {teamStickers.map((sticker) => (
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
