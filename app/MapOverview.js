'use client';
import {fileURL} from '../lib/client';
import {groupLocations,colorSegments,satelliteProjection,countryPath,centerOfLocations} from '../lib/mapGeometry.mjs';

const brazilProject=(lon,lat)=>[20+(lon+75)*6.2,40+(6-lat)*6.2];
export function BrazilLocator({rows,outline,satellite,onFocus}){
 const sites=groupLocations(rows),center=centerOfLocations(sites,satellite),p=center?brazilProject(...center):null;
 return <aside className="brazil-locator"><h3>Brasil</h3><svg viewBox="0 0 300 320" role="img" aria-label="Mapa do Brasil com a localização da Serra do Rabo, no Pará"><path d={countryPath(outline,brazilProject)} fill="#e2eee5" stroke="#48756a" strokeWidth="1.3" fillRule="evenodd"/>{p&&<g><circle cx={p[0]} cy={p[1]} r="12" fill="#d45232" fillOpacity=".14"/><circle cx={p[0]} cy={p[1]} r="4.5" fill="#bd482c" stroke="white" strokeWidth="1.5"/><path d={`M${p[0]+6},${p[1]} L275,${p[1]} L275,300`} fill="none" stroke="#bd482c" strokeDasharray="4 3"/><text x="20" y="300" fontSize="14" fontWeight="700" fill="#004f4c">Serra do Rabo · Pará</text></g>}</svg><button type="button" onClick={onFocus}>Ampliar locais de coleta →</button><p>Contorno: Natural Earth. Posição calculada com os metadados finais.</p></aside>;
}

export default function MapOverview({rows,outline,satellite,palettes,onOpen}){
 const sites=groupLocations(rows);if(!satellite?.extent_wgs84)return <p>Imagem de satélite não disponível nesta entrega.</p>;
 const project=satelliteProjection(satellite.extent_wgs84,{x:385,y:45,width:395,height:410}),b=project.box;
 const center=centerOfLocations(sites,satellite),c=center?brazilProject(...center):null;
 return <figure className="sampling-overview"><button className="overview-map-button" type="button" onClick={onOpen} aria-label="Abrir mapa interativo do Brasil e dos locais de coleta"><svg viewBox="0 0 800 495" role="img" aria-label={`Brasil e imagem de satélite com ${sites.length} locais de coleta e ${sites.reduce((s,p)=>s+p.rows.length,0)} bibliotecas`}>
 <text x="25" y="26" className="map-svg-title">Brasil</text><text x="405" y="26" className="map-svg-title">Locais de coleta</text>
 <g transform="translate(15 50)"><path d={countryPath(outline,brazilProject)} fill="#e2eee5" stroke="#48756a" strokeWidth="1.5" fillRule="evenodd"/>{c&&<><circle cx={c[0]} cy={c[1]} r="7" fill="#bd482c" stroke="white" strokeWidth="2"/><text x="22" y="320" fontSize="17" fontWeight="700" fill="#004f4c">Serra do Rabo · Pará</text></>}</g>
 {c&&<path d={`M${c[0]+22},${c[1]+45} L${b.x},${b.y} M${c[0]+22},${c[1]+55} L${b.x},${b.y+b.height}`} fill="none" stroke="#007e7a" strokeWidth="1.5" strokeDasharray="6 5"/>}
 <image href={fileURL(satellite.path)} x={b.x} y={b.y} width={b.width} height={b.height} preserveAspectRatio="none"/>
 {sites.map(site=>{const [x,y]=project.point(site.lon,site.lat),segments=colorSegments(site,'Estacao',palettes.Estacao),colors=[...new Set(segments.map(s=>s.color))];return <g key={site.key} className="overview-sampling-point"><title>{[...new Set(site.rows.map(r=>r.New_Field_ID))].join(', ')} · {site.rows.length} bibliotecas</title><circle cx={x} cy={y} r="6" fill={colors[0]} stroke="white" strokeWidth="2"/>{colors.length>1&&<path d={`M${x},${y-5} A5,5 0 0 1 ${x},${y+5} Z`} fill={colors[1]}/>}</g>})}
 <text x="405" y="480" fontSize="14" fill="#34594c">{sites.length} posições · clique para explorar</text></svg></button><figcaption>Coordenadas da planilha final · pontos sem deslocamento.<br/>Satélite © Esri e licenciadores. Brasil: Natural Earth.</figcaption></figure>;
}
