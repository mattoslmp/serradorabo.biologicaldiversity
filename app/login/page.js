'use client';
import {useState} from 'react';
import {signIn,sendPasswordRecovery,BASE} from '../../lib/client';
export default function Login(){
  const [error,E]=useState(''),[notice,N]=useState(''),[busy,B]=useState(false),[recover,R]=useState(false);
  async function submit(e){
    e.preventDefault();B(true);E('');N('');
    const f=new FormData(e.currentTarget);
    try{
      if(recover){
        await sendPasswordRecovery(f.get('email'));
        N('Solicitação enviada. Se o e-mail apontar para localhost, não clique no botão: copie o endereço do link e use a recuperação alternativa abaixo.');
      } else {
        await signIn(f.get('username'),f.get('password'));
        location.assign(BASE+'/');
      }
    }catch(err){E(err.message||'Não foi possível conectar.');}
    finally{B(false);}
  }
  return <main className="login canga-login">
    <header className="canga-login-header"><img src={BASE+'/brand/vale.svg'} alt="Vale" width="88" height="55"/><div><h1>Serra do Rabo · Biological Diversity</h1><p>Atlas de comunidades vegetais · Instituto Tecnológico Vale</p></div></header>
    <section className="login-form"><span className="eyebrow">ACESSO RESTRITO</span><h2>{recover?'Criar ou recuperar senha':'Entrar no atlas'}</h2>
      <p className="muted">Carajás · Amazônia brasileira</p>
      <form onSubmit={submit}>
        {recover?<label>E-mail cadastrado<input name="email" type="email" autoComplete="email" placeholder="seu.email@dominio.com" required/></label>:<>
          <label>Usuário ou e-mail<input name="username" autoComplete="username" required/></label>
          <label>Senha<input name="password" type="password" autoComplete="current-password" required/></label>
        </>}
        {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
        <button className="primary" disabled={busy}>{busy?'Processando…':recover?'Enviar link para definir senha':'Entrar no atlas →'}</button>
      </form>
      <button type="button" className="login-link" onClick={()=>{R(!recover);E('');N('')}}>{recover?'← Voltar ao login':'Primeiro acesso ou esqueci minha senha'}</button>
      <p className="small"><a href={BASE+'/reset-password/'}>O link do e-mail abre localhost? Definir senha por outro método</a></p><p className="small muted">Instituto Tecnológico Vale (ITV)</p>
    </section>
  </main>;
}
