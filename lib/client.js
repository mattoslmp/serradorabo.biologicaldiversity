'use client';
import {createClient} from '@supabase/supabase-js';
import config from './project.json';
export const BASE=process.env.NEXT_PUBLIC_BASE_PATH||'';
let client,activeRelease=config.release;
export function supabase(){if(!client)client=createClient(config.supabaseUrl,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client;}
export async function member(){const s=supabase();const {data,error}=await s.auth.getUser();if(error||!data.user||data.user.is_anonymous)return false;const r=await s.from('atlas_members').select('user_id').eq('user_id',data.user.id).eq('enabled',true).maybeSingle();return !r.error&&Boolean(r.data);}
export async function signIn(user,password){
 const name=String(user||'').trim().toLowerCase();
 if(!name)throw Error('Informe o usuário cadastrado ou seu e-mail.');
 let email=name;
 if(name===config.username){
   email=config.loginEmail;
 }else if(!name.includes('@')){
   if(!/^[a-z0-9][a-z0-9._-]{0,63}$/.test(name))throw Error('Informe o usuário cadastrado ou seu e-mail.');
   const domain=config.loginEmail.split('@')[1];
   email=`${name}@${domain}`;
 }
 const {error}=await supabase().auth.signInWithPassword({email,password});
 if(error||!await member()){
   await supabase().auth.signOut({scope:'local'});
   throw Error('Credenciais inválidas ou conta ainda não habilitada.');
 }
}
export function recoveryRedirect(){
 if(typeof window==='undefined')throw Error('Recuperação disponível no navegador.');
 return window.location.origin+BASE+'/reset-password/';
}
export async function sendPasswordRecovery(email){
 const address=String(email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))throw Error('Informe um e-mail válido.');
 const {error}=await supabase().auth.resetPasswordForEmail(address,{
   redirectTo:recoveryRedirect()
 });
 if(error)throw Error('Não foi possível enviar o e-mail de recuperação: '+error.message);
}

export async function signOut(){urls={};await supabase().auth.signOut({scope:'local'});location.assign(BASE+'/login/');}
function safe(path){if(!path||path.includes('\\')||path.split('/').some(x=>!x||x==='.'||x==='..'||x.startsWith('.')))throw Error('Caminho inválido');return activeRelease+'/'+path;}
export async function privateBlob(path){const {data,error}=await supabase().storage.from(config.bucket).download(safe(path));if(error)throw Error('Arquivo privado indisponível: '+path);return data;}
let urls={};
let publicRelease=null;
export function useApprovedPublicRelease(release){
  if(release!==null&&!/^public-[a-z0-9][a-z0-9_-]{2,63}$/.test(release))
    throw new Error('Identificador da publicação inválido.');
  publicRelease=release;
  urls={};
}
export function fileURL(path){
  if(publicRelease!==null){
    if(typeof path!=='string'||path.startsWith('/')||path.includes('..')||
       !/^[A-Za-z0-9._/-]+$/.test(path))
      return undefined;
    return supabase().storage.from('serradorabo-public')
      .getPublicUrl(publicRelease+'/'+path).data.publicUrl;
  }
  return urls[path];
}
export async function loadAtlas(){
 if(!await member()){location.assign(BASE+'/login/');throw Error('Sessão encerrada.');}
 const pointer=await supabase().storage.from(config.bucket).download('current.json');
 if(pointer.error)throw Error('A entrega científica ainda não foi ativada.');
 const current=JSON.parse(await pointer.data.text());
 if(!current.validated||!/^r[45]-[a-zA-Z0-9_-]+$/.test(current.release))throw Error('Manifesto de publicação inválido.');
 activeRelease=current.release;
 const data=JSON.parse(await (await privateBlob('atlas_data.json')).text());
 const paths=new Set(['maps/satellite.jpg','README_EXECUCAO.md','programa/ITV_CODIGO_COMPLETO_R5_20261105.zip','manifest.json','publication.json','SHA256SUMS.txt','RELATORIO_ITV_PUBLICACAO.docx','phylogeny/provenance.json','phylogeny/alignment_before_trim.fasta','phylogeny/alignment_trimmed.fasta','phylogeny/tree_original_ids.nwk','phylogeny/tree_untrimmed_original_ids.nwk']);
 for(const f of data.manifest.figures){Object.values(f.files).forEach(p=>paths.add(p));if(f.readme)paths.add(f.readme);}
 for(const f of data.manifest.atlas_heatmaps||[]){Object.values(f.files).forEach(p=>paths.add(p));if(f.readme)paths.add(f.readme);}
 const comparison=data.manifest.floristica;
 if(comparison){
   for(const path of [...comparison.arquivos,comparison.relatorio])paths.add(path);
   for(const figure of comparison.figuras)Object.values(figure.files).forEach(path=>paths.add(path));
 }
 for(const t of data.manifest.tables)paths.add('tables/'+t.name);
 const list=[...paths];const signed=await supabase().storage.from(config.bucket).createSignedUrls(list.map(safe),300);
 if(signed.error)throw Error('Falha ao autorizar os arquivos privados.');
 const fresh={};signed.data.forEach((r,i)=>{if(!r.error&&r.signedUrl)fresh[list[i]]=r.signedUrl;});urls=fresh;
 return data;
}
