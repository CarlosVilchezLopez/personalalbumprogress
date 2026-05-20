export type StickerRarity = "Base" | "Foil" | "Special" | string;

export type Sticker = {
  id: string;
  code: string;
  team: string;
  group: string;
  number: number;
  category: string;
  rarity: StickerRarity;
  name: string;
  isCrack: boolean;
  imageUrl: string;
  sourceUrl: string;
};

export type CollectionEntry = {
  owned: boolean;
  duplicates: number;
  notes: string;
  updatedAt: string;
  image?: string;
};

export type CollectionState = Record<string, CollectionEntry>;

export type OverallProgress = {
  total: number;
  owned: number;
  missing: number;
  duplicates: number;
  completionPercent: number;
  cracksTotal: number;
  cracksOwned: number;
  cracksCompletionPercent: number;
};

export type TeamProgress = OverallProgress & {
  team: string;
  group: string;
};
