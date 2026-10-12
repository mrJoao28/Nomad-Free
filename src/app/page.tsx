import Link from "next/link";
import { Hero } from "@/components/hero";
import { SearchForm } from "@/components/search-form";
import { ResortCard } from "@/components/catalog-card";
import { SiteFooter } from "@/components/site-footer";
import { DemoNotice } from "@/components/price";
import { buttonVariants } from "@/components/ui/button";
import { listResorts } from "@/data/catalog-repository";
import { searchResorts } from "@/domain/catalog";
import { REGION_LABELS, REGION_SLUGS, TAG_LABELS, TAG_SLUGS } from "@/domain/labels";
import { REGIONS, TAGS } from "@/domain/types";
import { findPhoto } from "@/lib/photos";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await listResorts();
  const featured = items.slice(0, 4);
  const highlights = items.slice(4, 12);
  const southern = searchResorts(items, { region: "SOUTH_AMERICA" }, "maior-area").slice(0, 4);
  const countries = new Set(items.map((i) => i.country)).size;
  const counts = new Map(REGIONS.map((r) => [r, items.filter((i) => i.region === r).length]));

  return (
    <>
      <Hero photoSrc={findPhoto("hero-home")} featured={featured} total={items.length} />
      <main id="conteudo">
        <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
          <SearchForm idPrefix="home" />
        </div>

        <section
          aria-label="Números do guia"
          className="mx-auto mt-14 grid max-w-7xl grid-cols-2 gap-6 px-5 sm:px-8 md:grid-cols-4"
        >
          {[
            [String(items.length), "estações de esqui"],
            [String(countries), "países"],
            [String(REGIONS.length), "regiões"],
            ["2", "hemisférios, com esqui o ano todo"],
          ].map(([value, label]) => (
            <div key={label} className="border-line border-t pt-4">
              <p className="display text-5xl">{value}</p>
              <p className="text-ink-soft mt-2 text-sm">{label}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="regioes-title" className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
          <h2 id="regioes-title" className="display display-caps text-[clamp(2.2rem,5vw,4.2rem)]">
            Escolha a região
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((r) => (
              <li key={r}>
                <Link
                  href={`/explorar?regiao=${REGION_SLUGS[r]}`}
                  className="group border-line hover:border-fjord bg-paper flex h-full items-end justify-between gap-4 rounded-[var(--radius-card)] border p-6 transition-colors"
                >
                  <span>
                    <span className="display-caps block text-2xl font-bold">
                      {REGION_LABELS[r]}
                    </span>
                    <span className="text-ink-soft mt-2 block text-sm">
                      {counts.get(r)} estações
                    </span>
                  </span>
                  <span className="text-fjord text-2xl transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="destaques-title" className="mx-auto mt-28 max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2
              id="destaques-title"
              className="display display-caps max-w-2xl text-[clamp(2.4rem,6vw,5rem)]"
            >
              Estações em destaque
            </h2>
            <p className="text-ink-soft max-w-sm text-sm leading-relaxed">
              Seleção curada de estações muito procuradas. A ordem é uma curadoria do NomadFree, não
              um ranking medido.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <li key={item.slug} className="flex">
                <ResortCard item={item} className="w-full" />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link href="/explorar" className={cn(buttonVariants({ variant: "outline" }))}>
              Ver as {items.length} estações
            </Link>
          </div>
        </section>

        <section aria-labelledby="perfil-title" className="mx-auto mt-28 max-w-7xl px-5 sm:px-8">
          <h2 id="perfil-title" className="display display-caps text-[clamp(2.2rem,5vw,4.2rem)]">
            Escolha o seu estilo
          </h2>
          <ul className="mt-10 flex flex-wrap gap-3">
            {TAGS.map((t) => (
              <li key={t}>
                <Link
                  href={`/explorar?perfil=${TAG_SLUGS[t]}`}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  {TAG_LABELS[t]}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sul-title" className="mx-auto mt-28 max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2
              id="sul-title"
              className="display display-caps max-w-2xl text-[clamp(2.2rem,5vw,4.2rem)]"
            >
              Esquiar de junho a outubro
            </h2>
            <p className="text-ink-soft max-w-sm text-sm leading-relaxed">
              No Hemisfério Sul a temporada é no nosso inverno. Estas estações dos Andes ficam nas
              montanhas de Chile e Argentina.
            </p>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {southern.map((item) => (
              <li key={item.slug} className="flex">
                <ResortCard item={item} className="w-full" />
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
          <DemoNotice className="max-w-3xl rounded-xl border border-[#d9bf86] bg-[#f3e4c3] p-4 text-sm leading-relaxed text-[#5c3f0e]" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
