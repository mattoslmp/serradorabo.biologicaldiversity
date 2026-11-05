import {readdir,readFile} from 'node:fs/promises';import path from 'node:path';
async function walk(dir){let r=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())r.push(...await walk(p));else r.push(p)}return r}
const files=await walk('out');const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;

for(const p of files){
 if(/atlas_data|server-data|\.env|\.rds$|\.fasta$|\.csv$/i.test(p))throw Error('Private science asset in static export: '+p);
 const b=await readFile(p),text=b.toString('utf8');
 if((secret&&b.includes(Buffer.from(secret)))||/sb_secret_[a-zA-Z0-9_-]{20,}/.test(text))throw Error('Privileged credential in static export: '+p);
 if(/MG00924_26|TC03_FLO_SS|ASV_000001/.test(text))throw Error('Scientific sample data in static export: '+p);
 for(const token of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]){
   let role;try{role=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).role}catch{}
   if(role==='service_role')throw Error('Service JWT in static export: '+p);
 }
}
if(!files.includes('out/index.html')||!files.includes('out/login/index.html')||!files.includes('out/basemap-para.geojson'))throw Error('Static route or basemap missing');
console.log('PASS: static routes/geography present; actual privileged key, service JWTs and scientific assets absent.');
