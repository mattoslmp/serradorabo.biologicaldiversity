'use client';
import {useEffect,useState} from 'react';
import {supabase,BASE} from '../../lib/client';
import config from '../../lib/project.json';
import {extractRecoveryToken} from '../../lib/recoveryLink.mjs';

export default function ResetPassword(){
  const [ready,R]=useState(false),[busy,B]=useState(false),
    [error,E]=useState(''),[notice,N]=useState('');

  useEffect(()=>{
    let alive=true;
    const auth=supabase().auth;
    auth.getSession().then(({data,error})=>{
      if(!alive)return;
      if(error)E(error.message);
      R(Boolean(data?.session));
    }).catch(e=>{if(alive)E(e.message)});
    const {data:{subscription}}=auth.onAuthStateChange((event,session)=>{
      if(alive&&(event==='PASSWORD_RECOVERY'||event==='SIGNED_IN'||event==='SIGNED_OUT'))
        R(Boolean(session));
    });
    return ()=>{alive=false;subscription.unsubscribe()};
  },[]);

  // A verified email token is redeemed directly through Supabase Auth, on this
  // trusted page. The original link is never navigated to or logged.
  async function validateEmailLink(e){
    e.preventDefault();B(true);E('');N('');
    const form=e.currentTarget;
    try{
      const input=form.elements.namedItem('recovery_url');
      const token=extractRecoveryToken(input?.value,config.supabaseUrl);
      input.value='';
      const {data,error}=await supabase().auth.verifyOtp({
        token_hash:token,type:'recovery'
      });
      if(error||!data?.session)
        throw new Error('Link expirado ou já utilizado. Solicite um novo e-mail e copie o endereço do botão sem clicar nele.');
      R(true);
      N('Link confirmado. Agora defina sua nova senha.');
    }catch(err){
      E(err.message||'Não foi possível validar o link. Solicite um novo e-mail.');
    }finally{B(false);}
  }

  async function savePassword(e){
    e.preventDefault();B(true);E('');N('');
    const form=e.currentTarget,fields=new FormData(form);
    const password=String(fields.get('password')||'');
    if(password!==fields.get('confirm')){E('As senhas não coincidem.');B(false);return;}
    if(password.length<12){E('Use uma senha com pelo menos 12 caracteres.');B(false);return;}
    try{
      const {error}=await supabase().auth.updateUser({password});
      if(error)throw error;
      form.reset();
      await supabase().auth.signOut({scope:'local'});
      R(false);
      N('Senha definida com sucesso. Entre no atlas com seu e-mail e a nova senha.');
    }catch(err){
      E(err.message||'Não foi possível salvar a senha.');
    }finally{B(false);}
  }

  return <main className="login canga-login">
    <header className="canga-login-header">
      <img src={BASE+'/brand/vale.svg'} alt="Vale" width="88" height="55"/>
      <div><h1>Serra do Rabo · Biological Diversity</h1><p>Definição de senha</p></div>
    </header>
    <section className="login-form">
      <span className="eyebrow">ACESSO RESTRITO</span>
      <h2>Definir nova senha</h2>
      {ready?
        <form onSubmit={savePassword}>
          <label>Nova senha<input name="password" type="password" autoComplete="new-password" minLength={12} required/></label>
          <label>Confirmar senha<input name="confirm" type="password" autoComplete="new-password" minLength={12} required/></label>
          <button className="primary" disabled={busy}>{busy?'Salvando…':'Salvar minha senha'}</button>
        </form>:
        <>
          <p className="small">Se o botão do e-mail abrir <strong>localhost</strong>, use a alternativa abaixo. Ela valida o link diretamente no Supabase, sem redirecionar para localhost.</p>
          <ol className="small">
            <li>Solicite um novo e-mail em “Esqueci minha senha”.</li>
            <li>No e-mail, clique com o botão direito sobre “Reset password” e selecione <strong>Copiar endereço do link</strong>. Não abra o link.</li>
            <li>Cole o endereço no campo abaixo e confirme.</li>
          </ol>
          <form onSubmit={validateEmailLink} autoComplete="off">
            <label>Endereço do link recebido por e-mail
              <input name="recovery_url" type="url" placeholder="https://…supabase.co/auth/v1/verify?…" autoComplete="off" spellCheck={false} required/>
            </label>
            <button className="primary" disabled={busy}>{busy?'Validando…':'Validar link e cadastrar senha'}</button>
          </form>
          <p className="small muted">O link é utilizado somente no seu navegador com o Supabase do projeto. Não envie esse link para outras pessoas nem o cole em conversas.</p>
        </>
      }
      {error&&<p role="alert">{error}</p>}
      {notice&&<p role="status">{notice}</p>}
      <p><a href={BASE+'/login/'}>← Voltar ao login</a></p>
    </section>
  </main>;
}
