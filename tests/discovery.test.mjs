import test from 'node:test';
import assert from 'node:assert/strict';
import {dimensions,preferenceQuestions,interests,careers} from '../public/discovery-data.js';
import {questionsFor,score,careerSuggestions,validRecord,recordsFor,discoveryKey} from '../public/discovery-engine.js';

test('question banks cover every scale, are unique, and balance visible preference poles',()=>{
 assert.equal(preferenceQuestions.length,32);
 for(const d of dimensions){const qs=preferenceQuestions.filter(q=>q.dimension===d.id);assert.equal(qs.length,8);assert.equal(qs.filter(q=>q.reverse).length,4);}
 for(let grade=1;grade<=10;grade++){
  const qs=questionsFor('interests',grade);assert.equal(qs.length,grade<=3?18:36);assert.equal(new Set(qs.map(q=>q.id)).size,qs.length);
  for(const d of interests)assert.equal(qs.filter(q=>q.dimension===d.id).length,grade<=3?3:6);
 }
 assert.equal(new Set(preferenceQuestions.map(q=>q.prompt)).size,32);
});
test('all 16 directional preference combinations score consistently after position reversal',()=>{
 for(let bits=0;bits<16;bits++){
  const poles=dimensions.map((d,i)=>d.id[(bits>>i)&1]);
  const answers=preferenceQuestions.map(q=>{const right=poles[dimensions.findIndex(d=>d.id===q.dimension)]===q.dimension[1];const value=right?5:1;return q.reverse?6-value:value;});
  const result=score('preferences',10,answers);assert.equal(result.code,poles.join(''));assert.ok(result.ready);
  result.scales.forEach((s,i)=>assert.equal(s.value,((bits>>i)&1)?100:0));
 }
 assert.equal(score('preferences',10,Array(32).fill(3)).code,'XXXX');
 assert.equal(score('preferences',10,Array(32).fill(1)).code,'XXXX'); // uniform visible-side bias balances out
});
test('skips are not neutral; missing data blocks profiles and career ordering',()=>{
 const answers=Array(32).fill(3);answers[0]=answers[1]=null;
 assert.equal(score('preferences',10,answers).scales[0].ready,true);
 answers[2]=null;assert.equal(score('preferences',10,answers).code,null);
 assert.equal(score('preferences',10,Array(32).fill(null)).scales[0].value,null);
 for(const grade of [1,10]){
  const qs=questionsFor('interests',grade),values=qs.map(q=>q.dimension==='R'?null:5),r=score('interests',grade,values);
  assert.equal(r.ready,false);assert.deepEqual(careerSuggestions(r),[]);
  assert.equal(r.scales[0].value,null);assert.equal(r.scales[1].value,100);
 }
});
test('interest scoring and editorial career order use interests alone',()=>{
 const qs=questionsFor('interests',8),r=score('interests',8,qs.map(q=>['R','I'].includes(q.dimension)?5:1));
 assert.equal(r.scales.find(s=>s.id==='R').mean,5);assert.equal(r.scales.find(s=>s.id==='A').mean,1);
 const suggestions=careerSuggestions(r);assert.equal(suggestions.length,24);assert.equal(suggestions[0].name,'Engineering & building');
 assert.ok(suggestions.every((c,i)=>!i||suggestions[i-1].order>=c.order));
 assert.deepEqual(careerSuggestions(score('preferences',10,Array(32).fill(3))),[]);
 const tied=score('interests',8,Array(36).fill(3));assert.ok(careerSuggestions(tied).every(c=>c.order===50));
});
test('saved records validate responses, adult self-report, learner and grade isolation',()=>{
 const base={version:1,kind:'interests',profile:1,grade:1,date:1,answers:Array(18).fill(4)};
 assert.ok(validRecord(base));
 for(const change of [{answers:Array(18).fill(undefined)},{answers:Array(18).fill(6)},{answers:[]},{grade:11},{profile:4},{kind:'unknown'},{version:2},{date:NaN}])assert.equal(validRecord({...base,...change}),false);
 const pref={...base,kind:'preferences',grade:10,answers:Array(32).fill(3)};assert.equal(validRecord(pref),false);assert.equal(validRecord({...pref,self16:true}),true);
 const records=[base,{...base,profile:2},{...base,grade:2,answers:Array(18).fill(2)},{...base,date:2}];
 assert.deepEqual(recordsFor(records,1,1).map(r=>r.date),[2,1]);
 assert.notEqual(discoveryKey(),discoveryKey('12345678-1234-1234-1234-123456789abc'));assert.throws(()=>discoveryKey('../other'));
});
test('career data offers distinct projects and only known interest tags',()=>{
 assert.equal(new Set(careers.map(c=>c.id)).size,24);assert.equal(new Set(careers.map(c=>c.project)).size,24);
 for(const c of careers){assert.equal(c.tags.length,2);assert.ok(c.tags.every(id=>interests.some(d=>d.id===id)));assert.ok(c.roles&&c.subjects&&c.reflection);}
});
