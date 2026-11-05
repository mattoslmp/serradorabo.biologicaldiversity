import assert from 'node:assert/strict';
import {taxonomyBars,normalizeCutoff} from '../lib/taxonCutoff.mjs';
const taxa=['Dominante','Limite','Raro1','Raro2'];
const v=taxonomyBars(taxa,{a:[93,5,1,1],b:[92,6,1,1]},5);
assert.equal(v.label,'Outros (<5%)');assert.deepEqual(v.selected.map(t=>t.name),['Dominante','Limite']);
assert.deepEqual(v.other,[2,2]);
const many=taxonomyBars(Array.from({length:20},(_,i)=>'T'+i),{a:Array(20).fill(5)},'auto');
assert.equal(many.cutoff,5);assert.equal(many.selected.length,20);assert.equal(many.other[0],0);
assert.equal(taxonomyBars(taxa,{a:[96,2,1,1]},'auto').cutoff,1);
assert.equal(normalizeCutoff('<1%'),1);assert.equal(normalizeCutoff(' <5% '),5);
assert.throws(()=>normalizeCutoff(3));assert.throws(()=>taxonomyBars(['A'],{a:[NaN]},5));
assert.equal(taxonomyBars(taxa,{},'auto').keys.length,0);
assert.deepEqual(taxonomyBars(['A','B'],{a:[92,8],b:[100,0]},5,'mean').other,[8,0]);
assert.deepEqual(taxonomyBars(['A','B'],{a:[92,8],b:[100,0]},5,'max').other,[0,0]);
for(const t of [1,5,'auto']){const r=taxonomyBars(taxa,{a:[93,5,1,1]},t);assert.equal(r.selected.reduce((n,x)=>n+r.percentages.a[x.j],0)+r.other[0],100);}
console.log('Taxonomy cutoff: strict boundary, exact mass, auto selection and invalid inputs passed.');
