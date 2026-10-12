import { BUDGET_CURRENCY, type Region, type ResortItem, type Tag } from "./types";

export type SortOrder =
  "curadoria" | "menor-custo" | "maior-custo" | "maior-altitude" | "maior-area";

export interface ResortFilters {
  q?: string;
  tag?: Tag;
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

/** Pontuação de relevância: nome pesa mais que país/região, que pesa mais que o resumo. */
export function relevanceScore(item: ResortItem, q?: string): number {
  if (!q || tokens(q).length === 0) return 0;
  const name = normalizeText(item.name);
  const place = normalizeText(`${item.country} ${item.mountainRange}`);
  const summary = normalizeText(item.summary);
  let score = 0;
  for (const token of tokens(q)) {
    if (name.includes(token)) score += 6;
    if (place.includes(token)) score += 3;
    if (summary.includes(token)) score += 1;
  }
  return score;
}

export function filterItems(items: ResortItem[], filters: ResortFilters): ResortItem[] {
  const q = filters.q?.trim();
  const hasQuery = !!q && tokens(q).length > 0;
  return items.filter((item) => {
    if (filters.tag && !item.tags.includes(filters.tag)) return false;
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

/**
 * "curadoria" ordena por relevância da busca (quando há termo) e, em empate ou sem busca,
 * pela posição na curadoria NomadFree.
 */
export function sortItems(items: ResortItem[], order: SortOrder, q?: string): ResortItem[] {
  const copy = [...items];
  const byRank = (a: ResortItem, b: ResortItem) => a.curatedRank - b.curatedRank;
  switch (order) {
    case "menor-custo":
      return copy.sort((a, b) => a.dailyCostMinor - b.dailyCostMinor || byRank(a, b));
    case "maior-custo":
      return copy.sort((a, b) => b.dailyCostMinor - a.dailyCostMinor || byRank(a, b));
    case "maior-altitude":
      return copy.sort((a, b) => b.topElevationM - a.topElevationM || byRank(a, b));
    case "maior-area":
      return copy.sort((a, b) => b.sizeRank - a.sizeRank || byRank(a, b));
    case "curadoria":
    default:
      return copy.sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q) || byRank(a, b));
  }
}

export function searchResorts(
  items: ResortItem[],
  filters: ResortFilters,
  order: SortOrder,
): ResortItem[] {
  return sortItems(filterItems(items, filters), order, filters.q);
}

export function findBySlug<T extends { slug: string }>(items: T[], slug: string): T | undefined {
  return items.find((item) => item.slug === slug);
}
