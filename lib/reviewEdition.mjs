// A revised analysis belongs to one exact count matrix and sampling design.
export async function matrixFingerprint(data){
 const matrix=data.asv_counts;
 const metadata=new Map(data.metadata.map(r=>[r.New_Field_ID,r]));
 const columns=matrix.asvs.map((id,j)=>[id,j]).sort(([a],[b])=>a<b?-1:a>b?1:0);
 const lines=[columns.map(([id])=>id).join('\t')];
 const units=matrix.units.map((id,i)=>[id,i]).sort(([a],[b])=>a<b?-1:a>b?1:0);
 for(const [unit,index] of units){
  const row=metadata.get(unit);
  if(!row)throw Error('Metadados ausentes para a unidade.');
  lines.push([unit,row.Estacao,row.Sample_Area,row.Geoambiente,...columns.map(([,j])=>matrix.counts[index][j])].join('\t'));
 }
 const bytes=new TextEncoder().encode(lines.join('\n'));
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
}

export const seasonalColumns=['Comparação','Nível','Esquerda','Direita','Compartilhados','Somente à esquerda','Somente à direita','União','Jaccard'];
