import { describe, expect, it } from "vitest";
import {
  filterItems,
  findBySlug,
  normalizeText,
  relevanceScore,
  searchResorts,
  sortItems,
} from "@/domain/catalog";
import { items } from "./fixtures";

const slugs = (list: { slug: string }[]) => list.map((i) => i.slug);

describe("normalizeText", () => {
  it("remove acentos e ignora maiúsculas", () => {
    expect(normalizeText("  Sölden — Áustria ")).toBe("solden — austria");
  });
});

describe("filterItems", () => {
  it("retorna tudo sem filtros", () => {
    expect(filterItems(items, {})).toHaveLength(items.length);
  });

  it("filtra por perfil", () => {
    expect(slugs(filterItems(items, { tag: "BUDGET" }))).toEqual(["cerro-catedral", "bansko"]);
    expect(slugs(filterItems(items, { tag: "LUXURY" }))).toEqual(["zermatt"]);
  });

  it("filtra por região", () => {
    expect(slugs(filterItems(items, { region: "NORTH_AMERICA" }))).toEqual([
      "whistler-blackcomb",
      "usd-resort",
    ]);
  });

  it("filtra por orçamento diário e exclui moedas diferentes da de referência", () => {
    const result = filterItems(items, { maxDailyMinor: 150000 });
    expect(slugs(result).sort()).toEqual(["bansko", "cerro-catedral", "niseko"]);
    expect(slugs(result)).not.toContain("usd-resort");
  });

  it("busca sem acento por nome, país e região de montanhas", () => {
    expect(slugs(filterItems(items, { q: "zermatt" }))).toEqual(["zermatt"]);
    expect(slugs(filterItems(items, { q: "japao" }))).toEqual(["niseko"]);
    expect(slugs(filterItems(items, { q: "patagonia" }))).toEqual(["cerro-catedral"]);
  });

  it("busca também no resumo", () => {
    expect(slugs(filterItems(items, { q: "hokkaido" }))).toEqual(["niseko"]);
  });

  it("combina filtros", () => {
    expect(slugs(filterItems(items, { tag: "APRES_SKI", region: "ASIA" }))).toEqual(["niseko"]);
    expect(filterItems(items, { tag: "LUXURY", region: "ASIA" })).toEqual([]);
  });

  it("não encontra termos inexistentes", () => {
    expect(filterItems(items, { q: "nadaquecombine" })).toEqual([]);
  });
});

describe("relevanceScore", () => {
  it("dá mais peso ao nome do que ao resumo", () => {
    const zermatt = items.find((i) => i.slug === "zermatt")!;
    expect(relevanceScore(zermatt, "zermatt")).toBeGreaterThan(
      relevanceScore(zermatt, "matterhorn"),
    );
  });

  it("é zero sem termo de busca", () => {
    expect(relevanceScore(items[0]!, "")).toBe(0);
    expect(relevanceScore(items[0]!)).toBe(0);
  });
});

describe("sortItems", () => {
  it("curadoria: sem busca, segue a posição na curadoria", () => {
    expect(slugs(sortItems(items, "curadoria"))).toEqual([
      "zermatt",
      "whistler-blackcomb",
      "niseko",
      "usd-resort",
      "bansko",
      "cerro-catedral",
    ]);
  });

  it("curadoria: com busca, prioriza relevância e desempata pela curadoria", () => {
    const found = filterItems(items, { q: "a" });
    const sorted = sortItems(found, "curadoria", "bansko");
    expect(sorted[0]?.slug).toBe("bansko");
  });

  it("menor e maior custo", () => {
    expect(slugs(sortItems(items, "menor-custo"))[0]).toBe("usd-resort");
    expect(slugs(sortItems(items, "maior-custo"))[0]).toBe("zermatt");
  });

  it("maior altitude", () => {
    expect(slugs(sortItems(items, "maior-altitude")).slice(0, 3)).toEqual([
      "zermatt",
      "usd-resort",
      "bansko",
    ]);
  });

  it("maior área: tamanho relativo e desempate pela curadoria", () => {
    expect(slugs(sortItems(items, "maior-area"))).toEqual([
      "whistler-blackcomb",
      "zermatt",
      "niseko",
      "usd-resort",
      "bansko",
      "cerro-catedral",
    ]);
  });

  it("não altera a lista original", () => {
    const before = slugs(items);
    sortItems(items, "maior-altitude");
    expect(slugs(items)).toEqual(before);
  });
});

describe("searchResorts / findBySlug", () => {
  it("aplica filtro e ordenação juntos", () => {
    const result = searchResorts(items, { region: "NORTH_AMERICA" }, "menor-custo");
    expect(slugs(result)).toEqual(["usd-resort", "whistler-blackcomb"]);
  });

  it("encontra por slug", () => {
    expect(findBySlug(items, "niseko")?.name).toBe("Niseko United");
    expect(findBySlug(items, "inexistente")).toBeUndefined();
  });
});
