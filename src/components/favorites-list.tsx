"use client";

import Link from "next/link";
import type { CatalogItem } from "@/domain/types";
import { favoriteId, useFavorites } from "@/lib/favorites-store";
import { CatalogCard } from "./catalog-card";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function FavoritesList({ items }: { items: CatalogItem[] }) {
  const favorites = useFavorites();
  const saved = items.filter((i) => favorites.includes(favoriteId(i.kind, i.slug)));

  if (saved.length === 0) {
    return (
      <div
        className="border-ink/30 mt-10 rounded-[var(--radius-card)] border border-dashed p-10 text-center"
        data-testid="favorites-empty"
      >
        <p className="text-lg font-semibold">Você ainda não salvou nada</p>
        <p className="text-ink-soft mx-auto mt-2 max-w-md text-sm">
          Use o botão de coração nos cards para guardar destinos e oportunidades.
        </p>
        <Link href="/explorar" className={cn(buttonVariants({ variant: "accent" }), "mt-6")}>
          Explorar destinos
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="favorites-list">
      {saved.map((item) => (
        <li key={`${item.kind}-${item.slug}`} className="flex">
          <CatalogCard item={item} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
