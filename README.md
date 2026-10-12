# NomadFree

Guia de **estações de esqui e resorts** do mundo (fase inicial): 100 estações muito procuradas, com
altitude, área esquiável, temporada, perfil e custo diário estimado. A ideia é expandir depois para
outras áreas.

> **Todo o conteúdo atual é de demonstração.** Altitudes, áreas e temporadas são valores aproximados,
> escritos sem verificação em tempo real; os custos são estimativas ilustrativas. A ordem das estações
> (`curatedRank`) é uma curadoria do projeto, **não** um ranking medido. Confirme tudo no site oficial
> de cada estação antes de planejar uma viagem.

## Funcionalidades atuais

- Landing page (`/`) com hero de montanha em tela cheia, busca, regiões, estações em destaque, perfis e
  uma seção do Hemisfério Sul (temporada de junho a outubro).
- Exploração (`/explorar`): busca por texto (sem diferenciar acentos), filtros por perfil (iniciantes,
  família, freeride, après-ski, luxo...), região e orçamento diário máximo; ordenação por curadoria,
  custo, altitude ou área esquiável. Os filtros vivem na URL
  (`?q=&perfil=&regiao=&orcamento=&ordem=`) e funcionam sem JavaScript (formulário GET).
- Página de cada estação (`/destinos/[slug]`): hero em tela cheia, números principais, visão geral,
  orçamento estimado (faixa para 3/7/14 dias) e estações parecidas. Cada país tem a sua paleta de cores
  (`src/domain/palettes.ts`).
- Comparador (`/comparar`): até 3 estações lado a lado, com custo total da viagem.
- Favoritos (`/favoritos`): **locais ao navegador** (`localStorage`). Não sincronizam entre dispositivos,
  não são enviados ao servidor e somem se os dados do navegador forem limpos.
- Página 404, página de erro, estados de carregamento e estado vazio; textos em português do Brasil.
- Acessibilidade: HTML semântico, link "Pular para o conteúdo", foco visível, rótulos de formulário,
  `alt` descritivo, suporte a `prefers-reduced-motion`.

## Limitações atuais

- Dados de demonstração; nenhuma integração com APIs externas, reservas, pagamentos, scraping ou afiliados.
- Sem autenticação e sem contas. Newsletter **não** implementada (o rodapé apenas informa isso).
- Fotos: baixadas do Wikimedia Commons (licenças livres) pelo script `scripts/fetch-photos.mjs`; sem foto, o
  site mostra uma silhueta de montanhas própria de cada estação. Veja `docs/FOTOS.md`.
- Filtros e ordenação rodam em memória sobre o catálogo carregado do banco (adequado para centenas de
  registros; ver `docs/ADR-0001-arquitetura.md`).
- O filtro de orçamento compara apenas valores em BRL; itens em outra moeda ficam fora quando o filtro está ativo.
- Fontes: pilha de fontes do sistema (sem download de fontes externas).

## Pré-requisitos

- Node.js 22+ e npm
- Docker e Docker Compose v2 (recomendado) **ou** um PostgreSQL 16 local

## Início rápido com Docker

```bash
cp .env.example .env          # edite POSTGRES_PASSWORD e DATABASE_URL/TEST_DATABASE_URL (use a mesma senha)
docker compose up --build     # sobe PostgreSQL (com healthcheck) e a aplicação
# em outro terminal, na primeira vez:
docker compose exec app npm run db:seed
```

A aplicação fica em <http://localhost:3000>. O serviço `app` só inicia depois que o PostgreSQL está saudável e
aplica as migrações automaticamente (`prisma migrate deploy`). O banco é exposto apenas em `127.0.0.1:5432`
(remova o bloco `ports` do serviço `db` se não precisar de acesso local).

| Ação                           | Comando                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| Subir em segundo plano         | `docker compose up -d --build`                                          |
| Ver logs                       | `docker compose logs -f app`                                            |
| Aplicar migrações              | `docker compose exec app npm run db:migrate`                            |
| Semear dados de demonstração   | `docker compose exec app npm run db:seed`                               |
| Parar                          | `docker compose down`                                                   |
| **Resetar tudo** (apaga dados) | `docker compose down -v && docker compose up --build`                   |
| Resetar só o schema            | `docker compose exec app npm run db:reset` (apaga e reaplica migrações) |

