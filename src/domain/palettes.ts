/**
 * Paleta de cores por lugar. Cada estação usa a paleta do seu país (com alternativa por região):
 * um fundo escuro de "noite na montanha" e destaques inspirados na paisagem e na cultura local.
 * Superfície e linhas são derivadas do fundo. O teste tests/unit/palettes.test.ts garante contraste.
 */
import type { Region } from "./types";

export interface PlacePalette {
  /** Fundo da página. */
  bg: string;
  /** Superfícies (cards, painéis). */
  surface: string;
  /** Linhas e bordas. */
  line: string;
  /** Destaque principal (botões, links, marcadores). */
  accent: string;
  /** Destaque secundário. */
  accent2: string;
}

/** Texto sobre o destaque (botões). Escuro em todas as paletas. */
export const ON_ACCENT = "#0b0f12";

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixWithWhite(hex: string, amount: number): string {
  return `#${hexToRgb(hex)
    .map((c) =>
      Math.round(c + (255 - c) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function make(bg: string, accent: string, accent2: string): PlacePalette {
  return {
    bg,
    surface: mixWithWhite(bg, 0.06),
    line: mixWithWhite(bg, 0.16),
    accent,
    accent2,
  };
}

/** Padrão: azul-noite com destaque azul-glacial. */
export const DEFAULT_PALETTE: PlacePalette = make("#0b1220", "#6aa9ff", "#ff7a59");

export const COUNTRY_PALETTES: Record<string, PlacePalette> = {
  França: make("#0b1220", "#6aa9ff", "#ff7a59"),
  Suíça: make("#150e12", "#ff5a5f", "#e8e8f0"),
  Áustria: make("#0e1a14", "#e9b44c", "#d1495b"),
  Itália: make("#181015", "#f08a5d", "#6fd3b8"),
  Alemanha: make("#10151c", "#f0c419", "#e4572e"),
  Andorra: make("#0f1620", "#4cc9f0", "#f4a261"),
  Espanha: make("#1a1210", "#f4a259", "#e63946"),
  Noruega: make("#0a1520", "#5ce1e6", "#ff9f1c"),
  Suécia: make("#0b1522", "#ffd23f", "#5aa9e6"),
  Finlândia: make("#08141a", "#5bf0a8", "#b18cff"),
  Eslováquia: make("#0f1420", "#7aa2ff", "#ff6b6b"),
  Bulgária: make("#121714", "#8fd16a", "#ff6b6b"),
  Geórgia: make("#17101a", "#e8688a", "#f0c36a"),
  Canadá: make("#101a17", "#ff6b57", "#f6e27a"),
  EUA: make("#0e1722", "#ffb347", "#4da8ff"),
  Japão: make("#0c0f1f", "#ff7aa2", "#7aa2ff"),
  "Coreia do Sul": make("#0c1220", "#7ad7f0", "#ff6b81"),
  Chile: make("#120f18", "#ff7a5c", "#5cc8ff"),
  Argentina: make("#0b1622", "#74c0fc", "#ffd166"),
  "Nova Zelândia": make("#0a1a1a", "#4be3c1", "#ffb86b"),
  Austrália: make("#1a110d", "#f08a4b", "#6ecbf5"),
};

const REGION_FALLBACK: Record<Region, string> = {
  ALPS: "França",
  EUROPE_OTHER: "Noruega",
  NORTH_AMERICA: "EUA",
  ASIA: "Japão",
  SOUTH_AMERICA: "Chile",
  OCEANIA: "Nova Zelândia",
};

export function paletteFor(place?: { country?: string; region?: Region }): PlacePalette {
  if (place?.country && COUNTRY_PALETTES[place.country]) return COUNTRY_PALETTES[place.country]!;
  if (place?.region) return COUNTRY_PALETTES[REGION_FALLBACK[place.region]] ?? DEFAULT_PALETTE;
  return DEFAULT_PALETTE;
}

/** Cor de destaque no hover: o destaque clareado. */
export function accentHover(palette: PlacePalette): string {
  return mixWithWhite(palette.accent, 0.18);
}

/** Variáveis CSS que sobrescrevem o tema padrão (ver @theme em globals.css). */
export function paletteStyle(palette: PlacePalette): Record<string, string> {
  return {
    "--color-stone": palette.bg,
    "--color-paper": palette.surface,
    "--color-line": palette.line,
    "--color-fjord": palette.accent,
    "--color-fjord-deep": accentHover(palette),
    "--color-accent2": palette.accent2,
    "--color-on-accent": ON_ACCENT,
  };
}
