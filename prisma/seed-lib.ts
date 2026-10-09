import type { PrismaClient } from "@prisma/client";
import { DEMO_SOURCE, destinations, opportunities } from "./seed-data";

/**
 * Semeia os dados de demonstração de forma idempotente (upsert por slug).
 * Com { reset: true}, apaga antes as tabelas de catálogo (usado nos testes de integração).
 */
export async function seedDatabase(db: PrismaClient, options: { reset?: boolean } = {}) {
  if (options.reset) {
    await db.opportunity.deleteMany();
    await db.destination.deleteMany();
  }

  for (const d of destinations) {
    const data = {
      name: d.name,
      country: d.country,
      region: d.region,
      categories: d.categories,
      summary: d.summary,
      description: d.description,
      dailyBudgetMinor: d.dailyBudgetReais * 100,
      currency: "BRL",
      priceKind: "ESTIMATE" as const,
      sourceLabel: DEMO_SOURCE,
      remoteWorkScore: d.remoteWorkScore,
      internetNotes: d.internetNotes,
      coworkingNotes: d.coworkingNotes,
      bestSeason: d.bestSeason,
      imageKey: d.imageKey,
      isDemo: true,
    };
    await db.destination.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, ...data },
      update: data,
    });
  }

  for (const o of opportunities) {
    const destination = await db.destination.findUniqueOrThrow({
      where: { slug: o.destinationSlug },
    });
    const data = {
      title: o.title,
      category: o.category,
      destinationId: destination.id,
      summary: o.summary,
      conditions: o.conditions,
      hoursPerWeek: o.hoursPerWeek,
      dailyCostMinor: o.dailyCostReais * 100,
      upfrontFeeMinor: o.upfrontFeeReais !== undefined ? o.upfrontFeeReais * 100 : null,
      currency: "BRL",
      priceKind: "ESTIMATE" as const,
      sourceLabel: DEMO_SOURCE,
      externalUrl: o.externalUrl ?? null,
      imageKey: o.imageKey,
      isDemo: true,
    };
    await db.opportunity.upsert({
      where: { slug: o.slug },
      create: { slug: o.slug, ...data },
      update: data,
    });
  }

  return { destinations: destinations.length, opportunities: opportunities.length };
}
