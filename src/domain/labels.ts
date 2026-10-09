import type { Category, PriceKind, Region } from "./types";

export const CATEGORY_LABELS: Record<Category, string> = {
  BUDGET_DESTINATION: "Destino econômico",
  ACCOMMODATION_EXCHANGE: "Troca de hospedagem",
  VOLUNTEERING: "Voluntariado",
  REMOTE_FRIENDLY: "Bom para trabalho remoto",
};

/** Valores usados na URL (query params). */
export const CATEGORY_SLUGS: Record<Category, string> = {
  BUDGET_DESTINATION: "destino-economico",
  ACCOMMODATION_EXCHANGE: "troca-hospedagem",
  VOLUNTEERING: "voluntariado",
  REMOTE_FRIENDLY: "trabalho-remoto",
};

export const REGION_LABELS: Record<Region, string> = {
  SOUTH_AMERICA: "América do Sul",
  CENTRAL_AMERICA_CARIBBEAN: "América Central e Caribe",
  EUROPE: "Europa",
  ASIA: "Ásia",
  AFRICA: "África",
};

export const REGION_SLUGS: Record<Region, string> = {
  SOUTH_AMERICA: "america-do-sul",
  CENTRAL_AMERICA_CARIBBEAN: "america-central-caribe",
  EUROPE: "europa",
  ASIA: "asia",
  AFRICA: "africa",
};

export const PRICE_KIND_LABELS: Record<PriceKind, string> = {
  ESTIMATE: "Estimativa ilustrativa",
  VERIFIED: "Preço verificado",
};
