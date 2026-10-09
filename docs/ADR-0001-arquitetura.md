# ADR-0001 — Decisões de arquitetura da fase inicial

Status: aceita · Contexto: fundação do NomadFree com dados de demonstração.

## Decisões

1. **Next.js App Router + Server Components por padrão.** Páginas que consultam o banco são dinâmicas
   (`force-dynamic`), assim o build não depende de um banco disponível. Client Components apenas para
   favoritos (localStorage) e o contador do cabeçalho.
2. **Domínio puro separado do acesso a dados.** `src/domain` (filtros, ordenação, dinheiro, validação) não
   conhece Prisma e é coberto por testes unitários; `src/data` traduz linhas do banco para `CatalogItem`.
3. **Filtragem em memória.** O catálogo é pequeno; carregar tudo e filtrar em TypeScript mantém a lógica
   testável e a mesma para qualquer fonte de dados. Quando o catálogo crescer, mover filtros para consultas
   SQL (índices já existem em região, categoria e custo) mantendo as funções de domínio como especificação.
4. **Dinheiro em centavos inteiros + moeda explícita + `priceKind`.** Evita erros de ponto flutuante e
   impede que estimativas sejam confundidas com preços verificados.
5. **Favoritos locais.** Sem autenticação nesta fase, `localStorage` via `useSyncExternalStore`. Sem modelo
   `Favorite` no banco para não sugerir sincronização inexistente.
6. **Prisma com `engineType = "client"` e `@prisma/adapter-pg`.** Dispensa o binário do query engine em
   tempo de execução. O CLI ainda baixa o schema-engine para `migrate`.
7. **Parâmetros de URL validados com Zod e tolerantes.** Valores inválidos são ignorados e sinalizados na
   UI, nunca causam erro 500.
8. **Primitivos de UI estilo shadcn escritos à mão** (cva + Radix Slot + tailwind-merge), sem o CLI do
   shadcn/ui, para manter o projeto reprodutível offline e com poucas dependências.
9. **Imagens SVG locais** geradas por script: sem imagens remotas quebradas e sem questões de licença.
10. **Pontos de extensão futuros** (reservas, pagamentos, APIs de viagem, afiliados) devem entrar atrás de
    interfaces de serviço em `src/server/` — nada disso existe nesta fase.
