// Authenticated ASV identity review; no study data in the public source.
export const POLICY=Object.freeze({Family:90,Genus:95,Species:98});
export const LEVELS={Family:'Família',Genus:'Gênero',Species:'Espécie'};
export const POLICY_TEXT='Identidade mínima: família ≥90%, gênero ≥95%, espécie ≥98%.';
const RANKS=['Kingdom','Phylum','Class','Order','Family','Genus','Species'];
const txt=x=>String(x??'').trim(),key=(...x)=>JSON.stringify(x);
export const named=x=>!!txt(x)&&! /^(não classificado|não informado|unassigned|unknown|unclassified|missing|none|nan|na)(\b|\s|$)/i.test(txt(x));
const sha=async b=>Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',b))).map(x=>x.toString(16).padStart(2,'0')).join('');
const enc=x=>new TextEncoder().encode(x);
export async function verifyIdentity(data,row){
 const m=data.asv_counts,tax=data.asv_taxonomy;
 if(!m||!tax||!row||row.source_sha256!==data.manifest?.raw_inputs?.inputs?.taxonomy?.sha256||row.score_encoding!=='u16le_offset_90000_scale_100000')throw Error('Fonte PIMBA e auditoria incompatíveis.');
 const ids=[...m.asvs].sort();
 if(ids.length!==row.n_asvs||new Set(ids).size!==ids.length||Object.keys(tax).length!==ids.length||ids.some(id=>!tax[id]))throw Error('Identificadores ASV incompatíveis.');
 const bytes=Uint8Array.from(atob(row.scores_b64),c=>c.charCodeAt(0)),canonical=ids.map(id=>[id,...RANKS.map(r=>txt(tax[id][r]))].join('\t')).join('\n');
 if(bytes.length!==2*ids.length||await sha(bytes)!==row.scores_sha256||await sha(enc(ids.join('\n')))!==row.asv_ids_sha256||await sha(enc(canonical))!==row.taxonomy_sha256)throw Error('Falha de integridade da auditoria de identidade.');
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 return Object.fromEntries(ids.map((id,i)=>{const p=(90000+v.getUint16(2*i,true))/1000;if(p>100)throw Error('Identidade inválida');return [id,p];}));
}
export function maskLabel(row,rank,identity){
 const old=txt(row?.[rank]);if(!named(old))return 'Não classificado (sem atribuição)';
 return POLICY[rank]!==undefined&&(!Number.isFinite(identity)||identity<POLICY[rank])?'Não classificado (identidade abaixo de '+POLICY[rank]+'%)':old;
}
export function identityReview(data,scores){
 const m=data.asv_counts,old=data.asv_taxonomy;
 if(!m||m.counts.length!==m.units.length||new Set(m.units).size!==m.units.length||m.counts.some(r=>r.length!==m.asvs.length||r.some(n=>!Number.isSafeInteger(n)||n<0)))throw Error('Matriz ASV inválida.');
 const taxonomy={...data.taxonomy},revised={},summary=[],total=m.counts.reduce((s,r)=>s+r.reduce((a,b)=>a+b,0),0);
 for(const id of m.asvs){const p=scores[id];if(!old[id]||!Number.isFinite(p)||p<0||p>100)throw Error('ASV sem identidade verificável');revised[id]={...old[id],...Object.fromEntries(Object.keys(POLICY).map(r=>[r,maskLabel(old[id],r,p)])),Identity_pct:p};}
 for(const [rank,cut] of Object.entries(POLICY)){
  const labels=m.asvs.map(id=>revised[id][rank]),taxa=[...new Set(labels)].sort(),index=new Map(taxa.map((t,j)=>[t,j])),columns=labels.map(l=>index.get(l));
  const counts=m.counts.map(row=>{const out=taxa.map(()=>0);row.forEach((n,j)=>out[columns[j]]+=n);return out;});
  taxonomy[rank]={taxa,units:m.units,counts};
  const good=labels.map((l,j)=>named(l)?j:-1).filter(j=>j>=0),reads=good.reduce((s,j)=>s+m.counts.reduce((n,r)=>n+r[j],0),0);
  summary.push({Nivel:LEVELS[rank],Identidade_minima_pct:cut,ASVs_atribuidas:good.length,Taxa_distintos:new Set(good.map(j=>labels[j])).size,Leituras_atribuidas:reads,Leituras_nao_classificadas:total-reads});
 }
 return {...data,taxonomy,asv_taxonomy:revised,asv_taxonomy_original:old,identity_review:{status:'verified',policy:POLICY,scores,summary,source_sha256:data.manifest?.raw_inputs?.inputs?.taxonomy?.sha256}};
}
export function namedMatrix(raw){const j=raw.taxa.map((t,i)=>named(t)?i:-1).filter(i=>i>=0);return {...raw,taxa:j.map(i=>raw.taxa[i]),counts:raw.counts.map(row=>j.map(i=>row[i]))};}
export function groupIdentity(data,selected,view,rank){
 if(data.identity_review?.status!=='verified')return {};
 const m=data.asv_counts,md=new Map(selected.map(r=>[r.New_Field_ID,r])),result=Object.create(null);
 m.units.forEach((u,i)=>{const r=md.get(u);if(!r)return;const group=view==='New_Field_ID'?u:r.Estacao+' | '+r[view];const a=result[group]??=Object.create(null);
  m.counts[i].forEach((n,j)=>{if(!(n>0))return;const id=m.asvs[j],label=data.asv_taxonomy[id][rank],p=data.identity_review.scores[id];const cell=a[label]??={min:p,max:p,reads:0,asvs:new Set()};cell.min=Math.min(cell.min,p);cell.max=Math.max(cell.max,p);cell.reads+=n;cell.asvs.add(id);});
 });return result;
}
export function identityHover(groups,group,taxon){const c=groups[group]?.[taxon];return !c?'Identidade não disponível ou sem detecção':c.asvs.size+' ASV(s) · identidade '+c.min.toFixed(3)+'–'+c.max.toFixed(3)+'% · '+c.reads.toLocaleString('pt-BR')+' leituras';}
export function mergedRows(data,selected,rank,view,search=''){
 const matrix=data.asv_counts, original=data.asv_taxonomy_original??data.asv_taxonomy;
 if(!matrix || !original) return [];
 const metadata=new Map(selected.map(record=>[record.New_Field_ID,record]));
 const groups=new Map();
 matrix.units.forEach((unit,index)=>{
  const record=metadata.get(unit);
  if(!record)return;
  const label=view==='New_Field_ID'?unit:record.Estacao+' | '+record[view];
  if(!groups.has(label))groups.set(label,{total:0,counts:new Map()});
  const group=groups.get(label);
  matrix.counts[index].forEach((reads,column)=>{
   if(!reads)return;
   group.total+=reads;
   const id=matrix.asvs[column];
   const item=group.counts.get(id)??{reads:0,units:0};
   item.reads+=reads;item.units++;group.counts.set(id,item);
  });
 });
 const rows=[],query=txt(search).toLowerCase(),verified=data.identity_review?.status==='verified';
 for(const [group,{total,counts}] of groups){
  for(const [id,{reads,units}] of counts){
   const raw=original[id]??{},revised=data.asv_taxonomy[id]??{};
   if(query&&![id,...RANKS.map(r=>raw[r]),revised[rank]].some(v=>txt(v).toLowerCase().includes(query)))continue;
   rows.push({ASV:id,Identidade_pct:verified?data.identity_review.scores[id]:null,Grupo:group,
    Taxon_original:raw[rank]??null,Taxon_revisado:verified?revised[rank]:null,
    Leituras:reads,Percentual_do_grupo:100*reads/total,Unidades_com_deteccao:units,
    ...Object.fromEntries(RANKS.map(r=>[r+'_original',raw[r]??null])),
    Family:verified?revised.Family:null,Genus:verified?revised.Genus:null,Species:verified?revised.Species:null});
  }
 }
 return rows.sort((a,b)=>b.Leituras-a.Leituras||a.ASV.localeCompare(b.ASV)||a.Grupo.localeCompare(b.Grupo));
}
export function binomial(genus,label){const g=txt(genus),words=txt(label).split(/\s+/);if(!/^[A-Z][a-z-]+$/.test(g))return '';if(words[0]===g)words.shift();return /^[a-z][a-z-]+$/.test(words[0]||'')&&!['sp','cf','aff','uncultured','unidentified'].includes(words[0])?g+' '+words[0]:'';}
const geo={CBG:'CBG',LAJ:'LAJ',VRA:'VRA',VRAB:'VRAB',MAB:'MB'};
function unitsFor(meta,row){return meta.filter(m=>row.Escala==='Platô'?txt(m.Sample_Area).match(/^S\d+/)?.[0]===row.Grupo:row.Escala==='Geofácies'?m.Geoambiente===geo[row.Grupo]:['Regional','Coletas','Método de campo'].includes(row.Escala));}
export function reviewFloristica(data,old,detail,wcvp){
 if(!old?.resumo?.length||!detail.length||!wcvp.length)throw Error('Fontes de concordância incompletas.');
 const m=data.asv_counts,md=data.metadata,rev=data.identity_review,original=data.asv_taxonomy_original,w=new Map(),botanical=new Map();
 for(const r of wcvp){const k=key(r.Family,r.Genus,r.Species);if(w.has(k))throw Error('WCVP duplicada');w.set(k,r);}
 for(const r of detail){const n=Number(r.Registros_campo);if(n>0){const k=key(r.Tratamento,r.Escala,r.Grupo,r.Nivel),v=botanical.get(k)||new Map();if(v.has(r.Taxon))throw Error('Registro botânico duplicado');v.set(r.Taxon,n);botanical.set(k,v);}}
 const mapping=m.asvs.map(id=>{const t=original[id],names={Family:txt(t.Family),Genus:txt(t.Genus),Species:binomial(t.Genus,t.Species)},a=w.get(key(names.Family,names.Genus,names.Species));if(!a)throw Error('ASV sem mapeamento WCVP: '+id);return {names,a,id};});
 const resumo=[],details=[];
 for(const row of old.resumo){
  const rank=Object.keys(LEVELS).find(r=>LEVELS[r]===row.Nivel);if(!rank||!['Original','WCVP v16'].includes(row.Tratamento))throw Error('Nível ou tratamento desconhecido.');
  const units=new Set(unitsFor(md,row).map(r=>r.New_Field_ID)),ii=m.units.map((u,i)=>units.has(u)?i:-1).filter(i=>i>=0),bot=botanical.get(key(row.Tratamento,row.Escala,row.Grupo,row.Nivel))||new Map();
  if(bot.size!==Number(row.Campo)||ii.length!==Number(row.Unidades_ITS))throw Error('Inventário ou unidades divergentes: '+row.Grupo+' '+row.Nivel);
  const mol=new Map();
  mapping.forEach(({names,a,id},j)=>{if(rev.scores[id]<POLICY[rank])return;const label=row.Tratamento==='Original'?names[rank]:a[rank+'_WCVP'];if(!named(label))return;const positive=ii.filter(i=>m.counts[i][j]>0);if(!positive.length)return;const v=mol.get(label)||{units:new Set(),reads:0,asvs:0,min:100,max:0};for(const i of positive){v.units.add(i);v.reads+=m.counts[i][j];}v.asvs++;v.min=Math.min(v.min,rev.scores[id]);v.max=Math.max(v.max,rev.scores[id]);mol.set(label,v);});
  const union=[...new Set([...bot.keys(),...mol.keys()])].sort(),shared=union.filter(t=>bot.has(t)&&mol.has(t)).length;
  resumo.push({...row,Identidade_minima_pct:POLICY[rank],ITS:mol.size,Campo:bot.size,Comuns:shared,So_ITS:mol.size-shared,So_campo:bot.size-shared,Uniao:union.length,Jaccard:union.length?shared/union.length:null,Sorensen:union.length?2*shared/(mol.size+bot.size):null});
  for(const t of union){const v=mol.get(t);details.push({Tratamento:row.Tratamento,Escala:row.Escala,Grupo:row.Grupo,Nivel:row.Nivel,Taxon:t,Evidencia:v?(bot.has(t)?'Compartilhado':'Somente ITS'):'Somente campo',Unidades_ITS:v?.units.size||0,Leituras_ITS:v?.reads||0,ASVs_ITS:v?.asvs||0,Registros_campo:bot.get(t)||0,Identidade_minima_pct:POLICY[rank],Identidade_observada_min_pct:v?.min??null,Identidade_observada_max_pct:v?.max??null});}
 }
 return {...old,resumo,taxons:details.filter(r=>r.Escala==='Regional'),review_details:details,identity_policy:POLICY,original_summary:old.resumo};
}
export function plateauPatterns(comparison,mode,level,source='ITS'){
 const rows=comparison.review_details||[],groups=[...new Set(comparison.resumo.filter(r=>r.Escala==='Platô').map(r=>r.Grupo))].sort();
 if(groups.length!==3)return {groups,patterns:[]};
 const masks=new Map();for(const r of rows){if(r.Escala!=='Platô'||r.Tratamento!==mode||r.Nivel!==level||!(source==='ITS'?r.Unidades_ITS>0:r.Registros_campo>0))continue;const i=groups.indexOf(r.Grupo);if(i>=0)masks.set(r.Taxon,(masks.get(r.Taxon)||0)|(1<<i));}
 return {groups,patterns:[1,2,3,4,5,6,7].map(mask=>{const taxa=[...masks].filter(([,v])=>v===mask).map(([t])=>t).sort();return {mask,Grupos:groups.filter((_,i)=>mask&(1<<i)).join(' ∩ '),N:taxa.length,Taxa:taxa.join('; ')};})};
}
export function occupancy(comparison,mode){const rows=comparison.taxons.filter(r=>r.Tratamento===mode),out=[];for(const level of Object.values(LEVELS)){const r=rows.filter(x=>x.Nivel===level),field=r.filter(x=>x.Registros_campo>0).length;for(const n of [1,2,3,5]){const hits=r.filter(x=>x.Unidades_ITS>=n),common=hits.filter(x=>x.Registros_campo>0).length,union=field+hits.length-common;out.push({Nivel:level,Min_unidades:n,ITS:hits.length,Campo:field,Comuns:common,Jaccard:union?common/union:null});}}return out;}
