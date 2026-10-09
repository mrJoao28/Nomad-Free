import { describe, expect, it } from "vitest";
import { estimateTripBudget, formatMoney, reaisToMinor } from "@/domain/money";

describe("formatMoney", () => {
  it("formata centavos em reais", () => {
    expect(formatMoney(26000, "BRL").replace(/\s/g, " ")).toBe("R$ 260");
    expect(formatMoney(26050, "BRL").replace(/\s/g, " ")).toBe("R$ 260,50");
  });
});

describe("reaisToMinor", () => {
  it("converte reais para centavos sem erro de ponto flutuante", () => {
    expect(reaisToMinor(260)).toBe(26000);
    expect(reaisToMinor(0.1 + 0.2)).toBe(30);
  });
});

describe("estimateTripBudget", () => {
  it("calcula total esperado e faixa -20%/+30%", () => {
    const b = estimateTripBudget(20000, 10, "BRL");
    expect(b).toEqual({
      days: 10,
      currency: "BRL",
      lowMinor: 160000,
      expectedMinor: 200000,
      highMinor: 260000,
    });
  });

  it("retorna inteiros", () => {
    const b = estimateTripBudget(19999, 7, "BRL");
    expect(Number.isInteger(b.lowMinor) && Number.isInteger(b.highMinor)).toBe(true);
  });

  it("rejeita entradas inválidas", () => {
    expect(() => estimateTripBudget(-1, 7, "BRL")).toThrow(RangeError);
    expect(() => estimateTripBudget(100.5, 7, "BRL")).toThrow(RangeError);
    expect(() => estimateTripBudget(100, 0, "BRL")).toThrow(RangeError);
  });
});
