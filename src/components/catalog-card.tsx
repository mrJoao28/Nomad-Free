import Link from "next/link";
import type { CatalogItem } from "@/domain/types";
import { CATEGORY_LABELS } from "@/domain/labels";
import { CatalogImage } from "./catalog-image";
import { FavoriteButton } from "./favorite-button";
import { Badge } from "./ui/badge";
import { DailyCost } from "./price";
import { cn } from "@/lib/utils";

export function CatalogCard({
  item,
  className,
  imageClassName,
  headingLevel = 3,
}: {
  item: CatalogItem;
  className?: string;
  imageClassName?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  return (
    <article
      className={cn(
        "group bg-paper relative flex flex-col overflow-hidden rounded-[var(--radius-card)]",
        className,
      )}
      data-testid="catalog-card"
      data-kind={item.kind}
    >
      <div className={cn("relative aspect-[4/3] overflow-hidden", imageClassName)}>
        <CatalogImage
          imageKey={item.imageKey}
          alt={`Ilustração de paisagem representando ${item.locationLabel}`}
          className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <Badge tone="dark">{item.kind === "destination" ? "Destino" : "Oportunidade"}</Badge>
          <FavoriteButton
            kind={item.kind}
            slug={item.slug}
            title={item.title}
            className="relative z-20"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Heading className="text-xl leading-tight font-bold tracking-tight">
            <Link
              href={item.href}
              className="after:absolute after:inset-0 after:z-10 after:content-['']"
            >
              {item.title}
            </Link>
          </Heading>
          <p className="text-ink-soft mt-1 text-sm">{item.locationLabel}</p>
        </div>
        <p className="text-ink-soft text-sm leading-relaxed">{item.summary}</p>
        <ul className="flex flex-wrap gap-1.5" aria-label="Categorias">
          {item.categories.map((c) => (
            <li key={c}>
              <Badge>{CATEGORY_LABELS[c]}</Badge>
            </li>
          ))}
        </ul>
        <DailyCost
          minor={item.dailyCostMinor}
          currency={item.currency}
          kind={item.priceKind}
          className="mt-auto pt-1 text-sm"
        />
      </div>
    </article>
  );
}
