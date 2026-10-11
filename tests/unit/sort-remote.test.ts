import { describe, expect, it } from "vitest";
import { sortItems } from "@/domain/catalog";
import { parseExploreParams } from "@/domain/search-params";
import { items } from "./fixtures";

describe("ordenação por melhor nota de trabalho remoto", () => {
  it("ordena por nota, desempata por custo e deixa oportunidades no fim", () => {
    const sorted = sortItems(items, "melhor-trabalho-remoto").map((i) => i.slug);
    expect(sorted).toEqual([
      "medellin",
      "porto",
      "cusco",
      "usd-item",
      "troca-cafe-cusco",
      "horta-medellin",
    ]);
  });

  it("não altera a lista original", () => {
    const before = items.map((i) => i.slug);
    sortItems(items, "melhor-trabalho-remoto");
    expect(items.map((i) => i.slug)).toEqual(before);
  });

  it("é aceita nos parâmetros de URL", () => {
    const r = parseExploreParams({ ordem: "melhor-trabalho-remoto" });
    expect(r.order).toBe("melhor-trabalho-remoto");
    expect(r.ignored).toEqual([]);
  });
});
