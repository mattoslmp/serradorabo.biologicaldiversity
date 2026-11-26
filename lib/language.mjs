import dictionary from './english.json' with {type:'json'};

const phrases=Object.keys(dictionary).filter(k=>k.length>1).sort((a,b)=>b.length-a.length);
const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const words=new RegExp('(?<![\\p{L}\\p{N}_])(?:'+phrases.map(escaped).join('|')+')(?![\\p{L}\\p{N}_])','gu');
export function translate(value){
 if(typeof value!=='string'||!value.trim()||/^(?:https?:|mailto:)|^[\w./-]+\.(csv|json|js|xlsx|py|nwk|pdf|png|md|zip)$/i.test(value))return value;
 const key=value.trim().replace(/\s+/g,' ');
 if(Object.hasOwn(dictionary,key))return value.replace(value.trim(),()=>dictionary[key]);
 return value.replace(words,match=>dictionary[match]);
}
// Plotly receives localized display fields. Numerical arrays and scientific IDs retain their types.
export function plotLanguage(object){
 if(Array.isArray(object))return object.map(plotLanguage);
 if(!object||typeof object!=='object')return object;
 const out={...object};
 const format=x=>Array.isArray(x)?x.map(format):translate(x);
 for(const [key,value] of Object.entries(object)){
  if(['name','text','ticktext','hovertemplate','customdata','x','y','labels'].includes(key))out[key]=format(value);
  else if(value&&typeof value==='object'&&!ArrayBuffer.isView(value))out[key]=plotLanguage(value);
 }
 return out;
}
