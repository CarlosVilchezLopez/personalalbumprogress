import { useRef, useState } from "react";
import type { CollectionEntry, Sticker } from "../domain/types";

type StickerCardProps = {
  sticker: Sticker;
  entry?: CollectionEntry;
  onToggleOwned: (code: string, owned: boolean) => void;
  onSetDuplicates: (code: string, duplicates: number) => void;
  onSetImage: (code: string, image: string) => void;
  onClearImage: (code: string) => void;
};

const MAX_DIMENSION = 400;
const JPEG_QUALITY = 0.72;

function normalizeDuplicates(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

async function fileToDownscaledDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read error"));
    reader.readAsDataURL(file);
  });

  if (typeof document === "undefined" || typeof Image === "undefined") return dataUrl;

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export function StickerCard({
  sticker,
  entry,
  onToggleOwned,
  onSetDuplicates,
  onSetImage,
  onClearImage
}: StickerCardProps) {
  const duplicates = Math.max(0, entry?.duplicates ?? 0);
  const owned = Boolean(entry?.owned || duplicates > 0);
  const title = sticker.name || sticker.code;
  const currentImage = entry?.image || sticker.imageUrl;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const data = await fileToDownscaledDataUrl(file);
      onSetImage(sticker.code, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleUrlApply() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setError(null);
    try {
      onSetImage(sticker.code, trimmed);
      setUrlInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar URL");
    }
  }

  return (
    <article className={`sticker-card ${owned ? "is-owned" : ""}`}>
      <div className="sticker-card__image">
        {currentImage ? <img src={currentImage} alt={title} loading="lazy" /> : null}
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
      <div className="sticker-card__image-tools">
        <label className="sticker-card__file-btn">
          Subir
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            aria-label={`Imagen de ${sticker.code}`}
            onChange={handleFileChange}
          />
        </label>
        <input
          type="url"
          placeholder="URL imagen"
          aria-label={`URL imagen de ${sticker.code}`}
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleUrlApply();
            }
          }}
        />
        {entry?.image ? (
          <button type="button" onClick={() => onClearImage(sticker.code)}>
            Quitar
          </button>
        ) : null}
      </div>
      {error ? <p className="sticker-card__error">{error}</p> : null}
    </article>
  );
}
