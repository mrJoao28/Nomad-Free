import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Fotos reais opcionais. Se existir `public/img/photos/<imageKey>.jpg` (ou .jpeg/.webp/.png),
 * ela substitui a ilustração SVG; sem arquivo, o site continua usando `public/img/<imageKey>.svg`.
 * Os créditos (autor, licença, link) ficam em `public/img/photos/credits.json`.
 */

const PHOTOS_DIR = path.join(process.cwd(), "public", "img", "photos");
const EXTENSIONS = ["jpg", "jpeg", "webp", "png"] as const;
const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface PhotoCredit {
  imageKey: string;
  title?: string;
  author?: string;
  license?: string;
  sourceUrl?: string;
}

/** Caminho público da foto (ex.: "/img/photos/medellin-colombia.jpg") ou null se não houver. */
export function findPhoto(imageKey: string): string | null {
  if (!KEY_PATTERN.test(imageKey)) return null;
  for (const ext of EXTENSIONS) {
    if (existsSync(path.join(PHOTOS_DIR, `${imageKey}.${ext}`))) {
      return `/img/photos/${imageKey}.${ext}`;
    }
  }
  return null;
}

/** Primeira foto existente entre as chaves (ex.: da oportunidade, depois do destino). */
export function findFirstPhoto(...imageKeys: string[]): string | null {
  for (const key of imageKeys) {
    const found = findPhoto(key);
    if (found) return found;
  }
  return null;
}

function text(value: unknown, max = 200): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;
}

/** Créditos das fotos que realmente existem em disco. Nunca lança: arquivo ausente ou inválido = []. */
export function listPhotoCredits(): PhotoCredit[] {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path.join(PHOTOS_DIR, "credits.json"), "utf8"));
  } catch {
    return [];
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return [];

  const credits: PhotoCredit[] = [];
  for (const [imageKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!findPhoto(imageKey) || typeof value !== "object" || value === null) continue;
    const v = value as Record<string, unknown>;
    const sourceUrl = text(v.sourceUrl, 500);
    credits.push({
      imageKey,
      title: text(v.title),
      author: text(v.author),
      license: text(v.license),
      // Só links https são renderizados.
      sourceUrl: sourceUrl?.startsWith("https://") ? sourceUrl : undefined,
    });
  }
  return credits.sort((a, b) => a.imageKey.localeCompare(b.imageKey));
}
