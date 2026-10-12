import { estimateTripBudget, type TripBudget } from "./money";
import { slugSchema } from "./search-params";
import type { ResortDetail } from "./types";

export const MAX_COMPARE = 3;
export const DEFAULT_COMPARE_DAYS = 7;
export const MAX_COMPARE_DAYS = 60;

type RawParams = Record<string, string | string[] | undefined>;

export interface CompareQuery {
  /** Slugs válidos, sem repetição, no máximo MAX_COMPARE, na ordem recebida. */
  slugs: string[];
  days: number;
  /** Parâmetros presentes porém inválidos (ignorados). */
  ignored: string[];
}

/**
 * Lê ?d=slug&d=slug&dias=7. Valores inválidos são ignorados (nunca lançam)
 * e listados em `ignored` para que a UI possa avisar.
 */
export function parseCompareParams(params: RawParams): CompareQuery {
  const ignored: string[] = [];

  const rawSlugs = ([] as (string | undefined)[])
    .concat(params.d)
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((v) => v.trim());
  const slugs: string[] = [];
  for (const slug of rawSlugs) {
    if (!slugSchema.safeParse(slug).success) {
      if (!ignored.includes("d")) ignored.push("d");
      continue;
    }
    if (!slugs.includes(slug) && slugs.length < MAX_COMPARE) slugs.push(slug);
  }

  let days = DEFAULT_COMPARE_DAYS;
  const rawDays = ([] as (string | undefined)[]).concat(params.dias)[0];
  if (rawDays !== undefined && rawDays !== "") {
    const n = Number(rawDays);
    if (Number.isInteger(n) && n >= 1 && n <= MAX_COMPARE_DAYS) days = n;
    else ignored.push("dias");
  }

  return { slugs, days, ignored };
}

export interface ComparisonRow {
  resort: ResortDetail;
  budget: TripBudget;
  /** Menor custo diário entre os comparados (só quando todos usam a mesma moeda). */
  isCheapest: boolean;
  /** Maior altitude máxima entre os comparados. */
  isHighest: boolean;
  /** Maior área esquiável (tamanho relativo) entre as comparadas. */
  isLargest: boolean;
}

/**
 * Monta a comparação. Destaques só aparecem com 2+ estações e, para custo,
 * apenas quando todas usam a mesma moeda (não convertemos moedas).
 * Em empate, todas as empatadas são destacadas; se todas empatam, nada é destacado.
 */
export function buildComparison(resorts: ResortDetail[], days: number): ComparisonRow[] {
  const multiple = resorts.length >= 2;
  const sameCurrency = resorts.every((r) => r.currency === resorts[0]?.currency);
  const minCost = Math.min(...resorts.map((r) => r.dailyBudgetMinor));
  const maxCost = Math.max(...resorts.map((r) => r.dailyBudgetMinor));
  const maxTop = Math.max(...resorts.map((r) => r.topElevationM));
  const minTop = Math.min(...resorts.map((r) => r.topElevationM));
  const maxSize = Math.max(...resorts.map((r) => r.sizeRank));
  const minSize = Math.min(...resorts.map((r) => r.sizeRank));

  return resorts.map((resort) => ({
    resort,
    budget: estimateTripBudget(resort.dailyBudgetMinor, days, resort.currency),
    isCheapest:
      multiple && sameCurrency && minCost !== maxCost && resort.dailyBudgetMinor === minCost,
    isHighest: multiple && maxTop !== minTop && resort.topElevationM === maxTop,
    isLargest: multiple && maxSize !== minSize && resort.sizeRank === maxSize,
  }));
}
