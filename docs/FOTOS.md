# Fotos e cores por lugar

O site usa foto real quando existe `public/img/photos/<chave>.jpg` e, sem foto, a ilustração SVG
(`public/img/<chave>.svg`). Nada quebra se faltar foto.

## Baixar fotos livres automaticamente (Wikimedia Commons)

```powershell
node scripts/fetch-photos.mjs --list     # só mostra as melhores candidatas de cada lugar
node scripts/fetch-photos.mjs            # baixa a melhor foto de cada chave
```

- Escolhe sozinho, entre "Featured pictures" e "Quality images", fotos em paisagem e alta resolução
  com licença livre (CC BY, CC BY-SA, CC0, domínio público). Ignora mapas, bandeiras e logos.
- Grava autor, licença e link em `public/img/photos/credits.json`; o rodapé mostra os créditos.
- Chaves: `hero-home` (fundo da página inicial) e os nove destinos, em `scripts/photo-sources.json`.
- Não gostou de uma foto? Procure outra no Commons, copie o título (ex.: `File:Exemplo.jpg`),
  cole em `"file"` na chave e rode: `node scripts/fetch-photos.mjs --only=cusco-peru --force`.
- Outras opções: `--only=chave1,chave2`, `--force` (baixar de novo).

Respeite as licenças: CC BY e CC BY-SA exigem atribuição (o rodapé cuida disso).
As oportunidades (`op-*`) usam a foto do destino onde acontecem.

## Cores de cada lugar

Cada destino tem uma paleta (fundo, superfícies, linhas e dois destaques) em
`src/domain/palettes.ts`, aplicada em toda a página do destino e das suas oportunidades.
Para mudar as cores de um lugar, edite os valores dele; o teste `tests/unit/palettes.test.ts`
garante contraste legível. Destino novo sem paleta usa a paleta padrão (verde-água).
