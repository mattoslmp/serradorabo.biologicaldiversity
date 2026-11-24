'use client';

import {useState} from 'react';
import {fileURL} from '../lib/client';
import {FloristicEvidence} from './Evidence';
import {WcvpExplanation,PlateauExplanation} from './TableDocumentation';
import RegionalOverlap from './RegionalOverlap';
import {IdentityLegend,PlateauVenn,OccupancyReview,RegionalVenn} from './IdentityReview';

export default function Floristica({comparison, Table, metadata=[]}) {
  const [names,setNames]=useState('WCVP v16');
  const [scope,setScope]=useState('Regional');
  const [level,setLevel]=useState('Espécie');
  const [evidence,setEvidence]=useState('Compartilhado');
  if (!comparison) return null;
  const rows=comparison.taxons.filter(row=>row.Tratamento===names && row.Nivel===level && (evidence==='Todos'||row.Evidencia===evidence));
  return <section className="panel">
    <h2>ITS do solo e inventário florístico</h2>
    <p>Comparação exclusivamente entre o ITS do solo do projeto Serra do Rabo e o inventário de campo do Diagnóstico Florístico e Fitossociológico da Serra do Rabo, Lume Ambiental (março de 2025, Tabela 5, p. 61–65). Nenhuma ocorrência da literatura é incorporada. Registros de coleta/censo associados ao próprio diagnóstico são identificados separadamente nas análises auxiliares e sazonais.</p><IdentityLegend comparison={comparison}/>{comparison.identity_review_error&&<p role="alert">Revisão florística indisponível: {comparison.identity_review_error}. Os números abaixo são históricos.</p>}<p className="small">WCVP v16 = referência de nomes aceitos e sinônimos do Kew. Original mantém a nomenclatura registrada. Protocolo detalhado em Materiais e métodos.</p><p className="note"><b>Por que duas tabelas?</b> As duas tabelas detalhadas a seguir têm funções distintas: a primeira resume os números de concordância por escala e nível taxonômico; a segunda identifica os nomes e as evidências de cada táxon na comparação regional. A seleção da escala modifica apenas o resumo; a lista de táxons permanece regional. O gráfico e a tabela de comparação Original × WCVP v16 estão abaixo das duas tabelas detalhadas.</p><h3>1. Resumo quantitativo da concordância</h3><p>Uma linha por escala, grupo e nível taxonômico. Regional é a comparação principal com a Tabela 5.</p>
    <label>Tratamento nomenclatural <select aria-label="Tratamento nomenclatural" value={names} onChange={e=>setNames(e.target.value)}><option value="WCVP v16">WCVP v16</option><option value="Original">Original</option></select></label>
    <label>Escala <select value={scope} onChange={e=>setScope(e.target.value)}>{['Regional',...new Set(comparison.resumo.map(r=>r.Escala).filter(s=>s!=='Regional'))].map(s=><option key={s}>{s}</option>)}</select></label><Table key={names+scope} rows={comparison.resumo.filter(r=>r.Tratamento===names&&r.Escala===scope)} name="concordancia_por_escala.csv"/>
    <h3>2. Evidências por táxon — lista regional</h3><p>Esta segunda tabela identifica os nomes responsáveis pela concordância regional e suas evidências moleculares e botânicas; não repete o resumo.</p>
    <label>Nível <select value={level} onChange={e=>setLevel(e.target.value)}>{['Família','Gênero','Espécie'].map(x=><option key={x}>{x}</option>)}</select></label>{' '}
    <label>Evidência <select value={evidence} onChange={e=>setEvidence(e.target.value)}>{['Compartilhado','Somente ITS','Somente campo','Todos'].map(x=><option key={x}>{x}</option>)}</select></label>
    <Table key={[names,level,evidence].join('/')} rows={rows} name="taxons_filtrados.csv"/>
    <RegionalOverlap comparison={comparison}/>
    <PlateauVenn comparison={comparison} Table={Table} metadata={metadata}/><RegionalVenn comparison={comparison} Table={Table}/><OccupancyReview comparison={comparison} Table={Table}/>
    <p className="note">Pranchas e relatório da entrega histórica, anteriores à revisão hierárquica; o heatmap de concordância espacial foi retirado da visualização.</p>
    {comparison.figuras.filter(f=>!f.id?.includes('Figura16')&&(!comparison.identity_policy||!['Figura14','Figura15','Figura17','Figura18'].some(id=>f.id?.includes(id)))).map(figure=><figure key={figure.id}>
      <h3>{figure.title}</h3><img loading="lazy" style={{maxWidth:'100%',height:'auto'}} src={fileURL(figure.files.png)} alt={figure.title}/>
      <figcaption>{figure.caption}</figcaption><FloristicEvidence figure={figure} comparison={comparison.identity_policy?{...comparison,resumo:comparison.original_summary,taxons:[]}:comparison}/>{figure.id?.includes('Figura17')&&<p>Uma unidade de detecção é um New_Field_ID distinto, e não um platô. O número mínimo representa recorrência molecular; a lista botânica permanece fixa. Não se trata de um teste inferencial.</p>}
      <p>{Object.entries(figure.files).map(([format,path])=><a key={path} href={fileURL(path)} target="_blank" rel="noreferrer" style={{marginRight:'1rem'}}>{format.toUpperCase()}</a>)}</p>
    </figure>)}
    {comparison.identity_policy&&<details><summary>Arquivos históricos das figuras substituídas (antes do filtro)</summary>{comparison.figuras.filter(f=>['Figura14','Figura15','Figura17','Figura18'].some(id=>f.id?.includes(id))).map(f=><p key={f.id}>{f.title} · {Object.entries(f.files).map(([format,path])=><a key={path} href={fileURL(path)} style={{marginRight:8}}>{format.toUpperCase()}</a>)}</p>)}</details>}
    <h3>Relatório e dados completos</h3>
    <p><a href={fileURL(comparison.relatorio)}>Baixar o relatório científico histórico em Word</a></p>
    <ul>{comparison.arquivos.map(path=><li key={path}><a href={fileURL(path)}>{path.split('/').pop()}</a></li>)}</ul>
  </section>;
}
