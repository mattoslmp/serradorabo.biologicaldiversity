# R5 — publicação das figuras locais no Atlas (06/11/2026)

O **GitHub Pages** hospeda apenas o frontend. O **Supabase Storage privado** mantém as figuras, CSVs, mapa e resultados por release autenticada. **Não publique** a pasta científica `dados/`, `inputs/`, sequências, arquivos RDS, credenciais nem o `ITV_ENTREGA_FINAL/` no GitHub público.

## Etapa 1 · baixar o código científico corrigido

Use o ZIP `ITV_CODIGO_COMPLETO_R5_CORRIGIDO_20261106.zip` fornecido na conversa do ChatGPT, extraia em sua pasta local `ITS_Analises_Plantas`. O código científico e os dados PIMBA são mantidos **fora** deste repositório público.

```bash
cd /mnt/c/Users/Microsoft/Desktop/Serra_do_rabo_ITS/ITS_Analises_Plantas/ITV-R5-20261105
conda activate itv-publicacao
python -m pip install -r publication/requirements.txt
export ITV_PYTHON="$(command -v python)"
export ITV_RSCRIPT="$(command -v Rscript)"
bash executar_itv.sh --check-only
bash executar_itv.sh --threads 4 --taxon-cutoff 1 --taxon-cutoff-basis max
```

Quando a execução terminar com sucesso, anote o valor de `RESULTADOS_FINAIS=` exibido no terminal. A pasta validada tem `manifest.json`, `atlas_data.json`, `figures/`, `atlas_heatmaps/`, `tables/` e `SHA256SUMS.txt`.

## Etapa 2 · clonar o frontend com HTTPS

```bash
cd ~
git clone https://github.com/mattoslmp/serradorabo.biologicaldiversity.git
cd serradorabo.biologicaldiversity
npm ci
```

Na branch `main`, o GitHub Actions publica a interface. Alterações apenas nos resultados **não requerem** `git push`.

## Etapa 3 · atualizar os arquivos no Supabase privado

Copie do ZIP científico apenas o importador atualizado (ou utilize o arquivo `scripts/import-results.mjs` do repositório se já estiver na versão R5 corrigida):

```bash
cp /CAMINHO/ITV-R5-20261105/publication/nextjs/scripts/import-results.mjs scripts/import-results.mjs
export ITV_ENTREGA="/CAMINHO/ITV_ENTREGA_FINAL"
node scripts/import-results.mjs "$ITV_ENTREGA" --dry-run
```

Quando o teste emitir `DRY_RUN_OK`, defina a URL, capture a credencial privada **sem escrevê-la em comandos ou arquivos versionados** e execute:

```bash
export SUPABASE_URL="https://dgxrsvfpaenuxiuttkea.supabase.co"
read -r -s -p "Supabase service-role: " SUPABASE_SERVICE_ROLE_KEY
printf '\n'
export SUPABASE_SERVICE_ROLE_KEY
export ATLAS_RELEASE="r5-20261106-local-01"
node scripts/import-results.mjs "$ITV_ENTREGA"
unset SUPABASE_SERVICE_ROLE_KEY
```

Para uma segunda execução, use release novo (ex.: `r5-20261106-local-02`). A versão anterior permanece ativa se o upload falhar. `current.json` só é atualizado após conferir todos os uploads.

## Etapa 4 · atualizar a interface pelo GitHub

O frontend atualizado para reconhecer `manifest.atlas_heatmaps` está em `app/Atlas.js`. Para mudanças adicionais aprovadas no código público:

```bash
git pull --ff-only origin main
npm run build
git status
git add app README.md docs scripts
git commit -m "Atualiza interface do Atlas ITV"
git push origin main
```

Não execute um commit vazio; se `git status` estiver limpo, não é necessário `git push`.

## Etapa 5 · verificar

- Workflow de publicação: https://github.com/mattoslmp/serradorabo.biologicaldiversity/actions
- Atlas: https://mattoslmp.github.io/serradorabo.biologicaldiversity/login/
- Confirme após autenticação as 13 figuras e dois heatmaps extras (família/abundância e família/presença-ausência).
- Confirme o mesmo release em `serradorabo-private/current.json`.

**Observação:** a interface é independente da execução R/Python. Atualizar a página no GitHub não altera automaticamente as figuras privadas.