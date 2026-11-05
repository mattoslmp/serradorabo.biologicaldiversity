import assert from 'node:assert/strict';
import {presenceMatrix,presenceCSV} from '../lib/presence.mjs';
const raw={taxa:['A','rare','never'],units:['a','b','c'],counts:[[1000,0,0],[0,1,0],[3,0,0]]};
const meta=[{New_Field_ID:'a',Estacao:'Seca',Sample_Area:'X'},{New_Field_ID:'b',Estacao:'Seca',Sample_Area:'X'},{New_Field_ID:'c',Estacao:'Chuvosa',Sample_Area:'X'}];
const all=presenceMatrix(raw,meta);assert.equal(all.rows.length,2);assert.equal(all.rows[1].occupied,1);assert.equal(all.units,3);
const grouped=presenceMatrix(raw,meta,{view:'Sample_Area'});assert.deepEqual(grouped.keys,['Chuvosa | X','Seca | X']);assert.deepEqual(grouped.rows.find(r=>r.name==='rare').cells.map(c=>c.value),[0,1]);assert.equal(grouped.rows[1].cells[1].total,2);
assert.equal(presenceMatrix(raw,[meta[0]]).rows.length,1);assert.equal(presenceMatrix(raw,[],{}).rows.length,0);assert.equal(presenceMatrix(raw,meta,{minUnits:2}).rows.length,1);assert.ok(presenceCSV(grouped).includes('"rare",0,1')||presenceCSV(grouped).includes('"rare","0","1"'));
console.log('Presence/absence: complete taxa, rare detections, season groups, filters and CSV verified.');
