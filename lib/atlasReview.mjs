// Presentation only: preserve scientific values and distinguish missing tests.
export const SCIENCE='https://github.com/mattoslmp/ITV-rel1-2026/blob/8dce6cdbddcb4719b1eca2af870d512c9ecb40fb/';
export const APP='https://github.com/mattoslmp/serradorabo.biologicaldiversity/blob/main/';
export const WORKBOOK_SHA='04a3e8a917be88f0f51ee63d75a065f3ee036cebf2b916fe2ea746cfc68b3162';
export const validQ=q=>q!==null&&q!==undefined&&q!==''&&Number.isFinite(Number(q))&&Number(q)>=0&&Number(q)<=1;
export function qLabel(q){if(!validQ(q))return 'NE';const n=Number(q);return n===0?'0 registrado (limite numérico)':n<.001?n.toExponential(3):n.toLocaleString('pt-BR',{maximumSignificantDigits:5});}
export function alphaSummary(rows){const ok=rows.filter(r=>r.Status==='OK'&&validQ(r.Q_BH));return {total:rows.length,ok:ok.length,notEstimated:rows.length-ok.length,significant:ok.filter(r=>Number(r.Q_BH)<.05).length,min:ok.length?Math.min(...ok.map(r=>Number(r.Q_BH))):null};}
export function contrastLabels(r){const id=String(r.Contrast||''),same=id.match(/_VS_.*_(Seca|Chuvosa)$/i),season=same?(same[1].toLowerCase()==='seca'?'Seca':'Chuvosa'):null,ref=String(r.Reference||'Não informado'),cmp=String(r.Comparison||'Não informado');if(season)return {reference:ref+' · '+season,comparison:cmp+' · '+season,season,verified:!/^Grupo [12]$|^Não informado$/.test(ref)&&!/^Grupo [12]$|^Não informado$/.test(cmp)};if(/^Seca_vs_Chuva/i.test(id)&&ref==='Seca'&&cmp==='Chuvosa'){const stratum=id.replace(/^Seca_vs_Chuva_(?:Sample_Area_|Geoambiente_|Pareado_New_Field_ID)?/i,'').replaceAll('_',' ').trim();return {reference:(stratum?stratum+' · ':'')+ref,comparison:(stratum?stratum+' · ':'')+cmp,season:'Seca × Chuvosa',verified:true};}return {reference:ref,comparison:cmp,season:'Estação não confirmada',verified:false};}
export function exactPatterns(taxa,groups,query=''){const keys=Object.keys(groups),patterns=new Map();taxa.forEach((t,j)=>{if(query&&!String(t).toLowerCase().includes(query.toLowerCase()))return;const found=keys.filter(k=>Number(groups[k][j])>0);if(!found.length)return;const key=JSON.stringify(found);if(!patterns.has(key))patterns.set(key,{found,taxa:[]});patterns.get(key).taxa.push(t);});return [...patterns.values()].map(({found,taxa})=>({Grupos:found.join(' ∩ '),Numero_grupos:found.length,N:taxa.length,Tipo_intersecao:keys.length===1?'Grupo único — sem comparação':found.length===1?'Exclusivo no recorte':'Compartilhado em interseção exata',Interpretacao:keys.length===1?'Todos os táxons detectados no único grupo selecionado; não há comparação.':found.length===1?'Exclusivos de '+found[0]+' entre os grupos do recorte (não detectados nos demais).':'Detectados em todos os grupos indicados e em nenhum dos outros grupos do recorte.',Grupos_sem_deteccao:keys.filter(k=>!found.includes(k)).join('; ')||'Nenhum',Taxa:taxa.join('; ')})).sort((a,b)=>b.N-a.N||a.Grupos.localeCompare(b.Grupos));}
export function distinctMetadataPalettes(original){const palettes={...original},warm=['#A83E22','#D78E18','#9F5A18','#E8AD63','#B52B50','#8A4C31','#D46937','#DB9C9C','#79501B','#F1CA83','#8D2639','#A16F5D'],cool=['#166B95','#008C86','#423A9B','#4A8325','#7D3DB5','#30AFC1','#17524D','#6A9DD1','#A0AF36','#514F86','#31975D','#9C87D2'];for(const [field,colors] of [['Sample_Area',warm],['Geoambiente',cool]]){const names=Object.keys(original[field]||{}).filter(k=>!['Misto','Não informado'].includes(k)).sort();palettes[field]=Object.fromEntries(names.map((k,i)=>[k,colors[i]||('hsl('+((field==='Sample_Area'?10:165)+i*7)%360+',65%,42%)')]));if('Misto' in (original[field]||{}))palettes[field].Misto=field==='Sample_Area'?'#8B7566':'#667D87';if('Não informado' in (original[field]||{}))palettes[field]['Não informado']=field==='Sample_Area'?'#B9ABA2':'#A3B3BF';}return palettes;}
export function tipOccurrences(data,asv,unitIds){const matrix=data.asv_counts;if(!matrix)return [];const j=matrix.asvs.indexOf(asv);if(j<0)return [];const md=new Map(data.metadata.map(m=>[m.New_Field_ID,m])),tax=data.asv_taxonomy?.[asv]||{};return matrix.units.flatMap((u,i)=>{const reads=Number(matrix.counts[i][j]);if(!unitIds.has(u)||!(reads>0))return [];return [{...md.get(u),...tax,ASV:asv,New_Field_ID:u,Leituras_ASV_na_unidade:reads}];});}
export function tipAnnotation(rows,original){if(!rows.length)return {...original,Season:'Não detectada',Sample_Area:'Não informado',Geoambiente:'Não informado',Total_reads:0,N_New_Field_ID:0};const seasons=[...new Set(rows.map(r=>r.Estacao).filter(Boolean))];const dominant=field=>{const totals=new Map();for(const r of rows){const k=r[field]||'Não informado';totals.set(k,(totals.get(k)||0)+r.Leituras_ASV_na_unidade);}const ordered=[...totals].sort((a,b)=>b[1]-a[1]);return ordered.length>1&&ordered[0][1]===ordered[1][1]?'Misto':ordered[0][0];};return {...original,Season:seasons.length>1?'Ambas':seasons[0]||'Não informado',Sample_Area:dominant('Sample_Area'),Geoambiente:dominant('Geoambiente'),Total_reads:rows.reduce((a,r)=>a+r.Leituras_ASV_na_unidade,0),N_New_Field_ID:rows.length};}
export function compareMetadata(expected,actual){const key=x=>String(x.Sample_ID??'').trim(),fields=['New_Field_ID','Sample_Area','Geoambiente','Estacao'],map=new Map(expected.map(r=>[key(r),r])),seen=new Set(),differences=[];if(expected.length!==89||actual.length!==89){if(expected.length===0||actual.length===0)differences.push('Tabela de bibliotecas ausente ou vazia');}if(map.size!==expected.length)differences.push('Sample_ID duplicado na referência');for(const r of actual){const id=key(r),e=map.get(id);if(seen.has(id))differences.push(id+': Sample_ID duplicado');seen.add(id);if(!e){differences.push(id+': ausente na referência');continue;}for(const f of fields){if(e[f]===undefined||r[f]===undefined||String(e[f]).trim()!==String(r[f]).trim())differences.push(id+' · '+f);}}for(const id of map.keys())if(!seen.has(id))differences.push(id+': ausente na entrega');return {expected:expected.length,actual:actual.length,differences};}

