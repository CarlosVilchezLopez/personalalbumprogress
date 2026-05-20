import { StickerCard } from "../components/StickerCard";
import { getDuplicateStickers } from "../domain/progress";
import type { CollectionState, Sticker } from "../domain/types";

type RepetidasPageProps = {
  stickers: Sticker[];
  collection: CollectionState;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
  onSetImage: (code: string, image: string) => void;
  onClearImage: (code: string) => void;
};

export function RepetidasPage({ stickers, collection, onToggleOwned, onSetDuplicates, onSetImage, onClearImage }: RepetidasPageProps) {
  const duplicates = getDuplicateStickers(stickers, collection);
  return (
    <section className="sticker-grid">
      {duplicates.map(({ sticker }) => (
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
