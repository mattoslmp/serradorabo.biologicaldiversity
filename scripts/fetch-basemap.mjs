// Publish the audited, versioned public geography without a build-time API dependency.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const geo=JSON.parse(await readFile('assets/para_municipal.geojson','utf8'));
if(geo.type!=='FeatureCollection'||geo.features.length!==143)throw Error('Versioned IBGE/Geodata BR basemap is incomplete');
if(!geo.features.some(f=>f.properties.name==='Canaã dos Carajás'))throw Error('Study region absent');
await mkdir('public',{recursive:true});await writeFile('public/basemap-para.geojson',JSON.stringify(geo));await writeFile('public/.nojekyll','');
console.log('Validated IBGE/Geodata BR geography:',geo.features.length,'municipalities; source version',geo.source_date);
