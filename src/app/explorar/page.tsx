import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchForm } from "@/components/search-form";
import { ResortCard } from "@/components/catalog-card";
import { DemoNotice } from "@/components/price";
import { buttonVariants } from "@/components/ui/button";
import { listResorts } from "@/data/catalog-repository";
import { searchResorts } from "@/domain/catalog";
import { parseExploreParams } from "@/domain/search-params";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explorar estações de esqui",
  description:
    "Busque e filtre 100 estações de esqui por perfil, região, orçamento, altitude e tamanho.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = parseExploreParams(params);
  const all = await listResorts();
  const results = searchResorts(all, query.filters, query.order);

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-5 pt-6 pb-8 sm:px-8">
        <h1 className="display display-caps text-[clamp(2.6rem,7vw,6rem)]">Explorar</h1>
        <p className="text-ink-soft mt-4 max-w-xl text-sm leading-relaxed">
          Combine busca, perfil, região e orçamento. Altitudes, áreas e custos são aproximados e de
          demonstração.
        </p>

        <SearchForm
          showSort
          idPrefix="explorar"
          className="mt-8"
          values={{
            q: first(params.q),
            perfil: first(params.perfil),
            regiao: first(params.regiao),
            orcamento: first(params.orcamento),
            ordem: first(params.ordem),
          }}
        />

        {query.ignored.length > 0 ? (
          <p role="status" className="mt-4 rounded-lg bg-[#f3e4c3] p-3 text-sm text-[#5c3f0e]">
            Ignoramos filtros com valores inválidos: {query.ignored.join(", ")}.
          </p>
        ) : null}

        <h2 className="mt-10 text-lg font-semibold" aria-live="polite" data-testid="results-count">
          {results.length === 1 ? "1 resultado" : `${results.length} resultados`}
        </h2>

        {results.length === 0 ? (
          <div
            className="border-ink/30 mt-6 rounded-[var(--radius-card)] border border-dashed p-10 text-center"
            data-testid="empty-state"
          >
            <p className="text-lg font-semibold">Nada encontrado com esses filtros</p>
            <p className="text-ink-soft mx-auto mt-2 max-w-md text-sm">
              Tente remover algum filtro, aumentar o orçamento diário ou buscar por outro termo.
            </p>
            <Link href="/explorar" className={cn(buttonVariants({ variant: "accent" }), "mt-6")}>
              Limpar filtros
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((item) => (
              <li key={item.slug} className="flex">
                <ResortCard item={item} className="w-full" headingLevel={3} />
              </li>
            ))}
          </ul>
        )}

        <DemoNotice className="text-ink-soft mt-12 max-w-3xl text-sm leading-relaxed" />
      </main>
      <SiteFooter />
    </>
  );
}
