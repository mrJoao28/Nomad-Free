import { describe, expect, it } from "vitest";
import {
  buildComparison,
  DEFAULT_COMPARE_DAYS,
  MAX_COMPARE,
  parseCompareParams,
} from "@/domain/compare";
import type { DestinationDetail } from "@/domain/types";

function destination(overrides: Partial<DestinationDetail>): DestinationDetail {
  return {
    id: "id",
    slug: "x",
    name: "X",
    country: "País",
    region: "SOUTH_AMERICA",
    categories: ["REMOTE_FRIENDLY"],
    summary: "",
    description: "",
    dailyBudgetMinor: 20000,
    currency: "BRL",
    priceKind: "ESTIMATE",
    verifiedAt: null,
    sourceLabel: "demo",
    remoteWorkScore: 3,
    internetNotes: "",
    coworkingNotes: "",
    bestSeason: "",
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
    expect(parseCompareParams({ d: "medellin-colombia" }).slugs).toEqual(["medellin-colombia"]);
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
    for (const bad of ["0", "-3", "366", "abc", "2.5"]) {
      const r = parseCompareParams({ dias: bad });
      expect(r.days).toBe(DEFAULT_COMPARE_DAYS);
      expect(r.ignored).toEqual(["dias"]);
    }
  });
});

describe("buildComparison", () => {
  const a = destination({ slug: "a", dailyBudgetMinor: 26000, remoteWorkScore: 5 });
  const b = destination({ slug: "b", dailyBudgetMinor: 19000, remoteWorkScore: 3 });

  it("calcula o orçamento da estadia com inteiros", () => {
    const budget = buildComparison([a, b], 10)[0]?.budget;
    expect(budget?.expectedMinor).toBe(260000);
    expect(budget?.lowMinor).toBe(208000);
    expect(budget?.highMinor).toBe(338000);
  });

  it("destaca o mais barato e a melhor nota remota", () => {
    const [ra, rb] = buildComparison([a, b], 30);
    expect(ra).toMatchObject({ isCheapest: false, isBestRemote: true });
    expect(rb).toMatchObject({ isCheapest: true, isBestRemote: false });
  });

  it("marca empates", () => {
    const rows = buildComparison([a, destination({ slug: "c", remoteWorkScore: 5 })], 7);
    expect(rows.map((r) => r.isBestRemote)).toEqual([true, true]);
  });

  it("não destaca custo quando as moedas diferem", () => {
    const rows = buildComparison([a, destination({ slug: "u", currency: "USD" })], 7);
    expect(rows.every((r) => !r.isCheapest)).toBe(true);
  });

  it("não destaca nada com um único destino", () => {
    const [only] = buildComparison([a], 7);
    expect(only).toMatchObject({ isCheapest: false, isBestRemote: false });
  });
});
