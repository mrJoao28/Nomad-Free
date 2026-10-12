import { Button } from "./ui/button";
import { Field, Select, TextInput } from "./ui/field";
import { REGIONS, TAGS } from "@/domain/types";
import { REGION_LABELS, REGION_SLUGS, TAG_LABELS, TAG_SLUGS } from "@/domain/labels";
import { MAX_BUDGET_REAIS } from "@/domain/search-params";
import { cn } from "@/lib/utils";

export interface SearchFormValues {
  q?: string;
  perfil?: string;
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
      aria-label="Buscar estações de esqui"
      className={cn(
        "bg-paper border-line grid gap-4 rounded-[var(--radius-card)] border p-5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] lg:items-end",
        className,
      )}
    >
      <Field label="Estação, país ou região" htmlFor={id("q")}>
        <TextInput
          id={id("q")}
          name="q"
          type="search"
          maxLength={80}
          defaultValue={values.q}
          placeholder="Ex.: Zermatt, Japão, Dolomitas"
        />
      </Field>
      <Field label="Perfil" htmlFor={id("perfil")}>
        <Select id={id("perfil")} name="perfil" defaultValue={values.perfil ?? ""}>
          <option value="">Todos</option>
          {TAGS.map((t) => (
            <option key={t} value={TAG_SLUGS[t]}>
              {TAG_LABELS[t]}
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
          step={50}
          defaultValue={values.orcamento}
          placeholder="Ex.: 1500"
        />
      </Field>
      {showSort ? (
        <Field label="Ordenar por" htmlFor={id("ordem")}>
          <Select id={id("ordem")} name="ordem" defaultValue={values.ordem ?? "curadoria"}>
            <option value="curadoria">Curadoria NomadFree</option>
            <option value="menor-custo">Menor custo diário</option>
            <option value="maior-custo">Maior custo diário</option>
            <option value="maior-altitude">Maior altitude</option>
            <option value="maior-area">Maior área esquiável</option>
          </Select>
        </Field>
      ) : null}
      <Button type="submit" variant="accent" className="sm:col-span-2 lg:col-span-1">
        Buscar
      </Button>
    </form>
  );
}
