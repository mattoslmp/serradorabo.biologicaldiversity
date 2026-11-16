// Shared taxonomic barplot policy: the residual is strictly below 1%
// PER GROUP, not a misleading sum of individually rare taxa.
export const TAXON_CUTOFF_PERCENT = 1;
export const AUTO_MAX_TAXA = 12; // retained for backwards-compatible imports
export function normalizeCutoff(value='auto'){
  const raw=String(value).trim().toLowerCase().replaceAll(' ','').replace(/^</,'').replace(/%$/,'');
  if(raw==='auto'||raw==='1')return 1;
  throw new Error('O corte taxonômico da plataforma é fixo em 1%.');
}
export function taxonomyBars(taxa,groups,requested=1,basis='max'){
  normalizeCutoff(requested);
  if(!['mean','max'].includes(basis))throw new Error('Critério deve ser mean ou max.');
  const keys=Object.keys(groups),percentages={};
  for(const key of keys){
    const counts=groups[key];
    if(counts.length!==taxa.length||counts.some(x=>!Number.isFinite(x)||x<0))
      throw new Error('Contagens taxonômicas inválidas.');
    const total=counts.reduce((a,b)=>a+b,0);
    percentages[key]=counts.map(n=>total?100*n/total:0);
  }
  // Determine eligible residual taxa per bar, in ascending abundance order.
  // A taxon can be folded ONLY if it is eligible in EVERY group where it occurs.
  // This leaves a stable legend/palette while ensuring each residual sum <1%.
  const foldable=taxa.map(()=>true);
  for(const key of keys){
    const eligible=Array.from({length:taxa.length},(_,j)=>j)
      .filter(j=>percentages[key][j]>0)
      .sort((a,b)=>percentages[key][a]-percentages[key][b]||taxa[a].localeCompare(taxa[b]));
    let cumulative=0;
    const locallyFolded=new Set();
    for(const j of eligible){
      if(cumulative+percentages[key][j]>=1-1e-10)break;
      cumulative+=percentages[key][j];
      locallyFolded.add(j);
    }
    for(let j=0;j<taxa.length;j++)
      if(percentages[key][j]>0&&!locallyFolded.has(j))foldable[j]=false;
  }
  const maxima=taxa.map((_,j)=>Math.max(0,...keys.map(k=>percentages[k][j])));
  const selected=taxa.map((name,j)=>({name,j,max:maxima[j]}))
    .filter(t=>!foldable[t.j]&&t.max>0)
    .sort((a,b)=>keys.reduce((s,k)=>s+percentages[k][b.j]-percentages[k][a.j],0)||a.name.localeCompare(b.name));
  const other=keys.map(k=>percentages[k].reduce((sum,n,j)=>sum+(foldable[j]?n:0),0));
  if(other.some(x=>x>=1-1e-9))throw new Error('Outros ultrapassou o limite de 1%.');
  return {cutoff:1,selected,other,keys,percentages,label:'Outros (<1%)'};
}
