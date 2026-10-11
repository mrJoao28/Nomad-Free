/**
 * Paleta de cores por lugar (chave = slug do destino). Cada página de destino/oportunidade
 * usa a paleta do seu lugar: fundo, superfícies, linhas e cores de destaque inspiradas na
 * paisagem. Valores curados à mão; o teste tests/unit/palettes.test.ts garante contraste.
 */

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

export const DEFAULT_PALETTE: PlacePalette = {
  bg: "#0d1014",
  surface: "#151a20",
  line: "#262d35",
  accent: "#3fb6a8",
  accent2: "#e0a458",
};

export const PALETTES: Record<string, PlacePalette> = {
  // Verde de montanha com o amarelo e o laranja das flores.
  "medellin-colombia": {
    bg: "#0c1a13",
    surface: "#13261c",
    line: "#24402f",
    accent: "#f2a93b",
    accent2: "#e4572e",
  },
  // Terracota andina e ouro.
  "cusco-peru": {
    bg: "#1a120e",
    surface: "#261a14",
    line: "#43302a",
    accent: "#e0793f",
    accent2: "#d4af5a",
  },
  // Rosa vivo, turquesa e ocre das fachadas e dos tecidos.
  "oaxaca-mexico": {
    bg: "#1a1018",
    surface: "#261822",
    line: "#43293a",
    accent: "#ee5f8f",
    accent2: "#3cc4b0",
  },
  // Vinho, pedra e dourado da cidade velha.
  "tbilisi-georgia": {
    bg: "#170f13",
    surface: "#231920",
    line: "#3d2a33",
    accent: "#d4506a",
    accent2: "#d9b46c",
  },
  // Dourado dos templos e vermelho lacado.
  "chiang-mai-tailandia": {
    bg: "#17140c",
    surface: "#231e12",
    line: "#3d3420",
    accent: "#e8b030",
    accent2: "#c9502f",
  },
  // Turquesa do mar e areia dourada.
  "da-nang-vietna": {
    bg: "#08171d",
    surface: "#0f2530",
    line: "#1d3d4a",
    accent: "#2fc4cf",
    accent2: "#f2b84b",
  },
  // Verde-água das praias e azul do Atlântico.
  "florianopolis-brasil": {
    bg: "#08191a",
    surface: "#0f2a2a",
    line: "#1d4747",
    accent: "#3cc9a5",
    accent2: "#4aa8e0",
  },
  // Pôr do sol sobre a Montanha da Mesa.
  "cidade-do-cabo-africa-do-sul": {
    bg: "#0d1620",
    surface: "#15222f",
    line: "#263a4d",
    accent: "#ec8040",
    accent2: "#58aee0",
  },
  // Azul dos azulejos e telhados de terracota.
  "porto-portugal": {
    bg: "#0b1322",
    surface: "#121d33",
    line: "#223455",
    accent: "#5b8def",
    accent2: "#e8814a",
  },
};

export function paletteFor(key: string | undefined): PlacePalette {
  return (key && PALETTES[key]) || DEFAULT_PALETTE;
}

function mixWithWhite(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const c = (n >> shift) & 255;
    return Math.round(c + (255 - c) * amount)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(16)}${channel(8)}${channel(0)}`;
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
