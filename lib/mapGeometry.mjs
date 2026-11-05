// Coordinates come from the final workbook export. Never invent or jitter locations.
export function coordinate(value,min,max){
 if(value===null||value===undefined||typeof value==='boolean'||String(value).trim()==='')return null;
 const n=Number(value);return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}
export function groupLocations(rows=[]){
 const groups=new Map();
 for(const row of rows){const lat=coordinate(row.Latitude,-90,90),lon=coordinate(row.Longitude,-180,180);if(lat===null||lon===null)continue;
  const key=`${lat}|${lon}`;if(!groups.has(key))groups.set(key,{key,lat,lon,rows:[]});groups.get(key).rows.push(row);
 }
 return [...groups.values()];
}
export function colorSegments(site,field,palette={}){
 const values=new Map();for(const row of site.rows){const value=String(row[field]??'Não informado');values.set(value,(values.get(value)||0)+1);}
 let position=0;return [...values.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([value,count])=>{const start=position;position+=count/site.rows.length;return {value,count,start,end:position,color:/^#[0-9a-f]{6}$/i.test(palette[value]||'')?palette[value]:'#687d76'};});
}
export const mercatorY=lat=>Math.log(Math.tan(Math.PI/4+Math.max(-85.051129,Math.min(85.051129,lat))*Math.PI/360));
export function satelliteProjection(extent,frame){
 const [west,east,south,north]=extent;const x0=west*Math.PI/180,x1=east*Math.PI/180,y0=mercatorY(south),y1=mercatorY(north);
 const scale=Math.min(frame.width/(x1-x0),frame.height/(y1-y0));const box={x:frame.x+(frame.width-(x1-x0)*scale)/2,y:frame.y+(frame.height-(y1-y0)*scale)/2,width:(x1-x0)*scale,height:(y1-y0)*scale};
 return {box,point:(lon,lat)=>[box.x+(lon*Math.PI/180-x0)*scale,box.y+(y1-mercatorY(lat))*scale]};
}
export function countryPath(outline,project){
 return (outline?.features||[]).flatMap(f=>f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates]).flatMap(p=>p.map(r=>r.map((c,i)=>`${i?'L':'M'}${project(c[0],c[1]).join(',')}`).join(' ')+'Z')).join(' ');
}
export function centerOfLocations(sites,satellite){
 if(sites.length){const lon=sites.map(s=>s.lon),lat=sites.map(s=>s.lat);return [(Math.min(...lon)+Math.max(...lon))/2,(Math.min(...lat)+Math.max(...lat))/2];}
 if(satellite?.extent_wgs84){const [w,e,s,n]=satellite.extent_wgs84;return [(w+e)/2,(s+n)/2];}return null;
}
