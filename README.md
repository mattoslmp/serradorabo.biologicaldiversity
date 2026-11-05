# Serra do Rabo · Biological Diversity

[Abrir o atlas](https://mattoslmp.github.io/serradorabo.biologicaldiversity/)

Atlas interativo de comunidades vegetais ITS, em React e Next.js. Publicado no GitHub Pages da conta **mattoslmp**. Instituto Tecnológico Vale · Leandro de Mattos Pereira, PhD.

Este repositório contém a interface e a malha municipal pública IBGE/Geodata BR. Dados, coordenadas amostrais, resultados, figuras e árvores são recuperados do armazenamento privado do Supabase após autenticação e verificação de associação. Nenhuma senha ou chave administrativa é necessária para compilar ou publicar a interface.

O atlas oferece mapa, taxonomia, heatmaps, diversidade alfa e beta, abundância diferencial, filogenia, interseções, literatura e downloads. A entrega científica ativa é identificada pelo manifesto privado `current.json`.

## Desenvolvimento

```sh
npm ci
node scripts/fetch-basemap.mjs
NEXT_PUBLIC_BASE_PATH=/serradorabo.biologicaldiversity npm run build
```

O workflow `.github/workflows/pages.yml` publica automaticamente a `main`. O caminho é obtido de `actions/configure-pages`, e os testes conferem login, rotas, JavaScript e geografia sob esse caminho. Não há Cloudflare ou Vercel na publicação.

As credenciais publishable do Supabase são públicas por definição e não autorizam acesso aos dados privados. As políticas RLS e de Storage exigem um usuário autenticado e habilitado em `atlas_members`. Não adicionar dados científicos, senhas, JWTs administrativos, arquivos `.env` ou chaves `service_role` ao repositório.

O pipeline científico e suas entregas anteriores permanecem preservados separadamente. Esta publicação reutiliza o mesmo backend e os mesmos resultados R4 validados.
