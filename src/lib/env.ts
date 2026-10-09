import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL é obrigatória")
    .refine((v) => v.startsWith("postgresql://") || v.startsWith("postgres://"), {
      message: "DATABASE_URL deve começar com postgresql://",
    }),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Valida variáveis de ambiente do servidor sob demanda (falha com mensagem clara). */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  });
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Variáveis de ambiente inválidas — ${details}`);
  }
  cached = parsed.data;
  return cached;
}

export function getSiteUrl(): string {
  const parsed = z.url().safeParse(process.env.NEXT_PUBLIC_SITE_URL);
  return parsed.success ? parsed.data : "http://localhost:3000";
}
