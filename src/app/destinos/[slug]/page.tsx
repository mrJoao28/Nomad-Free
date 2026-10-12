import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeScope } from "@/components/theme-scope";
import { CatalogImage } from "@/components/catalog-image";
import { ResortCard } from "@/components/catalog-card";
import { FavoriteButton } from "@/components/favorite-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DemoNotice } from "@/components/price";
import { getResortBySlug, listRelatedResorts } from "@/data/catalog-repository";
import {
  PRICE_KIND_LABELS,
  REGION_LABELS,
  SIZE_LABELS,
  TAG_LABELS,
  formatElevation,
} from "@/domain/labels";
import { estimateTripBudget, formatMoney } from "@/domain/money";
import { findPhoto } from "@/lib/photos";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const load = cache(getResortBySlug);
type Props = { params: Promise<{ slug: string }> };

const SECTIONS = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "orcamento", label: "Orçamento" },
  { id: "mais", label: "Mais estações" },
] as const;

const eyebrow = "text-fjord text-xs font-semibold tracking-[0.25em] uppercase";
const sectionTitle = "display display-caps mt-3 text-[clamp(2rem,4.5vw,3.75rem)]";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) return { title: "Estação não encontrada" };
  return {
    title: `${r.name}, ${r.country}`,
    description: r.summary,
    openGraph: {
      title: `${r.name}, ${r.country} · NomadFree`,
      description: r.summary,
      type: "article",
    },
  };
}

