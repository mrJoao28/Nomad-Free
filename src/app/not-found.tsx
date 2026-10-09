import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <h1 className="display text-[clamp(3rem,9vw,7rem)]">Página não encontrada</h1>
        <p className="text-ink-soft mt-6 max-w-md leading-relaxed">
          O endereço pode ter mudado ou o destino não existe. Volte ao início ou explore os destinos
          disponíveis.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/explorar" className={cn(buttonVariants({ variant: "accent" }))}>
            Explorar destinos
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Ir para o início
          </Link>
        </div>
      </main>
    </>
  );
}
