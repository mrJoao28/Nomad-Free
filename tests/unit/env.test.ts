import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe("getEnv", () => {
  it("falha com mensagem clara sem DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const { getEnv } = await import("@/lib/env");
    expect(() => getEnv()).toThrow(/DATABASE_URL/);
  });

  it("aceita URL postgresql válida", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@localhost:5432/db");
    const { getEnv } = await import("@/lib/env");
    expect(getEnv().DATABASE_URL).toContain("postgresql://");
  });
});
