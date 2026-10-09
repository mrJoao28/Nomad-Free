import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDatabase } from "../../prisma/seed-lib";
import { destinations, opportunities } from "../../prisma/seed-data";
import {
  getDestinationBySlug,
  getOpportunityBySlug,
  listCatalogItems,
  listOpportunitiesForDestination,
  listRelatedOpportunities,
} from "@/data/catalog-repository";
import { searchCatalog } from "@/domain/catalog";

const url = process.env.DATABASE_URL ?? "";
const dbName = url ? new URL(url).pathname.replace(/^\//, "") : "";

let db: PrismaClient;

beforeAll(async () => {
  // Proteção: nunca apagar/semear um banco que não seja de teste.
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `Recusando rodar testes de integração no banco "${dbName}". Use scripts/with-test-db.mjs.`,
    );
  }
  db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  await seedDatabase(db, { reset: true });
});

afterAll(async () => {
  await db?.$disconnect();
});

describe("seed", () => {
  it("é idempotente e não duplica registros", async () => {
    await seedDatabase(db);
    expect(await db.destination.count()).toBe(destinations.length);
    expect(await db.opportunity.count()).toBe(opportunities.length);
  });

  it("marca todos os registros como demonstração e estimativa", async () => {
    expect(
      await db.destination.count({ where: { OR: [{ isDemo: false }, { priceKind: "VERIFIED" }] } }),
    ).toBe(0);
    expect(
      await db.opportunity.count({ where: { OR: [{ isDemo: false }, { priceKind: "VERIFIED" }] } }),
    ).toBe(0);
  });
});

describe("catalog-repository", () => {
  it("lista destinos e oportunidades como itens unificados", async () => {
    const items = await listCatalogItems(db);
    expect(items).toHaveLength(destinations.length + opportunities.length);
    expect(items.filter((i) => i.kind === "destination")).toHaveLength(destinations.length);
  });

  it("busca destino por slug", async () => {
    const d = await getDestinationBySlug("medellin-colombia", db);
    expect(d?.name).toBe("Medellín");
    expect(d?.dailyBudgetMinor).toBe(26000);
    expect(d?.currency).toBe("BRL");
  });

  it("retorna null para slug inexistente ou inválido", async () => {
    expect(await getDestinationBySlug("nao-existe", db)).toBeNull();
    expect(await getDestinationBySlug("../x", db)).toBeNull();
    expect(await getOpportunityBySlug("nao-existe", db)).toBeNull();
  });

  it("busca oportunidade com seu destino", async () => {
    const o = await getOpportunityBySlug("troca-atendimento-cafe-cusco", db);
    expect(o?.category).toBe("ACCOMMODATION_EXCHANGE");
    expect(o?.destination.slug).toBe("cusco-peru");
  });

  it("lista oportunidades de um destino ordenadas por custo", async () => {
    const list = await listOpportunitiesForDestination("cusco-peru", db);
    expect(list.map((i) => i.slug)).toEqual([
      "troca-atendimento-cafe-cusco",
      "voluntariado-ingles-escola-cusco",
    ]);
  });

  it("relacionadas excluem a própria oportunidade", async () => {
    const list = await listRelatedOpportunities("troca-atendimento-cafe-cusco", "cusco-peru", db);
    expect(list.map((i) => i.slug)).toEqual(["voluntariado-ingles-escola-cusco"]);
  });

  it("filtros de domínio funcionam sobre dados do banco", async () => {
    const items = await listCatalogItems(db);
    const result = searchCatalog(
      items,
      { category: "VOLUNTEERING", maxDailyMinor: 7000 },
      "menor-custo",
    );
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((i) => i.categories.includes("VOLUNTEERING") && i.dailyCostMinor <= 7000),
    ).toBe(true);
    expect(result.map((i) => i.dailyCostMinor)).toEqual(
      [...result.map((i) => i.dailyCostMinor)].sort((a, b) => a - b),
    );
  });

  it("garante slugs únicos no banco", async () => {
    await expect(
      db.destination.create({
        data: {
          slug: "medellin-colombia",
          name: "x",
          country: "x",
          region: "ASIA",
          categories: [],
          summary: "x",
          description: "x",
          dailyBudgetMinor: 1,
          sourceLabel: "x",
          remoteWorkScore: 1,
          internetNotes: "x",
          coworkingNotes: "x",
          bestSeason: "x",
          imageKey: "x",
        },
      }),
    ).rejects.toThrow();
  });
});
