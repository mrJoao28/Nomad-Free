import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoNotice } from "@/components/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import { listDestinationOptions, listDestinationsBySlugs } from "@/data/catalog-repository";
import {
  buildComparison,
  MAX_COMPARE,
  MAX_COMPARE_DAYS,
  parseCompareParams,
} from "@/domain/compare";
import { CATEGORY_LABELS, PRICE_KIND_LABELS, REGION_LABELS } from "@/domain/labels";
import { formatMoney } from "@/domain/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparar destinos",
  description:
    "Compare até três destinos lado a lado: custo diário, orçamento da estadia e informações de trabalho remoto.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const rowHeader = "text-ink-soft py-3 pr-4 text-left align-top text-sm font-medium";
const cell = "py-3 pr-4 align-top text-sm leading-relaxed";

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseCompareParams(await searchParams);
  const [options, destinations] = await Promise.all([
    listDestinationOptions(),
    listDestinationsBySlugs(query.slugs),
  ]);
  const rows = buildComparison(destinations, query.days);
  const missing = query.slugs.length - destinations.length;

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-5 pt-6 pb-8 sm:px-8">
        <h1 className="display text-[clamp(2.6rem,7vw,6rem)]">Comparar</h1>
        <p className="text-ink-soft mt-4 max-w-xl text-sm leading-relaxed">
          Escolha de 2 a {MAX_COMPARE} destinos e a duração da estadia. Os valores são estimativas
          de demonstração.
        </p>

        <form
          action="/comparar"
          method="get"
          aria-label="Escolher destinos para comparar"
          className="bg-paper mt-8 grid gap-4 rounded-[var(--radius-card)] p-5 shadow-[0_18px_40px_-24px_rgba(31,35,38,0.45)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_0.7fr_auto] lg:items-end"
        >
          {Array.from({ length: MAX_COMPARE }, (_, i) => (
            <Field key={i} label={`Destino ${i + 1}`} htmlFor={`comparar-d${i + 1}`}>
              <Select id={`comparar-d${i + 1}`} name="d" defaultValue={query.slugs[i] ?? ""}>
                <option value="">{i < 2 ? "Escolha um destino" : "Nenhum (opcional)"}</option>
                {options.map((o) => (
                  <option key={o.slug} value={o.slug}>
                    {o.name}, {o.country}
                  </option>
                ))}
              </Select>
            </Field>
          ))}
          <Field label="Dias de estadia" htmlFor="comparar-dias">
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
              ? "Um destino não foi encontrado"
              : `${missing} destinos não foram encontrados`}
            .
          </p>
        ) : null}

        {rows.length < 2 ? (
          <div
            className="border-ink/30 mt-8 rounded-[var(--radius-card)] border border-dashed p-10 text-center"
            data-testid="compare-empty"
          >
            <p className="text-lg font-semibold">Escolha pelo menos 2 destinos</p>
            <p className="text-ink-soft mx-auto mt-2 max-w-md text-sm">
              Selecione os destinos acima e clique em Comparar. Você também pode começar pela página
              de um destino.
            </p>
            <Link
              href="/explorar"
              className="mt-5 inline-block text-sm font-medium underline underline-offset-4"
            >
              Ver todos os destinos
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto" data-testid="compare-table">
            <table className="w-full min-w-[40rem] border-collapse">
              <caption className="sr-only">
                Comparação de {rows.length} destinos para {query.days}{" "}
                {query.days === 1 ? "dia" : "dias"}
              </caption>
              <thead>
                <tr className="border-line border-b">
                  <td className="w-40" />
                  {rows.map(({ destination: d, isCheapest, isBestRemote }) => (
                    <th key={d.slug} scope="col" className="py-3 pr-4 text-left align-top">
                      <Link
                        href={`/destinos/${d.slug}`}
                        className="display text-2xl underline-offset-4 hover:underline"
                      >
                        {d.name}
                      </Link>
                      <span className="text-ink-soft block text-sm font-normal">{d.country}</span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {isCheapest ? <Badge tone="dark">Mais barato</Badge> : null}
                        {isBestRemote ? <Badge tone="dark">Melhor nota remota</Badge> : null}
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
                  {rows.map(({ destination: d }) => (
                    <td key={d.slug} className={cell}>
                      {REGION_LABELS[d.region]}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Custo por dia
                  </th>
                  {rows.map(({ destination: d }) => (
                    <td key={d.slug} className={cell}>
                      <span className="font-semibold">
                        {formatMoney(d.dailyBudgetMinor, d.currency)}
                      </span>
                      <span className="text-ink-soft block text-xs">
                        {PRICE_KIND_LABELS[d.priceKind]}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Total em {query.days} {query.days === 1 ? "dia" : "dias"}
                  </th>
                  {rows.map(({ destination: d, budget }) => (
                    <td key={d.slug} className={cell}>
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
                    Nota de trabalho remoto
                  </th>
                  {rows.map(({ destination: d }) => (
                    <td key={d.slug} className={cell}>
                      {d.remoteWorkScore} de 5
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Internet
                  </th>
                  {rows.map(({ destination: d }) => (
                    <td key={d.slug} className={cell}>
                      {d.internetNotes}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Coworking
                  </th>
                  {rows.map(({ destination: d }) => (
                    <td key={d.slug} className={cell}>
                      {d.coworkingNotes}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Melhor época
                  </th>
                  {rows.map(({ destination: d }) => (
                    <td key={d.slug} className={cell}>
                      {d.bestSeason}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={rowHeader}>
                    Categorias
                  </th>
                  {rows.map(({ destination: d }) => (
                    <td key={d.slug} className={cell}>
                      {d.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}
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
