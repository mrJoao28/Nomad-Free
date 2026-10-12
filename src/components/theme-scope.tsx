import { paletteFor, paletteStyle } from "@/domain/palettes";
import type { Region } from "@/domain/types";
import { cn } from "@/lib/utils";

/** Aplica a paleta de um lugar (país/região) a tudo dentro dele: fundo, superfícies e destaques. */
export function ThemeScope({
  place,
  className,
  children,
}: {
  place?: { country?: string; region?: Region };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={paletteStyle(paletteFor(place)) as React.CSSProperties}
      className={cn("bg-stone text-ink min-h-dvh", className)}
      data-theme-country={place?.country}
    >
      {children}
    </div>
  );
}
