import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Mostra a foto real (`photoSrc`, resolvido no servidor) ou, sem foto, a ilustração SVG local
 * (public/img/<imageKey>.svg). Não acessa o disco: pode ser usado em componentes de cliente.
 * - `subject`: lugar retratado (ex.: "Medellín, Colômbia"); gera o alt de foto ou de ilustração.
 * - `alt`: usado quando não há `subject` (ex.: imagens decorativas do hero).
 */
export function CatalogImage({
  imageKey,
  photoSrc,
  subject,
  alt,
  className,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: {
  imageKey: string;
  photoSrc?: string | null;
  subject?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const description = subject
    ? photoSrc
      ? `Foto de ${subject}`
      : `Ilustração de paisagem representando ${subject}`
    : (alt ?? "");

  return (
    <Image
      src={photoSrc ?? `/img/${imageKey}.svg`}
      alt={description}
      width={1600}
      height={1000}
      sizes={sizes}
      priority={priority}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
