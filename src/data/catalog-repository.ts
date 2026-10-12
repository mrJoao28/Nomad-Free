import "server-only";
import type { PrismaClient, Resort } from "@prisma/client";
import { getDb } from "@/server/db";
import { slugSchema } from "@/domain/search-params";
import { findPhoto } from "@/lib/photos";
import type { Region, ResortDetail, ResortItem } from "@/domain/types";

/**
 * Camada de acesso a dados. Todas as funções aceitam um cliente opcional
 * para facilitar testes de integração com um banco isolado.
 */

function toItem(r: Resort): ResortItem {
  const photoSrc = findPhoto(r.imageKey);
  return {
    slug: r.slug,
    href: `/destinos/${r.slug}`,
    name: r.name,
    country: r.country,
    locationLabel: `${r.name}, ${r.country}`,
    summary: r.summary,
    tags: r.tags,
    region: r.region,
    mountainRange: r.mountainRange,
    curatedRank: r.curatedRank,
    topElevationM: r.topElevationM,
    areaLabel: r.areaLabel,
    sizeRank: r.sizeRank,
    seasonLabel: r.seasonLabel,
    dailyCostMinor: r.dailyBudgetMinor,
    currency: r.currency,
    priceKind: r.priceKind,
    imageKey: r.imageKey,
    ...(photoSrc ? { photoSrc } : {}),
  };
}

/** Todas as estações, na ordem da curadoria. */
export async function listResorts(db: PrismaClient = getDb()): Promise<ResortItem[]> {
  const rows = await db.resort.findMany({ orderBy: { curatedRank: "asc" } });
  return rows.map(toItem);
}

export async function getResortBySlug(
  slug: string,
  db: PrismaClient = getDb(),
): Promise<ResortDetail | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  return db.resort.findUnique({ where: { slug } });
}

/** Estações para comparação, na mesma ordem dos slugs recebidos (slugs inexistentes são omitidos). */
export async function listResortsBySlugs(
  slugs: string[],
  db: PrismaClient = getDb(),
): Promise<ResortDetail[]> {
  const valid = slugs.filter((s) => slugSchema.safeParse(s).success);
  if (valid.length === 0) return [];
  const rows = await db.resort.findMany({ where: { slug: { in: valid } } });
  const ordered: ResortDetail[] = [];
  for (const slug of valid) {
    const row = rows.find((r) => r.slug === slug);
    if (row) ordered.push(row);
  }
  return ordered;
}

/** Opções leves (slug, nome, país) para os seletores do comparador. */
export async function listResortOptions(
  db: PrismaClient = getDb(),
): Promise<{ slug: string; name: string; country: string }[]> {
  return db.resort.findMany({
    select: { slug: true, name: true, country: true },
    orderBy: { name: "asc" },
  });
}

/** Outras estações do mesmo país (ou, se faltarem, da mesma região), na ordem da curadoria. */
export async function listRelatedResorts(
  slug: string,
  country: string,
  region: Region,
  limit = 3,
  db: PrismaClient = getDb(),
): Promise<ResortItem[]> {
  const rows = await db.resort.findMany({
    where: { slug: { not: slug }, OR: [{ country }, { region }] },
    orderBy: { curatedRank: "asc" },
  });
  const sameCountry = rows.filter((r) => r.country === country);
  const others = rows.filter((r) => r.country !== country);
  return [...sameCountry, ...others].slice(0, limit).map(toItem);
}
