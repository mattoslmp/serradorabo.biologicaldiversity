'use client';
import {Localized} from '../Language';
import {useEffect,useState} from 'react';
import {BASE,supabase} from '../../lib/client';
import {isPublicationAdmin} from '../../lib/publication';

export default function AdminPage(){
  const [authorized,A]=useState(false),[loading,L]=useState(true),
    [status,S]=useState(''),[setting,G]=useState(null),[releases,R]=useState([]),
    [selected,Select]=useState(''),[busy,B]=useState(false);
  async function reload(){
    const db=supabase();
    const [publication,approved]=await Promise.all([
      db.from('atlas_publication').select('public_enabled,release').eq('singleton',true).single(),
      db.from('atlas_public_releases').select('release').eq('approved',true).order('release',{ascending:false})
    ]);
    if(publication.error)throw publication.error;
    if(approved.error)throw approved.error;
    G(publication.data);
    R(approved.data||[]);
    Select(publication.data.release||approved.data?.[0]?.release||'');
  }
  useEffect(()=>{
    let alive=true;
    (async()=>{
      try{
        if(!await isPublicationAdmin())throw Error('Acesso exclusivo do administrador. Entre com a conta autorizada.');
        if(alive)A(true);
        await reload();
      }catch(e){if(alive)S(e.message);}
      finally{if(alive)L(false);}
    })();
    return ()=>{alive=false;};
  },[]);
  async function change(enabled){
    if(!authorized||busy)return;
    if(enabled&&!selected){S('Nenhuma entrega pública revisada foi aprovada. A área privada permanece protegida.');return;}
    if(enabled&&!window.confirm('Publicar somente a entrega previamente aprovada para acesso sem login?'))return;
    B(true);S('');
    try{
      const db=supabase();
      const row={public_enabled:enabled,release:enabled?selected:setting?.release||null};
      const {data,error}=await db.from('atlas_publication')
        .update(row).eq('singleton',true).select('public_enabled,release').single();
      if(error||!data)throw error||Error('Atualização não autorizada.');
      await reload();
      S(data.public_enabled?'Publicação pública habilitada para a entrega aprovada.':'Acesso público desativado; área privada preservada.');
    }catch(e){S(e.message||'Não foi possível alterar a publicação.');}
    finally{B(false);}
  }
  return <Localized><main className="canga-login admin-workspace">
    <header className="canga-login-header"><h1>Serra do Rabo · Administração</h1></header>
    <section className="panel">
      <a href={BASE+'/'}>← Voltar ao atlas</a>
      <h2>Publicação pública</h2>
      {loading?<p>Validando autorização…</p>:authorized?<>
        <p>Esta configuração não altera a autenticação administrativa e não libera o armazenamento científico privado.</p>
        <p><b>Situação:</b> {setting?.public_enabled?'Público (somente conteúdo aprovado)':'Privado (login obrigatório)'}</p>
        <label>Entrega pública previamente aprovada
          <select value={selected} onChange={e=>Select(e.target.value)} disabled={!releases.length||busy}>
            {!releases.length?<option value="">Nenhuma publicação aprovada</option>:releases.map(r=><option key={r.release} value={r.release}>{r.release}</option>)}
          </select>
        </label>
        <p className="small">Uma entrega somente é aprovada depois da revisão de dados sensíveis, imagens e arquivos publicados. Esta página não aprova automaticamente dados científicos.</p>
        <div className="controls">
          <button className="primary" disabled={busy||!releases.length||setting?.public_enabled}
            onClick={()=>change(true)}>Abrir atlas ao público</button>
          <button disabled={busy||!setting?.public_enabled}
            onClick={()=>change(false)}>Voltar ao acesso privado</button>
        </div>
      </>:<p role="alert">Acesso não autorizado. {status}</p>}
      {authorized&&status&&<p role="status">{status}</p>}
    </section>
  </main></Localized>;
}
