import { Button } from "./ui/button";
import { Field, Select, TextInput } from "./ui/field";
import { CATEGORIES, REGIONS } from "@/domain/types";
import { CATEGORY_LABELS, CATEGORY_SLUGS, REGION_LABELS, REGION_SLUGS } from "@/domain/labels";
import { MAX_BUDGET_REAIS } from "@/domain/search-params";
import { cn } from "@/lib/utils";

export interface SearchFormValues {
  q?: string;
  categoria?: string;
  regiao?: string;
  orcamento?: string;
  ordem?: string;
}

/**
 * Formulário GET simples (funciona sem JavaScript): envia os filtros como
 * query params para /explorar.
 */
export function SearchForm({
  values = {},
  showSort = false,
  idPrefix = "busca",
  className,
}: {
  values?: SearchFormValues;
  showSort?: boolean;
  idPrefix?: string;
  className?: string;
}) {
  const id = (name: string) => `${idPrefix}-${name}`;
  return (
    <form
      action="/explorar"
      method="get"
      role="search"
      aria-label="Buscar destinos e oportunidades"
      className={cn(
        "bg-paper grid gap-4 rounded-[var(--radius-card)] p-5 shadow-[0_18px_40px_-24px_rgba(31,35,38,0.45)] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] lg:items-end",
        className,
      )}
    >
      <Field label="Destino ou palavra-chave" htmlFor={id("q")}>
        <TextInput
          id={id("q")}
          name="q"
          type="search"
          maxLength={80}
          defaultValue={values.q}
          placeholder="Ex.: Medellín, café, horta"
        />
      </Field>
      <Field label="Categoria" htmlFor={id("categoria")}>
        <Select id={id("categoria")} name="categoria" defaultValue={values.categoria ?? ""}>
          <option value="">Todas</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={CATEGORY_SLUGS[c]}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Região" htmlFor={id("regiao")}>
        <Select id={id("regiao")} name="regiao" defaultValue={values.regiao ?? ""}>
          <option value="">Todas</option>
          {REGIONS.map((r) => (
            <option key={r} value={REGION_SLUGS[r]}>
              {REGION_LABELS[r]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Orçamento diário máx. (R$)" htmlFor={id("orcamento")}>
        <TextInput
          id={id("orcamento")}
          name="orcamento"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_BUDGET_REAIS}
          step={10}
          defaultValue={values.orcamento}
          placeholder="Ex.: 250"
        />
      </Field>
      {showSort ? (
        <Field label="Ordenar por" htmlFor={id("ordem")}>
          <Select id={id("ordem")} name="ordem" defaultValue={values.ordem ?? "relevancia"}>
            <option value="relevancia">Relevância</option>
            <option value="menor-custo">Menor custo diário</option>
            <option value="maior-custo">Maior custo diário</option>
            <option value="melhor-trabalho-remoto">Melhor nota para trabalho remoto</option>
          </Select>
        </Field>
      ) : null}
      <Button type="submit" variant="accent" className="sm:col-span-2 lg:col-span-1">
        Buscar
      </Button>
    </form>
  );
}
