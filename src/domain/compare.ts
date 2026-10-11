import { estimateTripBudget, type TripBudget } from "./money";
import { slugSchema } from "./search-params";
import type { DestinationDetail } from "./types";

export const MAX_COMPARE = 3;
export const DEFAULT_COMPARE_DAYS = 30;
export const MAX_COMPARE_DAYS = 365;

type RawParams = Record<string, string | string[] | undefined>;

export interface CompareQuery {
  /** Slugs válidos, sem repetição, no máximo MAX_COMPARE, na ordem recebida. */
  slugs: string[];
  days: number;
  /** Parâmetros presentes porém inválidos (ignorados). */
  ignored: string[];
}

/**
 * Lê ?d=slug&d=slug&dias=30. Valores inválidos são ignorados (nunca lançam)
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
  destination: DestinationDetail;
  budget: TripBudget;
  /** Menor custo diário entre os comparados (só quando todos usam a mesma moeda). */
  isCheapest: boolean;
  /** Maior nota de trabalho remoto entre os comparados. */
  isBestRemote: boolean;
}

/**
 * Monta a comparação. Destaques só aparecem com 2+ destinos e, para custo,
 * apenas quando todos usam a mesma moeda (não convertemos moedas).
 */
export function buildComparison(destinations: DestinationDetail[], days: number): ComparisonRow[] {
  const sameCurrency = destinations.every((d) => d.currency === destinations[0]?.currency);
  const minCost = Math.min(...destinations.map((d) => d.dailyBudgetMinor));
  const maxRemote = Math.max(...destinations.map((d) => d.remoteWorkScore));
  const multiple = destinations.length >= 2;

  return destinations.map((destination) => ({
    destination,
    budget: estimateTripBudget(destination.dailyBudgetMinor, days, destination.currency),
    isCheapest: multiple && sameCurrency && destination.dailyBudgetMinor === minCost,
    isBestRemote: multiple && destination.remoteWorkScore === maxRemote,
  }));
}
