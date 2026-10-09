import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CatalogImage } from "@/components/catalog-image";
import { CatalogCard } from "@/components/catalog-card";
import { FavoriteButton } from "@/components/favorite-button";
import { Badge } from "@/components/ui/badge";
import { DemoNotice } from "@/components/price";
import { getDestinationBySlug, listOpportunitiesForDestination } from "@/data/catalog-repository";
import { CATEGORY_LABELS, PRICE_KIND_LABELS, REGION_LABELS } from "@/domain/labels";
import { estimateTripBudget, formatMoney } from "@/domain/money";

export const dynamic = "force-dynamic";

const load = cache(getDestinationBySlug);
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await load(slug);
  if (!d) return { title: "Destino não encontrado" };
  return {
    title: `${d.name}, ${d.country}`,
    description: d.summary,
    openGraph: {
      title: `${d.name}, ${d.country} · NomadFree`,
      description: d.summary,
      type: "article",
    },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const d = await load(slug);
  if (!d) notFound();
  const opportunities = await listOpportunitiesForDestination(d.slug);
  const stays = [7, 15, 30].map((days) => estimateTripBudget(d.dailyBudgetMinor, days, d.currency));

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[1.75rem]">
          <div className="aspect-[16/9] max-h-[34rem] min-h-64 w-full">
            <CatalogImage
              imageKey={d.imageKey}
              alt={`Ilustração de paisagem representando ${d.name}`}
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute top-4 right-4">
            <FavoriteButton kind="destination" slug={d.slug} title={d.name} />
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-ink-soft text-sm">
              {d.country} · {REGION_LABELS[d.region]}
            </p>
            <h1 className="display mt-2 text-[clamp(3rem,8vw,7rem)]">{d.name}</h1>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Categorias">
              {d.categories.map((c) => (
                <li key={c}>
                  <Badge>{CATEGORY_LABELS[c]}</Badge>
                </li>
              ))}
            </ul>
            <h2 className="mt-10 text-xl font-bold">Visão geral</h2>
            <p className="text-ink-soft mt-3 max-w-prose leading-relaxed">{d.description}</p>
            <p className="text-ink-soft mt-3 text-sm">
              Melhor época (ilustrativo): {d.bestSeason}.
            </p>
          </div>

          <aside
            className="bg-paper rounded-[var(--radius-card)] p-6"
            aria-labelledby="orcamento-title"
          >
            <h2 id="orcamento-title" className="text-xl font-bold">
              Orçamento estimado
            </h2>
            <p className="mt-3 text-3xl font-bold" data-testid="daily-budget">
              {formatMoney(d.dailyBudgetMinor, d.currency)}
              <span className="text-ink-soft text-base font-medium"> por dia</span>
            </p>
            <Badge tone="warn" className="mt-3">
              {PRICE_KIND_LABELS[d.priceKind]}
            </Badge>
            <p className="text-ink-soft mt-3 text-xs leading-relaxed">Fonte: {d.sourceLabel}.</p>
            <table className="mt-5 w-full text-sm">
              <caption className="sr-only">
                Orçamento total ilustrativo por duração da estadia
              </caption>
              <thead>
                <tr className="border-line text-ink-soft border-b text-left">
                  <th scope="col" className="py-2 font-medium">
                    Estadia
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Faixa estimada
                  </th>
                </tr>
              </thead>
              <tbody>
                {stays.map((s) => (
                  <tr key={s.days} className="border-line/60 border-b">
                    <th scope="row" className="py-2 text-left font-medium">
                      {s.days} dias
                    </th>
                    <td className="py-2 text-right">
                      {formatMoney(s.lowMinor, s.currency)} a {formatMoney(s.highMinor, s.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-ink-soft mt-3 text-xs leading-relaxed">
              Faixa de -20% a +30% sobre a estimativa diária; não inclui passagens nem seguro.
            </p>
          </aside>
        </div>

        <section
          aria-labelledby="remoto-title"
          className="bg-paper mt-14 rounded-[var(--radius-card)] p-6 sm:p-8"
        >
          <h2 id="remoto-title" className="text-xl font-bold">
            Trabalho remoto
          </h2>
          <dl className="mt-5 grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-ink-soft text-sm">Nota ilustrativa</dt>
              <dd className="mt-1 text-2xl font-bold" data-testid="remote-score">
                {d.remoteWorkScore} de 5
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft text-sm">Internet</dt>
              <dd className="mt-1 text-sm leading-relaxed">{d.internetNotes}</dd>
            </div>
            <div>
              <dt className="text-ink-soft text-sm">Coworking</dt>
              <dd className="mt-1 text-sm leading-relaxed">{d.coworkingNotes}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="oportunidades-title" className="mt-14">
          <h2 id="oportunidades-title" className="display text-[clamp(2rem,4vw,3.5rem)]">
            Oportunidades em {d.name}
          </h2>
          {opportunities.length === 0 ? (
            <p className="text-ink-soft mt-4">
              Ainda não há oportunidades de demonstração para este destino.
            </p>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((o) => (
                <li key={o.slug} className="flex">
                  <CatalogCard item={o} className="w-full" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <DemoNotice className="text-ink-soft mt-12 max-w-3xl text-sm leading-relaxed" />
        <p className="mt-6">
          <Link href="/explorar" className="text-sm font-medium underline underline-offset-4">
            Voltar para explorar
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
