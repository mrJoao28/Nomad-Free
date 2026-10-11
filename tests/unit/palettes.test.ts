import { describe, expect, it } from "vitest";
import {
  accentHover,
  DEFAULT_PALETTE,
  ON_ACCENT,
  paletteFor,
  PALETTES,
  paletteStyle,
} from "@/domain/palettes";

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

const all = { default: DEFAULT_PALETTE, ...PALETTES };

describe("paletas por lugar", () => {
  it("cobre os nove destinos do seed", () => {
    expect(Object.keys(PALETTES).sort()).toEqual([
      "chiang-mai-tailandia",
      "cidade-do-cabo-africa-do-sul",
      "cusco-peru",
      "da-nang-vietna",
      "florianopolis-brasil",
      "medellin-colombia",
      "oaxaca-mexico",
      "porto-portugal",
      "tbilisi-georgia",
    ]);
  });

  for (const [name, p] of Object.entries(all)) {
    it(`${name}: cores válidas e contraste legível`, () => {
      for (const color of Object.values(p)) expect(color).toMatch(/^#[0-9a-f]{6}$/);
      // Texto principal sobre fundo e sobre superfície.
      expect(contrast(TEXT, p.bg)).toBeGreaterThanOrEqual(7);
      expect(contrast(TEXT, p.surface)).toBeGreaterThanOrEqual(7);
      // Destaque usado como texto/link sobre o fundo.
      expect(contrast(p.accent, p.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.accent2, p.bg)).toBeGreaterThanOrEqual(3);
      // Botão: texto escuro sobre o destaque, também no hover.
      expect(contrast(ON_ACCENT, p.accent)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(ON_ACCENT, accentHover(p))).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("usa a paleta padrão para chaves desconhecidas ou ausentes", () => {
    expect(paletteFor("nao-existe")).toBe(DEFAULT_PALETTE);
    expect(paletteFor(undefined)).toBe(DEFAULT_PALETTE);
    expect(paletteFor("cusco-peru")).toBe(PALETTES["cusco-peru"]);
  });

  it("gera as variáveis CSS do tema", () => {
    const style = paletteStyle(PALETTES["porto-portugal"]!);
    expect(style["--color-stone"]).toBe("#0b1322");
    expect(style["--color-fjord"]).toBe("#5b8def");
    expect(style["--color-on-accent"]).toBe(ON_ACCENT);
    expect(style["--color-fjord-deep"]).toMatch(/^#[0-9a-f]{6}$/);
  });
});
