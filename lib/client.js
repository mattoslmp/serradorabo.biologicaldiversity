'use client';
import {createClient} from '@supabase/supabase-js';
import config from './project.json';
export const BASE=process.env.NEXT_PUBLIC_BASE_PATH||'';
let client,activeRelease=config.release;
export function supabase(){if(!client)client=createClient(config.supabaseUrl,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});return client;}
export async function member(){const s=supabase();const {data,error}=await s.auth.getUser();if(error||!data.user||data.user.is_anonymous)return false;const r=await s.from('atlas_members').select('user_id').eq('user_id',data.user.id).eq('enabled',true).maybeSingle();return !r.error&&Boolean(r.data);}
export async function signIn(user,password){if(user!==config.username)throw Error('Usuário ou senha inválidos.');const {error}=await supabase().auth.signInWithPassword({email:config.loginEmail,password});if(error||!await member()){await supabase().auth.signOut({scope:'local'});throw Error('Usuário ou senha inválidos.');}}
export async function signOut(){urls={};await supabase().auth.signOut({scope:'local'});location.assign(BASE+'/login/');}
function safe(path){if(!path||path.includes('\\')||path.split('/').some(x=>!x||x==='.'||x==='..'||x.startsWith('.')))throw Error('Caminho inválido');return activeRelease+'/'+path;}
export async function privateBlob(path){const {data,error}=await supabase().storage.from(config.bucket).download(safe(path));if(error)throw Error('Arquivo privado indisponível: '+path);return data;}
let urls={};
export const fileURL=path=>urls[path];
export async function loadAtlas(){
 if(!await member()){location.assign(BASE+'/login/');throw Error('Sessão encerrada.');}
 const pointer=await supabase().storage.from(config.bucket).download('current.json');
 if(pointer.error)throw Error('A entrega R4 ainda não foi ativada.');
 const current=JSON.parse(await pointer.data.text());
 if(!current.validated||!/^r4-[a-zA-Z0-9_-]+$/.test(current.release))throw Error('Manifesto de publicação inválido.');
 activeRelease=current.release;
 const data=JSON.parse(await (await privateBlob('atlas_data.json')).text());
 const paths=new Set(['manifest.json','publication.json','SHA256SUMS.txt','RELATORIO_ITV_PUBLICACAO.docx','phylogeny/provenance.json','phylogeny/alignment_before_trim.fasta','phylogeny/alignment_trimmed.fasta','phylogeny/tree_original_ids.nwk','phylogeny/tree_untrimmed_original_ids.nwk']);
 for(const f of data.manifest.figures){Object.values(f.files).forEach(p=>paths.add(p));if(f.readme)paths.add(f.readme);}
 for(const f of data.manifest.atlas_heatmaps||[]){Object.values(f.files).forEach(p=>paths.add(p));if(f.readme)paths.add(f.readme);}
 for(const t of data.manifest.tables)paths.add('tables/'+t.name);
 const list=[...paths];const signed=await supabase().storage.from(config.bucket).createSignedUrls(list.map(safe),300);
 if(signed.error)throw Error('Falha ao autorizar os arquivos privados.');
 const fresh={};signed.data.forEach((r,i)=>{if(!r.error&&r.signedUrl)fresh[list[i]]=r.signedUrl;});urls=fresh;
 return data;
}
export async function uploadSource(file){
 if(!await member())throw Error('Acesso negado.');
 if(!file||!file.name.endsWith('.zip')||file.size>50*1024*1024)throw Error('Selecione o ZIP de resultados R3, com até 50 MB.');
 const {error}=await supabase().storage.from(config.bucket).upload('incoming/ITV_RESULTADOS_COMPLETOS_R3_20261105.zip',file,{contentType:'application/zip',upsert:false});
 if(error)throw Error('Não foi possível enviar: '+error.message);
}

export async function loadMapMetadata(){if(!await member())throw Error('Acesso negado.');const {data,error}=await supabase().storage.from(config.bucket).download('map_metadata.json');if(error)throw Error('Metadados geográficos indisponíveis.');const obj=JSON.parse(await data.text());const links=await supabase().storage.from(config.bucket).createSignedUrls(['map/Figura01_Amostragem.png','map/Figura01_Amostragem.pdf'],300);obj.map_files=links.error?[]:links.data.map((x,i)=>({format:i?'PDF':'PNG',url:x.signedUrl})).filter(x=>x.url);return obj;}
