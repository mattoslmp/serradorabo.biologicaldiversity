'use client';
import {useEffect,useState} from 'react';
import {supabase,BASE} from '../../lib/client';
export default function ResetPassword(){
  const [ready,R]=useState(false),[busy,B]=useState(false),[error,E]=useState(''),[notice,N]=useState('');
  useEffect(()=>{
    let alive=true;
    const auth=supabase().auth;
    auth.getSession().then(({data,error})=>{
      if(!alive)return;
      if(error)E(error.message);
      R(Boolean(data?.session));
    }).catch(e=>{if(alive)E(e.message)});
    const {data:{subscription}}=auth.onAuthStateChange((event,session)=>{
      if(alive&&(event==='PASSWORD_RECOVERY'||event==='SIGNED_IN'))R(Boolean(session));
    });
    return ()=>{alive=false;subscription.unsubscribe()};
  },[]);
  async function submit(e){
    e.preventDefault();B(true);E('');N('');
    const password=new FormData(e.currentTarget).get('password');
    if(password!==new FormData(e.currentTarget).get('confirm')){E('As senhas não coincidem.');B(false);return;}
    if(String(password).length<12){E('Use uma senha com pelo menos 12 caracteres.');B(false);return;}
    const {error}=await supabase().auth.updateUser({password});
    if(error)E(error.message);else{
      N('Senha definida com sucesso. Volte ao login e entre com seu e-mail.');
      await supabase().auth.signOut({scope:'local'});
      R(false);
    }
    B(false);
  }
  return <main className="login canga-login">
    <header className="canga-login-header"><img src={BASE+'/brand/vale.svg'} alt="Vale" width="88" height="55"/><div><h1>Serra do Rabo · Biological Diversity</h1><p>Definição de senha</p></div></header>
    <section className="login-form"><h2>Definir nova senha</h2>
      {ready?<form onSubmit={submit}>
        <label>Nova senha<input name="password" type="password" autoComplete="new-password" minLength={12} required/></label>
        <label>Confirmar senha<input name="confirm" type="password" autoComplete="new-password" minLength={12} required/></label>
        <button className="primary" disabled={busy}>{busy?'Salvando…':'Salvar minha senha'}</button>
      </form>:<p>Abra um link de recuperação válido enviado ao seu e-mail. Links anteriores que apontavam para localhost devem ser substituídos.</p>}
      {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
      <p><a href={BASE+'/login/'}>← Voltar ao login</a></p>
    </section>
  </main>;
}
