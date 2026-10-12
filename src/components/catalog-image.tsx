import Image from "next/image";
import { RIDGE_HEIGHT, RIDGE_WIDTH, ridgePath } from "@/lib/ridge";
import { cn } from "@/lib/utils";

/**
 * Mostra a foto real (`photoSrc`, resolvida no servidor). Sem foto, desenha uma silhueta de
 * montanhas única por estação, nas cores do lugar. Não acessa o disco: pode ser usado em
 * componentes de cliente.
 * - `subject`: lugar retratado (ex.: "Zermatt, Suíça"); gera o texto alternativo da foto.
 * - `alt`: usado quando não há `subject` (ex.: imagens decorativas).
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
  if (photoSrc) {
    return (
      <Image
        src={photoSrc}
        alt={subject ? `Foto de ${subject}` : (alt ?? "")}
        width={1920}
        height={1200}
        sizes={sizes}
        priority={priority}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-accent2) 22%, var(--color-stone)) 0%, var(--color-stone) 85%)",
      }}
      role={subject ? "img" : undefined}
      aria-label={subject ? `Ilustração de montanhas representando ${subject}` : undefined}
      aria-hidden={subject ? undefined : true}
    >
      <svg
        viewBox={`0 0 ${RIDGE_WIDTH} ${RIDGE_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d={ridgePath(imageKey, 0)}
          fill="color-mix(in srgb, var(--color-fjord) 22%, var(--color-stone))"
        />
        <path
          d={ridgePath(imageKey, 1)}
          fill="color-mix(in srgb, var(--color-fjord) 12%, var(--color-stone))"
        />
        <path d={ridgePath(imageKey, 2)} fill="var(--color-paper)" />
      </svg>
    </div>
  );
}
