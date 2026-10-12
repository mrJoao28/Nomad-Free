import type { PrismaClient } from "@prisma/client";
import { DEMO_SOURCE, resorts } from "./seed-data";

/**
 * Semeia as estações de demonstração de forma idempotente (upsert por slug).
 * Com { reset: true }, apaga antes a tabela (usado nos testes de integração).
 */
export async function seedDatabase(db: PrismaClient, options: { reset?: boolean } = {}) {
  if (options.reset) {
    await db.resort.deleteMany();
  }

  for (const r of resorts) {
    const data = {
      name: r.name,
      country: r.country,
      region: r.region,
      mountainRange: r.mountainRange,
      tags: r.tags,
      summary: r.summary,
      description: r.description,
      curatedRank: r.curatedRank,
      topElevationM: r.topElevationM,
      areaLabel: r.areaLabel,
      sizeRank: r.sizeRank,
      seasonLabel: r.seasonLabel,
      dailyBudgetMinor: r.dailyBudgetReais * 100,
      currency: "BRL",
      priceKind: "ESTIMATE" as const,
      sourceLabel: DEMO_SOURCE,
      imageKey: r.imageKey,
      isDemo: true,
    };
    await db.resort.upsert({
      where: { slug: r.slug },
      create: { slug: r.slug, ...data },
      update: data,
    });
  }

  return { resorts: resorts.length };
}
