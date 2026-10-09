import Link from "next/link";
import { FavoritesLink } from "./favorites-count";

const links = [
  { href: "/explorar", label: "Explorar" },
  { href: "/explorar?categoria=troca-hospedagem", label: "Trocas de hospedagem" },
  { href: "/explorar?categoria=voluntariado", label: "Voluntariado" },
];

const linkClass = "rounded-md px-2 py-1 text-sm font-medium hover:underline underline-offset-4";

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <header className={tone === "dark" ? "on-dark text-white" : "text-ink"}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link href="/" className="display text-2xl" aria-label="NomadFree — página inicial">
          NomadFree
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-3 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
          <FavoritesLink className={linkClass} />
        </nav>
        <details className="relative md:hidden">
          <summary className="flex h-10 cursor-pointer list-none items-center rounded-lg border border-current px-3 text-sm font-medium">
            Menu
          </summary>
          <nav
            aria-label="Principal (mobile)"
            className="bg-paper text-ink absolute right-0 z-50 mt-2 flex w-64 flex-col gap-1 rounded-xl p-3 shadow-xl"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:bg-ink/5 rounded-md px-3 py-2.5 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
            <FavoritesLink className="hover:bg-ink/5 rounded-md px-3 py-2.5 text-sm font-medium" />
          </nav>
        </details>
      </div>
    </header>
  );
}
