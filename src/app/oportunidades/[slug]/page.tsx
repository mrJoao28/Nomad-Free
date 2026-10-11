import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeScope } from "@/components/theme-scope";
import { CatalogImage } from "@/components/catalog-image";
import { CatalogCard } from "@/components/catalog-card";
import { FavoriteButton } from "@/components/favorite-button";
import { Badge } from "@/components/ui/badge";
import { DemoNotice } from "@/components/price";
import { getOpportunityBySlug, listRelatedOpportunities } from "@/data/catalog-repository";
import { CATEGORY_LABELS, PRICE_KIND_LABELS, REGION_LABELS } from "@/domain/labels";
import { formatMoney } from "@/domain/money";
import { findFirstPhoto } from "@/lib/photos";

export const dynamic = "force-dynamic";

const load = cache(getOpportunityBySlug);
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const o = await load(slug);
  if (!o) return { title: "Oportunidade não encontrada" };
  return {
    title: o.title,
    description: o.summary,
    openGraph: { title: `${o.title} · NomadFree`, description: o.summary, type: "article" },
  };
}

export default async function OpportunityPage({ params }: Props) {
  const { slug } = await params;
  const o = await load(slug);
  if (!o) notFound();
  const related = await listRelatedOpportunities(o.slug, o.destination.slug);
  const place = `${o.destination.name}, ${o.destination.country}`;

  return (
    <ThemeScope paletteKey={o.destination.slug}>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[1.75rem]">
          <div className="aspect-[16/9] max-h-[30rem] min-h-64 w-full">
            <CatalogImage
              imageKey={o.imageKey}
              photoSrc={findFirstPhoto(o.imageKey, o.destination.imageKey)}
              subject={place}
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute top-4 right-4">
            <FavoriteButton kind="opportunity" slug={o.slug} title={o.title} />
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-ink-soft text-sm">
              <Link
                href={`/destinos/${o.destination.slug}`}
                className="underline underline-offset-4"
              >
                {place}
              </Link>{" "}
              · {REGION_LABELS[o.destination.region]}
            </p>
            <h1 className="display display-caps mt-2 text-[clamp(2.4rem,6vw,5rem)]">{o.title}</h1>
            <p className="mt-5">
              <Badge>{CATEGORY_LABELS[o.category]}</Badge>
            </p>
            <h2 className="mt-10 text-xl font-bold">Sobre</h2>
            <p className="text-ink-soft mt-3 max-w-prose leading-relaxed">{o.summary}</p>
            <h2 className="mt-8 text-xl font-bold">Condições</h2>
            <p className="text-ink-soft mt-3 max-w-prose leading-relaxed">{o.conditions}</p>
            {o.hoursPerWeek ? (
              <p className="text-ink-soft mt-3 text-sm">
                Carga horária de exemplo: cerca de {o.hoursPerWeek} horas por semana.
              </p>
            ) : null}
          </div>

          <aside
            className="bg-paper border-line h-fit rounded-[var(--radius-card)] border p-6"
            aria-labelledby="custos-title"
          >
            <h2 id="custos-title" className="text-xl font-bold">
              Custos estimados
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-ink-soft">Custo diário para você</dt>
                <dd className="text-2xl font-bold" data-testid="daily-cost">
                  {formatMoney(o.dailyCostMinor, o.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-soft">Taxa única de programa</dt>
                <dd className="font-semibold">
                  {o.upfrontFeeMinor !== null
                    ? formatMoney(o.upfrontFeeMinor, o.currency)
                    : "Nenhuma no exemplo"}
                </dd>
              </div>
            </dl>
            <Badge tone="warn" className="mt-4">
              {PRICE_KIND_LABELS[o.priceKind]}
            </Badge>
            <p className="text-ink-soft mt-3 text-xs leading-relaxed">Fonte: {o.sourceLabel}.</p>
            {o.externalUrl ? (
              <p className="mt-5 text-sm">
                <a
                  href={o.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-semibold underline underline-offset-4"
                >
                  Abrir link de exemplo (demonstração)
                </a>
                <span className="text-ink-soft mt-1 block text-xs">
                  Link ilustrativo: não leva a uma oferta real.
                </span>
              </p>
            ) : null}
          </aside>
        </div>

        {related.length > 0 ? (
          <section aria-labelledby="relacionadas-title" className="mt-14">
            <h2 id="relacionadas-title" className="display text-[clamp(2rem,4vw,3.5rem)]">
              Mais em {o.destination.name}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug} className="flex">
                  <CatalogCard item={r} className="w-full" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <DemoNotice className="text-ink-soft mt-12 max-w-3xl text-sm leading-relaxed" />
      </main>
      <SiteFooter />
    </ThemeScope>
  );
}
