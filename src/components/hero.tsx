import Link from "next/link";
import type { CatalogItem } from "@/domain/types";
import { formatMoney } from "@/domain/money";
import { cn } from "@/lib/utils";
import { CatalogImage } from "./catalog-image";
import { SiteHeader } from "./site-header";
import { buttonVariants } from "./ui/button";

/**
 * Hero em tela cheia: foto de paisagem ao fundo, título grande em caixa alta e uma fileira de
 * destinos em destaque sobre a imagem. Sem foto real, usa a ilustração local como fundo.
 */
export function Hero({
  photoSrc,
  featured,
}: {
  photoSrc?: string | null;
  featured: CatalogItem[];
}) {
  return (
    <section
      aria-labelledby="hero-title"
      className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden text-white"
    >
      <div className="absolute inset-0 -z-10">
        <CatalogImage
          imageKey="hero-fiorde"
          photoSrc={photoSrc}
          alt=""
          priority
          sizes="100vw"
          className="scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-black/10" />
        <div className="to-stone absolute inset-0 bg-gradient-to-b from-black/45 via-transparent" />
      </div>

      <SiteHeader />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end gap-10 px-5 pt-10 pb-12 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="hero-rise mb-5 max-w-sm text-sm leading-relaxed text-white/85">
            Destinos mais acessíveis, trocas de hospedagem por trabalho e lugares bons para
            trabalhar à distância. Conteúdo de demonstração.
          </p>
          <h1
            id="hero-title"
            className="display display-caps hero-rise text-[clamp(2.8rem,8.5vw,8rem)] [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]"
            style={{ animationDelay: "120ms" }}
          >
            Viaje leve,
            <br />
            trabalhe de
            <br />
            qualquer lugar.
          </h1>
          <div className="hero-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Link
              href="/explorar"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              Explorar destinos
            </Link>
            <Link
              href="/comparar"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/50 text-white hover:bg-white/10",
              )}
            >
              Comparar
            </Link>
          </div>
        </div>

        {featured.length > 0 ? (
          <ul
            aria-label="Destinos em destaque"
            className="hero-rise -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0 lg:pb-0"
            style={{ animationDelay: "360ms" }}
          >
            {featured.map((item) => (
              <li key={item.slug} className="shrink-0 snap-start">
                <Link
                  href={item.href}
                  data-testid="hero-card"
                  className="group relative block h-72 w-44 overflow-hidden rounded-2xl border border-white/20 xl:h-80 xl:w-48"
                >
                  <CatalogImage
                    imageKey={item.imageKey}
                    photoSrc={item.photoSrc}
                    subject={item.locationLabel}
                    sizes="200px"
                    className="transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span className="display-caps block text-xl font-bold">{item.title}</span>
                    <span className="mt-1 block text-xs text-white/80">
                      {formatMoney(item.dailyCostMinor, item.currency)} / dia
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
