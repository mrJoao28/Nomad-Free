import { paletteFor, paletteStyle } from "@/domain/palettes";
import { cn } from "@/lib/utils";

/** Aplica a paleta de um lugar (por slug) a tudo dentro dele: fundo, superfícies e destaques. */
export function ThemeScope({
  paletteKey,
  className,
  children,
}: {
  paletteKey?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={paletteStyle(paletteFor(paletteKey)) as React.CSSProperties}
      className={cn("bg-stone text-ink min-h-dvh", className)}
      data-theme-place={paletteKey}
    >
      {children}
    </div>
  );
}
