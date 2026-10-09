import { z } from "zod";
import { CATEGORY_SLUGS, REGION_SLUGS } from "./labels";
import { CATEGORIES, REGIONS, type Category, type Region } from "./types";
import { reaisToMinor } from "./money";
import type { CatalogFilters, SortOrder } from "./catalog";

export const MAX_BUDGET_REAIS = 1000;

const SORT_ORDERS = ["relevancia", "menor-custo", "maior-custo"] as const;

const categorySlug = z.enum(Object.values(CATEGORY_SLUGS) as [string, ...string[]]);
const regionSlug = z.enum(Object.values(REGION_SLUGS) as [string, ...string[]]);

const rawSchema = {
  q: z.string().trim().max(80),
  categoria: categorySlug,
  regiao: regionSlug,
  orcamento: z.coerce.number().int().min(0).max(MAX_BUDGET_REAIS),
  ordem: z.enum(SORT_ORDERS),
};

export interface ExploreQuery {
  filters: CatalogFilters;
  order: SortOrder;
  /** Parâmetros presentes porém inválidos (ignorados). */
  ignored: string[];
}

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v === undefined || v === "" ? undefined : v;
}

function slugToEnum<T extends string>(map: Record<T, string>, slug: string, all: readonly T[]) {
  return all.find((key) => map[key] === slug);
}

/**
 * Lê e valida parâmetros controlados pelo usuário. Valores inválidos são ignorados
 * (nunca lançam) e listados em `ignored` para que a UI possa avisar.
 */
export function parseExploreParams(params: RawParams): ExploreQuery {
  const ignored: string[] = [];
  const pick = <K extends keyof typeof rawSchema>(key: K) => {
    const raw = first(params[key]);
    if (raw === undefined) return undefined;
    const result = rawSchema[key].safeParse(raw);
    if (!result.success) {
      ignored.push(key);
      return undefined;
    }
    return result.data as z.infer<(typeof rawSchema)[K]>;
  };

  const q = pick("q");
  const categoria = pick("categoria");
  const regiao = pick("regiao");
  const orcamento = pick("orcamento");
  const ordem = pick("ordem");

  const category: Category | undefined = categoria
    ? slugToEnum(CATEGORY_SLUGS, categoria, CATEGORIES)
    : undefined;
  const region: Region | undefined = regiao ? slugToEnum(REGION_SLUGS, regiao, REGIONS) : undefined;

  return {
    filters: {
      q: q || undefined,
      category,
      region,
      maxDailyMinor: orcamento !== undefined ? reaisToMinor(orcamento) : undefined,
    },
    order: ordem ?? "relevancia",
    ignored,
  };
}

export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
