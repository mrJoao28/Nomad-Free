import { describe, expect, it } from "vitest";
import {
  accentHover,
  COUNTRY_PALETTES,
  DEFAULT_PALETTE,
  ON_ACCENT,
  paletteFor,
  paletteStyle,
} from "@/domain/palettes";
import { resorts } from "../../prisma/seed-data";

const TEXT = "#f3efe8";

function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const c = ((n >> shift) & 255) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const all = { padrão: DEFAULT_PALETTE, ...COUNTRY_PALETTES };

describe("paletas por país", () => {
  it("cobre todos os países do seed", () => {
    const countries = [...new Set(resorts.map((r) => r.country))];
    const missing = countries.filter((c) => !COUNTRY_PALETTES[c]);
    expect(missing).toEqual([]);
  });

  for (const [name, p] of Object.entries(all)) {
    it(`${name}: cores válidas e contraste legível`, () => {
      for (const color of Object.values(p)) expect(color).toMatch(/^#[0-9a-f]{6}$/);
      // Texto principal sobre fundo e sobre superfície.
      expect(contrast(TEXT, p.bg)).toBeGreaterThanOrEqual(7);
      expect(contrast(TEXT, p.surface)).toBeGreaterThanOrEqual(7);
      // Destaque usado como texto/link sobre o fundo e sobre a superfície.
      expect(contrast(p.accent, p.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.accent, p.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.accent2, p.bg)).toBeGreaterThanOrEqual(3);
      // Botão: texto escuro sobre o destaque, também no hover.
      expect(contrast(ON_ACCENT, p.accent)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(ON_ACCENT, accentHover(p))).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("usa a paleta do país, com alternativa por região e depois a padrão", () => {
    expect(paletteFor({ country: "Japão" })).toBe(COUNTRY_PALETTES["Japão"]);
    expect(paletteFor({ country: "País novo", region: "ASIA" })).toBe(COUNTRY_PALETTES["Japão"]);
    expect(paletteFor({ country: "País novo" })).toBe(DEFAULT_PALETTE);
    expect(paletteFor(undefined)).toBe(DEFAULT_PALETTE);
  });

  it("países vizinhos têm destaques diferentes", () => {
    expect(COUNTRY_PALETTES["França"]!.accent).not.toBe(COUNTRY_PALETTES["Suíça"]!.accent);
    expect(COUNTRY_PALETTES["Chile"]!.accent).not.toBe(COUNTRY_PALETTES["Argentina"]!.accent);
  });

  it("gera as variáveis CSS do tema", () => {
    const style = paletteStyle(COUNTRY_PALETTES["Suíça"]!);
    expect(style["--color-stone"]).toBe("#150e12");
    expect(style["--color-fjord"]).toBe("#ff5a5f");
    expect(style["--color-on-accent"]).toBe(ON_ACCENT);
    expect(style["--color-paper"]).toMatch(/^#[0-9a-f]{6}$/);
    expect(style["--color-fjord-deep"]).toMatch(/^#[0-9a-f]{6}$/);
  });
});
