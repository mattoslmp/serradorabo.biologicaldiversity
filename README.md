# Serra do Rabo · Biological Diversity

[Abrir o atlas](https://mattoslmp.github.io/serradorabo.biologicaldiversity/)

Atlas interativo de comunidades vegetais ITS, em React e Next.js. Publicado no GitHub Pages da conta **mattoslmp**. Instituto Tecnológico Vale · Leandro de Mattos Pereira, PhD.

## Manual científico integral — R5

O **README canônico do pipeline R5** foi revisado em 19/11/2026, no repositório científico privado [mattoslmp/ITV-rel1-2026/README.md](https://github.com/mattoslmp/ITV-rel1-2026/blob/main/README.md). Ele documenta **cada etapa (input → métodos → outputs → figuras)**, ambiente Ubuntu/WSL, linguagens e bibliotecas, **as 13 figuras com eixos, símbolos e legendas**, estatística, filogenia MAFFT/trimAl/FastTree e referências bibliográficas.

**Execução local atual:** `bash executar_itv.sh "$P" --threads 4 --dpi 300 --taxon-cutoff 1 --taxon-cutoff-basis max --install-r --publish-online`, após instalar/configurar e passar `bash scripts/publicar_online.sh --preflight`. **Publicação privada é padrão**, e `--offline-only` é opção. O repositório científico exige autorização GitHub; não inclua dados sensíveis aqui.

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

O pipeline científico e suas entregas anteriores permanecem preservados separadamente. A interface lê o ponteiro privado `current.json` do Supabase e pode exibir releases R4/R5 conforme a última **publicação científica efetivamente validada e ativada**; a atualização de código e README, isoladamente, não altera a release remota.


## Revisão presença/ausência e autores

A aba Presença e ausência deriva contagens binárias da entrega autenticada, com todos os táxons, sete níveis, filtros de metadados, agrupamento por campanha e exportação CSV. Não usa corte percentual ou Top N. Teste: `node scripts/test-presence.mjs`. Autores são persistidos em `atlas_editorial`; RLS exige membro ativo para leitura e `can_edit_authors` para edição. Nomes, afiliações e ordem são editáveis no admin. Layout e logo: `public/brand/SOURCE.md`. Referências metodológicas completas: `lib/methods.json`.

## Atualização de figuras locais — 06/11/2026

A interface reconhece os novos heatmaps de família **somente quando uma entrega R5 validada for enviada ao bucket privado**. A geração local (13 figuras principais + 2 extras de família) e a sincronização autenticada estão descritas no [guia completo de atualização](docs/ATUALIZACAO_R5_20261106.md). O envio ao GitHub não deve incluir dados científicos privados.

## Comparação florística por estação

A aba de inventário florístico apresenta os registros de campo e as atribuições do ITS por família, gênero e espécie. Os diagramas de Venn comparam os métodos dentro de cada estação e a seca e a chuva dentro de cada método. O painel de abundância distingue a proporção de leituras por unidade de solo, a contagem de indivíduos e a cobertura de herbáceas. As tabelas da entrega privada incluem esforço amostral, incidência, táxons compartilhados e a rastreabilidade dos registros datados.

O [repositório científico de mattoslmp](https://github.com/mattoslmp/ITV-rel1-2026) contém os insumos, as rotinas de análise e o README de reprodução local e publicação. As figuras e tabelas desta aba são carregadas do manifesto da entrega ativa após autenticação.
