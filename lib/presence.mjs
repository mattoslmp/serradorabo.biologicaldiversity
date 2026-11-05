/** Detections from non-rarefied counts. All observed categories retained. */
export function presenceMatrix(raw, metadata, {view='New_Field_ID',search='',minUnits=1,sort='occupancy'}={}) {
 const meta=new Map(metadata.map(m=>[m.New_Field_ID,m])),groups=new Map();
 const indices=raw.units.map((u,i)=>meta.has(u)?i:-1).filter(i=>i>=0);
 for(const i of indices){const m=meta.get(raw.units[i]);const key=view==='New_Field_ID'?m.New_Field_ID:`${m.Estacao} | ${m[view]}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);}
 const keys=[...groups.keys()].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const taxa=raw.taxa.map((name,j)=>({name,j,occupied:indices.filter(i=>Number(raw.counts[i][j])>0).length})).filter(t=>t.occupied>=Math.max(1,Number(minUnits)||1)&&t.name.toLowerCase().includes(search.toLowerCase()));
 taxa.sort((a,b)=>(sort==='name'?0:b.occupied-a.occupied)||a.name.localeCompare(b.name,'pt-BR'));
 const rows=taxa.map(t=>({name:t.name,occupied:t.occupied,cells:keys.map(k=>{const ix=groups.get(k),detected=ix.filter(i=>Number(raw.counts[i][t.j])>0).length;return {value:Number(detected>0),detected,total:ix.length,reads:ix.reduce((s,i)=>s+Number(raw.counts[i][t.j]),0)};})}));
 return {keys,rows,units:indices.length};
}
export function presenceCSV(matrix){const esc=x=>'"'+String(x??'').replaceAll('"','""')+'"';return '\uFEFF'+[['Taxon',...matrix.keys].map(esc).join(','),...matrix.rows.map(r=>[r.name,...r.cells.map(c=>c.value)].map(esc).join(','))].join('\n');}
