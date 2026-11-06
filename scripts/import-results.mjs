// Uso administrativo LOCAL: nunca mover service-role para o browser ou commits.
import {createClient} from '@supabase/supabase-js';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const arg=process.argv.slice(2),dry=arg.includes('--dry-run');
const dir=arg.find(x=>!x.startsWith('--'));
if(!dir)throw Error('Use: node scripts/import-results.mjs /CAMINHO/ITV_ENTREGA_FINAL [--dry-run]');
const root=path.resolve(dir);
const manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));
if(manifest.status!=='VALIDADA'||manifest.figures?.length!==13)
  throw Error('Publicação inválida: 13 figuras principais e status VALIDADA são obrigatórios.');
for(const id of ['Atlas_Heatmap_Family_Abundancia','Atlas_Heatmap_Family_Presenca_Ausencia'])
  if(!manifest.atlas_heatmaps?.some(x=>x.id===id))throw Error('Heatmap obrigatório ausente: '+id);
const required=['atlas_data.json','manifest.json','README_EXECUCAO.md','RELATORIO_ITV_PUBLICACAO.docx','SHA256SUMS.txt',
  ...manifest.figures.flatMap(x=>Object.values(x.files)),
  ...manifest.atlas_heatmaps.flatMap(x=>Object.values(x.files))];
for(const rel of required){
  if(typeof rel!=='string'||rel.startsWith('/')||rel.includes('\\')||rel.split('/').some(s=>!s||s==='.'||s==='..'))
    throw Error('Caminho inseguro no manifesto: '+rel);
  const info=await stat(path.join(root,rel)).catch(()=>null);
  if(!info?.isFile()||info.size<50)throw Error('Arquivo obrigatório ausente/inválido: '+rel);
}
const checks=(await readFile(path.join(root,'SHA256SUMS.txt'),'utf8')).trim().split(/\r?\n/);
for(const line of checks){
  const m=line.match(/^([a-f0-9]{64})  (.+)$/);
  if(!m)throw Error('Linha inválida no SHA256SUMS.txt');
  const candidate=path.resolve(root,m[2]);
  if(candidate!==root&&!candidate.startsWith(root+path.sep))throw Error('Caminho inseguro no SHA256SUMS.txt');
  if(createHash('sha256').update(await readFile(candidate)).digest('hex')!==m[1])
     throw Error('Checksum divergente: '+m[2]);
}
async function walk(d){
  let out=[];
  for(const entry of await readdir(d,{withFileTypes:true})){
    if(entry.name.startsWith('.')||['processing','node_modules'].includes(entry.name))continue;
    const p=path.join(d,entry.name);
    if(entry.isDirectory())out.push(...await walk(p));
    else if(entry.isFile())out.push(p);
  }
  return out;
}
const paths=await walk(root);
console.log('VALIDACAO_LOCAL_OK: figuras=13, heatmaps_de_familia=2, arquivos='+paths.length);
if(dry){console.log('DRY_RUN_OK: nada enviado');process.exit(0)}
const release=process.env.ATLAS_RELEASE;
if(!/^r5-[A-Za-z0-9_-]{6,80}$/.test(release||''))
  throw Error('Informe ATLAS_RELEASE com nome único: r5-20261106-local-01');
const cfg=JSON.parse(await readFile(new URL('../lib/project.json',import.meta.url),'utf8'));
if(process.env.SUPABASE_URL!==cfg.supabaseUrl)throw Error('SUPABASE_URL diferente do projeto configurado');
if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw Error('Falta SUPABASE_SERVICE_ROLE_KEY no ambiente privado');
const api=createClient(cfg.supabaseUrl,process.env.SUPABASE_SERVICE_ROLE_KEY,
 {auth:{persistSession:false,autoRefreshToken:false}});
const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.zip':'application/zip',
 '.json':'application/json','.csv':'text/csv','.md':'text/markdown','.pdf':'application/pdf',
 '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.html':'text/html',
 '.js':'text/javascript','.css':'text/css'};
for(let i=0;i<paths.length;i++){
  const file=paths[i],rel=path.relative(root,file).split(path.sep).join('/'),key=release+'/'+rel,bytes=await readFile(file);
  const {error}=await api.storage.from(cfg.bucket).upload(key,bytes,
    {upsert:false,contentType:mime[path.extname(file)]||'application/octet-stream',cacheControl:'0'});
  if(error){
    const {data:previous,error:readError}=await api.storage.from(cfg.bucket).download(key);
    if(readError||!previous)throw Error('Upload falhou: '+rel+' — '+error.message);
    const old=Buffer.from(await previous.arrayBuffer());
    if(createHash('sha256').update(old).digest('hex')!==createHash('sha256').update(bytes).digest('hex'))
      throw Error('Arquivo remoto com mesmo nome e checksum diferente: '+rel);
  }
  console.log('ENVIADO/VALIDADO '+(i+1)+'/'+paths.length+' '+rel);
}
const pointer=JSON.stringify({release,validated:true,renderer:manifest.figure_renderer_revision,uploadedAt:new Date().toISOString()});
const {error}=await api.storage.from(cfg.bucket).upload('current.json',pointer,
 {upsert:true,contentType:'application/json',cacheControl:'0'});
if(error)throw Error('Arquivos enviados, mas ponteiro não atualizado: '+error.message);
console.log('ATLAS_PRIVADO_ATUALIZADO='+release);