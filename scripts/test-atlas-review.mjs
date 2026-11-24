import assert from 'node:assert/strict';import {alphaSummary,validQ,qLabel,contrastLabels,exactPatterns,distinctMetadataPalettes,tipOccurrences,tipAnnotation,compareMetadata,floristicResult,regionalOverlap} from '../lib/atlasReview.mjs';
assert.deepEqual(alphaSummary([{Status:'OK',Q_BH:.937},{Status:'NAO_ESTIMAVEL',Q_BH:null}]),{total:2,ok:1,notEstimated:1,significant:0,min:.937});assert.equal(alphaSummary([{Status:'OK',Q_BH:0}]).significant,1);assert.equal(validQ(null),false);assert.match(qLabel(1e-20),/e-20/);
assert.deepEqual(contrastLabels({Contrast:'Sample_Area_S43_VS_S45H_Seca',Reference:'S43',Comparison:'S45H'}),{reference:'S43 · Seca',comparison:'S45H · Seca',season:'Seca',verified:true});assert.equal(contrastLabels({Contrast:'Seca_vs_Chuva_Sample_Area_S43',Reference:'Seca',Comparison:'Chuvosa'}).comparison,'S43 · Chuvosa');
const rows=exactPatterns(['a','b','c'],{'Seca | S43':[1,2,0],'Chuvosa | S45':[0,3,1]});assert.equal(rows.reduce((n,r)=>n+r.N,0),3);assert.match(rows.find(r=>r.Grupos==='Seca | S43').Interpretacao,/Exclusivos/);assert.match(exactPatterns(['a'],{G:[1]})[0].Interpretacao,/não há comparação/);
const pal=distinctMetadataPalettes({Sample_Area:{A:'#111',B:'#222',Misto:'#aaa'},Geoambiente:{X:'#111',Y:'#222',Misto:'#aaa'}});assert.equal(new Set([...Object.values(pal.Sample_Area),...Object.values(pal.Geoambiente)]).size,6);
const meta=[{Sample_ID:'a',New_Field_ID:'u1',Sample_Area:'A',Geoambiente:'X',Estacao:'Seca'},{Sample_ID:'b',New_Field_ID:'u2',Sample_Area:'B',Geoambiente:'Y',Estacao:'Chuvosa'}],data={metadata:meta,asv_counts:{units:['u1','u2'],asvs:['a'],counts:[[2],[4]]},asv_taxonomy:{a:{Family:'Fabaceae',Species:'Species a'}}};const occ=tipOccurrences(data,'a',new Set(['u1','u2']));assert.equal(occ.length,2);assert.equal(occ[0].Family,'Fabaceae');assert.equal(tipAnnotation(occ,{}).Sample_Area,'B');assert.equal(tipAnnotation(occ,{}).Season,'Ambas');assert.equal(compareMetadata(meta,meta).differences.length,0);assert.equal(compareMetadata(meta,[{...meta[0],Geoambiente:'Q'},meta[1]]).differences.length,1);console.log('Atlas review helpers verified');
assert.equal(exactPatterns(['a','b'],{G:[1,1]},'b')[0].Taxa,'b');

const fixture={resumo:[{Tratamento:'Original',Escala:'Regional',Nivel:'Espécie',Campo:2,ITS:2,Comuns:1,Jaccard:1/3,Unidades_ITS:5},{Tratamento:'WCVP v16',Escala:'Regional',Nivel:'Espécie',Comuns:2,Jaccard:1}],taxons:[{Tratamento:'Original',Escala:'Regional',Nivel:'Espécie',Taxon:'Species A',Evidencia:'Compartilhado',Unidades_ITS:5},{Tratamento:'Original',Escala:'Regional',Nivel:'Espécie',Taxon:'Species B',Evidencia:'Somente ITS',Unidades_ITS:1},{Tratamento:'Original',Escala:'Regional',Nivel:'Espécie',Taxon:'Species C',Evidencia:'Somente campo',Unidades_ITS:0}]};
assert.match(floristicResult('Figura15',fixture),/Species A.*5 de 5/);
assert.match(floristicResult('Figura17',fixture),/5 unidade\(s\): 1 comuns, J=0,5/);
assert.match(floristicResult('Figura18',fixture),/1 → 2 comuns/);
assert.equal(floristicResult('Figura17',{}),'');

const overlapFixture={resumo:[
 {Escala:'Regional',Nivel:'Família',Tratamento:'Original',Comuns:2,ITS:4,Campo:3},
 {Escala:'Regional',Nivel:'Família',Tratamento:'WCVP v16',Comuns:3,ITS:4,Campo:3},
 {Escala:'Regional',Nivel:'Gênero',Tratamento:'Original',Comuns:5},
 {Escala:'Regional',Nivel:'Gênero',Tratamento:'WCVP v16',Comuns:5},
 {Escala:'Regional',Nivel:'Espécie',Tratamento:'Original',Comuns:6},
 {Escala:'Regional',Nivel:'Espécie',Tratamento:'WCVP v16',Comuns:8},
 {Escala:'Platô',Nivel:'Espécie',Tratamento:'Original',Comuns:999}
]};
assert.deepEqual(regionalOverlap(overlapFixture),[{Nivel:'Família',Original:2,WCVP_v16:3,Diferenca:1},{Nivel:'Gênero',Original:5,WCVP_v16:5,Diferenca:0},{Nivel:'Espécie',Original:6,WCVP_v16:8,Diferenca:2}]);
assert.equal(regionalOverlap({})[0].Original,null);
assert.equal(regionalOverlap({resumo:[{Escala:'Regional',Nivel:'Família',Tratamento:'Original',Comuns:0}]})[0].Original,0);
assert.equal(regionalOverlap({resumo:[...overlapFixture.resumo,overlapFixture.resumo[0]]})[0].Original,null);
assert.equal(regionalOverlap({resumo:[{Escala:'Regional',Nivel:'Família',Tratamento:'Original',Comuns:8,ITS:3}]})[0].Original,null);
assert.equal(regionalOverlap({resumo:[{Escala:'Regional',Nivel:'Família',Tratamento:'Original',Comuns:''}]})[0].Original,null);
console.log('PASS: original/WCVP paired regional counts; no fabricated missing values; duplicate and inconsistent rows rejected.');
