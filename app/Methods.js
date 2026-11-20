'use client';
import {useEffect,useState} from 'react';
import {fileURL,privateBlob} from '../lib/client';
import currentMethods from '../lib/methods.json';

export function Methods({data}){
 const content=currentMethods;
 return <><p>Procedimentos executados nesta entrega. Os arquivos completos registram parâmetros, exclusões e unidades efetivamente usadas.</p>
 <div className="method-grid">{(content.methods||[]).map((m,i)=><article className="method-card" key={m.title}><span className="eyebrow">{String(i+1).padStart(2,'0')}</span><h3>{m.title}</h3><p>{m.description}</p><details><summary>Código correspondente</summary><code>{m.code}</code></details></article>)}</div>
 <h2>Referências metodológicas</h2><ol className="references">{(content.references||[]).map(r=><li key={r.url}><b>{r.method}</b><p>{r.citation} <a href={r.url} target="_blank" rel="noreferrer">Fonte original ↗</a></p></li>)}</ol>
 <h2>Estudos de Serra do Rabo e Bocaina</h2><ol className="references">{(data.local_literature?.sources||[]).map(r=><li key={r.url}>{r.citation} <a href={r.url} target="_blank" rel="noreferrer">Artigo ↗</a></li>)}</ol></>;
}

export function CodeGuide({data}){
 const files=data.code_catalog||[];const [selected,Select]=useState('README.md'),[text,Text]=useState(''),[error,ErrorText]=useState('');
 useEffect(()=>{let alive=true;Text('');ErrorText('');privateBlob('code/'+selected).then(b=>b.text()).then(t=>{if(alive)Text(t)}).catch(e=>{if(alive)ErrorText(e.message)});return()=>{alive=false}},[selected]);
 return <><p>Programa completo da versão final, com o cadastro atualizado, entradas PIMBA, scripts de análise, figuras e aplicação React/Next.js. A execução cria um novo diretório de resultados e preserva as entregas anteriores.</p>
 <div className="controls"><a className="download-primary" href="https://github.com/mattoslmp/ITV-rel1-2026" target="_blank" rel="noreferrer">Código científico e pacote completo</a><a href="https://github.com/mattoslmp/ITV-rel1-2026/blob/main/README.md" target="_blank" rel="noreferrer">Reprodução e publicação no Ubuntu</a></div>
 <div className="execution-steps"><article><b>1 · Extrair</b><p>Extraia o ZIP e abra um terminal na pasta scientific/.</p></article><article><b>2 · Conferir o ambiente</b><pre>python -m pip install -r publication/requirements.txt</pre><p>Use um ambiente virtual com Python 3.12.</p></article><article><b>3 · Executar</b><pre>bash scripts/reproduzir_sazonal.sh ../Serra_do_Rabo_sazonal</pre><p>O README também descreve a reanálise em R e a publicação autenticada com --publicar.</p></article></div>
 <label className="source-select">Código usado nesta versão<select value={selected} onChange={e=>Select(e.target.value)}>{files.map(f=><option key={f.path} value={f.path}>{f.path}</option>)}</select></label>
 {error?<p role="alert">{error}</p>:<pre className="source-code"><code>{text||'Carregando código…'}</code></pre>}
 <p className="small muted">Arquivos exibidos pertencem à entrega autenticada. O ZIP contém todas as fontes e dependências declaradas; senhas e chaves administrativas não fazem parte do programa.</p></>;
}
