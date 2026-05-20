import { StickerCard } from "../components/StickerCard";
import { getMissingStickers } from "../domain/progress";
import type { CollectionState, Sticker } from "../domain/types";

type FaltantesPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
  onSetImage: (code: string, image: string) => void;
  onClearImage: (code: string) => void;
};

export function FaltantesPage({ stickers, collection, onToggleOwned, onSetDuplicates, onSetImage, onClearImage }: FaltantesPageProps) {
  const missing = getMissingStickers(stickers, collection);
  return (
    <section className="sticker-grid">
      {missing.map((sticker) => (
        <StickerCard
          key={sticker.code}
          sticker={sticker}
          entry={collection[sticker.code]}
          onToggleOwned={onToggleOwned}
          onSetDuplicates={onSetDuplicates}
          onSetImage={onSetImage}
          onClearImage={onClearImage}
        />
      ))}
    </section>
  );
}
