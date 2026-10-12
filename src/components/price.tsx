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
      <span className="text-ink-soft">
        {" "}
        por pessoa/dia · {PRICE_KIND_LABELS[kind].toLowerCase()}
      </span>
    </p>
  );
}

export function DemoNotice({ className }: { className?: string }) {
  return (
    <p className={className} data-testid="demo-notice">
      Dados de demonstração: altitudes, áreas, temporadas e custos são aproximados e ilustrativos,
      não foram verificados em tempo real e não representam preços ou condições reais. Confirme
      sempre no site oficial da estação.
    </p>
  );
}
