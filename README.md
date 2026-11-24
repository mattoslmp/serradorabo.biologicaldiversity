# Serra do Rabo · Biological Diversity

[Abrir o Atlas](https://mattoslmp.github.io/serradorabo.biologicaldiversity/)

Atlas interativo de comunidades vegetais ITS, em React e Next.js. Publicado no GitHub Pages da conta mattoslmp. Instituto Tecnológico Vale · Leandro de Mattos Pereira, PhD.

## Manual científico e publicação — versão de 24/11/2026

O **[README científico canônico](https://github.com/mattoslmp/ITV-rel1-2026/blob/main/README.md)** no repositório privado contém todas as etapas para reproduzir no Ubuntu/WSL (instalação, entradas PIMBA, metadados finais, R/Python, MAFFT/trimAl/FastTree, relatório, artigo, suplementos e validação). Inclui também os comandos para publicar a entrega no Supabase privado e verificar os hashes remotos. O acesso ao repositório científico exige autorização.

| Objetivo | Roteiro |
| --- | --- |
| Reproduzir localmente a edição sazonal | Rota A do README científico: scripts/reproduzir_sazonal.sh |
| Recalcular desde PIMBA | Rota B: executar_itv.sh, R e filogenias |
| Visualizar os novos resultados antes de publicar | Rota C: Atlas_ITV_Publicacao.html, servidor local ligado apenas a 127.0.0.1 |
| Atualizar os resultados remotos | Rota D: scripts/publicar_online.sh e publication/verify_online_release.py no repositório científico |
| Alterar o site sem recalcular a ciência | Rota E e instruções abaixo |

A interface lê a release científica ativa (ponteiro privado current.json); a atualização de código **não** muda essa release. O build do site não publica figuras ou matrizes nem habilita acesso anônimo. A versão HTML local da entrega científica é diferente do frontend Next.js conectado ao Supabase.

## 1. Obter e preparar a interface em Ubuntu/WSL

Requisitos: Git, GitHub CLI (para publicar), Python 3 para o servidor de testes e Node.js 22 com npm. Utilize Ubuntu 24.04 ou equivalente. Se não tiver Node 22, obtenha-o pela [distribuição oficial](https://nodejs.org/en/download) ou via Conda (conda create -n serra-web -c conda-forge nodejs=22; conda activate serra-web). Não instale a chave administrativa no frontend.

```bash
sudo apt update
sudo apt install -y git gh python3
node --version
npm --version

WEB="$HOME/serradorabo.biologicaldiversity"
if [ -d "$WEB/.git" ]; then
  git -C "$WEB" status --short
  git -C "$WEB" pull --ff-only
elif [ ! -e "$WEB" ]; then
  git clone https://github.com/mattoslmp/serradorabo.biologicaldiversity.git "$WEB"
else
  printf 'Pasta existente sem .git: escolha outro WEB.\n'
fi
cd "$WEB"
git rev-parse HEAD
npm ci
node scripts/fetch-basemap.mjs
```

Preserve alterações locais antes de atualizar a branch. Use npm ci (lockfile versionado), não troque versões arbitrariamente.

## 2. Executar e revisar localmente

```bash
cd "$WEB"
npm run dev -- --hostname 127.0.0.1
```

Abra http://127.0.0.1:3000/ no navegador, com uma conta habilitada do Atlas. Pare com Ctrl+C. O servidor consulta o Supabase configurado em lib/project.json; não lê uma pasta de resultados local nem requer chave service_role. Para visualizar novos dados ainda não publicados, use o Atlas HTML da rota C no README científico; nunca copie dados científicos para public/ ou server-data/.

## 3. Testes antes de publicar

```bash
cd "$WEB"
node scripts/test-map-geometry.mjs
node scripts/test-taxon-cutoff.mjs
node scripts/test-recovery-link.mjs
node scripts/test-presence.mjs
node scripts/test-atlas-review.mjs
node scripts/fetch-basemap.mjs
NEXT_PUBLIC_BASE_PATH=/serradorabo.biologicaldiversity npm run build
node scripts/check-static.mjs

npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install --with-deps chromium
NEXT_PUBLIC_BASE_PATH=/serradorabo.biologicaldiversity node scripts/test-public-shell.mjs
```

O build exporta out/. A base /serradorabo.biologicaldiversity é necessária para reproduzir o caminho do GitHub Pages. O último teste serve a exportação local em 127.0.0.1, verifica redirecionamento de login, mapa e isolamento dos arquivos científicos; não valida cada página autenticada. Revise essas páginas com a sua conta. Para testar um build estático local sem o prefixo do Pages, execute NEXT_PUBLIC_BASE_PATH= npm run build, depois python3 -m http.server 3000 --bind 127.0.0.1 --directory out.

## 4. Publicar somente a interface

Autentique o GitHub CLI na conta com permissão de escrita; siga os desafios do próprio GitHub. Revise os arquivos alterados, nunca envie out/, node_modules/, .env, arquivos científicos ou chaves. Exemplo com branch e PR (substitua os caminhos de git add pelos arquivos realmente editados):

```bash
gh auth status --hostname github.com || gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
cd "$WEB"
git switch -c revisao-atlas-local
# Edite e execute os testes da seção 3.
git add app/Atlas.js app/Evidence.js
git diff --cached
git commit -m "Atualizar visualizacoes do Atlas"
git push -u origin revisao-atlas-local
gh pr create --base main --head revisao-atlas-local --fill
```

Revise e faça o merge do PR de acordo com as permissões. O workflow .github/workflows/pages.yml publica main automaticamente. Para republicar a mesma revisão sem mudanças:

```bash
gh workflow run pages.yml --repo mattoslmp/serradorabo.biologicaldiversity --ref main
gh run list --repo mattoslmp/serradorabo.biologicaldiversity --workflow pages.yml --limit 5
```

Identifique o run correspondente e use gh run watch ID_DO_RUN --repo mattoslmp/serradorabo.biologicaldiversity --exit-status, substituindo ID_DO_RUN pelo identificador mostrado. Confirme build e deploy com sucesso e abra o Atlas. A base pública é obtida de actions/configure-pages. Não há Vercel ou Cloudflare no deploy. Não é necessário reexecutar R, Python ou publicar dados no Supabase para alterar a interface.

## 5. Publicar também novos resultados científicos

No clone **privado** e com o ambiente científico preparado, siga o README canônico (rotas A/B e D). Os comandos de referência são:

```bash
cd "$CODE"
# CODE: clone privado do pipeline; FINAL: pasta da entrega científica VALIDADA.
export PYTHONPATH="$CODE/publication"
python -m itv_publication --validate "$FINAL"
(cd "$FINAL" && sha256sum -c SHA256SUMS.txt)
bash scripts/publicar_online.sh --preflight
bash scripts/publicar_online.sh "$FINAL"
```

A primeira configuração administrativa usa scripts/configurar_publicacao_online.sh no clone privado, com entrada oculta da credencial do Supabase e arquivo local protegido. O publicador gera uma release GitHub privada, envia os arquivos navegáveis em prefixo imutável no bucket privado, ativa current.json por último no upload e aciona o Pages. Não utilize scripts/import-results.mjs do repositório público como substituto do publicador canônico: este não contém as mesmas salvaguardas de proveniência e arquivamento. Não envie dados científicos ao GitHub Pages. A publicação sem senha é uma modalidade independente, sujeita a aprovação explícita.

Confirme a release ativa e os SHA-256 dos arquivos com publication/verify_online_release.py, conforme a rota D. Um deploy Pages aprovado sozinho não é confirmação de novos resultados. Se falhar o workflow científico privado antes das etapas, o cálculo e a publicação podem ser feitos no computador pelo procedimento autorizado do README privado; não afrouxe permissões para contornar falhas.

## 6. Revisão científica da interface — 24/11/2026

Os painéis apresentam descrição, interpretação, método, entradas, dados processados, outputs e links para os scripts em app/Evidence.js. A diversidade alfa distingue não estimável de não significativo; a abundância diferencial explicita referência, grupo comparado e estação. As legendas ficam separadas das áreas de desenho. A filogenia permite consultar metadados e taxonomia das ASVs exibidas, quando a matriz faz parte da entrega autorizada. As interseções são exatas, e os registros bibliográficos de ocorrência não compõem a comparação ITS × inventário da Lume. WCVP v16 é uma referência nomenclatural. A revisão inclui testes em scripts/test-atlas-review.mjs.

Os PNG/PDF científicos estáticos só mudam após regenerar e ativar a entrega validada; as prévias interativas são geradas dos dados disponíveis na release ativa. Não confunda a publicação de uma nova interface com a regeneração das pranchas de publicação.

## 7. Privacidade e arquitetura

Este repositório contém apenas a interface e a malha municipal pública IBGE/Geodata BR. Dados, resultados, coordenadas amostrais, árvores e relatórios ficam no Supabase privado e no repositório científico privado. A chave publishable do Supabase é pública por definição e não autoriza acesso aos arquivos privados. As políticas RLS e Storage exigem usuário autenticado e habilitado em atlas_members; a publicação pública exige release explicitamente aprovada. Nunca versionar credenciais administrativas, arquivos .env ou dados científicos. Os testes de segurança não devem ser removidos para obter um build aprovado.

## Revisão presença/ausência e autores

A aba Presença e ausência deriva contagens binárias da entrega autenticada, com todos os táxons, sete níveis, filtros de metadados, agrupamento por campanha e exportação CSV. Não usa corte percentual ou Top N. Teste: `node scripts/test-presence.mjs`. Autores são persistidos em `atlas_editorial`; RLS exige membro ativo para leitura e `can_edit_authors` para edição. Nomes, afiliações e ordem são editáveis no admin. Layout e logo: `public/brand/SOURCE.md`. Referências metodológicas completas: `lib/methods.json`.

## Nota histórica — atualização de figuras locais em 06/11/2026

A interface reconhece os novos heatmaps de família **somente quando uma entrega R5 validada for enviada ao bucket privado**. A geração local (13 figuras principais + 2 extras de família) e a sincronização autenticada estão descritas no [guia completo de atualização](docs/ATUALIZACAO_R5_20261106.md). O envio ao GitHub não deve incluir dados científicos privados.

## Comparação florística por estação

A aba de inventário florístico apresenta os registros de campo e as atribuições do ITS por família, gênero e espécie. Os diagramas de Venn comparam os métodos dentro de cada estação e a seca e a chuva dentro de cada método. O painel de abundância distingue a proporção de leituras por unidade de solo, a contagem de indivíduos e a cobertura de herbáceas. As tabelas da entrega privada incluem esforço amostral, incidência, táxons compartilhados e a rastreabilidade dos registros datados.

O [repositório científico de mattoslmp](https://github.com/mattoslmp/ITV-rel1-2026) contém os insumos, as rotinas de análise e o README de reprodução local e publicação. As figuras e tabelas desta aba são carregadas do manifesto da entrega ativa após autenticação.

## Documentação de cada figura e tabela

A revisão usa app/Evidence.js e app/TableDocumentation.js para renderizar, imediatamente abaixo dos resultados, descrição, interpretação, significado das colunas, origem, método, entradas, dados intermediários, saída, links para os scripts e comandos reproduzíveis. O catálogo lib/tableDocumentation.mjs documenta as tabelas científicas por família e indica explicitamente qualquer coluna sem definição cadastrada, sem inventar significado. O inventário explica as duas tabelas, platôs versus geofácies, e a origem oficial da [WCVP v16](https://kew.iro.bl.uk/entities/product/998399a0-4b87-4a93-8303-6abc8a2de281), publicada em 04/06/2026 pelo Royal Botanic Gardens, Kew. A interseção de um grupo sozinho indica exclusividade apenas em relação a outros grupos selecionados; quando existe um único grupo no recorte não há comparação. Teste adicional: `node scripts/test-table-documentation.mjs`.

### WCVP e seção Materiais e métodos

A WCVP v16 possui uma [página institucional específica de Kew](https://kew.iro.bl.uk/entities/product/998399a0-4b87-4a93-8303-6abc8a2de281) e uma [distribuição no GBIF em português](https://www.gbif.org/pt/dataset/f382f0ce-323a-4091-bb9f-add557f3a9a2); o DOI 10.34885/egs6-cp24 é mantido como identificador bibliográfico. [Kew/POWO](https://powo.science.kew.org/about-wcvp) permite consultar a nomenclatura. O Atlas documenta exemplos verificados (Camptosema ellipticum → Cerradicola elliptica; Ipomoea decora → Ipomoea goyazensis), preserva nomes originais sem resolução, e apresenta os links da tabela WCVP_v16.csv e dos scripts de exportação e harmonização. A aba **Materiais e métodos** reúne fichas de todas as figuras presentes no manifesto, análises interativas, fontes, métodos, input/output, scripts e comandos, com busca e expansão das fichas.
