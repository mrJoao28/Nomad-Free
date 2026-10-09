#!/usr/bin/env node
// Executa um comando apontando DATABASE_URL para o banco de TESTE.
// Recusa rodar se o nome do banco não terminar em "_test" (protege dados de desenvolvimento).
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile(".env");

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) {
  console.error("TEST_DATABASE_URL não definida. Copie .env.example para .env.");
  process.exit(1);
}
const dbName = new URL(testUrl).pathname.replace(/^\//, "");
if (!dbName.endsWith("_test")) {
  console.error(`Recusando executar: o banco "${dbName}" não termina em "_test".`);
  process.exit(1);
}

const command = process.argv.slice(2).join(" ");
if (!command) {
  console.error('Uso: node scripts/with-test-db.mjs "<comando>"');
  process.exit(1);
}

const result = spawnSync(command, {
  shell: true,
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: testUrl, NODE_ENV: process.env.NODE_ENV ?? "test" },
});
process.exit(result.status ?? 1);