export default async function ResortPage({ params }: Props) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) notFound();
  const related = await listRelatedResorts(r.slug, r.country, r.region, 3);
  const stays = [3, 7, 14].map((days) => estimateTripBudget(r.dailyBudgetMinor, days, r.currency));
  const subject = `${r.name}, ${r.country}`;

  return (
    <ThemeScope place={{ country: r.country, region: r.region }}>
      <section
        aria-label={`Apresentação de ${r.name}`}
        className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden text-white"
      >
        <div className="absolute inset-0 -z-10">
          <CatalogImage
            imageKey={r.imageKey}
            photoSrc={findPhoto(r.imageKey)}
            subject={subject}
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-black/10" />
          <div className="via-stone/20 to-stone absolute inset-0 bg-gradient-to-b from-black/45" />
        </div>

        <SiteHeader />

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pt-10 pb-10 sm:px-8">
          <div className="flex items-end justify-between gap-8">
            <div className="max-w-3xl">
              <p className="hero-rise text-xs tracking-[0.25em] text-white/80 uppercase">
                {r.country} · {REGION_LABELS[r.region]}
              </p>
              <h1
                className="display display-caps hero-rise mt-4 text-[clamp(3.2rem,11vw,10rem)] [text-shadow:0_2px_40px_rgba(0,0,0,0.4)]"
                style={{ animationDelay: "100ms" }}
              >
                {r.name}
              </h1>
              <p
                className="hero-rise mt-6 max-w-md text-sm leading-relaxed text-white/85"
                style={{ animationDelay: "200ms" }}
              >
                {r.summary}
              </p>
              <div
                className="hero-rise mt-7 flex items-center gap-3"
                style={{ animationDelay: "300ms" }}
              >
                <a
                  href="#orcamento"
                  className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
                >
                  Ver orçamento
                </a>
                <FavoriteButton slug={r.slug} title={r.name} />
              </div>
            </div>

            <nav aria-label="Seções da página" className="hidden lg:block">
              <ol className="space-y-3 text-right">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group inline-flex items-center gap-3 text-xs tracking-[0.2em] text-white/70 uppercase hover:text-white"
                    >
                      <span className="opacity-0 transition-opacity group-hover:opacity-100">
                        {s.label}
                      </span>
                      <span className="font-semibold">{String(i + 1).padStart(2, "0")}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="mt-10 flex gap-2" aria-hidden="true">
            <span className="bg-fjord h-0.5 flex-[1.4]" />
            <span className="h-0.5 flex-1 bg-white/25" />
            <span className="h-0.5 flex-1 bg-white/25" />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <a href="#visao-geral" className="group block">
              <p className="text-[0.7rem] tracking-[0.2em] text-white/60 uppercase">
                Altitude máxima
              </p>
              <p className="mt-2 text-lg font-semibold">▲ {formatElevation(r.topElevationM)}</p>
              <span className="text-fjord mt-3 inline-block text-sm group-hover:underline">
                Ver detalhes →
              </span>
            </a>
            <a href="#visao-geral" className="group block">
              <p className="text-[0.7rem] tracking-[0.2em] text-white/60 uppercase">Temporada</p>
              <p className="mt-2 text-lg font-semibold">{r.seasonLabel}</p>
              <span className="text-fjord mt-3 inline-block text-sm group-hover:underline">
                Ver detalhes →
              </span>
            </a>
            <a href="#orcamento" className="group block">
              <p className="text-[0.7rem] tracking-[0.2em] text-white/60 uppercase">
                Custo por dia
              </p>
              <p className="mt-2 text-lg font-semibold">
                {formatMoney(r.dailyBudgetMinor, r.currency)}
              </p>
              <span className="text-fjord mt-3 inline-block text-sm group-hover:underline">
                Ver orçamento →
              </span>
            </a>
          </div>
        </div>
      </section>

      <main id="conteudo" className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 pt-20 lg:grid-cols-[1.4fr_1fr]">
          <section id="visao-geral" aria-labelledby="visao-title" className="scroll-mt-8">
            <p className={eyebrow}>01</p>
            <h2 id="visao-title" className={sectionTitle}>
              Visão geral
            </h2>
            <p className="text-ink-soft mt-6 max-w-prose leading-relaxed">{r.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Perfis">
              {r.tags.map((t) => (
                <li key={t}>
                  <Badge>{TAG_LABELS[t]}</Badge>
                </li>
              ))}
            </ul>
            <dl className="border-line mt-10 grid gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-2">
              <div>
                <dt className="text-ink-soft text-sm">Altitude máxima (aprox.)</dt>
                <dd className="mt-1 text-2xl font-bold" data-testid="top-elevation">
                  {formatElevation(r.topElevationM)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-soft text-sm">Área esquiável</dt>
                <dd className="mt-1 text-lg font-semibold">{r.areaLabel}</dd>
                <dd className="text-ink-soft text-sm">Tamanho: {SIZE_LABELS[r.sizeRank]}</dd>
              </div>
              <div>
                <dt className="text-ink-soft text-sm">Temporada típica</dt>
                <dd className="mt-1 text-lg font-semibold">{r.seasonLabel}</dd>
              </div>
              <div>
                <dt className="text-ink-soft text-sm">Cadeia de montanhas</dt>
                <dd className="mt-1 text-lg font-semibold">{r.mountainRange}</dd>
              </div>
            </dl>
          </section>

          <aside
            id="orcamento"
            className="bg-paper border-line h-fit scroll-mt-8 rounded-[var(--radius-card)] border p-6"
            aria-labelledby="orcamento-title"
          >
            <p className={eyebrow}>02</p>
            <h2 id="orcamento-title" className="mt-2 text-xl font-bold">
              Orçamento estimado
            </h2>
            <p className="mt-3 text-3xl font-bold" data-testid="daily-budget">
              {formatMoney(r.dailyBudgetMinor, r.currency)}
              <span className="text-ink-soft text-base font-medium"> por pessoa/dia</span>
            </p>
            <Badge tone="warn" className="mt-3">
              {PRICE_KIND_LABELS[r.priceKind]}
            </Badge>
            <p className="text-ink-soft mt-3 text-xs leading-relaxed">
              Inclui lift pass, hospedagem e refeições, em estimativa por faixa de preço e país.
              Fonte: {r.sourceLabel}.
            </p>
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
            <Link
              href={`/comparar?d=${r.slug}`}
              className={cn(buttonVariants({ variant: "outline" }), "mt-5 w-full")}
            >
              Comparar com outras estações
            </Link>
          </aside>
        </div>

        <section id="mais" aria-labelledby="mais-title" className="mt-20 scroll-mt-8">
          <p className={eyebrow}>03</p>
          <h2 id="mais-title" className={sectionTitle}>
            Mais estações perto do estilo
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((o) => (
              <li key={o.slug} className="flex">
                <ResortCard item={o} className="w-full" />
              </li>
            ))}
          </ul>
        </section>

        <DemoNotice className="text-ink-soft mt-16 max-w-3xl text-sm leading-relaxed" />
        <p className="mt-6">
          <Link
            href="/explorar"
            className="hover:text-fjord text-sm font-medium underline underline-offset-4"
          >
            Voltar para explorar
          </Link>
        </p>
      </main>
      <SiteFooter />
    </ThemeScope>
  );
}
