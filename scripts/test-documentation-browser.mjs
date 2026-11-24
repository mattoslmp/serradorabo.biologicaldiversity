// Synthetic browser fixture only; requests are intercepted locally. Never promotes a release.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdtemp,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,'');
const root=base?await mkdtemp(path.join(tmpdir(),'atlas-docs-')):path.resolve('out');
if(base)await symlink(path.resolve('out'),path.join(root,base.slice(1)),'dir');
const site='http://127.0.0.1:3102'+base+'/';
const release='public-test-documentation';
const server=spawn('python3',['-m','http.server','3102','--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
const names=['Example A','Example B','Example C'],units=['fixture-1','fixture-2'];
const metadata=[{New_Field_ID:units[0],Sample_ID:'fixture-lib-1',Sample_Area:'S01A',Geoambiente:'LAJ',Estacao:'Seca',Latitude:null,Longitude:null},{New_Field_ID:units[1],Sample_ID:'fixture-lib-2',Sample_Area:'S02B',Geoambiente:'FLO',Estacao:'Seca',Latitude:null,Longitude:null}];
const counts={taxa:names,units,counts:[[4,2,0],[0,3,8]]};
const ranks=['Kingdom','Phylum','Class','Order','Family','Genus','Species'];
const taxonomy=Object.fromEntries(ranks.map(r=>[r,counts]));
const summary={Escala:'Regional',Grupo:'Região teste',Nivel:'Espécie',ITS:3,Campo:2,Comuns:1,So_ITS:2,So_campo:1,Uniao:4,Jaccard:.25,Sorensen:.4,Unidades_ITS:2};
const taxon={Escala:'Regional',Grupo:'Região teste',Nivel:'Espécie',Taxon:'Example A',Evidencia:'Compartilhado',Unidades_ITS:1,Leituras_ITS:4,ASVs_ITS:1,Registros_campo:1};
const floristica={resumo:['Família','Gênero','Espécie'].flatMap((Nivel,i)=>['Original','WCVP v16'].map((Tratamento,j)=>{const Comuns=[2,4,6][i]+(j?[1,0,2][i]:0);return {...summary,Nivel,Tratamento,ITS:10,Campo:12,Comuns,So_ITS:10-Comuns,So_campo:12-Comuns,Uniao:22-Comuns,Jaccard:Comuns/(22-Comuns)};})),taxons:['Original','WCVP v16'].map(Tratamento=>({...taxon,Tratamento})),figuras:[14,15,16,17,18,19,20,21].map(i=>({id:'Figura'+i+'_fixture',title:'Prancha teste '+i,caption:'Legenda de teste, dados sintéticos.',files:{png:'floristica/test-'+i+'.png',pdf:'floristica/test-'+i+'.pdf',svg:'floristica/test-'+i+'.svg'}})),arquivos:['floristica/Concordancia_resumo.csv','floristica/Concordancia_taxons.csv','floristica/WCVP_v16.csv'],relatorio:'floristica/report.docx'};
const alpha=[{...metadata[0],Dataset:'Padronizada',Shannon:1,ASVs:2},{...metadata[1],Dataset:'Padronizada',Shannon:2,ASVs:2}];
const alphaTests=[{Dataset:'Padronizada',Metric:'Shannon',View:'Sample_Area',Category:'Pares',Season:'Seca',Comparison:'S01A vs S02B',Family:'Nao_parametrico',Status:'OK',Q_BH:.8,Symbol:'ns'}];
const betaTests=[{Contrast:'fixture',View:'Sample_Area',Season:'Seca',Test:'PERMANOVA',Status:'OK',N:2,P:.5,Q_BH:.7}];
const da=[{Rank:'Genus',Taxon:'Example A',Contrast:'Sample_Area_S01A_VS_S02B_Seca',Reference:'S01A',Comparison:'S02B',Method:'DESeq2',Effect:1,Q:.03,Significant:true}];
const tip_metadata={'fixture-asv':{ASV:'fixture-asv',Family:'Example A',Genus:'Example A',Season:'Seca',Sample_Area:'S01A',Geoambiente:'LAJ',Total_reads:4,N_New_Field_ID:1}};
const asv_taxonomy={'fixture-asv':{Family:'Example A',Genus:'Example A',Species:'Example A'}};
const figure={id:'Figura05_Rarefacao_Alfa',title:'Prancha alfa teste',caption:'Legenda da figura de teste',files:{png:'figures/test.png',pdf:'figures/test.pdf'},readme:'readmes/test.md'};
const palettes={Estacao:{Seca:'#a02b20',Chuvosa:'#116699',Ambas:'#443388'},Sample_Area:{S01A:'#aabbcc',S02B:'#ccaabb'},Geoambiente:{LAJ:'#225544',FLO:'#442255'},Family:Object.fromEntries(names.map((n,i)=>[n,['#226688','#883322','#337744'][i]])),Genus:Object.fromEntries(names.map(n=>[n,'#337744']))};
const data={manifest:{public_approved:true,public_release:release,version:'SYNTHETIC TEST',units:2,depth:2,figures:[figure],atlas_heatmaps:[],tables:[{name:'Alfa_testes.csv'}],floristica},metadata,all_libraries:metadata,libraries:metadata,map_points:metadata,map_outline:{type:'FeatureCollection',features:[]},palettes,taxonomy,alpha,beta:{PCoA:metadata.map((m,i)=>({...m,Axis1:i,Axis2:i+.5}))},statistics:{da,alpha_tests:alphaTests,beta_tests:betaTests,beta_jaccard_tests:[]},asv_counts:{units,asvs:['fixture-asv'],counts:[[4],[0]]},asv_taxonomy,tip_metadata,trees:{'tree_original_ids.nwk':{name:'root',length:0,children:[{name:'fixture-asv',length:1,children:[]}]}},rarefaction:[],local_literature:{comparison:[{Rank:'Genus',Taxon:'Example A',Detected_ITS:true,Reads_ITS:4}],records:[{Taxon:'Example A',Family:'Example A',Voucher:'fixture'}]},literature:{comparison_data:[{Rank:'Genus',View:'Sample_Area',Group:'S01A',Season:'Seca',Taxon:'Example A',Study_Reads:4,Study_Detected:true,Literature_Confirmed:false,Literature_Evidence:'fixture'}],papers_data:[{PaperID:'fixture',Title:'Synthetic fixture',Year:2026}]},family_codes:{'Example A':'F01'}};
const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ioAAAAASUVORK5CYII=','base64');
let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch(site)).ok)break}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',err=>errors.push(err.message));
 await page.route('**/rest/v1/atlas_publication**',r=>r.fulfill({json:{public_enabled:true,release},headers:{'access-control-allow-origin':'*'}}));
 await page.route('**/rest/v1/atlas_public_releases**',r=>r.fulfill({json:{release},headers:{'access-control-allow-origin':'*'}}));
 await page.route('**/storage/v1/object/public/serradorabo-public/**',r=>{const u=r.request().url();if(u.endsWith('atlas_data.json'))return r.fulfill({json:data,headers:{'access-control-allow-origin':'*'}});if(u.endsWith('.png'))return r.fulfill({body:pixel,contentType:'image/png',headers:{'access-control-allow-origin':'*'}});if(u.endsWith('Alfa_testes.csv'))return r.fulfill({body:'Dataset,Metric,Q_BH\nPadronizada,Shannon,0.8\n',contentType:'text/csv',headers:{'access-control-allow-origin':'*'}});return r.fulfill({body:'fixture',headers:{'access-control-allow-origin':'*'}})});
 const tab=async name=>{await page.locator('nav').getByRole('button',{name,exact:true}).click();};
 const doc=async name=>{const p=page.locator('[data-table-documentation="'+name+'"]');await p.waitFor({state:'visible'});for(const label of ['Significado de cada coluna','Fonte e dados de entrada (input)','Método','Dados processados','Resultado (output)','Scripts utilizados','Comando de reprodução'])assert.ok((await p.innerText()).includes(label),name+' '+label);return p;};
 await page.goto(site);
 await tab('Inventário florístico');
 await page.getByText('Por que duas tabelas?',{exact:true}).waitFor();
 const overlap=page.getByTestId('regional-overlap');await overlap.getByRole('heading',{name:'Táxons compartilhados entre ITS e inventário florístico',exact:true}).waitFor();
 const table=overlap.getByTestId('overlap-table');
 // The comparison must follow both detailed scientific tables and their documentation,
 // and precede the other floristic figures.
 for(const name of ['concordancia_por_escala.csv','taxons_filtrados.csv']){
   await doc(name);
   assert.ok(await overlap.evaluate((el,n)=>Boolean(document.querySelector('[data-table-documentation="'+n+'"]').compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING),name), 'Regional comparison must be below '+name);
 }
 assert.ok(await overlap.evaluate(el=>Boolean(el.compareDocumentPosition(el.nextElementSibling)&Node.DOCUMENT_POSITION_FOLLOWING)&&el.nextElementSibling?.dataset.testid==='plateau-venn'),'Regional comparison must precede the floristic figures');
 for(const [level,a,b,d] of [['Família',2,3,'+1'],['Gênero',4,4,'0'],['Espécie',6,8,'+2']]){
  const row=table.locator('tbody tr').filter({has:page.getByRole('rowheader',{name:level,exact:true})});
  await row.waitFor({state:'visible'});
  assert.equal(await row.count(),1);
  assert.deepEqual(await row.locator('td').allTextContents(),[String(a),String(b),d]);
  for(const [t,v] of [['Original',a],['WCVP v16',b]])assert.equal(await overlap.getByTestId('overlap-chart').locator('[data-level="'+level+'"][data-treatment="'+t+'"] .overlap-count').innerText(),String(v));
 }
 for(const key of ['overlap-chart-explanation','overlap-table-explanation']){const e=overlap.getByTestId(key);assert.match(await e.innerText(),/World Checklist of Vascular Plants/);assert.match(await e.innerText(),/Camptosema ellipticum/);assert.match(await e.innerText(),/Comando de reprodução científica/);assert.match(await e.innerText(),/Concordancia_resumo.csv/);assert.match(await e.innerText(),/harmonizar.py/);assert.equal(await e.getByRole('link',{name:'WCVP v16 — repositório oficial de Kew',exact:true}).getAttribute('href'),'https://kew.iro.bl.uk/entities/product/998399a0-4b87-4a93-8303-6abc8a2de281');}
 const expectedRows=await table.innerText();const treatment=page.getByRole('combobox',{name:'Tratamento nomenclatural',exact:true});await treatment.selectOption('Original');assert.equal(await treatment.inputValue(),'Original');assert.equal(await table.innerText(),expectedRows);await treatment.selectOption('WCVP v16');assert.equal(await treatment.inputValue(),'WCVP v16');
 console.log('PASS: six original/WCVP bars and corresponding numerical cells, explanation/source under each, independent of treatment filter (synthetic fixture).');
 const s=await doc('concordancia_por_escala.csv'),t=await doc('taxons_filtrados.csv');
 assert.match(await s.innerText(),/Total de unidades de campo ITS avaliadas/);
 assert.match(await t.innerText(),/Quantidade de unidades New_Field_ID com pelo menos uma leitura/);
 assert.equal(await page.getByRole('link',{name:'WCVP v16 — repositório oficial de Kew',exact:true}).first().getAttribute('href'),'https://kew.iro.bl.uk/entities/product/998399a0-4b87-4a93-8303-6abc8a2de281');
 await page.getByTestId('plateau-venn').waitFor();assert.equal(await page.getByRole('heading',{name:'Prancha teste 16',exact:true}).count(),0);
 assert.equal(await page.locator('figure').filter({has:page.getByRole('heading',{name:'Comando de reprodução',exact:true})}).count(),7);
 await tab('Interseções');await doc('intersecoes_exatas.csv');await page.getByRole('cell',{name:'Exclusivo no recorte',exact:true}).first().waitFor();
 await page.getByLabel('Área amostral',{exact:true}).selectOption('S01A');
 await page.getByRole('cell',{name:'Grupo único — sem comparação',exact:true}).first().waitFor();
 await page.getByLabel('Área amostral',{exact:true}).selectOption('Todas');
 await tab('Taxonomia');await doc('taxonomia_Genus.csv');
 await tab('Diversidade alfa');await doc('alfa_testes.csv');
 await tab('Diversidade beta');await doc('beta_tests.csv');
 await tab('Diferencial');await doc('diferencial_Genus_DESeq2.csv');
 await tab('Filogenia');await doc('filogenia_metadados_taxonomia.csv');
 await tab('Presença e ausência');await doc('Presenca_Ausencia_Genus_COMPLETA.csv');
 await tab('Literatura');const l=await doc('literatura_comparacao.csv');assert.match(await l.innerText(),/detectado no nosso ITS/);await doc('literatura_serra_do_rabo_ITS.csv');await doc('literatura_fontes.csv');
 await tab('Materiais e métodos');await page.getByRole('heading',{name:'Materiais e métodos — protocolo científico completo'}).waitFor();await page.getByTestId('regional-overlap').getByTestId('overlap-table').waitFor({state:'visible'});await page.getByRole('heading',{name:'4. Fichas metodológicas de todas as figuras disponíveis'}).waitFor();await page.getByRole('button',{name:'Expandir todas as fichas'}).click();await page.locator('.method-figure').filter({hasText:'Figura18_fixture'}).first().waitFor();await tab('Figuras');await page.getByRole('button',{name:/Prancha alfa teste/}).click();await page.getByRole('heading',{name:'Comando de reprodução'}).waitFor();
 await tab('Tabelas');await doc('Alfa_testes.csv');await page.getByText('Valor p ajustado por Benjamini–Hochberg, para a família de testes definida no método.',{exact:true}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: documentation below all exercised tables, seven historical floristic figures (spatial heatmap removed), WCVP/plateau sources, two intersection scenarios, and static figure documentation (synthetic browser fixture only).');
}finally{await browser?.close();server.kill();if(base)await rm(root,{recursive:true,force:true});}
