import type { PriceKind, Region, Tag } from "./types";

export const TAG_LABELS: Record<Tag, string> = {
  BEGINNERS: "Iniciantes",
  FAMILY: "Família",
  ADVANCED: "Avançados",
  FREERIDE: "Freeride",
  LARGE_AREA: "Grande área esquiável",
  HIGH_ALTITUDE: "Altitude e neve confiável",
  APRES_SKI: "Après-ski",
  LUXURY: "Luxo",
  BUDGET: "Econômico",
  PARK: "Snowpark",
};

/** Valores usados na URL (query params). */
export const TAG_SLUGS: Record<Tag, string> = {
  BEGINNERS: "iniciantes",
  FAMILY: "familia",
  ADVANCED: "avancados",
  FREERIDE: "freeride",
  LARGE_AREA: "grande-area",
  HIGH_ALTITUDE: "altitude",
  APRES_SKI: "apres-ski",
  LUXURY: "luxo",
  BUDGET: "economico",
  PARK: "snowpark",
};

export const REGION_LABELS: Record<Region, string> = {
  ALPS: "Alpes",
  EUROPE_OTHER: "Europa (fora dos Alpes)",
  NORTH_AMERICA: "América do Norte",
  ASIA: "Ásia",
  SOUTH_AMERICA: "América do Sul",
  OCEANIA: "Oceania",
};

export const REGION_SLUGS: Record<Region, string> = {
  ALPS: "alpes",
  EUROPE_OTHER: "europa-outros",
  NORTH_AMERICA: "america-do-norte",
  ASIA: "asia",
  SOUTH_AMERICA: "america-do-sul",
  OCEANIA: "oceania",
};

export const PRICE_KIND_LABELS: Record<PriceKind, string> = {
  ESTIMATE: "Estimativa ilustrativa",
  VERIFIED: "Preço verificado",
};

/** Tamanho relativo da área esquiável. */
export const SIZE_LABELS: Record<number, string> = {
  1: "Compacta",
  2: "Pequena",
  3: "Média",
  4: "Grande",
  5: "Gigante",
};

/** Altitude em metros, no padrão brasileiro (ex.: "3.883 m"). */
export function formatElevation(meters: number): string {
  return `${new Intl.NumberFormat("pt-BR").format(meters)} m`;
}
