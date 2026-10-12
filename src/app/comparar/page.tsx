import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoNotice } from "@/components/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import { listResortOptions, listResortsBySlugs } from "@/data/catalog-repository";
import {
  buildComparison,
  MAX_COMPARE,
  MAX_COMPARE_DAYS,
  parseCompareParams,
} from "@/domain/compare";
import {
  PRICE_KIND_LABELS,
  REGION_LABELS,
  SIZE_LABELS,
  TAG_LABELS,
  formatElevation,
} from "@/domain/labels";
import { formatMoney } from "@/domain/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparar estações",
  description:
    "Compare até três estações de esqui lado a lado: altitude, área esquiável, temporada e custo da viagem.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const rowHeader = "text-ink-soft py-3 pr-4 text-left align-top text-sm font-medium";
const cell = "py-3 pr-4 align-top text-sm leading-relaxed";

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseCompareParams(await searchParams);
  const [options, resorts] = await Promise.all([
    listResortOptions(),
    listResortsBySlugs(query.slugs),
  ]);
  const rows = buildComparison(resorts, query.days);
  const missing = query.slugs.length - resorts.length;
  const daysLabel = `${query.days} ${query.days === 1 ? "dia" : "dias"}`;

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-5 pt-6 pb-8 sm:px-8">
        <h1 className="display display-caps text-[clamp(2.6rem,7vw,6rem)]">Comparar</h1>
        <p className="text-ink-soft mt-4 max-w-xl text-sm leading-relaxed">
          Escolha de 2 a {MAX_COMPARE} estações e a duração da viagem. Os valores são aproximados e
          de demonstração.
        </p>

        <form
          action="/comparar"
          method="get"
          aria-label="Escolher estações para comparar"
          className="bg-paper border-line mt-8 grid gap-4 rounded-[var(--radius-card)] border p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_0.7fr_auto] lg:items-end"
        >
          {Array.from({ length: MAX_COMPARE }, (_, i) => (
            <Field key={i} label={`Estação ${i + 1}`} htmlFor={`comparar-d${i + 1}`}>
              <Select id={`comparar-d${i + 1}`} name="d" defaultValue={query.slugs[i] ?? ""}>
                <option value="">{i < 2 ? "Escolha uma estação" : "Nenhuma (opcional)"}</option>
                {options.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.name}, {o.country}
                  </option>
                ))}
              </Select>
            </Field>
          ))}
          <Field label="Dias de viagem" htmlFor="comparar-dias">
            <TextInput
              id="comparar-dias"
              name="dias"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_COMPARE_DAYS}
              defaultValue={query.days}
            />
          </Field>
          <Button type="submit" variant="accent" className="sm:col-span-2 lg:col-span-1">
            Comparar
          </Button>
        </form>

        {query.ignored.length > 0 ? (
          <p role="status" className="mt-4 rounded-lg bg-[#f3e4c3] p-3 text-sm text-[#5c3f0e]">
            Ignoramos parâmetros inválidos: {query.ignored.join(", ")}.
          </p>
        ) : null}
        {missing > 0 ? (
          <p role="status" className="mt-4 rounded-lg bg-[#f3e4c3] p-3 text-sm text-[#5c3f0e]">
            {missing === 1
              ? "Uma estação não foi encontrada."
              : `${missing} estações não foram encontradas.`}
          </p>
        ) : null}

        {rows.length < 2 ? (
          <div
            className="border-ink/30 mt-8 rounded-[var(--radius-card)] border border-dashed p-10 text-center"
            data-testid="compare-empty"
          >
            <p className="text-lg font-semibold">Escolha pelo menos 2 estações</p>
            <p className="text-ink-soft mx-auto mt-2 max-w-md text-sm">
              Selecione as estações acima e clique em Comparar. Você também pode começar pela página
              de uma estação.
            </p>
            <Link
              href="/explorar"
              className="mt-5 inline-block text-sm font-medium underline underline-offset-4"
            >
              Ver todas as estações
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto" data-testid="compare-table">
            <table className="w-full min-w-[40rem] border-collapse">
              <caption className="sr-only">
                Comparação de {rows.length} estações para {daysLabel}
              </caption>
              <thead>
                <tr className="border-line border-b">
                  <td className="w-40" />
                  {rows.map(({ resort: r, isCheapest, isHighest, isLargest }) => (
                    <th key={r.slug} scope="col" className="py-3 pr-4 text-left align-top">
                      <Link
                        href={`/destinos/${r.slug}`}
                        className="display display-caps text-2xl underline-offset-4 hover:underline"
                      >
                        {r.name}
                      </Link>
                      <span className="text-ink-soft block text-sm font-normal">{r.country}</span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {isCheapest ? <Badge tone="dark">Mais barata</Badge> : null}
                        {isHighest ? <Badge tone="dark">Mais alta</Badge> : null}
                        {isLargest ? <Badge tone="dark">Maior área</Badge> : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                <tr>
                  <th scope="row" className={rowHeader}>
                    Região
                  </th>
                  {rows.map(({ resort: r }) => (
                    <td key={r.slug} className={cell}>
                      {REGION_LABELS[r.region]}
                      <span className="text-ink-soft block text-xs">{r.mountainRange}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Altitude máxima
                  </th>
                  {rows.map(({ resort: r }) => (
                    <td key={r.slug} className={cell}>
                      <span className="font-semibold">{formatElevation(r.topElevationM)}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Área esquiável
                  </th>
                  {rows.map(({ resort: r }) => (
                    <td key={r.slug} className={cell}>
                      <span className="font-semibold">{SIZE_LABELS[r.sizeRank]}</span>
                      <span className="text-ink-soft block text-xs">{r.areaLabel}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Temporada
                  </th>
                  {rows.map(({ resort: r }) => (
                    <td key={r.slug} className={cell}>
                      {r.seasonLabel}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Custo por pessoa/dia
                  </th>
                  {rows.map(({ resort: r }) => (
                    <td key={r.slug} className={cell}>
                      <span className="font-semibold">
                        {formatMoney(r.dailyBudgetMinor, r.currency)}
                      </span>
                      <span className="text-ink-soft block text-xs">
                        {PRICE_KIND_LABELS[r.priceKind]}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Total em {daysLabel}
                  </th>
                  {rows.map(({ resort: r, budget }) => (
                    <td key={r.slug} className={cell}>
                      <span className="font-semibold" data-testid="compare-total">
                        {formatMoney(budget.expectedMinor, budget.currency)}
                      </span>
                      <span className="text-ink-soft block text-xs">
                        Faixa: {formatMoney(budget.lowMinor, budget.currency)} a{" "}
                        {formatMoney(budget.highMinor, budget.currency)}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Perfis
                  </th>
                  {rows.map(({ resort: r }) => (
                    <td key={r.slug} className={cell}>
                      {r.tags.map((t) => TAG_LABELS[t]).join(", ")}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            <p className="text-ink-soft mt-4 text-xs leading-relaxed">
              Faixa de -20% a +30% sobre a estimativa diária; não inclui passagens nem seguro.
            </p>
          </div>
        )}

        <DemoNotice className="text-ink-soft mt-12 max-w-3xl text-sm leading-relaxed" />
      </main>
      <SiteFooter />
    </>
  );
}
