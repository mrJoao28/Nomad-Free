import Image from "next/image";
import { cn } from "@/lib/utils";

/** Imagens são ilustrações locais geradas (public/img); o alt descreve a cena, não é texto essencial. */
export function CatalogImage({
  imageKey,
  alt,
  className,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: {
  imageKey: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={`/img/${imageKey}.svg`}
      alt={alt}
      width={1600}
      height={1000}
      sizes={sizes}
      priority={priority}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
