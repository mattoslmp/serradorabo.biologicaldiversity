'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {BASE,fileURL} from '../lib/client';
import {groupLocations,colorSegments} from '../lib/mapGeometry.mjs';
import {BrazilLocator} from './MapOverview';

export default function GeoMap({rows,palettes,satellite,outline}){
 const ref=useRef(),mapRef=useRef(),boundsRef=useRef();
 const sites=useMemo(()=>groupLocations(rows),[rows]);
 const [field,Field]=useState('Estacao'),[basemap,Base]=useState('Satélite'),[error,ErrorText]=useState('');
 const focus=()=>{const map=mapRef.current;if(map&&boundsRef.current){map.invalidateSize();map.fitBounds(boundsRef.current.pad(.1),{maxZoom:16});}};
 useEffect(()=>{
  let live=true,map,resize;const abort=new AbortController();ErrorText('');boundsRef.current=null;
  import('leaflet').then(module=>{
   if(!live)return;const L=module.default;map=L.map(ref.current,{zoomSnap:.25});mapRef.current=map;
   map.createPane('satellite').style.zIndex='250';map.createPane('boundaries').style.zIndex='350';map.createPane('sampling').style.zIndex='610';
   L.control.scale({imperial:false}).addTo(map);
   if(basemap==='Satélite'&&satellite?.extent_wgs84){const [w,e,s,n]=satellite.extent_wgs84,url=fileURL(satellite.path);
    if(url)L.imageOverlay(url,[[s,w],[n,e]],{pane:'satellite',attribution:'Imagem © Esri e licenciadores; acesso 05/11/2026'}).on('error',()=>{if(live)ErrorText('A imagem não carregou. Os pontos permanecem disponíveis; recarregue a página para renovar o acesso à imagem.');}).addTo(map);
    else ErrorText('Imagem indisponível. Os pontos da planilha continuam disponíveis.');
   }
   if(basemap==='Ruas')L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
   if(basemap==='Satélite ao vivo')L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri — World Imagery'}).addTo(map);
   for(const site of sites){
    const sectors=colorSegments(site,field,palettes[field]),icon=document.createElement('span');icon.className='sample-location-symbol';
    icon.style.background=sectors.length===1?sectors[0].color:`conic-gradient(${sectors.map(s=>`${s.color} ${s.start*100}% ${s.end*100}%`).join(',')})`;
    const count=document.createElement('span');count.className='sample-location-count';count.textContent=String(site.rows.length);icon.appendChild(count);
    const ids=[...new Set(site.rows.map(r=>r.New_Field_ID))],title=`${site.rows.length} bibliotecas: ${ids.join(', ')}`;
    const content=document.createElement('section');content.className='sampling-popup';const heading=document.createElement('strong');heading.textContent=title;content.appendChild(heading);
    const position=document.createElement('p');position.textContent=`Latitude ${site.lat.toFixed(6)} · Longitude ${site.lon.toFixed(6)}`;content.appendChild(position);
    for(const row of site.rows){const p=document.createElement('p');p.textContent=[row.Sample_ID,row.New_Field_ID,row.Estacao,row.Sample_Area,row.Geoambiente].filter(Boolean).join(' · ');content.appendChild(p);}
    const marker=L.marker([site.lat,site.lon],{pane:'sampling',icon:L.divIcon({html:icon,className:'sampling-marker',iconSize:[30,30],iconAnchor:[15,15]}),title,alt:title,keyboard:true}).bindPopup(content,{maxWidth:380}).addTo(map);
    const tooltip=document.createElement('span');tooltip.textContent=title;marker.bindTooltip(tooltip);
   }
   if(sites.length){boundsRef.current=L.latLngBounds(sites.map(s=>[s.lat,s.lon]));map.fitBounds(boundsRef.current.pad(.1),{maxZoom:16});}
   else if(satellite?.extent_wgs84){const [w,e,s,n]=satellite.extent_wgs84;map.fitBounds([[s,w],[n,e]]);}
   else map.setView([-14,-52],4);
   resize=new ResizeObserver(()=>{if(live)map.invalidateSize({pan:false});});resize.observe(ref.current);
   // Municipal data failure cannot prevent sample-marker rendering.
   fetch(BASE+'/basemap-para.geojson',{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('Limites municipais indisponíveis. Pontos e satélite preservados.');return r.json();}).then(geo=>{if(live)L.geoJSON(geo,{pane:'boundaries',style:{color:'#587365',weight:1,fillColor:'#dce8d3',fillOpacity:basemap==='IBGE'?.65:0},attribution:'Limites municipais © IBGE'}).addTo(map);}).catch(e=>{if(live&&e.name!=='AbortError')ErrorText(e.message);});
  }).catch(e=>{if(live)ErrorText(e.message);});
  return()=>{live=false;abort.abort();resize?.disconnect();map?.remove();mapRef.current=null;};
 },[sites,palettes,field,basemap,satellite]);
 return <><div className="controls"><label>Base geográfica<select value={basemap} onChange={e=>Base(e.target.value)}><option value="IBGE">Municípios do Pará · IBGE</option><option value="Ruas">Ruas · OpenStreetMap (externo)</option><option value="Satélite">Satélite · imagem da entrega</option><option value="Satélite ao vivo">Satélite · Esri ao vivo</option></select></label><label>Colorir por<select value={field} onChange={e=>Field(e.target.value)}><option value="Estacao">Campanha</option><option value="Sample_Area">Área amostral</option><option value="Geoambiente">Geofácies</option></select></label><button onClick={focus}>Enquadrar amostras</button></div>
 <p className="map-count" role="status">{sites.length} posições no mapa · {sites.reduce((n,s)=>n+s.rows.length,0)} bibliotecas com coordenadas</p>
 {error&&<p role="alert">{error}</p>}
 <div className="map-context"><BrazilLocator rows={rows} outline={outline} satellite={satellite} onFocus={focus}/><div className="map-connector" aria-hidden="true">→</div><div className="local-map"><h3>Serra do Rabo · locais de coleta</h3><div className="map" ref={ref} role="region" aria-label="Mapa interativo dos locais de coleta"/></div></div>
 <p className="small muted">O número em cada ponto indica as bibliotecas na mesma coordenada. As cores representam {field==='Estacao'?'as campanhas':field==='Sample_Area'?'as áreas':'os geoambientes'}; clique para consultar todos os registros. Nenhum ponto foi deslocado. Coordenadas da planilha final.</p>
 {!sites.length&&<p role="status">Nenhuma coordenada válida para os filtros selecionados.</p>}
 <div className="legend">{Object.entries(palettes[field]||{}).filter(([key])=>sites.some(s=>s.rows.some(r=>r[field]===key))).map(([key,color])=><span key={key}><i style={{background:color}}/>{key}</span>)}</div>
 <p className="small muted">Imagem real da região de coleta. Aquisição não informada pelo provedor; acesso em 05/11/2026. Ruas e satélite ao vivo consultam provedores externos.</p></>;
}
