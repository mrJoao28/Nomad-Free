"use client";

import { favoriteId, toggleFavorite, useFavorites } from "@/lib/favorites-store";
import type { ItemKind } from "@/domain/types";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  kind,
  slug,
  title,
  className,
}: {
  kind: ItemKind;
  slug: string;
  title: string;
  className?: string;
}) {
  const favorites = useFavorites();
  const id = favoriteId(kind, slug);
  const active = favorites.includes(id);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id)}
      aria-pressed={active}
      aria-label={active ? `Remover ${title} dos favoritos` : `Salvar ${title} nos favoritos`}
      data-testid="favorite-button"
      className={cn(
        "bg-paper/90 text-ink inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition-colors hover:bg-white",
        active && "bg-fjord hover:bg-fjord-deep text-white",
        className,
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.7 4.5c2 0 3.7 1.1 5.3 3 1.6-1.9 3.3-3 5.3-3 3.7 0 5.8 3.7 4.3 7.2C19.500 16.400 12 21 12 21z" />
      </svg>
    </button>
  );
}
