'use client';

import {useState} from 'react';
import {fileURL} from '../lib/client';

export default function Floristica({comparison, Table}) {
  const [names,setNames]=useState('WCVP v16');
  const [level,setLevel]=useState('Espécie');
  const [evidence,setEvidence]=useState('Compartilhado');
  if (!comparison) return null;
  const rows=comparison.taxons.filter(row=>row.Tratamento===names && row.Nivel===level && (evidence==='Todos'||row.Evidencia===evidence));
  return <section className="panel">
    <h2>ITS do solo e inventário florístico</h2>
    <p>Compare as detecções moleculares com a lista de campo da Tabela 5 do diagnóstico florístico da Lume Ambiental. A interseção reúne táxons registrados pelos dois métodos na escala selecionada.</p>
    <label>Tratamento nomenclatural <select value={names} onChange={e=>setNames(e.target.value)}><option>WCVP v16</option><option>Original</option></select></label>
    <Table key={names} rows={comparison.resumo.filter(r=>r.Tratamento===names)} name="concordancia_por_escala.csv"/>
    <h3>Táxons da Serra do Rabo</h3>
    <label>Nível <select value={level} onChange={e=>setLevel(e.target.value)}>{['Família','Gênero','Espécie'].map(x=><option key={x}>{x}</option>)}</select></label>{' '}
    <label>Evidência <select value={evidence} onChange={e=>setEvidence(e.target.value)}>{['Compartilhado','Somente ITS','Somente campo','Todos'].map(x=><option key={x}>{x}</option>)}</select></label>
    <Table key={[names,level,evidence].join('/')} rows={rows} name="taxons_filtrados.csv"/>
    {comparison.figuras.map(figure=><figure key={figure.id}>
      <h3>{figure.title}</h3><img loading="lazy" style={{maxWidth:'100%',height:'auto'}} src={fileURL(figure.files.png)} alt={figure.title}/>
      <figcaption>{figure.caption}</figcaption>
      <p>{Object.entries(figure.files).map(([format,path])=><a key={path} href={fileURL(path)} target="_blank" rel="noreferrer" style={{marginRight:'1rem'}}>{format.toUpperCase()}</a>)}</p>
    </figure>)}
    <h3>Relatório e dados completos</h3>
    <p><a href={fileURL(comparison.relatorio)}>Baixar o relatório científico em Word</a></p>
    <ul>{comparison.arquivos.map(path=><li key={path}><a href={fileURL(path)}>{path.split('/').pop()}</a></li>)}</ul>
  </section>;
}
