import { formatMoney } from "@/domain/money";
import { PRICE_KIND_LABELS } from "@/domain/labels";
import type { PriceKind } from "@/domain/types";

export function DailyCost({
  minor,
  currency,
  kind,
  className,
}: {
  minor: number;
  currency: string;
  kind: PriceKind;
  className?: string;
}) {
  return (
    <p className={className}>
      <span className="font-semibold">{formatMoney(minor, currency)}</span>
      <span className="text-ink-soft"> por dia · {PRICE_KIND_LABELS[kind].toLowerCase()}</span>
    </p>
  );
}

export function DemoNotice({ className }: { className?: string }) {
  return (
    <p className={className} data-testid="demo-notice">
      Dados de demonstração: valores, notas e condições são ilustrativos, não foram verificados e
      não representam preços ou disponibilidade reais. Confirme sempre com a fonte oficial.
    </p>
  );
}
