/**
 * Silhueta de montanhas gerada a partir de uma semente (ex.: o slug da estação).
 * Usada como imagem provisória quando ainda não há foto: cada estação recebe um desenho
 * diferente, em vez de uma mesma imagem repetida.
 */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const RIDGE_WIDTH = 400;
export const RIDGE_HEIGHT = 250;

/**
 * Caminho SVG (viewBox 0 0 400 250) de uma camada de montanhas.
 * `layer` 0 = mais ao fundo (picos altos); camadas maiores ficam mais baixas e à frente.
 */
export function ridgePath(seed: string, layer: number): string {
  const rand = mulberry32(hash(`${seed}:${layer}`));
  const points = 9 + layer * 2;
  const base = 95 + layer * 45; // altura média da camada
  const amplitude = 85 - layer * 22;
  const step = RIDGE_WIDTH / (points - 1);
  const coords: string[] = [`M0 ${RIDGE_HEIGHT}`];
  for (let i = 0; i < points; i++) {
    const x = Math.round(i * step);
    const peak = i % 2 === 0 ? 1 : 0.35; // alterna picos e vales
    const y = Math.round(base - rand() * amplitude * peak);
    coords.push(`L${x} ${y}`);
  }
  coords.push(`L${RIDGE_WIDTH} ${RIDGE_HEIGHT}`, "Z");
  return coords.join(" ");
}
