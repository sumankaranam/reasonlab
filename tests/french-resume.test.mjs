import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,stories,conversations,stages} from '../public/french-data.js';
import {missions} from '../public/french-journey.js';
import {activityFor,activityDraft,restoreActivity} from '../public/french-activities.js';

test('all supported activities reconstruct exactly from bounded descriptors',()=>{
 const descriptors=[...lessons.flatMap(l=>['mixed','reading','listening'].map(mode=>({kind:'lesson',id:l.id,mode}))),...lessons.map(l=>({kind:'cards',id:l.id})),...stages.map(s=>({kind:'checkpoint',id:s.id})),...stories.map(s=>({kind:'story',id:s.id})),...conversations.map(c=>({kind:'chat',id:c.id})),...missions.map(m=>({kind:'mission',id:m.id})),{kind:'daily',id:'daily',lessonIds:['sound-hello','food']}];
 for(const d of descriptors){const s=activityFor({mode:'mixed',seed:4294967295,...d});const raw=JSON.parse(JSON.stringify(activityDraft(s,42)));assert.ok(raw,d.kind+':'+d.id);assert.equal(raw.tasks,undefined);assert.deepEqual(restoreActivity(raw).tasks,s.tasks);}
});
test('resume preserves original responses, retry feedback, typed text and token choices',()=>{
 const s=activityFor({kind:'lesson',id:'sound-hello',seed:123,mode:'reading'});
 s.index=s.tasks.findIndex(t=>t.kind==='build');s.answers=Array.from({length:s.index},()=>({response:'first answer',skipped:false,assisted:false}));s.tokens=[1,0];s.typed='école';
 let restored=restoreActivity(JSON.parse(JSON.stringify(activityDraft(s))));assert.deepEqual(restored.tokens,[1,0]);assert.equal(restored.typed,'école');
 s.answers[s.index]={response:'wrong first answer',skipped:false,assisted:false};s.feedback={response:s.tasks[s.index].answer,skipped:false,assisted:false};s.retry=true;s.checked=true;
 restored=restoreActivity(JSON.parse(JSON.stringify(activityDraft(s))));assert.equal(restored.answers[s.index].response,'wrong first answer');assert.equal(restored.feedback.response,s.tasks[s.index].answer);
});
test('inconsistent saved checkpoints cannot skip questions, inject tasks or reuse invalid tokens',()=>{
 const s=activityFor({kind:'lesson',id:'sound-hello',seed:1,mode:'reading'}),raw=activityDraft(s);
 assert.equal(restoreActivity({...raw,index:999}),null);
 assert.equal(restoreActivity({...raw,index:2,answers:[null,null]}),null);
 assert.equal(restoreActivity({...raw,tokens:[0]}),null);
 assert.equal(restoreActivity({...raw,checked:true}),null);
 assert.equal(restoreActivity({...raw,version:99}),null);
 assert.equal(restoreActivity({...raw,id:'unknown'}),null);
 const rebuilt=restoreActivity({...raw,tasks:[{answer:'injected'}]});assert.notEqual(rebuilt.tasks[0].answer,'injected');
});
test('card checkpoints retain their flip state and memory ratings without microphone data',()=>{
 const s=activityFor({kind:'cards',id:'food',mode:'mixed',seed:3});s.index=1;s.answers=[{response:'again',skipped:false,assisted:false}];s.checked=true;
 const r=restoreActivity(JSON.parse(JSON.stringify(activityDraft(s))));assert.equal(r.checked,true);assert.equal(r.answers[0].response,'again');assert.equal(r.descriptor.kind,'cards');assert.equal(r.audio,undefined);
});