export function floristicResult(id,comparison){
 const summary=comparison?.resumo||[],original=(comparison?.taxons||[]).filter(r=>r.Tratamento==='Original'&&r.Escala==='Regional');
 const reg=(mode,level)=>summary.find(r=>r.Tratamento===mode&&r.Escala==='Regional'&&r.Nivel===level);
 const fmt=v=>Number(v).toLocaleString('pt-BR',{maximumFractionDigits:3});
 if(id.includes('Figura15')){
  const top=original.filter(r=>r.Nivel==='Espécie'&&r.Evidencia==='Compartilhado').sort((a,b)=>Number(b.Unidades_ITS)-Number(a.Unidades_ITS)||String(a.Taxon).localeCompare(String(b.Taxon)))[0];
  const n=reg('Original','Espécie')?.Unidades_ITS;
  return top?'Resultado desta entrega: '+top.Taxon+' apresenta a maior ocupação molecular ('+top.Unidades_ITS+(n?' de '+n:'')+' unidades). A lista de campo confirma o nome, não a ocorrência em cada unidade ITS.':'';
 }
 if(id.includes('Figura16')){
  const result=['Geofácies','Platô'].map(scope=>{
   const rows=summary.filter(r=>r.Tratamento==='Original'&&r.Escala===scope&&r.Nivel==='Espécie'&&r.Jaccard!==null&&r.Jaccard!==''&&Number.isFinite(Number(r.Jaccard)));
   const top=rows.sort((a,b)=>Number(b.Jaccard)-Number(a.Jaccard)||String(a.Grupo).localeCompare(String(b.Grupo)))[0];
   return top?scope+': '+top.Grupo+' tem o maior Jaccard de espécies ('+top.Comuns+'/'+top.Uniao+' = '+fmt(top.Jaccard)+')':'';
  }).filter(Boolean);
  return result.length?'Resultado desta entrega: '+result.join('; ')+'. Comparações descritivas; esforço e área amostrada podem diferir.':'';
 }
 if(id.includes('Figura17')){
  const result=['Família','Gênero','Espécie'].flatMap(level=>{
   const rows=original.filter(r=>r.Nivel===level),r=reg('Original',level);
   if(!rows.length||!r||rows.some(x=>x.Unidades_ITS===null||x.Unidades_ITS===''||!Number.isFinite(Number(x.Unidades_ITS))))return [];
   const field=rows.filter(x=>x.Evidencia!=='Somente ITS').length;
   const values=[1,2,3,5].map(n=>{const hits=rows.filter(x=>Number(x.Unidades_ITS)>=n);const common=hits.filter(x=>x.Evidencia==='Compartilhado').length;const union=field+hits.length-common;return {n,common,j:union?common/union:0,its:hits.length};});
   if(field!==Number(r.Campo)||values[0].common!==Number(r.Comuns)||values[0].its!==Number(r.ITS)||Math.abs(values[0].j-Number(r.Jaccard))>1e-6)return [];
   return [level+': '+values.map(x=>x.n+' unidade(s): '+x.common+' comuns, J='+fmt(x.j)).join('; ')];
  });
  return result.length?'Resultado desta entrega, recalculado da lista regional original sem alterar os dados: '+result.join(' | ')+'.':'';
 }
 if(id.includes('Figura18')||id.includes('Figura14')){
  const result=['Família','Gênero','Espécie'].flatMap(level=>{const a=reg('Original',level),b=reg('WCVP v16',level);return a&&b?[level+': '+a.Comuns+' → '+b.Comuns+' comuns (Jaccard '+fmt(a.Jaccard)+' → '+fmt(b.Jaccard)+')']:[];});
  return result.length?'Resultado desta entrega (original → WCVP v16): '+result.join('; ')+'.':'';
 }
 return '';
}
