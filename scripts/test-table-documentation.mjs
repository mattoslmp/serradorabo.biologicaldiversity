import assert from 'node:assert/strict';import {tableKind,tableDoc,columnDefinition,TABLE_FIELDS,WCVP,REPRO} from '../lib/tableDocumentation.mjs';
const examples={'concordancia_por_escala.csv':'florSummary','taxons_filtrados.csv':'florTaxa','intersecoes_exatas.csv':'intersections','Interseccoes_Species__Sample_Area__Seca.csv':'intersections','alfa_testes.csv':'alpha','beta_testes.csv':'beta','diferencial_Family_DESeq2.csv':'differential','filogenia_metadados_taxonomia.csv':'phylogeny','metadados_filtrados.csv':'metadata','literatura_serra_do_rabo_ITS.csv':'localLiterature','registros_literatura_local.csv':'localLiterature','literatura_comparacao.csv':'literature','literatura_fontes.csv':'literature','Taxonomia_Family_New_Field_ID_EXIBIDA.csv':'taxonomy','Heatmap_Family_Presenca_Ausencia.csv':'heatmap','Presenca_Ausencia_Species_COMPLETA.csv':'presence','WCVP_v16.csv':'wcvp','Seasonal_taxa.csv':'seasonal'};
for(const [file,kind] of Object.entries(examples)){assert.equal(tableKind(file),kind);const d=tableDoc(file);assert.ok(d.desc&&d.meaning&&d.method&&d.input.length&&d.scripts.length);}
assert.match(columnDefinition('literatura_comparacao.csv','Study_Detected'),/nosso ITS/);
assert.match(columnDefinition('alfa_testes.csv','Family'),/não é família botânica/);
assert.match(columnDefinition('taxons_filtrados.csv','Unidades_ITS'),/pelo menos uma/);
assert.match(columnDefinition('Presenca_Ausencia_Species_COMPLETA.csv','unit-01'),/1 detectado/);
assert.match(columnDefinition('Taxonomia_Family_New_Field_ID_EXIBIDA.csv','Example taxon'),/percentual/);
assert.match(tableDoc('intersecoes_exatas.csv').meaning,/não é possível avaliar exclusividade/);
assert.match(WCVP,/kew\.iro\.bl\.uk/);assert.match(REPRO,/reproduzir_sazonal/);
assert.equal(tableDoc('unverified.csv').kind,null);assert.match(columnDefinition('unverified.csv','unknown'),/não documentada/);
for(const col of ['Tratamento','Escala','Grupo','Nivel','ITS','Campo','Comuns','So_ITS','So_campo','Uniao','Jaccard','Sorensen','Unidades_ITS','Taxon','Evidencia','Leituras_ITS','ASVs_ITS','Registros_campo','Grupos','Numero_grupos','N','Interpretacao','Grupos_sem_deteccao','Taxa','Rank','View','Group','Season','Study_Reads','Study_Detected','Literature_Confirmed','Literature_Evidence'])assert.ok(TABLE_FIELDS[col],col);
console.log('Table documentation schema verified');
