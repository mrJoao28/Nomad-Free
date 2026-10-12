import Link from "next/link";
import { FavoritesLink } from "./favorites-count";
import { cn } from "@/lib/utils";

const links = [
  { href: "/explorar", label: "Explorar" },
  { href: "/comparar", label: "Comparar" },
  { href: "/explorar?regiao=alpes", label: "Alpes" },
  { href: "/explorar?regiao=america-do-norte", label: "América do Norte" },
  { href: "/explorar?regiao=america-do-sul", label: "Andes" },
];

const linkClass =
  "rounded-md px-2 py-1 text-[0.72rem] font-semibold tracking-[0.18em] uppercase underline-offset-8 hover:text-fjord hover:underline";

/** Cabeçalho transparente: fica sobre o hero das páginas de foto e sobre o fundo escuro nas demais. */
export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={cn("text-ink relative z-30", className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link
          href="/"
          className="display-caps text-lg font-bold tracking-[0.22em]"
          aria-label="NomadFree — página inicial"
        >
          Nomad<span className="text-fjord">Free</span>
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
          <FavoritesLink className={linkClass} />
        </nav>
        <details className="relative md:hidden">
          <summary className="border-ink/40 flex h-10 cursor-pointer list-none items-center rounded-lg border px-3 text-xs font-semibold tracking-[0.18em] uppercase backdrop-blur">
            Menu
          </summary>
          <nav
            aria-label="Principal (mobile)"
            className="bg-paper text-ink border-line absolute right-0 z-50 mt-2 flex w-64 flex-col gap-1 rounded-xl border p-3 shadow-xl"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:bg-ink/10 rounded-md px-3 py-2.5 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
            <FavoritesLink className="hover:bg-ink/10 rounded-md px-3 py-2.5 text-sm font-medium" />
          </nav>
        </details>
      </div>
    </header>
  );
}
