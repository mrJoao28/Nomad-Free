"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="conteudo" role="alert" className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
      <h1 className="display text-[clamp(2.6rem,8vw,6rem)]">Algo deu errado</h1>
      <p className="text-ink-soft mt-6 max-w-md leading-relaxed">
        Não conseguimos carregar esta página, possivelmente porque o banco de dados está
        indisponível. Tente novamente em instantes. Se o problema continuar, confira se o PostgreSQL
        está rodando.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="accent" onClick={() => reset()}>
          Tentar novamente
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Ir para o início
        </Link>
      </div>
    </main>
  );
}
