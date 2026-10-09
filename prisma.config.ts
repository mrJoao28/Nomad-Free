import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Com prisma.config.ts o Prisma não carrega .env sozinho; carregamos se existir.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
});
