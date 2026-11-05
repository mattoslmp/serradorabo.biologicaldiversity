import assert from 'node:assert/strict';
import {coordinate,groupLocations,colorSegments,satelliteProjection,centerOfLocations} from '../lib/mapGeometry.mjs';

for(const invalid of [null,undefined,'', ' ',true,false,'unknown',Infinity,91])assert.equal(coordinate(invalid,-90,90),null);
assert.equal(coordinate(0,-90,90),0);
const rows=[{Latitude:-6,Longitude:-50,Estacao:'Seca',Sample_ID:'a'},{Latitude:-6,Longitude:-50,Estacao:'Chuvosa',Sample_ID:'b'},{Latitude:-6.00001,Longitude:-50,Estacao:'Seca',Sample_ID:'c'},{Latitude:null,Longitude:-50,Sample_ID:'missing'}];
const sites=groupLocations(rows);assert.equal(sites.length,2);assert.deepEqual(sites[0].rows.map(r=>r.Sample_ID),['a','b']);assert.equal(sites[1].lat,-6.00001);assert.equal(sites.reduce((n,s)=>n+s.rows.length,0),3);
const sectors=colorSegments(sites[0],'Estacao',{Seca:'#BB5624',Chuvosa:'#087FA5'});assert.equal(sectors.length,2);assert.equal(sectors[0].start,0);assert.equal(sectors[0].end,.5);assert.equal(sectors[1].end,1);
const p=satelliteProjection([-10,10,-10,10],{x:20,y:30,width:400,height:400});
const [cx,cy]=p.point(0,0);assert.ok(Math.abs(cx-220)<1e-9&&Math.abs(cy-230)<1e-9);
const nw=p.point(-10,10),se=p.point(10,-10);assert.ok(Math.abs(nw[0]-p.box.x)<1e-9&&Math.abs(nw[1]-p.box.y)<1e-9);assert.ok(Math.abs(se[0]-p.box.x-p.box.width)<1e-9&&Math.abs(se[1]-p.box.y-p.box.height)<1e-9);
assert.deepEqual(centerOfLocations([],null),null);
console.log('PASS: missing GPS rejected; exact co-locations retained without jitter; metadata sectors preserved; satellite projection control points verified.');
