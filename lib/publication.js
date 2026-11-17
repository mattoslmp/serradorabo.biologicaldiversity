'use client';
import {supabase} from './client';
import config from './project.json';

const RELEASE_PATTERN=/^public-[a-z0-9][a-z0-9_-]{2,63}$/;
const SAFE_PATH=/^(?!\/)(?!.*(?:^|\/)\.\.?\/)[a-zA-Z0-9._\/-]+$/;
export function validPublicRelease(release){
  return typeof release==='string'&&RELEASE_PATTERN.test(release);
}
export async function publicationStatus(){
  const {data,error}=await supabase().from('atlas_publication')
    .select('public_enabled,release').eq('singleton',true).single();
  if(error)throw error;
  if(!data.public_enabled||!validPublicRelease(data.release))
    return {enabled:false,release:null};
  const approved=await supabase().from('atlas_public_releases')
    .select('release').eq('release',data.release).eq('approved',true).maybeSingle();
  if(approved.error||!approved.data)return {enabled:false,release:null};
  return {enabled:true,release:data.release};
}
export function publicAssetURL(release,path){
  if(!validPublicRelease(release)||!SAFE_PATH.test(path)||path.split('/').some(x=>x==='.'||x==='..'||!x))
    throw new Error('Caminho de recurso público inválido.');
  return supabase().storage.from('serradorabo-public')
    .getPublicUrl(release+'/'+path).data.publicUrl;
}
export async function loadReviewedPublicAtlas(release){
  if(!validPublicRelease(release))throw new Error('Release pública inválida.');
  // Server-side approval and content validation are independent safeguards.
  const state=await publicationStatus();
  if(!state.enabled||state.release!==release)
    throw new Error('A publicação pública ainda não foi autorizada.');
  const response=await fetch(publicAssetURL(release,'atlas_data.json'),{cache:'no-store'});
  if(!response.ok)throw new Error('Os dados públicos aprovados ainda não estão disponíveis.');
  const data=await response.json();
  if(data?.manifest?.public_approved!==true||
     data?.manifest?.public_release!==release||
     !Array.isArray(data?.manifest?.figures))
    throw new Error('Manifesto de publicação pública ausente ou não validado.');
  return data;
}
export async function isPublicationAdmin(){
  const s=supabase(),{data,error}=await s.auth.getUser();
  if(error||!data.user||data.user.is_anonymous)return false;
  const m=await s.from('atlas_members').select('can_manage_publication,enabled')
    .eq('user_id',data.user.id).maybeSingle();
  return !m.error&&m.data?.enabled===true&&m.data?.can_manage_publication===true;
}
