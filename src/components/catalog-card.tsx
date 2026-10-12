import Link from "next/link";
import type { ResortItem } from "@/domain/types";
import { SIZE_LABELS, TAG_LABELS, formatElevation } from "@/domain/labels";
import { CatalogImage } from "./catalog-image";
import { FavoriteButton } from "./favorite-button";
import { Badge } from "./ui/badge";
import { DailyCost } from "./price";
import { cn } from "@/lib/utils";

/** Card vertical com foto em destaque, nome sobre a imagem e os números principais abaixo. */
export function ResortCard({
  item,
  className,
  imageClassName,
  headingLevel = 3,
}: {
  item: ResortItem;
  className?: string;
  imageClassName?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  return (
    <article
      className={cn(
        "group bg-paper border-line hover:border-fjord relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border transition-colors",
        className,
      )}
      data-testid="resort-card"
    >
      <div className={cn("relative aspect-[4/5] overflow-hidden", imageClassName)}>
        <CatalogImage
          imageKey={item.imageKey}
          photoSrc={item.photoSrc}
          subject={item.locationLabel}
          className="transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <Badge tone="dark">{item.country}</Badge>
          <FavoriteButton slug={item.slug} title={item.name} className="relative z-20" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <Heading className="display-caps text-[1.65rem] leading-[0.95] font-bold">
            <Link
              href={item.href}
              className="after:absolute after:inset-0 after:z-10 after:content-['']"
            >
              {item.name}
            </Link>
          </Heading>
          <p className="mt-2 text-sm text-white/80">{item.mountainRange}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <dl className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <dt className="text-ink-soft">Altitude máx.</dt>
            <dd className="mt-1 text-sm font-semibold" data-testid="card-elevation">
              {formatElevation(item.topElevationM)}
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Tamanho</dt>
            <dd className="mt-1 text-sm font-semibold">{SIZE_LABELS[item.sizeRank]}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Temporada</dt>
            <dd className="mt-1 text-sm font-semibold">{item.seasonLabel}</dd>
          </div>
        </dl>
        <ul className="flex flex-wrap gap-1.5" aria-label="Perfis">
          {item.tags.slice(0, 3).map((t) => (
            <li key={t}>
              <Badge>{TAG_LABELS[t]}</Badge>
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
