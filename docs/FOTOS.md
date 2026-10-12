# Fotos e cores por lugar

O site usa a foto real quando existe `public/img/photos/<chave>.jpg` (a chave é o slug da estação) e,
sem foto, mostra uma silhueta de montanhas própria de cada estação. Nada quebra se faltar foto.

## Baixar as fotos (uma vez)

Rode dentro do contêiner (tem internet e Node 22; os arquivos aparecem na sua pasta):

```powershell
docker compose exec app node scripts/fetch-photos.mjs --dry   # só mostra o que seria escolhido
docker compose exec app node scripts/fetch-photos.mjs         # baixa as fotos que faltam
```

Depois abra `scripts/revisao-fotos.html` no navegador: ele mostra **todas as fotos de uma vez**, com
autor, licença e link, e lista as estações que ficaram sem foto.

### Como a foto de cada estação é escolhida

Não há busca por texto (foi o que trouxe fotos erradas). O script usa:

1. a imagem principal do artigo da estação na Wikipédia (campo `wiki` em `scripts/photo-sources.json`);
2. se ela não servir, as outras imagens do mesmo artigo;
3. se faltar, as fotos da categoria do Commons (campo opcional `commonsCategory`).

Cada candidata precisa estar no Wikimedia Commons com licença livre (CC BY, CC BY-SA, CC0 ou domínio
público), ser JPEG em paisagem e ter pelo menos 1600 px de largura (prefere 2400 px ou mais). Mapas de
pistas, logos, bandeiras e aeronaves são descartados, e **a mesma foto nunca é usada em duas estações**.
Se nada servir, a estação fica sem foto (e aparece no relatório) em vez de receber uma foto errada.

### Trocar ou completar uma foto

1. No Wikimedia Commons, ache uma foto boa daquele lugar e copie o título (ex.: `File:Exemplo.jpg`).
2. Cole em `"file"` na estação, em `scripts/photo-sources.json`.
3. Rode `docker compose exec app node scripts/fetch-photos.mjs --only=zermatt --force`.

Se o título do artigo em `"wiki"` estiver errado (relatório diz "nenhuma imagem encontrada"), corrija-o.
Outras opções: `--only=chave1,chave2`, `--force`, `--report`.

Respeite as licenças: CC BY e CC BY-SA exigem atribuição (o rodapé do site mostra os créditos).

## Cores de cada lugar

Cada país tem uma paleta (fundo de "noite na montanha" e dois destaques inspirados na paisagem e na
cultura local) em `src/domain/palettes.ts`, aplicada em toda a página da estação. Países sem paleta usam
a da região. O teste `tests/unit/palettes.test.ts` garante contraste legível e que todo país do seed
tenha paleta.
