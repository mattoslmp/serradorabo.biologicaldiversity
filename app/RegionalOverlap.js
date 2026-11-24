'use client';
import {regionalOverlap} from '../lib/atlasReview.mjs';
import {fileURL} from '../lib/client';
import {SCI,WCVP,WCVP_GBIF,WCVP_PORTAL,REPRO} from '../lib/tableDocumentation.mjs';

const TITLE='Táxons compartilhados entre ITS e inventário florístico';
const source=p=>SCI+p;
const fmt=n=>n===null?'Não disponível':n.toLocaleString('pt-BR');
const delta=n=>n===null?'Não disponível':n>0?'+'+fmt(n):fmt(n);
const accepted='https://powo.science.kew.org/taxon/77220414-1';
function Definition({rows}){
 const sp=rows.find(r=>r.Nivel==='Espécie'),fam=rows.find(r=>r.Nivel==='Família'),gen=rows.find(r=>r.Nivel==='Gênero');
 return <div className="overlap-definition">
 <h5>O que é WCVP v16 e por que foi utilizada?</h5>
 <p><b>Original:</b> número de táxons compartilhados usando os nomes registrados pelo ITS e pelo inventário da Lume, após normalização do nível taxonômico, sem conciliação de sinônimos. <b>WCVP v16:</b> World Checklist of Vascular Plants (Lista Mundial de Plantas Vasculares), versão 16, de 4 de junho de 2026, mantida pelo Royal Botanic Gardens, Kew. É uma referência de nomenclatura, não uma fonte de novas ocorrências. Atribui o mesmo nome aceito a sinônimos quando a correspondência é inequívoca; os nomes ambíguos ou não resolvidos são mantidos.</p>
 <p><b>Exemplos reais documentados no manuscrito:</b> a atribuição molecular <i>Camptosema ellipticum</i> e o nome botânico <i>Cerradicola elliptica</i> convergem no <a href={accepted} target="_blank" rel="noreferrer">nome aceito <i>Cerradicola elliptica</i></a>; no segundo exemplo, <i>Ipomoea decora</i> (campo) e <i>Ipomoea goyazensis</i> (ITS) são conciliados como <i>Ipomoea goyazensis</i>.</p>
 {rows.every(r=>r.Diferenca!==null)?<p data-testid="overlap-interpretation"><b>Resultado regional da entrega ativa:</b> famílias {fmt(fam.Original)} → {fmt(fam.WCVP_v16)} ({delta(fam.Diferenca)}); gêneros {fmt(gen.Original)} → {fmt(gen.WCVP_v16)} ({delta(gen.Diferenca)}); espécies {fmt(sp.Original)} → {fmt(sp.WCVP_v16)} ({delta(sp.Diferenca)}). Essas diferenças expressam a alteração da concordância nomenclatural, não novas coletas, leituras ou espécies detectadas.</p>:<p role="status">Há valores não disponíveis ou inconsistentes no resumo da entrega. Nenhum valor ausente foi substituído por zero.</p>}
 <p><a href={WCVP} target="_blank" rel="noreferrer">WCVP v16 — repositório oficial de Kew</a> · <a href={WCVP_GBIF} target="_blank" rel="noreferrer">WCVP no GBIF</a> · <a href={WCVP_PORTAL} target="_blank" rel="noreferrer">Sobre a WCVP no portal POWO</a>.</p>
 </div>;
}
function Provenance({type}){
 const summary=fileURL('floristica/Concordancia_resumo.csv'),taxa=fileURL('floristica/Concordancia_taxons.csv');
 return <div className="chart-evidence overlap-provenance">
 <h5>Fonte, método e reprodução</h5>
 <dl>
 <dt>Dados de entrada</dt><dd><a href={source('inputs/floristica/Lume_Tabela5.csv')} target="_blank" rel="noreferrer">Tabela 5 do inventário florístico (Lume, março de 2025)</a> · <a href={source('inputs/r5/PROCESSAMENTO_R5.tar.xz')} target="_blank" rel="noreferrer">matriz ITS e taxonomia (processamento R5)</a> · <a href={WCVP} target="_blank" rel="noreferrer">referência WCVP v16</a>.</dd>
 <dt>Método</dt><dd>Para cada nível, calcula-se a interseção dos conjuntos de nomes distintos ITS e campo, antes e depois de conciliar nomes aceitos e sinônimos. Este painel utiliza exclusivamente Escala = Regional e a coluna Comuns de cada tratamento. Diferença = WCVP v16 menos Original. Não há teste estatístico nem uso de ocorrências da literatura.</dd>
 <dt>Dados processados</dt><dd><a href={source('inputs/floristica/WCVP_v16.csv')} target="_blank" rel="noreferrer">WCVP_v16.csv (mapeamento nomenclatural)</a> · {summary?<a href={summary} target="_blank" rel="noreferrer">Concordancia_resumo.csv</a>:<span>Concordancia_resumo.csv (resumo incorporado ao manifesto; arquivo separado não disponibilizado)</span>} · {taxa?<a href={taxa} target="_blank" rel="noreferrer">Concordancia_taxons.csv</a>:<span>Concordancia_taxons.csv (arquivo separado não disponibilizado)</span>}.</dd>
 <dt>Resultado / output</dt><dd>{type==='chart'?'Gráfico comparativo dos seis valores regionais da entrega ativa.':'Tabela comparativa de família, gênero e espécie, exportável em CSV.'} Ambos são projeções do mesmo resumo científico, não uma nova inferência.</dd>
 <dt>Scripts</dt><dd><a href={source('publication/floristica/harmonizar.py')} target="_blank" rel="noreferrer">harmonizar.py</a> · <a href={source('publication/floristica/comparar.py')} target="_blank" rel="noreferrer">comparar.py</a> · <a href="https://github.com/mattoslmp/serradorabo.biologicaldiversity/blob/main/lib/atlasReview.mjs" target="_blank" rel="noreferrer">extração do resumo (atlasReview.mjs)</a> · <a href="https://github.com/mattoslmp/serradorabo.biologicaldiversity/blob/main/app/RegionalOverlap.js" target="_blank" rel="noreferrer">RegionalOverlap.js (visualização)</a>.</dd>
 </dl>
 <p><b>Comando de reprodução científica:</b></p><pre><code>{REPRO}</code></pre><p><a href="https://github.com/mattoslmp/ITV-rel1-2026/blob/main/README.md" target="_blank" rel="noreferrer">README: entradas, instalação, parâmetros, validação e publicação</a>. Para reproduzir este painel, abra Inventário florístico na entrega gerada; não se deve somar os valores entre níveis taxonômicos nem entre platôs.</p>
 </div>;
}
export default function RegionalOverlap({comparison}){
 const rows=regionalOverlap(comparison);
 const maximum=Math.max(1,...rows.flatMap(r=>[r.Original??0,r.WCVP_v16??0]));
 const save=()=>{const csv=['Nivel,Original,WCVP_v16,Diferenca',...rows.map(r=>[r.Nivel,r.Original??'',r.WCVP_v16??'',r.Diferenca??''].join(','))].join('\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='taxons_compartilhados_original_wcvp_v16.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <section className="regional-overlap" data-testid="regional-overlap">
 <h3>{TITLE}</h3>
 <p className="small muted">Comparação regional de toda a Serra do Rabo — os dois tratamentos simultaneamente. Este resumo não é alterado pelos filtros de platô, área, campanha ou táxon.</p>
 <div className="overlap-chart" role="group" aria-label="Gráfico de táxons compartilhados: Original e WCVP v16" data-testid="overlap-chart">
 <div className="legend overlap-legend"><span><i className="overlap-swatch-original"/>Original</span><span><i className="overlap-swatch-wcvp"/>WCVP v16</span></div>
 <p className="small">Número de táxons distintos compartilhados</p>
 {rows.map(r=><div key={r.Nivel} className="overlap-pair"><b>{r.Nivel==='Família'?'Famílias':r.Nivel==='Gênero'?'Gêneros':'Espécies'}</b>{[['Original',r.Original,'original'],['WCVP v16',r.WCVP_v16,'wcvp']].map(([label,n,key])=><div key={key} className="overlap-bar-row" data-level={r.Nivel} data-treatment={label} aria-label={r.Nivel+' — '+label+': '+fmt(n)}><div className="overlap-track"><div className={'overlap-bar '+key} style={{width:((n??0)/maximum*100)+'%'}}/></div><strong className="overlap-count">{fmt(n)}</strong></div>)}</div>)}
 <div className="overlap-axis" aria-hidden="true"><span>0</span><span>{maximum}</span></div>
 </div>
 <div data-testid="overlap-chart-explanation"><Definition rows={rows}/><Provenance type="chart"/></div>
 <h4>Comparação numérica — Original e WCVP v16</h4>
 <div className="scrolltable"><table className="overlap-table" data-testid="overlap-table"><caption>Táxons compartilhados por nível taxonômico (escala regional)</caption><thead><tr><th scope="col">Nível taxonômico</th><th scope="col">Original</th><th scope="col">WCVP v16</th><th scope="col">Diferença</th></tr></thead><tbody>{rows.map(r=><tr key={r.Nivel}><th scope="row">{r.Nivel}</th><td>{fmt(r.Original)}</td><td>{fmt(r.WCVP_v16)}</td><td>{delta(r.Diferenca)}</td></tr>)}</tbody></table></div>
 <div data-testid="overlap-table-explanation"><p><b>Significado das colunas:</b> Nível taxonômico = família, gênero ou espécie; Original = quantidade compartilhada antes da conciliação; WCVP v16 = quantidade compartilhada após conciliar nomes; Diferença = segundo valor menos o primeiro. Os três níveis são hierárquicos e não devem ser somados.</p><Definition rows={rows}/><Provenance type="table"/></div>
 <button type="button" onClick={save} disabled={rows.every(r=>r.Original===null&&r.WCVP_v16===null)}>↓ Exportar CSV da comparação</button>
 </section>;
}
