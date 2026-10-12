import { describe, expect, it } from "vitest";
import {
  buildComparison,
  DEFAULT_COMPARE_DAYS,
  MAX_COMPARE,
  parseCompareParams,
} from "@/domain/compare";
import type { ResortDetail } from "@/domain/types";

function resort(overrides: Partial<ResortDetail>): ResortDetail {
  return {
    id: "id",
    slug: "x",
    name: "X",
    country: "País",
    region: "ALPS",
    mountainRange: "Alpes",
    tags: ["FAMILY"],
    summary: "",
    description: "",
    curatedRank: 1,
    topElevationM: 3000,
    areaLabel: "",
    sizeRank: 3,
    seasonLabel: "Dez–Abr",
    dailyBudgetMinor: 160000,
    currency: "BRL",
    priceKind: "ESTIMATE",
    verifiedAt: null,
    sourceLabel: "demo",
    imageKey: "x",
    isDemo: true,
    ...overrides,
  };
}

describe("parseCompareParams", () => {
  it("usa padrões sem parâmetros", () => {
    expect(parseCompareParams({})).toEqual({
      slugs: [],
      days: DEFAULT_COMPARE_DAYS,
      ignored: [],
    });
  });

  it("aceita um slug único e vários slugs repetidos", () => {
    expect(parseCompareParams({ d: "zermatt" }).slugs).toEqual(["zermatt"]);
    expect(parseCompareParams({ d: ["a", "b", "c"] }).slugs).toEqual(["a", "b", "c"]);
  });

  it("ignora vazios, remove repetidos e limita ao máximo", () => {
    const r = parseCompareParams({ d: ["a", "", "a", "b", "c", "d"] });
    expect(r.slugs).toEqual(["a", "b", "c"]);
    expect(r.slugs).toHaveLength(MAX_COMPARE);
    expect(r.ignored).toEqual([]);
  });

  it("descarta slugs inválidos e avisa", () => {
    const r = parseCompareParams({ d: ["../etc/passwd", "ok-slug", "UPPER"] });
    expect(r.slugs).toEqual(["ok-slug"]);
    expect(r.ignored).toEqual(["d"]);
  });

  it("valida a quantidade de dias", () => {
    expect(parseCompareParams({ dias: "15" }).days).toBe(15);
    for (const bad of ["0", "-3", "61", "abc", "2.5"]) {
      const r = parseCompareParams({ dias: bad });
      expect(r.days).toBe(DEFAULT_COMPARE_DAYS);
      expect(r.ignored).toEqual(["dias"]);
    }
  });
});

describe("buildComparison", () => {
  const a = resort({ slug: "a", dailyBudgetMinor: 300000, topElevationM: 3883, sizeRank: 4 });
  const b = resort({ slug: "b", dailyBudgetMinor: 150000, topElevationM: 2000, sizeRank: 2 });

  it("calcula o orçamento da viagem com inteiros", () => {
    const budget = buildComparison([a, b], 7)[0]?.budget;
    expect(budget?.expectedMinor).toBe(2100000);
    expect(budget?.lowMinor).toBe(1680000);
    expect(budget?.highMinor).toBe(2730000);
  });

  it("destaca a mais barata, a mais alta e a de maior área", () => {
    const [ra, rb] = buildComparison([a, b], 7);
    expect(ra).toMatchObject({ isCheapest: false, isHighest: true, isLargest: true });
    expect(rb).toMatchObject({ isCheapest: true, isHighest: false, isLargest: false });
  });

  it("marca empates parciais, mas não destaca quando todas empatam", () => {
    const c = resort({ slug: "c", dailyBudgetMinor: 150000, topElevationM: 2000, sizeRank: 2 });
    const rows = buildComparison([a, b, c], 7);
    expect(rows.map((r) => r.isCheapest)).toEqual([false, true, true]);
    const equal = buildComparison([resort({ slug: "p" }), resort({ slug: "q" })], 7);
    expect(equal.every((r) => !r.isCheapest && !r.isHighest && !r.isLargest)).toBe(true);
  });

  it("não destaca custo quando as moedas diferem", () => {
    const rows = buildComparison([a, resort({ slug: "u", currency: "USD" })], 7);
    expect(rows.every((r) => !r.isCheapest)).toBe(true);
  });

  it("não destaca nada com uma única estação", () => {
    const [only] = buildComparison([a], 7);
    expect(only).toMatchObject({ isCheapest: false, isHighest: false, isLargest: false });
  });
});