> A senha vai dentro da `DATABASE_URL`; evite caracteres especiais (`@ : / ?`) ou use URL-encoding.
> O banco de testes (`nomadfree_test`) é criado automaticamente na primeira inicialização do volume. Se o
> volume já existia: `docker compose exec db createdb -U nomadfree nomadfree_test`.

### Imagem de produção

O `Dockerfile` tem um estágio `runner` (multi-stage, usuário não-root, `output: standalone`, healthcheck):

```bash
docker build --target runner -t nomadfree:prod .
docker run --rm -p 3000:3000 -e DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/BANCO" nomadfree:prod
```

Aplique as migrações antes (`npx prisma migrate deploy` com `DATABASE_URL` apontando para o banco de produção).

## Desenvolvimento sem Docker para a aplicação

```bash
cp .env.example .env
docker compose up -d db       # apenas o banco
npm ci
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev                   # http://localhost:3000
```

## Variáveis de ambiente

Validadas com Zod em `src/lib/env.ts` (a aplicação falha com mensagem clara se estiverem inválidas).

| Variável                                                                                    | Obrigatória | Descrição                                                            |
| ------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------- |
| `DATABASE_URL`                                                                              | sim         | URL do PostgreSQL usada pela aplicação, migrações e seed.            |
| `TEST_DATABASE_URL`                                                                         | para testes | Banco **isolado** de testes; o nome precisa terminar em `_test`.     |
| `NEXT_PUBLIC_SITE_URL`                                                                      | não         | URL pública (metadados/Open Graph). Padrão: `http://localhost:3000`. |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_TEST_DB` / `DB_HOST_PORT` | Compose     | Configuração do contêiner PostgreSQL.                                |

`.env.example` contém apenas placeholders. **Nunca** faça commit de `.env`.

## Banco de dados

- Modelo: `Resort` (`prisma/schema.prisma`). Não há modelo `Favorite`, pois favoritos são locais.
- Dinheiro em **centavos (inteiros)** com código de moeda explícito (`currency`) e `priceKind`
  (`ESTIMATE` ou `VERIFIED` + `verifiedAt`). Todo o seed usa `ESTIMATE`.
- Migrações versionadas em `prisma/migrations`. Aplicar: `npm run db:migrate`. Criar nova (dev): `npm run db:migrate:dev`.
- Seed (`prisma/seed-data.ts`, `npm run db:seed`) é idempotente (upsert por slug) e marcado como demonstração.

## Testes

| Comando                                       | O que faz                                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `npm test`                                    | Unitários (Vitest): filtros, ordenação, slug, orçamento, parâmetros de URL, env.                               |
| `npm run test:integration`                    | Aplica migrações e roda consultas reais no **banco de teste** (`TEST_DATABASE_URL`).                           |
| `npm run test:e2e`                            | Migra e semeia o banco de teste e roda Playwright (desktop e mobile). Exige `npx playwright install chromium`. |
| `npm run lint` / `typecheck` / `format:check` | Qualidade estática.                                                                                            |

Os testes de integração e E2E **recusam rodar** se o banco não terminar em `_test`, protegendo dados de desenvolvimento.

## Estrutura

```
src/
  app/            rotas (App Router), layout, error/not-found, /api/health
  components/     UI (ui/ = primitivos estilo shadcn), cards, busca, favoritos
  domain/         tipos, rótulos, dinheiro, filtros/ordenação (puro, testável), validação Zod
  data/           acesso a dados (Prisma), apenas servidor
  server/         cliente Prisma (server-only)
  lib/            env, utilitários, store de favoritos (cliente)
prisma/           schema, migrações, seed
tests/            unit/ e integration/       e2e/  Playwright
docs/             decisão de arquitetura
```

## Solução de problemas

- **`Variáveis de ambiente inválidas`**: confira `DATABASE_URL` no `.env`.
- **Página de erro "Algo deu errado"**: o PostgreSQL provavelmente não está acessível (`docker compose ps`).
- **Porta 5432 ou 3000 em uso**: ajuste `DB_HOST_PORT` ou pare o serviço que a usa.
- **Dependências novas não aparecem no Docker**: `docker compose down -v && docker compose up --build`.
- **Banco de teste inexistente**: veja a observação acima sobre `createdb`.
- **Prisma sem acesso a `binaries.prisma.sh`**: o CLI precisa baixar o schema-engine para `migrate`/`generate`.
