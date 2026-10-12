import { describe, expect, it } from "vitest";
import { MAX_BUDGET_REAIS, parseExploreParams, slugSchema } from "@/domain/search-params";

describe("parseExploreParams", () => {
  it("usa padrões quando não há parâmetros", () => {
    expect(parseExploreParams({})).toEqual({
      filters: { q: undefined, tag: undefined, region: undefined, maxDailyMinor: undefined },
      order: "curadoria",
      ignored: [],
    });
  });

  it("converte valores válidos", () => {
    const r = parseExploreParams({
      q: " zermatt ",
      perfil: "freeride",
      regiao: "alpes",
      orcamento: "1500",
      ordem: "maior-altitude",
    });
    expect(r.filters).toEqual({
      q: "zermatt",
      tag: "FREERIDE",
      region: "ALPS",
      maxDailyMinor: 150000,
    });
    expect(r.order).toBe("maior-altitude");
    expect(r.ignored).toEqual([]);
  });

  it("aceita todos os perfis e regiões usados nos links do site", () => {
    for (const perfil of ["iniciantes", "familia", "avancados", "grande-area", "altitude"]) {
      expect(parseExploreParams({ perfil }).ignored).toEqual([]);
    }
    for (const regiao of [
      "america-do-norte",
      "america-do-sul",
      "europa-outros",
      "asia",
      "oceania",
    ]) {
      expect(parseExploreParams({ regiao }).ignored).toEqual([]);
    }
  });

  it("ignora valores inválidos sem lançar erro", () => {
    const r = parseExploreParams({
      perfil: "voluntariado",
      regiao: "marte",
      orcamento: "abc",
      ordem: "aleatoria",
    });
    expect(r.filters).toEqual({
      q: undefined,
      tag: undefined,
      region: undefined,
      maxDailyMinor: undefined,
    });
    expect(r.order).toBe("curadoria");
    expect(r.ignored.sort()).toEqual(["orcamento", "ordem", "perfil", "regiao"]);
  });

  it("rejeita orçamento negativo, decimal ou acima do máximo", () => {
    for (const orcamento of ["-1", "10.5", String(MAX_BUDGET_REAIS + 1)]) {
      expect(parseExploreParams({ orcamento }).ignored).toEqual(["orcamento"]);
    }
    expect(parseExploreParams({ orcamento: "0" }).filters.maxDailyMinor).toBe(0);
  });

  it("rejeita busca muito longa", () => {
    expect(parseExploreParams({ q: "a".repeat(81) }).ignored).toEqual(["q"]);
  });

  it("usa o primeiro valor de parâmetros repetidos e ignora vazios", () => {
    expect(parseExploreParams({ perfil: ["luxo", "familia"] }).filters.tag).toBe("LUXURY");
    expect(parseExploreParams({ q: "", perfil: "" }).ignored).toEqual([]);
  });

  it("já não aceita as categorias antigas de voluntariado e troca de hospedagem", () => {
    expect(parseExploreParams({ categoria: "voluntariado" }).ignored).toEqual([]);
    expect(parseExploreParams({ categoria: "voluntariado" }).filters.tag).toBeUndefined();
  });
});

describe("slugSchema", () => {
  it("aceita slugs válidos e rejeita o resto", () => {
    expect(slugSchema.safeParse("val-d-isere").success).toBe(true);
    for (const bad of ["", "UPPER", "com espaço", "../etc/passwd", "a--b", "-a", "a-"]) {
      expect(slugSchema.safeParse(bad).success).toBe(false);
    }
  });
});
