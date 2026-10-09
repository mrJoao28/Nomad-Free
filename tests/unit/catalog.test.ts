import { describe, expect, it } from "vitest";
import {
  filterItems,
  findBySlug,
  normalizeText,
  relevanceScore,
  searchCatalog,
  sortItems,
} from "@/domain/catalog";
import { items } from "./fixtures";

const slugs = (list: { slug: string }[]) => list.map((i) => i.slug);

describe("normalizeText", () => {
  it("remove acentos e ignora maiúsculas", () => {
    expect(normalizeText("  MEDELLÍN ")).toBe("medellin");
  });
});

describe("filterItems", () => {
  it("retorna tudo sem filtros", () => {
    expect(filterItems(items, {})).toHaveLength(items.length);
  });

  it("busca por texto sem depender de acentos", () => {
    expect(slugs(filterItems(items, { q: "medellin" }))).toEqual(["medellin", "horta-medellin"]);
  });

  it("busca por mais de um termo (qualquer termo)", () => {
    expect(slugs(filterItems(items, { q: "horta porto" })).sort()).toEqual([
      "horta-medellin",
      "porto",
    ]);
  });

  it("filtra por categoria", () => {
    expect(slugs(filterItems(items, { category: "ACCOMMODATION_EXCHANGE" }))).toEqual([
      "troca-cafe-cusco",
    ]);
  });

  it("um destino pode pertencer a mais de uma categoria", () => {
    const result = slugs(filterItems(items, { category: "BUDGET_DESTINATION" }));
    expect(result).toEqual(["medellin", "cusco"]);
  });

  it("filtra por região", () => {
    expect(slugs(filterItems(items, { region: "EUROPE" }))).toEqual(["porto"]);
  });

  it("filtra por orçamento diário máximo, inclusive o limite", () => {
    expect(slugs(filterItems(items, { maxDailyMinor: 19000 }))).toEqual([
      "cusco",
      "troca-cafe-cusco",
      "horta-medellin",
    ]);
  });

  it("exclui itens em outra moeda quando há filtro de orçamento", () => {
    expect(slugs(filterItems(items, { maxDailyMinor: 100000 }))).not.toContain("usd-item");
  });

  it("combina filtros", () => {
    const result = filterItems(items, {
      q: "cusco",
      category: "BUDGET_DESTINATION",
      maxDailyMinor: 20000,
    });
    expect(slugs(result)).toEqual(["cusco"]);
  });

  it("retorna vazio quando nada corresponde", () => {
    expect(filterItems(items, { q: "inexistente" })).toEqual([]);
  });

  it("consulta só com espaços é tratada como vazia", () => {
    expect(filterItems(items, { q: "   " })).toHaveLength(items.length);
  });
});

describe("sortItems", () => {
  it("ordena por menor custo", () => {
    expect(sortItems(items, "menor-custo").map((i) => i.dailyCostMinor)).toEqual([
      1000, 5500, 7000, 19000, 26000, 42000,
    ]);
  });

  it("ordena por maior custo", () => {
    expect(sortItems(items, "maior-custo")[0]?.slug).toBe("porto");
  });

  it("não modifica o array original", () => {
    const before = slugs(items);
    sortItems(items, "menor-custo");
    expect(slugs(items)).toEqual(before);
  });

  it("relevância: título pesa mais que local", () => {
    const result = searchCatalog(items, { q: "cusco" }, "relevancia");
    expect(result[0]?.slug).toBe("cusco");
    expect(slugs(result)).toContain("troca-cafe-cusco");
  });

  it("relevância sem consulta coloca destinos antes de oportunidades", () => {
    const result = sortItems(items, "relevancia");
    expect(result.slice(0, 3).every((i) => i.kind === "destination")).toBe(true);
  });

  it("relevanceScore é 0 quando nada corresponde", () => {
    expect(relevanceScore(items[0]!, "zzz")).toBe(0);
  });
});

describe("findBySlug", () => {
  it("encontra por slug estável", () => {
    expect(findBySlug(items, "porto")?.title).toBe("Porto");
  });
  it("retorna undefined para slug desconhecido", () => {
    expect(findBySlug(items, "nao-existe")).toBeUndefined();
  });
});
