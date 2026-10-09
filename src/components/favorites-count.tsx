"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites-store";

export function FavoritesLink({ className }: { className?: string }) {
  const favorites = useFavorites();
  return (
    <Link href="/favoritos" className={className} data-testid="favorites-link">
      Favoritos
      <span
        aria-label={`${favorites.length} itens salvos`}
        className="bg-ink text-paper ml-2 inline-flex min-w-6 justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold"
        data-testid="favorites-count"
      >
        {favorites.length}
      </span>
    </Link>
  );
}
