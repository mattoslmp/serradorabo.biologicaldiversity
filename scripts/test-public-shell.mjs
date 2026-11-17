import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdtemp,symlink,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const base=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,'');
if(base&&!/^\/[a-zA-Z0-9._-]+$/.test(base))throw Error('Invalid base path');
const root=base?await mkdtemp(path.join(tmpdir(),'serradorabo-pages-')):path.resolve('out');
if(base)await symlink(path.resolve('out'),path.join(root,base.slice(1)),'dir');
const site='http://127.0.0.1:3100'+base+'/';
const server=spawn('python3',['-m','http.server','3100','--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
let browser;
try{
 for(let i=0;i<60;i++){try{if((await fetch(site)).ok)break}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:3100')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto(site);
 await page.getByRole('textbox',{name:'Usuário ou e-mail',exact:true}).waitFor();
 await page.getByRole('textbox',{name:'Senha',exact:true}).waitFor();
 await page.getByRole('button',{name:'Primeiro acesso ou esqueci minha senha'}).waitFor();
 if(new URL(page.url()).pathname!==base+'/login/')throw Error('Unauthenticated route escaped project path');
 await page.getByRole('link',{name:'O link do e-mail abre localhost? Definir senha por outro método'}).click();
 await page.getByRole('textbox',{name:'Endereço do link recebido por e-mail'}).waitFor();
 if(new URL(page.url()).pathname!==base+'/reset-password/')throw Error('Recovery page did not render in public project path');
 await page.getByRole('button',{name:'Validar link e cadastrar senha'}).waitFor();
 
 if(errors.length)throw Error(errors.join('; '));
 const geo=await fetch(site+'basemap-para.geojson');if(!geo.ok||(await geo.json()).features.length!==143)throw Error('Geography missing under project URL');
 const cfg=JSON.parse(await readFile('lib/project.json','utf8'));
 const headers={apikey:cfg.publishableKey};
 for(const route of ['object/authenticated','object/public']){
  const r=await fetch(cfg.supabaseUrl+'/storage/v1/'+route+'/'+cfg.bucket+'/current.json',{headers});
  if(r.ok)throw Error('Anonymous access to private manifest was permitted');
 }
 console.log('PASS: public login and local recovery fallback, 143 geographic boundaries, anonymous scientific storage denied.');
}finally{await browser?.close();server.kill();if(base)await rm(root,{recursive:true,force:true});}
