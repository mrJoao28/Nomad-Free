/**
 * Dinheiro é sempre armazenado em unidades menores (centavos) como inteiro,
 * com código de moeda ISO 4217 explícito. Nunca usamos float para valores monetários.
 */

export function formatMoney(minor: number, currency: string, locale = "pt-BR"): string {
  const digits = currency === "JPY" ? 0 : 2;
  const major = minor / 10 ** digits;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: digits,
    minimumFractionDigits: minor % 100 === 0 ? 0 : digits,
  }).format(major);
}

/** Converte reais (inteiros do formulário) em centavos. */
export function reaisToMinor(reais: number): number {
  return Math.round(reais * 100);
}

export interface TripBudget {
  days: number;
  currency: string;
  /** Faixa ilustrativa: -20% / +30% sobre a estimativa diária. */
  lowMinor: number;
  expectedMinor: number;
  highMinor: number;
}

/**
 * Orçamento total ilustrativo para uma estadia. Usa aritmética inteira.
 * A faixa (-20% / +30%) é uma convenção do produto, não dado de mercado.
 */
export function estimateTripBudget(dailyMinor: number, days: number, currency: string): TripBudget {
  if (!Number.isInteger(dailyMinor) || dailyMinor < 0) {
    throw new RangeError("dailyMinor deve ser um inteiro >= 0");
  }
  if (!Number.isInteger(days) || days < 1) {
    throw new RangeError("days deve ser um inteiro >= 1");
  }
  const expectedMinor = dailyMinor * days;
  return {
    days,
    currency,
    lowMinor: Math.round((expectedMinor * 80) / 100),
    expectedMinor,
    highMinor: Math.round((expectedMinor * 130) / 100),
  };
}
