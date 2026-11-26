'use client';
import {Localized} from './Language';

import {useState} from 'react';
import {fileURL} from '../lib/client';
import {FloristicEvidence} from './Evidence';
import {WcvpExplanation,PlateauExplanation} from './TableDocumentation';
import RegionalOverlap from './RegionalOverlap';
import {IdentityLegend,PlateauVenn,OccupancyReview,RegionalVenn} from './IdentityReview';

export default function Floristica({comparison, Table, metadata=[],edition}) {
  const [names,setNames]=useState('WCVP v16');
  const [scope,setScope]=useState('Regional');
  const [level,setLevel]=useState('Espécie');
  const [evidence,setEvidence]=useState('Compartilhado');
  if (!comparison) return null;
  const rows=comparison.taxons.filter(row=>row.Tratamento===names && row.Nivel===level && (evidence==='Todos'||row.Evidencia===evidence));
  return <Localized><section className="panel">
    <h2>ITS do solo e inventário florístico</h2>
    <p>ITS do solo e inventário da Lume Ambiental, por nível taxonômico e escala.</p>{comparison.identity_review_error&&<p role="alert">Exibindo a série histórica. A revisão de identidade está indisponível.</p>}
    <h3>Concordância por escala</h3>
    <label>Tratamento nomenclatural <select aria-label="Tratamento nomenclatural" value={names} onChange={e=>setNames(e.target.value)}><option value="WCVP v16">WCVP v16</option><option value="Original">Original</option></select></label>
    <label>Escala <select value={scope} onChange={e=>setScope(e.target.value)}>{['Regional',...new Set(comparison.resumo.map(r=>r.Escala).filter(s=>s!=='Regional'))].map(s=><option key={s}>{s}</option>)}</select></label><Table key={names+scope} rows={comparison.resumo.filter(r=>r.Tratamento===names&&r.Escala===scope)} name="concordancia_por_escala.csv"/>
    <h3>Evidências por táxon no inventário regional</h3>
    <label>Nível <select value={level} onChange={e=>setLevel(e.target.value)}>{['Família','Gênero','Espécie'].map(x=><option key={x}>{x}</option>)}</select></label>{' '}
    <label>Evidência <select value={evidence} onChange={e=>setEvidence(e.target.value)}>{['Compartilhado','Somente ITS','Somente campo','Todos'].map(x=><option key={x}>{x}</option>)}</select></label>
    <Table key={[names,level,evidence].join('/')} rows={rows} name="taxons_filtrados.csv"/>
    <RegionalOverlap comparison={comparison}/>
    <PlateauVenn comparison={comparison} Table={Table} metadata={metadata}/><RegionalVenn comparison={comparison} Table={Table}/><OccupancyReview comparison={comparison} Table={Table}/>
    {edition&&<section><h3>Comparação por estação</h3><Table rows={edition.seasonal} name="concordancia_sazonal_revisada.csv"/></section>}
    <details><summary>Figuras da edição histórica</summary>
    {comparison.figuras.filter(f=>!f.id?.includes('Figura16')&&(!comparison.identity_policy||!['Figura14','Figura15','Figura17','Figura18'].some(id=>f.id?.includes(id)))).map(figure=><figure key={figure.id}>
      <h3>{figure.title}</h3><img loading="lazy" style={{maxWidth:'100%',height:'auto'}} src={fileURL(figure.files.png)} alt={figure.title}/>
      <figcaption>{figure.caption}</figcaption><FloristicEvidence figure={figure} comparison={comparison.identity_policy?{...comparison,resumo:comparison.original_summary,taxons:[]}:comparison}/>{figure.id?.includes('Figura17')&&<p>Uma unidade de detecção é um New_Field_ID distinto, e não um platô. O número mínimo representa recorrência molecular; a lista botânica permanece fixa. Não se trata de um teste inferencial.</p>}
      <p>{Object.entries(figure.files).map(([format,path])=><a key={path} href={fileURL(path)} target="_blank" rel="noreferrer" style={{marginRight:'1rem'}}>{format.toUpperCase()}</a>)}</p>
    </figure>)}
    {comparison.identity_policy&&<details><summary>Arquivos históricos das figuras substituídas (antes do filtro)</summary>{comparison.figuras.filter(f=>['Figura14','Figura15','Figura17','Figura18'].some(id=>f.id?.includes(id))).map(f=><p key={f.id}>{f.title} · {Object.entries(f.files).map(([format,path])=><a key={path} href={fileURL(path)} style={{marginRight:8}}>{format.toUpperCase()}</a>)}</p>)}</details>}
    </details>
    <h3>Relatório e dados completos</h3>
    {edition?.documents&&<div className="controls"><a href={edition.documents.report}>Relatório atualizado</a><a href={edition.documents.manuscript}>Artigo</a><a href={edition.documents.supplement}>Informações suplementares</a><a href={edition.documents.tables}>Tabelas suplementares</a></div>}
    {!edition&&<p><a href={fileURL(comparison.relatorio)}>Relatório da edição histórica</a></p>}
    <details><summary>Arquivos de dados</summary><ul>{comparison.arquivos.map(path=><li key={path}><a href={fileURL(path)}>{path.split('/').pop()}</a></li>)}</ul></details>
  </section></Localized>;
}
