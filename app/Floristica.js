'use client';

import {useState} from 'react';
import {fileURL} from '../lib/client';
import {FloristicEvidence} from './Evidence';
import {WcvpExplanation,PlateauExplanation} from './TableDocumentation';

export default function Floristica({comparison, Table, metadata=[]}) {
  const [names,setNames]=useState('WCVP v16');
  const [scope,setScope]=useState('Regional');
  const [level,setLevel]=useState('Espécie');
  const [evidence,setEvidence]=useState('Compartilhado');
  if (!comparison) return null;
  const rows=comparison.taxons.filter(row=>row.Tratamento===names && row.Nivel===level && (evidence==='Todos'||row.Evidencia===evidence));
  return <section className="panel">
    <h2>ITS do solo e inventário florístico</h2>
    <p>Comparação exclusivamente entre o ITS do solo do projeto Serra do Rabo e o inventário de campo do Diagnóstico Florístico e Fitossociológico da Serra do Rabo, Lume Ambiental (março de 2025, Tabela 5, p. 61–65). Nenhuma ocorrência da literatura é incorporada. Registros de coleta/censo associados ao próprio diagnóstico são identificados separadamente nas análises auxiliares e sazonais.</p><WcvpExplanation comparison={comparison}/><PlateauExplanation metadata={metadata}/><p className="note"><b>Por que duas tabelas?</b> A primeira resume os números de concordância por escala e nível taxonômico; a segunda identifica os nomes e as evidências de cada táxon na comparação regional. A seleção da escala modifica apenas o resumo; a lista de táxons permanece regional.</p><h3>1. Resumo quantitativo da concordância</h3><p>Uma linha por escala, grupo e nível taxonômico. Regional é a comparação principal com a Tabela 5.</p>
    <label>Tratamento nomenclatural <select value={names} onChange={e=>setNames(e.target.value)}><option>WCVP v16</option><option>Original</option></select></label>
    <label>Escala <select value={scope} onChange={e=>setScope(e.target.value)}>{['Regional',...new Set(comparison.resumo.map(r=>r.Escala).filter(s=>s!=='Regional'))].map(s=><option key={s}>{s}</option>)}</select></label><Table key={names+scope} rows={comparison.resumo.filter(r=>r.Tratamento===names&&r.Escala===scope)} name="concordancia_por_escala.csv"/>
    <h3>2. Evidências por táxon — lista regional</h3><p>Esta segunda tabela identifica os nomes responsáveis pela concordância regional e suas evidências moleculares e botânicas; não repete o resumo.</p>
    <label>Nível <select value={level} onChange={e=>setLevel(e.target.value)}>{['Família','Gênero','Espécie'].map(x=><option key={x}>{x}</option>)}</select></label>{' '}
    <label>Evidência <select value={evidence} onChange={e=>setEvidence(e.target.value)}>{['Compartilhado','Somente ITS','Somente campo','Todos'].map(x=><option key={x}>{x}</option>)}</select></label>
    <Table key={[names,level,evidence].join('/')} rows={rows} name="taxons_filtrados.csv"/>
    {comparison.figuras.map(figure=><figure key={figure.id}>
      <h3>{figure.title}</h3><img loading="lazy" style={{maxWidth:'100%',height:'auto'}} src={fileURL(figure.files.png)} alt={figure.title}/>
      <figcaption>{figure.caption}</figcaption><FloristicEvidence figure={figure} comparison={comparison}/>{figure.id?.includes('Figura16')&&<PlateauExplanation metadata={metadata}/>} {figure.id?.includes('Figura18')&&<WcvpExplanation comparison={comparison}/>}
      <p>{Object.entries(figure.files).map(([format,path])=><a key={path} href={fileURL(path)} target="_blank" rel="noreferrer" style={{marginRight:'1rem'}}>{format.toUpperCase()}</a>)}</p>
    </figure>)}
    <h3>Relatório e dados completos</h3>
    <p><a href={fileURL(comparison.relatorio)}>Baixar o relatório científico em Word</a></p>
    <ul>{comparison.arquivos.map(path=><li key={path}><a href={fileURL(path)}>{path.split('/').pop()}</a></li>)}</ul>
  </section>;
}
