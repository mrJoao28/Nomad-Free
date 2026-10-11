import { BUDGET_CURRENCY, type CatalogItem, type Category, type Region } from "./types";

export type SortOrder = "relevancia" | "menor-custo" | "maior-custo" | "melhor-trabalho-remoto";

export interface CatalogFilters {
  q?: string;
  category?: Category;
  region?: Region;
  /** Orçamento diário máximo em centavos (moeda de referência: BRL). */
  maxDailyMinor?: number;
}

/** Minúsculas e sem acentos, para busca tolerante. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function tokens(q: string): string[] {
  return normalizeText(q).split(/\s+/).filter(Boolean);
}

/** Pontuação de relevância: título pesa mais que local, que pesa mais que resumo. */
export function relevanceScore(item: CatalogItem, q?: string): number {
  const base = item.kind === "destination" ? 1 : 0;
  if (!q || tokens(q).length === 0) return base;
  const title = normalizeText(item.title);
  const location = normalizeText(item.locationLabel);
  const summary = normalizeText(item.summary);
  let score = 0;
  for (const token of tokens(q)) {
    if (title.includes(token)) score += 6;
    if (location.includes(token)) score += 3;
    if (summary.includes(token)) score += 1;
  }
  return score > 0 ? score + base : 0;
}

export function filterItems(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
  const q = filters.q?.trim();
  const hasQuery = !!q && tokens(q).length > 0;
  return items.filter((item) => {
    if (filters.category && !item.categories.includes(filters.category)) return false;
    if (filters.region && item.region !== filters.region) return false;
    if (filters.maxDailyMinor !== undefined) {
      // Só comparamos valores na moeda de referência; outras moedas ficam de fora do filtro.
      if (item.currency !== BUDGET_CURRENCY) return false;
      if (item.dailyCostMinor > filters.maxDailyMinor) return false;
    }
    if (hasQuery && relevanceScore(item, q) === 0) return false;
    return true;
  });
}

export function sortItems(items: CatalogItem[], order: SortOrder, q?: string): CatalogItem[] {
  const copy = [...items];
  const byTitle = (a: CatalogItem, b: CatalogItem) => a.title.localeCompare(b.title, "pt-BR");
  switch (order) {
    case "menor-custo":
      return copy.sort((a, b) => a.dailyCostMinor - b.dailyCostMinor || byTitle(a, b));
    case "maior-custo":
      return copy.sort((a, b) => b.dailyCostMinor - a.dailyCostMinor || byTitle(a, b));
    case "melhor-trabalho-remoto":
      // Só destinos têm nota; oportunidades vão para o fim. Desempate: mais barato, depois título.
      return copy.sort(
        (a, b) =>
          (b.remoteWorkScore ?? -1) - (a.remoteWorkScore ?? -1) ||
          a.dailyCostMinor - b.dailyCostMinor ||
          byTitle(a, b),
      );
    case "relevancia":
    default:
      return copy.sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q) || byTitle(a, b));
  }
}

export function searchCatalog(
  items: CatalogItem[],
  filters: CatalogFilters,
  order: SortOrder,
): CatalogItem[] {
  return sortItems(filterItems(items, filters), order, filters.q);
}

export function findBySlug<T extends { slug: string }>(items: T[], slug: string): T | undefined {
  return items.find((item) => item.slug === slug);
}
