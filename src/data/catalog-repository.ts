import "server-only";
import type { Destination, Prisma, PrismaClient } from "@prisma/client";
import { getDb } from "@/server/db";
import { slugSchema } from "@/domain/search-params";
import { findFirstPhoto } from "@/lib/photos";
import type { CatalogItem, DestinationDetail, OpportunityDetail, Region } from "@/domain/types";

/**
 * Camada de acesso a dados. Todas as funções aceitam um cliente opcional
 * para facilitar testes de integração com um banco isolado.
 */

type DestinationRow = Destination;
type OpportunityRow = Prisma.OpportunityGetPayload<{ include: { destination: true } }>;

/** Foto real (se existir) da chave; oportunidades usam a foto do destino como alternativa. */
function photoProps(...imageKeys: string[]): { photoSrc?: string } {
  const photoSrc = findFirstPhoto(...imageKeys);
  return photoSrc ? { photoSrc } : {};
}

function toDestinationItem(d: DestinationRow): CatalogItem {
  return {
    kind: "destination",
    slug: d.slug,
    href: `/destinos/${d.slug}`,
    title: d.name,
    locationLabel: `${d.name}, ${d.country}`,
    summary: d.summary,
    categories: d.categories,
    region: d.region,
    dailyCostMinor: d.dailyBudgetMinor,
    currency: d.currency,
    priceKind: d.priceKind,
    imageKey: d.imageKey,
    remoteWorkScore: d.remoteWorkScore,
    ...photoProps(d.imageKey),
  };
}

function toOpportunityItem(o: OpportunityRow): CatalogItem {
  return {
    kind: "opportunity",
    slug: o.slug,
    href: `/oportunidades/${o.slug}`,
    title: o.title,
    locationLabel: `${o.destination.name}, ${o.destination.country}`,
    summary: o.summary,
    categories: [o.category],
    region: o.destination.region,
    dailyCostMinor: o.dailyCostMinor,
    currency: o.currency,
    priceKind: o.priceKind,
    imageKey: o.imageKey,
    ...photoProps(o.imageKey, o.destination.imageKey),
  };
}

export async function listCatalogItems(db: PrismaClient = getDb()): Promise<CatalogItem[]> {
  const [destinations, opportunities] = await Promise.all([
    db.destination.findMany({ orderBy: { name: "asc" } }),
    db.opportunity.findMany({ include: { destination: true }, orderBy: { title: "asc" } }),
  ]);
  return [...destinations.map(toDestinationItem), ...opportunities.map(toOpportunityItem)];
}

export async function getDestinationBySlug(
  slug: string,
  db: PrismaClient = getDb(),
): Promise<DestinationDetail | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  return db.destination.findUnique({ where: { slug } });
}

/** Destinos para comparação, na mesma ordem dos slugs recebidos (slugs inexistentes são omitidos). */
export async function listDestinationsBySlugs(
  slugs: string[],
  db: PrismaClient = getDb(),
): Promise<DestinationDetail[]> {
  const valid = slugs.filter((s) => slugSchema.safeParse(s).success);
  if (valid.length === 0) return [];
  const rows = await db.destination.findMany({ where: { slug: { in: valid } } });
  const ordered: DestinationDetail[] = [];
  for (const slug of valid) {
    const row = rows.find((r) => r.slug === slug);
    if (row) ordered.push(row);
  }
  return ordered;
}

/** Opções leves (slug, nome, país) para os seletores do comparador. */
export async function listDestinationOptions(
  db: PrismaClient = getDb(),
): Promise<{ slug: string; name: string; country: string }[]> {
  return db.destination.findMany({
    select: { slug: true, name: true, country: true },
    orderBy: { name: "asc" },
  });
}

export async function getOpportunityBySlug(
  slug: string,
  db: PrismaClient = getDb(),
): Promise<OpportunityDetail | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  const row = await db.opportunity.findUnique({
    where: { slug },
    include: { destination: true },
  });
  if (!row) return null;
  const { destination, ...rest } = row;
  return {
    ...rest,
    destination: {
      slug: destination.slug,
      name: destination.name,
      country: destination.country,
      region: destination.region as Region,
      imageKey: destination.imageKey,
    },
  };
}

export async function listOpportunitiesForDestination(
  destinationSlug: string,
  db: PrismaClient = getDb(),
): Promise<CatalogItem[]> {
  const rows = await db.opportunity.findMany({
    where: { destination: { slug: destinationSlug } },
    include: { destination: true },
    orderBy: { dailyCostMinor: "asc" },
  });
  return rows.map(toOpportunityItem);
}

export async function listRelatedOpportunities(
  opportunitySlug: string,
  destinationSlug: string,
  db: PrismaClient = getDb(),
): Promise<CatalogItem[]> {
  const all = await listOpportunitiesForDestination(destinationSlug, db);
  return all.filter((o) => o.slug !== opportunitySlug);
}

export async function listSlugs(db: PrismaClient = getDb()) {
  const [destinations, opportunities] = await Promise.all([
    db.destination.findMany({ select: { slug: true } }),
    db.opportunity.findMany({ select: { slug: true } }),
  ]);
  return {
    destinations: destinations.map((d) => d.slug),
    opportunities: opportunities.map((o) => o.slug),
  };
}
