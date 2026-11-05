export const AUTO_MAX_TAXA=12;
export function normalizeCutoff(value='auto'){
 const raw=String(value).trim().toLowerCase().replaceAll(' ','').replace(/^</,'').replace(/%$/,'');
 if(raw==='auto')return 'auto';
 const n=Number(raw);if(n===1||n===5)return n;
 throw new Error('O corte deve ser auto, 1 ou 5 (%).');
}
export function taxonomyBars(taxa,groups,requested='auto',basis='mean'){
 if(!['mean','max'].includes(basis))throw new Error('Critério deve ser mean ou max.');
 const keys=Object.keys(groups),percentages={};
 for(const key of keys){const counts=groups[key];
  if(counts.length!==taxa.length||counts.some(x=>!Number.isFinite(x)||x<0))throw new Error('Contagens taxonômicas inválidas.');
  const total=counts.reduce((a,b)=>a+b,0);percentages[key]=counts.map(n=>total?100*n/total:0);
 }
 const maxima=taxa.map((_,j)=>Math.max(0,...keys.map(k=>percentages[k][j])));
 const scores=basis==='max'?maxima:taxa.map((_,j)=>keys.length?keys.reduce((s,k)=>s+percentages[k][j],0)/keys.length:0);
 const configured=normalizeCutoff(requested),cutoff=configured==='auto'?(scores.filter(x=>x>=1).length<=AUTO_MAX_TAXA?1:5):configured;
 const selected=taxa.map((name,j)=>({name,j,max:maxima[j],score:scores[j]})).filter(t=>t.score>=cutoff)
  .sort((a,b)=>keys.reduce((s,k)=>s+percentages[k][b.j]-percentages[k][a.j],0)||a.name.localeCompare(b.name));
 const selectedIndices=new Set(selected.map(t=>t.j));
 const other=keys.map(k=>percentages[k].reduce((sum,n,j)=>sum+(selectedIndices.has(j)?0:n),0));
 return {cutoff,selected,other,keys,percentages,label:`Outros (<${cutoff}%)`};
}
