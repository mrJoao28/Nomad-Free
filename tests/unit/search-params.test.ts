import { describe, expect, it } from "vitest";
import { parseExploreParams, slugSchema } from "@/domain/search-params";

describe("parseExploreParams", () => {
  it("usa padrões quando não há parâmetros", () => {
    expect(parseExploreParams({})).toEqual({
      filters: { q: undefined, category: undefined, region: undefined, maxDailyMinor: undefined },
      order: "relevancia",
      ignored: [],
    });
  });

  it("converte valores válidos", () => {
    const r = parseExploreParams({
      q: " café ",
      categoria: "voluntariado",
      regiao: "europa",
      orcamento: "250",
      ordem: "menor-custo",
    });
    expect(r.filters).toEqual({
      q: "café",
      category: "VOLUNTEERING",
      region: "EUROPE",
      maxDailyMinor: 25000,
    });
    expect(r.order).toBe("menor-custo");
    expect(r.ignored).toEqual([]);
  });

  it("ignora e reporta valores inválidos sem lançar", () => {
    const r = parseExploreParams({
      categoria: "xyz",
      orcamento: "-5",
      ordem: "aleatorio",
      regiao: "marte",
    });
    expect(r.filters.category).toBeUndefined();
    expect(r.filters.maxDailyMinor).toBeUndefined();
    expect(r.order).toBe("relevancia");
    expect(r.ignored.sort()).toEqual(["categoria", "orcamento", "ordem", "regiao"]);
  });

  it("rejeita orçamento acima do máximo e não inteiro", () => {
    expect(parseExploreParams({ orcamento: "999999" }).ignored).toContain("orcamento");
    expect(parseExploreParams({ orcamento: "10.5" }).ignored).toContain("orcamento");
  });

  it("limita o tamanho da busca", () => {
    expect(parseExploreParams({ q: "a".repeat(81) }).ignored).toContain("q");
  });

  it("usa o primeiro valor quando o parâmetro se repete", () => {
    expect(parseExploreParams({ ordem: ["maior-custo", "menor-custo"] }).order).toBe("maior-custo");
  });
});

describe("slugSchema", () => {
  it("aceita slugs válidos e rejeita o resto", () => {
    expect(slugSchema.safeParse("medellin-colombia").success).toBe(true);
    expect(slugSchema.safeParse("../etc/passwd").success).toBe(false);
    expect(slugSchema.safeParse("Maiúscula").success).toBe(false);
  });
});
