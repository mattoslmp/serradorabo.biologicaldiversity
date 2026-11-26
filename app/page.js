'use client';
import {Localized} from './Language';
import {useState,useEffect} from 'react';
import Atlas from './Atlas';
import {member,BASE} from '../lib/client';
import {publicationStatus,loadReviewedPublicAtlas} from '../lib/publication';

export default function Page(){
  const [state,S]=useState({loading:true,mode:null,data:null,error:''});
  useEffect(()=>{
    let active=true;
    async function boot(){
      try{
        // An approved public release can be read without a session.
        const setting=await publicationStatus();
        if(setting.enabled){
          const data=await loadReviewedPublicAtlas(setting.release);
          if(active)S({loading:false,mode:'public',data,error:''});
          return;
        }
      }catch(error){
        // Fail closed: never expose private data as a fallback for public errors.
        if(active)S({loading:false,mode:'public_error',data:null,error:error.message});
        return;
      }
      try{
        if(await member()){if(active)S({loading:false,mode:'private',data:null,error:''});}
        else location.replace(BASE+'/login/');
      }catch{location.replace(BASE+'/login/');}
    }
    boot();
    return ()=>{active=false;};
  },[]);
  if(state.mode==='public_error')
    return <Localized><main className="loading"><h1>Serra do Rabo</h1>
      <p>Publicação pública temporariamente indisponível.</p>
      <p role="alert">{state.error}</p><a href={BASE+'/login/'}>Entrar na área restrita</a></main></Localized>;
  if(state.loading)return <Localized><main className="loading"><div className="brandmark">ITS</div><p>Verificando a modalidade de acesso…</p></main></Localized>;
  return <Localized><Atlas publicMode={state.mode==='public'} initialData={state.data}/></Localized>;
}
