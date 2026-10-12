import { describe, expect, it } from "vitest";
import { resorts } from "../../prisma/seed-data";
import { REGIONS, TAGS } from "@/domain/types";
import { slugSchema } from "@/domain/search-params";

describe("seed: 100 estações de esqui", () => {
  it("tem exatamente 100 estações, sem slugs repetidos", () => {
    expect(resorts).toHaveLength(100);
    expect(new Set(resorts.map((r) => r.slug)).size).toBe(100);
    expect(new Set(resorts.map((r) => r.name)).size).toBe(100);
  });

  it("tem posições de curadoria de 1 a 100, em ordem, sem repetição", () => {
    expect(resorts.map((r) => r.curatedRank)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });

  it("usa só valores válidos e plausíveis", () => {
    for (const r of resorts) {
      expect(slugSchema.safeParse(r.slug).success).toBe(true);
      expect(r.imageKey).toBe(r.slug);
      expect(REGIONS).toContain(r.region);
      expect(r.tags.length).toBeGreaterThanOrEqual(2);
      expect(r.tags.length).toBeLessThanOrEqual(4);
      expect(new Set(r.tags).size).toBe(r.tags.length);
      for (const t of r.tags) expect(TAGS).toContain(t);
      expect(r.sizeRank).toBeGreaterThanOrEqual(1);
      expect(r.sizeRank).toBeLessThanOrEqual(5);
      expect(r.topElevationM).toBeGreaterThanOrEqual(400);
      expect(r.topElevationM).toBeLessThanOrEqual(4500);
      expect(r.dailyBudgetReais).toBeGreaterThanOrEqual(500);
      expect(r.dailyBudgetReais % 50).toBe(0);
      expect(r.seasonLabel).toMatch(/^[A-Z][a-z]{2}–[A-Z][a-z]{2}$/);
      expect(r.summary.length).toBeGreaterThan(30);
      expect(r.summary.length).toBeLessThanOrEqual(180);
      expect(r.description).toContain(r.name);
      expect(r.areaLabel.length).toBeGreaterThan(3);
    }
  });

  it("distribui as estações pelas seis regiões", () => {
    const count = (region: string) => resorts.filter((r) => r.region === region).length;
    expect(count("ALPS")).toBe(48);
    expect(count("EUROPE_OTHER")).toBe(10);
    expect(count("NORTH_AMERICA")).toBe(22);
    expect(count("ASIA")).toBe(8);
    expect(count("SOUTH_AMERICA")).toBe(5);
    expect(count("OCEANIA")).toBe(7);
  });

  it("estações do Hemisfério Sul têm temporada de inverno sul-americano/oceânico", () => {
    for (const r of resorts.filter((x) => x.region === "SOUTH_AMERICA" || x.region === "OCEANIA")) {
      expect(r.seasonLabel).toBe("Jun–Out");
    }
  });

  it("não deixa resquícios de trabalho voluntário ou troca de hospedagem", () => {
    const text = JSON.stringify(resorts).toLowerCase();
    expect(text).not.toContain("voluntari");
    expect(text).not.toContain("troca de hospedagem");
  });
});
