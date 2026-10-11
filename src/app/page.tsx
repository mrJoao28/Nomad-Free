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
import { findPhoto } from "@/lib/photos";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await listCatalogItems();
  const destinations = items.filter((i) => i.kind === "destination");
  const featured = searchCatalog(destinations, {}, "melhor-trabalho-remoto").slice(0, 4);
  const cheapest = searchCatalog(destinations, {}, "menor-custo").slice(0, 4);
  const opportunities = searchCatalog(
    items.filter((i) => i.kind === "opportunity"),
    {},
    "menor-custo",
  ).slice(0, 4);

  return (
    <>
      <Hero photoSrc={findPhoto("hero-home")} featured={featured} />
      <main id="conteudo">
        <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
          <SearchForm idPrefix="home" />
        </div>

        <section aria-labelledby="destinos-title" className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2
              id="destinos-title"
              className="display display-caps max-w-2xl text-[clamp(2.4rem,6vw,5rem)]"
            >
              Escolha o lugar
            </h2>
            <p className="text-ink-soft max-w-sm text-sm leading-relaxed">
              Os destinos com menor custo diário estimado. Os valores são estimativas de
              demonstração, não preços verificados.
            </p>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cheapest.map((item) => (
              <li key={item.slug} className="flex">
                <CatalogCard item={item} className="w-full" />
              </li>
            ))}
          </ul>
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
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.6fr]">
            <div>
              <h2
                id="oportunidades-title"
                className="display display-caps text-[clamp(2.2rem,5vw,4.2rem)]"
              >
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
            <ul className="grid gap-6 sm:grid-cols-2">
              {opportunities.map((item) => (
                <li key={item.slug} className="flex">
                  <CatalogCard item={item} className="w-full" imageClassName="aspect-[4/3]" />
                </li>
              ))}
            </ul>
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
