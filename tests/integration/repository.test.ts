import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDatabase } from "../../prisma/seed-lib";
import { resorts } from "../../prisma/seed-data";
import {
  getResortBySlug,
  listRelatedResorts,
  listResortOptions,
  listResorts,
  listResortsBySlugs,
} from "@/data/catalog-repository";
import { searchResorts } from "@/domain/catalog";

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
    expect(await db.resort.count()).toBe(resorts.length);
    expect(resorts).toHaveLength(100);
  });

  it("marca todos os registros como demonstração e estimativa", async () => {
    expect(
      await db.resort.count({ where: { OR: [{ isDemo: false }, { priceKind: "VERIFIED" }] } }),
    ).toBe(0);
  });
});

describe("catalog-repository", () => {
  it("lista as 100 estações na ordem da curadoria", async () => {
    const items = await listResorts(db);
    expect(items).toHaveLength(100);
    expect(items.map((i) => i.curatedRank)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
    expect(items[0]?.slug).toBe("zermatt");
    expect(items[0]?.href).toBe("/destinos/zermatt");
  });

  it("busca estação por slug e rejeita slugs inválidos", async () => {
    const r = await getResortBySlug("zermatt", db);
    expect(r?.name).toBe("Zermatt");
    expect(r?.topElevationM).toBe(3883);
    expect(r?.tags).toContain("HIGH_ALTITUDE");
    expect(await getResortBySlug("nao-existe", db)).toBeNull();
    expect(await getResortBySlug("../etc/passwd", db)).toBeNull();
  });

  it("devolve estações para comparação na ordem pedida, omitindo as inexistentes", async () => {
    const list = await listResortsBySlugs(["chamonix", "nao-existe", "zermatt", "INVALIDO"], db);
    expect(list.map((r) => r.slug)).toEqual(["chamonix", "zermatt"]);
    expect(await listResortsBySlugs([], db)).toEqual([]);
  });

  it("lista opções ordenadas por nome", async () => {
    const options = await listResortOptions(db);
    expect(options).toHaveLength(100);
    const names = options.map((o) => o.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("relacionadas excluem a própria estação e priorizam o mesmo país", async () => {
    const related = await listRelatedResorts("zermatt", "Suíça", "ALPS", 3, db);
    expect(related).toHaveLength(3);
    expect(related.map((r) => r.slug)).not.toContain("zermatt");
    expect(related.every((r) => r.country === "Suíça")).toBe(true);
  });

  it("filtra os dados reais por região, perfil e orçamento", async () => {
    const items = await listResorts(db);
    expect(searchResorts(items, { region: "ALPS" }, "curadoria")).toHaveLength(48);
    const luxury = searchResorts(items, { tag: "LUXURY" }, "maior-custo");
    expect(luxury.length).toBeGreaterThan(5);
    expect(luxury.every((i) => i.tags.includes("LUXURY"))).toBe(true);
    const cheap = searchResorts(items, { maxDailyMinor: 70000 }, "menor-custo");
    expect(cheap.length).toBeGreaterThan(0);
    expect(cheap.every((i) => i.dailyCostMinor <= 70000)).toBe(true);
    expect(
      searchResorts(items, { q: "japao" }, "curadoria").every((i) => i.country === "Japão"),
    ).toBe(true);
  });
});
