export const TAGS = [
  "BEGINNERS",
  "FAMILY",
  "ADVANCED",
  "FREERIDE",
  "LARGE_AREA",
  "HIGH_ALTITUDE",
  "APRES_SKI",
  "LUXURY",
  "BUDGET",
  "PARK",
] as const;
export type Tag = (typeof TAGS)[number];

export const REGIONS = [
  "ALPS",
  "EUROPE_OTHER",
  "NORTH_AMERICA",
  "ASIA",
  "SOUTH_AMERICA",
  "OCEANIA",
] as const;
export type Region = (typeof REGIONS)[number];

export type PriceKind = "ESTIMATE" | "VERIFIED";

/** Moeda de referência dos filtros de orçamento. */
export const BUDGET_CURRENCY = "BRL";

/** Visão resumida usada em listagens, cards, filtros e ordenação. */
export interface ResortItem {
  slug: string;
  href: string;
  name: string;
  country: string;
  /** Ex.: "Zermatt, Suíça" */
  locationLabel: string;
  summary: string;
  tags: Tag[];
  region: Region;
  mountainRange: string;
  curatedRank: number;
  /** Altitude máxima aproximada, em metros. */
  topElevationM: number;
  areaLabel: string;
  /** Tamanho relativo de 1 a 5. */
  sizeRank: number;
  seasonLabel: string;
  /** Custo diário estimado por pessoa, em centavos. */
  dailyCostMinor: number;
  currency: string;
  priceKind: PriceKind;
  imageKey: string;
  /** Caminho público da foto real, quando existir (resolvido no servidor). */
  photoSrc?: string;
}

export interface ResortDetail {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: Region;
  mountainRange: string;
  tags: Tag[];
  summary: string;
  description: string;
  curatedRank: number;
  topElevationM: number;
  areaLabel: string;
  sizeRank: number;
  seasonLabel: string;
  dailyBudgetMinor: number;
  currency: string;
  priceKind: PriceKind;
  verifiedAt: Date | null;
  sourceLabel: string;
  imageKey: string;
  isDemo: boolean;
}
