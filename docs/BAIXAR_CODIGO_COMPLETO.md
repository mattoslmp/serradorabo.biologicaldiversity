# Serra do Rabo — Código científico e site na conta mattoslmp

O código está dividido de propósito para preservar os resultados científicos privados:

- **Frontend publicado (público):** [mattoslmp/serradorabo.biologicaldiversity](https://github.com/mattoslmp/serradorabo.biologicaldiversity) — Next.js, login, recuperação e administração.
- **Pipeline científico (privado):** [mattoslmp/ITV-rel1-2026](https://github.com/mattoslmp/ITV-rel1-2026) — R/Python, figuras 1–13, árvores MAFFT/trimAl/FastTree, testes, metadados, scripts e documentação.

O segundo repositório é privado, e seu endereço só funciona no navegador com uma conta GitHub autorizada.

## Links de download duráveis

- [Código científico: Download ZIP](https://github.com/mattoslmp/ITV-rel1-2026/archive/refs/heads/main.zip) (precisa estar autenticado no GitHub e ter acesso).
- [Interface web: Download ZIP](https://github.com/mattoslmp/serradorabo.biologicaldiversity/archive/refs/heads/main.zip) (público).

**Download ZIP é um snapshot do código**, não é o resultado da execução científica. Os dados PIMBA originais não são distribuídos nesses repositórios.

## Clonar ambos pelo Ubuntu/WSL

```bash
mkdir -p "$HOME/serra-rabo-codigo"
cd "$HOME/serra-rabo-codigo"

git clone https://github.com/mattoslmp/ITV-rel1-2026.git scientific
git clone https://github.com/mattoslmp/serradorabo.biologicaldiversity.git frontend

# Só para conferir o código versionado:
(cd scientific && git log -1 --oneline)
(cd frontend && git log -1 --oneline)
```

Se a clonagem do repositório privado falhar por autorização, autentique-se no GitHub com `mattoslmp` (ou conta com permissão de leitura) e não compartilhe tokens em conversas ou logs.

## Executar a análise local

Consulte o [guia científico atualizado](https://github.com/mattoslmp/ITV-rel1-2026/blob/main/documentacao/GUIA_R5_REGENERACAO_20261117.md). Os arquivos PIMBA necessários devem estar em `01_DADOS_PIMBA/` no seu diretório de projeto local.

```bash
cd "$HOME/serra-rabo-codigo/scientific"
conda activate itv-publicacao
export ITV_PYTHON="$(command -v python)"
export ITV_RSCRIPT="$(command -v Rscript)"
P="/mnt/c/Users/Microsoft/Desktop/Serra_do_rabo_ITS/ITS_Analises_Plantas"

bash executar_itv.sh "$P" --check-only --threads 4 --taxon-cutoff 1 --taxon-cutoff-basis max
bash executar_itv.sh "$P" --threads 4 --dpi 300 --taxon-cutoff 1 --taxon-cutoff-basis max --no-literature
```

A revisão gráfica corrigiu o espaçamento entre o título do eixo X e as legendas taxonômicas, e separou a legenda da filogenia dos painéis retangular/circular. As figuras existentes no Supabase privado não são substituídas apenas com a alteração do Git; requerem uma nova execução local validada e publicação autenticada.

## Segurança

O acesso público ao atlas continua desativado até aprovação e publicação de um conjunto de dados sanitizado. Não envie o ZIP científico nem suas entradas PIMBA ao repositório público.

## Publicação automática dos resultados científicos

A versão de 17/11/2026 do executor privado em `mattoslmp/ITV-rel1-2026` publica automaticamente após uma execução **real e validada**: a entrega científica completa vai para uma GitHub Release **privada**, os arquivos do atlas vão para o Supabase privado e o workflow GitHub Pages da interface é republicado e conferido. Não se enviam dados científicos privados a este repositório público.

Guia: [Publicação automática R5](https://github.com/mattoslmp/ITV-rel1-2026/blob/main/documentacao/PUBLICACAO_AUTOMATICA_R5_20261117.md) (exige acesso ao repositório privado). Uma instalação local pode optar por `--offline-only`, sem upload. A recuperação do atlas online não depende de executar programas no computador do visitante.

A versão científica remota só muda depois de nova análise validada e importada. O simples commit no GitHub não regenerará as figuras a partir de dados PIMBA que existem apenas no computador local.
