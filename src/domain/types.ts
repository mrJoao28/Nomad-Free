export const CATEGORIES = [
  "BUDGET_DESTINATION",
  "ACCOMMODATION_EXCHANGE",
  "VOLUNTEERING",
  "REMOTE_FRIENDLY",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const REGIONS = [
  "SOUTH_AMERICA",
  "CENTRAL_AMERICA_CARIBBEAN",
  "EUROPE",
  "ASIA",
  "AFRICA",
] as const;
export type Region = (typeof REGIONS)[number];

export type PriceKind = "ESTIMATE" | "VERIFIED";

/** Moeda de referência dos filtros de orçamento. */
export const BUDGET_CURRENCY = "BRL";

export type ItemKind = "destination" | "opportunity";

/** Visão unificada usada em listagens, cards, filtros e ordenação. */
export interface CatalogItem {
  kind: ItemKind;
  slug: string;
  href: string;
  title: string;
  /** Ex.: "Medellín, Colômbia" */
  locationLabel: string;
  summary: string;
  categories: Category[];
  region: Region;
  /** Custo diário estimado em centavos. */
  dailyCostMinor: number;
  currency: string;
  priceKind: PriceKind;
  imageKey: string;
  /** Apenas destinos. */
  remoteWorkScore?: number;
}

export interface DestinationDetail {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: Region;
  categories: Category[];
  summary: string;
  description: string;
  dailyBudgetMinor: number;
  currency: string;
  priceKind: PriceKind;
  verifiedAt: Date | null;
  sourceLabel: string;
  remoteWorkScore: number;
  internetNotes: string;
  coworkingNotes: string;
  bestSeason: string;
  imageKey: string;
  isDemo: boolean;
}

export interface OpportunityDetail {
  id: string;
  slug: string;
  title: string;
  category: Category;
  summary: string;
  conditions: string;
  hoursPerWeek: number | null;
  dailyCostMinor: number;
  upfrontFeeMinor: number | null;
  currency: string;
  priceKind: PriceKind;
  verifiedAt: Date | null;
  sourceLabel: string;
  externalUrl: string | null;
  imageKey: string;
  isDemo: boolean;
  destination: { slug: string; name: string; country: string; region: Region };
}
