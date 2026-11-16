import assert from 'node:assert/strict';
import {taxonomyBars,normalizeCutoff} from '../lib/taxonCutoff.mjs';
const taxa=['Dominante','Limite','Raro1','Raro2'];
const v=taxonomyBars(taxa,{a:[93,5,1,1],b:[92,6,1,1]},1);
assert.equal(v.label,'Outros (<1%)');
assert.deepEqual(v.selected.map(t=>t.name),['Dominante','Limite','Raro1','Raro2']);
assert.deepEqual(v.other,[0,0]);
assert.equal(normalizeCutoff('auto'),1);
assert.equal(normalizeCutoff('<1%'),1);
assert.throws(()=>normalizeCutoff('<5%'));
assert.throws(()=>normalizeCutoff(5));
assert.throws(()=>normalizeCutoff(3));
assert.throws(()=>taxonomyBars(['A'],{a:[NaN]},1));
assert.equal(taxonomyBars(taxa,{},1).keys.length,0);
const group=taxonomyBars(['A','B','C','D'],{
 a:[99.35,.2,.2,.25],b:[99.4,.1,.3,.2]
},1);
assert.ok(group.other.every(x=>x<1));
for(const k of group.keys)
 assert.ok(Math.abs(group.selected.reduce((n,x)=>n+group.percentages[k][x.j],0)+group.other[group.keys.indexOf(k)]-100)<1e-8);
const mixed=taxonomyBars(['Main','Rare','Changing'],{
 a:[99.8,.1,.1],b:[89.9,.1,10]
},1);
assert.ok(mixed.selected.some(x=>x.name==='Changing'));
assert.ok(mixed.other.every(x=>x<1));
assert.equal(taxonomyBars(['A','B'],{a:[90,10],b:[100,0]},'auto').label,'Outros (<1%)');
console.log('PASS: strict residual <1% for every bar, mass closure, reproducible categories, no 5% mode.');
