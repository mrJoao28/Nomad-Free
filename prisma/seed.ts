import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDatabase } from "./seed-lib";

if (existsSync(".env")) process.loadEnvFile(".env");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL não definida.");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const result = await seedDatabase(db);
    console.log(
      `Seed concluído (DADOS DE DEMONSTRAÇÃO): ${result.destinations} destinos, ${result.opportunities} oportunidades.`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
