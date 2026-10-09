import Link from "next/link";
import { Hero } from "@/components/hero";
import { SearchForm } from "@/components/search-form";
import { CatalogCard } from "@/components/catalog-card";
import { SiteFooter } from "@/components/site-footer";
import { DemoNotice } from "@/components/price";
import { buttonVariants } from "@/components/ui/button";
import { listCatalogItems } from "@/data/catalog-repository";
import { searchCatalog } from "@/domain/catalog";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/domain/labels";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await listCatalogItems();
  const destinations = searchCatalog(
    items.filter((i) => i.kind === "destination" && (i.remoteWorkScore ?? 0) >= 4),
    {},
    "relevancia",
  ).slice(0, 4);
  const opportunities = searchCatalog(
    items.filter((i) => i.kind === "opportunity"),
    {},
    "menor-custo",
  ).slice(0, 4);
  const [lead, ...rest] = destinations;

  return (
    <>
      <Hero />
      <main id="conteudo">
        <div className="relative z-20 mx-auto -mt-16 max-w-6xl px-5 sm:px-8">
          <SearchForm idPrefix="home" />
        </div>

        <section aria-labelledby="destinos-title" className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="destinos-title" className="display max-w-2xl text-[clamp(2.6rem,6vw,5.5rem)]">
              Escolha o lugar
            </h2>
            <p className="text-ink-soft max-w-sm text-sm leading-relaxed">
              Destinos com boa nota ilustrativa para trabalho remoto. Os custos são estimativas de
              demonstração, não preços verificados.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
            {lead ? (
              <CatalogCard
                item={lead}
                headingLevel={3}
                className="lg:row-span-1"
                imageClassName="aspect-[5/4] lg:aspect-[4/4]"
              />
            ) : null}
            <div className="grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-1 xl:grid-cols-2">
              {rest.map((item) => (
                <CatalogCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/explorar?categoria=destino-economico"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Ver todos os destinos econômicos
            </Link>
          </div>
        </section>

        <section
          aria-labelledby="oportunidades-title"
          className="mx-auto mt-28 max-w-7xl px-5 sm:px-8"
        >
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.6fr]">
            <div>
              <h2 id="oportunidades-title" className="display text-[clamp(2.4rem,5vw,4.5rem)]">
                Hospedagem em troca de trabalho
              </h2>
              <p className="text-ink-soft mt-5 max-w-md text-sm leading-relaxed">
                Trocas e voluntariados podem pedir horas semanais, taxas de programa ou outros
                custos, e não estão disponíveis para todos. Os exemplos abaixo são fictícios e
                servem para demonstrar a interface.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {(["ACCOMMODATION_EXCHANGE", "VOLUNTEERING"] as const).map((c) => (
                  <li key={c}>
                    <Link
                      href={`/explorar?categoria=${CATEGORY_SLUGS[c]}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      {CATEGORY_LABELS[c]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {opportunities.map((item) => (
                <CatalogCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
          <DemoNotice className="max-w-3xl rounded-xl border border-[#d9bf86] bg-[#f3e4c3] p-4 text-sm leading-relaxed text-[#5c3f0e]" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
