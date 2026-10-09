import { CatalogImage } from "./catalog-image";
import { SiteHeader } from "./site-header";

/** Hero dividido: painel esquerdo desfocado com o título atravessando para o painel nítido. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-[96rem] px-3 pt-3 sm:px-5">
      <div className="on-dark bg-ink relative overflow-hidden rounded-[1.75rem] text-white">
        <div className="absolute inset-0 grid md:grid-cols-2" aria-hidden="false">
          <div className="relative hidden overflow-hidden md:block">
            <CatalogImage
              imageKey="hero-montanha"
              alt=""
              priority
              sizes="50vw"
              className="scale-125 blur-2xl"
            />
            <div className="bg-ink/35 absolute inset-0" />
          </div>
          <div className="relative">
            <CatalogImage
              imageKey="hero-fiorde"
              alt="Ilustração de montanhas e mar ao entardecer"
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <div className="from-ink/55 to-ink/25 absolute inset-0 bg-gradient-to-t via-transparent md:bg-none" />
          </div>
        </div>
        <div className="bg-ink/40 absolute inset-0 md:hidden" />

        <div className="relative z-10 flex min-h-[34rem] flex-col md:min-h-[42rem]">
          <SiteHeader tone="dark" />
          <div className="flex flex-1 flex-col justify-end px-5 pb-28 sm:px-10 md:pb-32">
            <p className="hero-rise mb-5 max-w-sm text-sm leading-relaxed text-white/90 md:max-w-xs">
              Destinos mais acessíveis, trocas de hospedagem por trabalho e lugares bons para
              trabalhar à distância. Conteúdo de demonstração.
            </p>
            <h1
              id="hero-title"
              className="display hero-rise text-[clamp(3rem,10.5vw,9.5rem)] [text-shadow:0_2px_30px_rgba(0,0,0,0.25)]"
              style={{ animationDelay: "120ms" }}
            >
              Viaje leve,
              <br />
              trabalhe de
              <br />
              qualquer lugar.
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
