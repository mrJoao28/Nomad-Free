/** Tipos das funções puras exportadas por fetch-photos.mjs (usadas nos testes). */
export interface PhotoCandidate {
  title: string;
  mime: string;
  license: string;
  width: number;
  height: number;
  order: number;
}

export function stripHtml(value: unknown): string;
export function escapeHtml(value: unknown): string;
export function normalizeTitle(title: string): string;
export function isUnwanted(title: string): boolean;
export function rankCandidates<T extends PhotoCandidate>(
  candidates: T[],
  used?: Set<string>,
): (T & { tier: number })[];
