import "server-only";
import type { PrismaClient } from "@prisma/client";
import { getDb } from "@/server/db";
import { slugSchema } from "@/domain/search-params";
import type { CatalogItem, DestinationDetail, OpportunityDetail, Region } from "@/domain/types";

/**
 * Camada de acesso a dados. Todas as funções aceitam um cliente opcional
 * para facilitar testes de integração com um banco isolado.
 */

export async function listCatalogItems(db: PrismaClient = getDb()): Promise<CatalogItem[]> {
  const [destinations, opportunities] = await Promise.all([
    db.destination.findMany({ orderBy: { name: "asc" } }),
    db.opportunity.findMany({ include: { destination: true }, orderBy: { title: "asc" } }),
  ]);

  const fromDestinations: CatalogItem[] = destinations.map((d) => ({
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
  }));

  const fromOpportunities: CatalogItem[] = opportunities.map((o) => ({
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
  }));

  return [...fromDestinations, ...fromOpportunities];
}

export async function getDestinationBySlug(
  slug: string,
  db: PrismaClient = getDb(),
): Promise<DestinationDetail | null> {
  if (!slugSchema.safeParse(slug).success) return null;
  return db.destination.findUnique({ where: { slug } });
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
  return rows.map((o) => ({
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
  }));
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
