import { describe, expect, it } from "vitest";
import { RIDGE_HEIGHT, RIDGE_WIDTH, ridgePath } from "@/lib/ridge";

describe("ridgePath", () => {
  it("é determinístico para a mesma semente e camada", () => {
    expect(ridgePath("zermatt", 0)).toBe(ridgePath("zermatt", 0));
  });

  it("gera desenhos diferentes por estação e por camada", () => {
    expect(ridgePath("zermatt", 0)).not.toBe(ridgePath("chamonix", 0));
    expect(ridgePath("zermatt", 0)).not.toBe(ridgePath("zermatt", 1));
  });

  it("produz um caminho fechado dentro do quadro", () => {
    const path = ridgePath("niseko", 2);
    expect(path.startsWith(`M0 ${RIDGE_HEIGHT}`)).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    const numbers = [...path.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
    for (const n of numbers) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(Math.max(RIDGE_WIDTH, RIDGE_HEIGHT));
    }
  });

  it("dá um desenho único a cada uma das 100 estações", async () => {
    const { resorts } = await import("../../prisma/seed-data");
    const paths = new Set(resorts.map((r) => ridgePath(r.imageKey, 0)));
    expect(paths.size).toBe(100);
  });
});
