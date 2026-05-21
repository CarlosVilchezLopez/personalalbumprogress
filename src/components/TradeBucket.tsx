import type { TradeBucket as TradeBucketModel } from "../domain/types";

type TradeBucketProps = {
  bucket: TradeBucketModel;
};

export function TradeBucket({ bucket }: TradeBucketProps) {
  return (
    <details className="trade-bucket" open>
      <summary>
        {bucket.label} ({bucket.stickers.length})
      </summary>
      <ul className="trade-bucket__list">
        {bucket.stickers.map((sticker) => (
          <li key={sticker.code} className="trade-bucket__item">
            {sticker.imageUrl ? (
              <img src={sticker.imageUrl} alt={sticker.name || sticker.code} loading="lazy" />
            ) : null}
            <span>
              <strong>{sticker.code}</strong> · {sticker.name || sticker.team}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
